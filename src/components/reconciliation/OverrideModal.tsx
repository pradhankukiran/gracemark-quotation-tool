"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Radio, Tag, Tooltip, Typography } from "antd";
import type { AnalyzedProvider } from "@/providers/_core/reconciliation";
import { getProviderMeta } from "@/providers/_meta";
import { ProviderLogo } from "@/components/ProviderLogo";
import { BRAND } from "@/lib/theme";

export interface OverrideModalProps {
  open: boolean;
  onClose: () => void;
  analyzed: AnalyzedProvider[];
  /** The current selection (algorithmic winner OR existing override). Pre-selects this row. */
  currentSelectionId: string | null;
  /** Algorithm's natural winner — labeled "Recommended" in the list to help the user orient. */
  algorithmicWinnerId: string | null;
  deelPrice: number;
  currency: string;
  /** Called when the user clicks Apply with a non-null choice. */
  onApply: (providerId: string, isOverride: boolean) => void;
}

interface ModalRow {
  providerId: string;
  displayName: string;
  price: number;
  inRange: boolean;
  isDeel: boolean;
  isRecommended: boolean;
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount).toLocaleString()} ${currency}`;
  }
}

function formatSignedPct(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : rounded < 0 ? "-" : "";
  return `${sign}${Math.abs(rounded).toFixed(1)}%`;
}

/**
 * Renders the status pill for a single provider row in the override picker.
 * - Deel = neutral "Anchor" tag (subtle warm-cream background)
 * - Algorithmic winner (in range) = green "Recommended" tag
 * - Other in-range = green "In band" tag (lighter weight)
 * - Out of range = warm clay "Out of band" tag
 */
function StatusPill({ row }: { row: ModalRow }) {
  if (row.isDeel) {
    return (
      <Tag
        style={{
          backgroundColor: BRAND.bgSubtle,
          color: BRAND.textSecondary,
          border: "none",
          fontSize: 11,
          fontWeight: 600,
          marginInlineEnd: 0,
        }}
      >
        ANCHOR
      </Tag>
    );
  }
  if (row.isRecommended && row.inRange) {
    return (
      <Tag
        style={{
          backgroundColor: BRAND.primarySoft,
          color: BRAND.primary,
          border: "none",
          fontSize: 11,
          fontWeight: 600,
          marginInlineEnd: 0,
        }}
      >
        RECOMMENDED
      </Tag>
    );
  }
  if (row.inRange) {
    return (
      <Tag
        style={{
          backgroundColor: BRAND.bgSubtle,
          color: BRAND.textSecondary,
          border: "none",
          fontSize: 11,
          fontWeight: 500,
          marginInlineEnd: 0,
        }}
      >
        IN BAND
      </Tag>
    );
  }
  return (
    <Tag
      style={{
        backgroundColor: BRAND.dangerSoft,
        color: BRAND.danger,
        border: "none",
        fontSize: 11,
        fontWeight: 500,
        marginInlineEnd: 0,
      }}
    >
      OUT OF BAND
    </Tag>
  );
}

/**
 * A single radio row in the override picker. Owns its own hover state so the
 * row gets a subtle background-color affordance on mouseover when not already
 * selected. Kept as a small subcomponent (rather than inline state in the
 * parent) so each row's hover toggle doesn't re-render the whole modal.
 */
function RadioRow({
  row,
  isSelected,
  variancePct,
  currency,
}: {
  row: ModalRow;
  isSelected: boolean;
  variancePct: number | null;
  currency: string;
}) {
  const [hovered, setHovered] = useState(false);
  const background = isSelected
    ? BRAND.primarySoft
    : hovered
      ? BRAND.bgSubtle
      : BRAND.bgContainer;
  return (
    <Radio
      value={row.providerId}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        width: "100%",
        padding: "12px 16px",
        border: `1px solid ${isSelected ? BRAND.primary : BRAND.border}`,
        borderRadius: 10,
        marginInlineEnd: 0,
        background,
        transition: "background-color 150ms ease, border-color 150ms ease",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 8,
          width: "100%",
          minWidth: 0,
        }}
      >
        <ProviderLogo
          providerId={row.providerId}
          fallback={row.displayName}
          height={24}
        />
        <StatusPill row={row} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <Typography.Text
            style={{
              fontWeight: 600,
              fontSize: 18,
              color: BRAND.text,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatMoney(row.price, currency)}
          </Typography.Text>
          {variancePct != null ? (
            <Tag
              style={{
                marginInlineEnd: 0,
                background: BRAND.bgContainer,
                borderColor: BRAND.border,
                color: row.inRange ? BRAND.text : BRAND.danger,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatSignedPct(variancePct)}
            </Tag>
          ) : null}
        </div>
      </div>
    </Radio>
  );
}

/**
 * Modal picker that lets the user pick any provider as the recommendation,
 * replacing the previous click-a-row-in-the-table flow.
 *
 * The radio list is sorted by price descending. The currently-selected
 * provider (algorithmic winner OR existing override) is pre-selected when
 * the modal opens, and the Apply button is disabled until the user picks
 * something different — there's no useful "apply" when nothing changes.
 */
export function OverrideModal({
  open,
  onClose,
  analyzed,
  currentSelectionId,
  algorithmicWinnerId,
  deelPrice,
  currency,
  onApply,
}: OverrideModalProps) {
  const [pickedId, setPickedId] = useState<string | null>(currentSelectionId);

  // Reset the local selection every time the modal re-opens so a fresh open
  // always reflects the persisted state (rather than a stale in-modal pick
  // from a prior session).
  useEffect(() => {
    if (open) {
      setPickedId(currentSelectionId);
    }
  }, [open, currentSelectionId]);

  const rows = useMemo<ModalRow[]>(() => {
    const sorted = [...analyzed].sort((a, b) => b.price - a.price);
    return sorted.map<ModalRow>((p) => {
      const meta = getProviderMeta(p.provider);
      return {
        providerId: p.provider,
        displayName: meta?.display_name ?? p.provider,
        price: p.price,
        inRange: p.inRange,
        isDeel: p.provider === "deel",
        isRecommended: p.provider === algorithmicWinnerId,
      };
    });
  }, [analyzed, algorithmicWinnerId]);

  const noChange = pickedId === currentSelectionId;

  const handleApply = () => {
    if (pickedId == null) return;
    const isOverride = pickedId !== algorithmicWinnerId;
    onApply(pickedId, isOverride);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleApply}
      title="Override Recommendation"
      width={1080}
      destroyOnHidden
      centered
      maskClosable={false}
      okText="Apply"
      cancelText="Cancel"
      styles={{
        body: { padding: 32 },
        header: { padding: "24px 32px", marginBottom: 0 },
        footer: { padding: "16px 32px 24px" },
      }}
      // Custom footer renders explicit large Buttons (OkBtn/CancelBtn don't
      // accept size). Apply is wrapped in a Tooltip when disabled so users
      // still see why it's inactive.
      footer={() => (
        <>
          <Button size="large" onClick={onClose}>
            Cancel
          </Button>
          {noChange ? (
            <Tooltip title="No change to apply" placement="top">
              <span>
                <Button
                  size="large"
                  type="primary"
                  onClick={handleApply}
                  disabled={noChange}
                >
                  Apply
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Button
              size="large"
              type="primary"
              onClick={handleApply}
              disabled={noChange}
            >
              Apply
            </Button>
          )}
        </>
      )}
    >
      <Typography.Text
        type="secondary"
        style={{ marginBottom: 16, display: "block" }}
      >
        Pick a different provider to replace the recommended one. Out-of-band
        providers can still be selected, but they fall outside Deel&rsquo;s
        &plusmn;4% variance band.
      </Typography.Text>
      <div className="override-modal-grid">
        {/*
         * Hide the native AntD radio dot inside this grid — each card is itself
         * the click target with a selected-state border + background, so the
         * dot is visual noise in the narrow column layout. Scoped via the
         * `override-modal-grid` wrapper className so it doesn't leak.
         */}
        <style jsx global>{`
          .override-modal-grid .ant-radio {
            display: none !important;
          }
          .override-modal-grid .ant-radio-wrapper {
            margin-inline-end: 0 !important;
            display: block !important;
            width: 100% !important;
          }
          .override-modal-grid .ant-radio-wrapper > span:not(.ant-radio) {
            padding-inline: 0 !important;
            display: block !important;
            width: 100% !important;
          }
        `}</style>
        <Radio.Group
          value={pickedId}
          onChange={(e) => setPickedId(e.target.value as string)}
          style={{ width: "100%" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {rows.map((row) => {
              const isSelected = pickedId === row.providerId;
              const variancePct = row.isDeel
                ? null
                : ((row.price - deelPrice) / deelPrice) * 100;
              return (
                <RadioRow
                  key={row.providerId}
                  row={row}
                  isSelected={isSelected}
                  variancePct={variancePct}
                  currency={currency}
                />
              );
            })}
          </div>
        </Radio.Group>
      </div>
    </Modal>
  );
}
