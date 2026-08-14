"use client";

import { Card, Col, InputNumber, Row, Typography } from "antd";
import { BRAND } from "@/lib/theme";

const TABULAR: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

export interface AcidTestInputsProps {
  /** Monthly bill rate, in `currency`. */
  billRate: number;
  onBillRateChange: (next: number) => void;
  /** Duration in months. */
  duration: number;
  onDurationChange: (next: number) => void;
  /** Gracemark fee stored as a fraction; displayed as a percentage. */
  feePct: number;
  onFeePctChange: (next: number) => void;
  /** Explains which main-quote markup seeded this Acid Test override. */
  markupDescription: string;
  /** Currency code (e.g. "BRL") — rendered as the InputNumber prefix. */
  currency: string;
}

/**
 * Three-input form for Acid Test inputs: Monthly Bill Rate, Duration, and
 * Gracemark Fee. Fee is stored as a fraction internally and displayed as a
 * percentage via the formatter/parser pair on the InputNumber.
 *
 * Each input is "large" size to match the rest of the page chrome.
 */
export function AcidTestInputs({
  billRate,
  onBillRateChange,
  duration,
  onDurationChange,
  feePct,
  onFeePctChange,
  markupDescription,
  currency,
}: AcidTestInputsProps) {
  return (
    <Card title="Inputs">
      <Row gutter={[24, 16]}>
        <Col xs={24} md={8}>
          <Typography.Text
            strong
            style={{ display: "block", marginBottom: 8, fontSize: 14 }}
          >
            Monthly Bill Rate
          </Typography.Text>
          <InputNumber<number>
            size="large"
            style={{ width: "100%", ...TABULAR }}
            min={0}
            prefix={
              <span
                style={{
                  color: BRAND.textSecondary,
                  fontWeight: 600,
                  fontSize: 14,
                  marginRight: 4,
                }}
              >
                {currency}
              </span>
            }
            value={billRate}
            onChange={(value) => {
              if (typeof value === "number" && Number.isFinite(value)) {
                onBillRateChange(value);
              } else if (value == null) {
                onBillRateChange(0);
              }
            }}
            step={100}
          />
        </Col>
        <Col xs={24} md={8}>
          <Typography.Text
            strong
            style={{ display: "block", marginBottom: 8, fontSize: 14 }}
          >
            Duration
          </Typography.Text>
          <InputNumber<number>
            size="large"
            style={{ width: "100%", ...TABULAR }}
            min={1}
            max={60}
            suffix={
              <span
                style={{
                  color: BRAND.textSecondary,
                  fontSize: 14,
                  marginLeft: 4,
                }}
              >
                months
              </span>
            }
            value={duration}
            onChange={(value) => {
              if (typeof value === "number" && Number.isFinite(value)) {
                onDurationChange(Math.max(1, Math.min(60, Math.round(value))));
              }
            }}
            step={1}
          />
        </Col>
        <Col xs={24} md={8}>
          <Typography.Text
            strong
            style={{ display: "block", marginBottom: 8, fontSize: 14 }}
          >
            Gracemark Fee
          </Typography.Text>
          <InputNumber<number>
            size="large"
            style={{ width: "100%", ...TABULAR }}
            min={0}
            max={1000}
            // The kernel uses a fraction; the input displays percentage points.
            value={Number((feePct * 100).toFixed(4))}
            formatter={(value) => `${value ?? 0}`}
            parser={(value) => {
              const cleaned = (value ?? "").replace(/[^\d.-]/g, "");
              const n = Number(cleaned);
              return Number.isFinite(n) ? n : 0;
            }}
            suffix={
              <span
                style={{
                  color: BRAND.textSecondary,
                  fontSize: 14,
                  marginLeft: 4,
                }}
              >
                %
              </span>
            }
            onChange={(value) => {
              if (typeof value === "number" && Number.isFinite(value)) {
                const clamped = Math.max(0, Math.min(1000, value));
                onFeePctChange(clamped / 100);
              }
            }}
            step={1}
          />
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginTop: 6, fontSize: 12 }}
          >
            {markupDescription}
          </Typography.Text>
        </Col>
      </Row>
    </Card>
  );
}
