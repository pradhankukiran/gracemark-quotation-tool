"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal, Segmented, Tooltip, Typography } from "antd";
import { ExperimentOutlined } from "@ant-design/icons";
import { BRAND } from "@/lib/theme";

type CostBasis = "recurring_only" | "all_inclusive";

export interface ReconciliationStartButtonProps {
  quoteId: string;
  /** Current cost basis on the quote page; pre-selected in the modal. */
  currentView: CostBasis;
  /** When true, the button is disabled (e.g., quotes still loading or Deel missing). */
  disabled?: boolean;
}

/**
 * Entry-point button for the EOR reconciliation flow. Renders a primary
 * antd Button that opens a modal asking the user to confirm the cost basis
 * (Statutory vs All-inclusive) before navigating to the reconciliation page.
 *
 * The cost basis is locked into the URL (`?view=...`) on Continue so the
 * reconciliation page knows which basis the run was anchored against.
 */
export function ReconciliationStartButton({
  quoteId,
  currentView,
  disabled,
}: ReconciliationStartButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<CostBasis>(currentView);

  // Keep the segmented selection in sync if the parent toggles the cost basis
  // between renders while the modal is closed. Once the modal is open the
  // user owns the selection until they Cancel or Continue.
  useEffect(() => {
    if (!open) {
      setSelectedView(currentView);
    }
  }, [currentView, open]);

  const handleOpen = () => {
    setSelectedView(currentView);
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleContinue = () => {
    router.push(`/eor/quote/${quoteId}/reconciliation?view=${selectedView}`);
    setOpen(false);
  };

  const button = (
    <Button
      size="large"
      type="primary"
      icon={<ExperimentOutlined />}
      onClick={handleOpen}
      disabled={disabled}
    >
      Start Reconciliation
    </Button>
  );

  return (
    <>
      {disabled ? (
        <Tooltip title="Waiting for quotes to finish">
          {/* span wrapper so the tooltip can attach to a disabled button */}
          <span>{button}</span>
        </Tooltip>
      ) : (
        button
      )}
      <Modal
        title="Start Reconciliation"
        open={open}
        onCancel={handleCancel}
        okText="Continue"
        cancelText="Cancel"
        onOk={handleContinue}
        destroyOnHidden
      >
        <Typography.Paragraph style={{ marginBottom: 16 }}>
          Reconciliation will compare providers using the selected cost basis.
        </Typography.Paragraph>
        <div style={{ marginBottom: 8 }}>
          <Typography.Text strong>Cost basis</Typography.Text>
        </div>
        <Segmented
          size="middle"
          block
          value={selectedView}
          onChange={(v) => setSelectedView(v as CostBasis)}
          options={[
            { label: "Statutory", value: "recurring_only" },
            { label: "All-inclusive", value: "all_inclusive" },
          ]}
        />
        <Typography.Paragraph
          type="secondary"
          style={{ marginTop: 12, marginBottom: 0, fontSize: 13, color: BRAND.textMuted }}
        >
          Statutory excludes termination/one-time costs. All-inclusive includes them.
        </Typography.Paragraph>
      </Modal>
    </>
  );
}
