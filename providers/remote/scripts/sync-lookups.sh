#!/usr/bin/env bash
#
# Pulls Remote (remote.com) lookup endpoints and writes the merged responses
# to:
#   src/data/remote/lookups/        — runtime imports
#
# Endpoints synced:
#   /v1/countries                       — general country reference (~224 entries)
#   /v1/cost-calculator/countries       — region_slug + currency.slug lookup (~103)
#
# The Remote API currently returns both endpoints as a single flat
# `{"data": [...]}` envelope (no pagination), but this script defensively
# handles the documented paginated shape `{"data": {"current_page", "total_pages",
# "countries": [...]}}` as well, in case Remote changes behaviour later.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
RUNTIME_DIR="$PROJECT_ROOT/src/data/remote/lookups"

if [[ ! -f "$PROJECT_ROOT/.env.local" ]]; then
  echo "error: $PROJECT_ROOT/.env.local not found" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source "$PROJECT_ROOT/.env.local"
set +a

: "${REMOTE_API_TOKEN:?REMOTE_API_TOKEN must be set in .env.local}"

BASE_URL="https://gateway.remote.com"
AUTH_HEADER="Authorization: Bearer ${REMOTE_API_TOKEN}"

mkdir -p "$RUNTIME_DIR"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

# Summary rows accumulated as: category|name|count|status
summary_rows=()

# fetch_paginated <endpoint_path> <output_basename> <inner_array_key>
#
# Walks the endpoint until all pages are collected. Detects whether the
# response is paginated (object with current_page/total_pages/<inner_array_key>)
# or a flat array under .data, and handles both shapes.
fetch_paginated() {
  local endpoint_path="$1"
  local out_name="$2"
  local inner_key="$3"

  local page=1
  local total_pages=1
  local merged_file="$tmp_dir/${out_name}.merged.json"
  echo '[]' > "$merged_file"

  local final_status="ok"
  local page_size_seen=""

  while :; do
    local page_file="$tmp_dir/${out_name}.page${page}.json"
    local url="${BASE_URL}${endpoint_path}"
    # Only append ?page= once we know pagination is in play, to keep the first
    # request identical to what a human would send.
    if [[ $page -gt 1 ]]; then
      if [[ "$endpoint_path" == *"?"* ]]; then
        url="${url}&page=${page}"
      else
        url="${url}?page=${page}"
      fi
    fi

    local http_code
    http_code=$(curl -sS -o "$page_file" -w '%{http_code}' \
      -H "$AUTH_HEADER" \
      -H 'Accept: application/json' \
      "$url")

    if [[ "$http_code" != "200" ]]; then
      echo "error: $endpoint_path page $page returned HTTP $http_code" >&2
      cat "$page_file" >&2 || true
      final_status="http_${http_code}"
      break
    fi

    if ! jq -e . "$page_file" >/dev/null 2>&1; then
      echo "error: $endpoint_path page $page returned invalid JSON" >&2
      final_status="invalid_json"
      break
    fi

    local data_type
    data_type=$(jq -r '.data | type' "$page_file")

    local items_file="$tmp_dir/${out_name}.page${page}.items.json"

    case "$data_type" in
      array)
        # Flat envelope: .data is the array of items. No pagination.
        jq '.data' "$page_file" > "$items_file"
        total_pages=1
        ;;
      object)
        # Paginated envelope: pull inner array + page meta.
        if ! jq -e --arg k "$inner_key" '.data | has($k)' "$page_file" >/dev/null; then
          echo "error: $endpoint_path returned object .data without key '$inner_key'" >&2
          final_status="missing_inner_key"
          break
        fi
        jq --arg k "$inner_key" '.data[$k]' "$page_file" > "$items_file"
        total_pages=$(jq -r '.data.total_pages // 1' "$page_file")
        local current_page
        current_page=$(jq -r '.data.current_page // 1' "$page_file")
        if [[ -z "$page_size_seen" ]]; then
          page_size_seen=$(jq -r '.data[$k] | length' --arg k "$inner_key" "$page_file")
        fi
        if [[ "$current_page" != "$page" ]]; then
          echo "warning: $endpoint_path requested page $page, server returned $current_page" >&2
        fi
        ;;
      *)
        echo "error: $endpoint_path .data is type '$data_type', expected array or object" >&2
        final_status="bad_data_type"
        break
        ;;
    esac

    # Append the page items into the merged array.
    jq -s '.[0] + .[1]' "$merged_file" "$items_file" > "$merged_file.next"
    mv "$merged_file.next" "$merged_file"

    if [[ $page -ge $total_pages ]]; then
      break
    fi
    page=$((page + 1))
  done

  local count=0
  if [[ "$final_status" == "ok" ]]; then
    count=$(jq 'length' "$merged_file")
    # Wrap back into { "data": [...] } to match the project's JSON convention
    # (matches Deel's countries.json / currencies.json shape).
    local wrapped="$tmp_dir/${out_name}.wrapped.json"
    jq '{ data: . }' "$merged_file" > "$wrapped"

    cp "$wrapped" "$RUNTIME_DIR/${out_name}.json"
  fi

  local pages_label
  if [[ $page -eq 1 && "$total_pages" -eq 1 ]]; then
    pages_label="1 page (flat)"
  else
    pages_label="${page}/${total_pages} pages"
  fi

  summary_rows+=("lookups|${out_name}|${count}|${final_status} (${pages_label})")
}

fetch_paginated "/v1/countries"                 "countries"            "countries"
fetch_paginated "/v1/cost-calculator/countries" "cost-calc-countries"  "countries"

echo ""
printf '%-10s %-26s %-8s %s\n' "CATEGORY" "NAME" "COUNT" "STATUS"
printf '%s\n' "------------------------------------------------------------------------"
for row in "${summary_rows[@]}"; do
  IFS='|' read -r category name count status <<< "$row"
  printf '%-10s %-26s %-8s %s\n' "$category" "$name" "$count" "$status"
done

echo ""
echo "Runtime:  $RUNTIME_DIR"
