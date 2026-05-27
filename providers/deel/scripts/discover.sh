#!/usr/bin/env bash
#
# Pulls Deel discovery endpoints (lookups + organization context) and saves
# each response as JSON under providers/deel/data/<category>/<name>.json.
# Also writes a manifest.json summarising the run.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
DATA_DIR="$SCRIPT_DIR/../data"

if [[ ! -f "$PROJECT_ROOT/.env.local" ]]; then
  echo "error: $PROJECT_ROOT/.env.local not found" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source "$PROJECT_ROOT/.env.local"
set +a

: "${DEEL_ORGANIZATION_TOKEN:?DEEL_ORGANIZATION_TOKEN must be set in .env.local}"

API_BASE="https://api.letsdeel.com/rest/v2"
AUTH_HEADER="Authorization: Bearer ${DEEL_ORGANIZATION_TOKEN}"
RUN_TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# format: <category>|<filename>|<path>
endpoints=(
  "lookups|countries|/lookups/countries"
  "lookups|currencies|/lookups/currencies"
  "lookups|seniority-levels|/lookups/seniorities"
  "lookups|job-titles|/lookups/job-titles"
  "lookups|time-off-types|/lookups/time-off-types"
  "lookups|industries|/industries"
  "organization|current|/organizations"
  "organization|legal-entities|/legal-entities"
  "organization|teams|/teams"
  "organization|roles|/roles"
  "organization|departments|/departments"
  "organization|working-locations|/working-locations"
)

manifest_tmp="$(mktemp)"
trap 'rm -f "$manifest_tmp"' EXIT

printf '[\n' > "$manifest_tmp"
first=1

printf '%-12s %-22s %-30s %-8s %s\n' "CATEGORY" "NAME" "PATH" "STATUS" "COUNT"
printf '%s\n' "----------------------------------------------------------------------------------------"

for entry in "${endpoints[@]}"; do
  IFS='|' read -r category name path <<< "$entry"
  outdir="$DATA_DIR/$category"
  outfile="$outdir/$name.json"
  mkdir -p "$outdir"

  http_code=$(curl -s -o "$outfile.raw" -w '%{http_code}' \
    -H "$AUTH_HEADER" \
    -H 'Accept: application/json' \
    "${API_BASE}${path}")

  count=0
  if [[ "$http_code" == "200" ]] && jq -e . "$outfile.raw" >/dev/null 2>&1; then
    jq '.' "$outfile.raw" > "$outfile"
    count=$(jq '
      if type == "array" then length
      elif type == "object" and has("data") and (.data | type == "array") then (.data | length)
      else 1
      end
    ' "$outfile")
    rm -f "$outfile.raw"
    status_label="$http_code"
  else
    mv "$outfile.raw" "$outfile.error"
    status_label="${http_code} ERR"
  fi

  printf '%-12s %-22s %-30s %-8s %s\n' "$category" "$name" "$path" "$status_label" "$count"

  if [[ $first -eq 0 ]]; then printf ',\n' >> "$manifest_tmp"; fi
  first=0
  jq -n \
    --arg cat "$category" \
    --arg name "$name" \
    --arg path "$path" \
    --arg code "$http_code" \
    --argjson count "$count" \
    --arg ts "$RUN_TS" \
    '{category:$cat, name:$name, path:$path, http_code:($code|tonumber), item_count:$count, fetched_at:$ts}' \
    >> "$manifest_tmp"
done

printf '\n]\n' >> "$manifest_tmp"
jq '.' "$manifest_tmp" > "$DATA_DIR/manifest.json"

echo ""
echo "Manifest: $DATA_DIR/manifest.json"
