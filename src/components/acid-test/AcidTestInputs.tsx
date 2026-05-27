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
  /** Gracemark fee stored as a fraction 0..1; displayed as 0..100. */
  feePct: number;
  onFeePctChange: (next: number) => void;
  /** Currency code (e.g. "BRL") — rendered as the InputNumber prefix. */
  currency: string;
}

/**
 * Three-input form for Acid Test inputs: Monthly Bill Rate, Duration, and
 * Gracemark Fee. Fee is stored as a fraction internally (0..1) and displayed
 * as a percentage (0..100) via the formatter/parser pair on the InputNumber.
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
            max={100}
            // The kernel uses a 0..1 fraction; the input shows 0..100.
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
                const clamped = Math.max(0, Math.min(100, value));
                onFeePctChange(clamped / 100);
              }
            }}
            step={1}
          />
        </Col>
      </Row>
    </Card>
  );
}
