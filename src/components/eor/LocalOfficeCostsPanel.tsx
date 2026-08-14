"use client";

// Panel owns local_office defaults. Re-seeds on (country, currency) change. Hydrated values preserved on first mount.

import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Skeleton,
  Space,
  Typography,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useRef } from "react";
import { blockNonNumericKeys } from "@/lib/form-utils";
import {
  DEFAULT_GRACEMARK_MARKUP,
  type GraceMarkMarkupMode,
  type LocalOfficeFormState,
} from "@/lib/quote-state";
import { useLocalOfficeDefaults } from "@/lib/use-local-office-defaults";

interface LocalOfficeCostsPanelProps {
  formPath: "primary" | "comparison";
  label?: string;
}

const SUB_HEADING_STYLE = {
  marginTop: 20,
  marginBottom: 12,
  fontSize: 14,
} as const;

const FIRST_SUB_HEADING_STYLE = {
  marginTop: 12,
  marginBottom: 12,
  fontSize: 14,
} as const;

type MonetaryField =
  | "meal_voucher"
  | "transportation"
  | "wfh"
  | "health_insurance"
  | "local_office"
  | "pre_employment_med"
  | "drug_test"
  | "background_check";

function MonetaryRow({
  formPath,
  field,
  label,
  currency,
  loading,
}: {
  formPath: "primary" | "comparison";
  field: MonetaryField;
  label: string;
  currency: string;
  loading: boolean;
}) {
  return (
    <Form.Item label={label} required style={{ marginBottom: 12 }}>
      <Space.Compact style={{ width: "100%", display: "flex" }}>
        <Form.Item
          name={[formPath, "local_office", "values", field]}
          noStyle
          rules={[{ required: true, type: "number", min: 0, message: "Required" }]}
        >
          <InputNumber<number>
            style={{ width: "100%", flex: 1 }}
            controls={false}
            min={0}
            precision={2}
            disabled={loading}
            onKeyDown={blockNonNumericKeys}
          />
        </Form.Item>
        <Input
          value={currency}
          disabled
          style={{
            width: 64,
            flex: "0 0 64px",
            textAlign: "center",
            color: "rgba(0,0,0,0.85)",
            backgroundColor: "#fafafa",
            cursor: "default",
          }}
        />
      </Space.Compact>
    </Form.Item>
  );
}

export function LocalOfficeCostsPanel({
  formPath,
}: LocalOfficeCostsPanelProps) {
  const form = Form.useFormInstance();
  const countryCode = Form.useWatch([formPath, "country_code"], form) as
    | string
    | undefined;
  const quoteCurrencyRaw = Form.useWatch([formPath, "currency"], form) as
    | string
    | undefined;
  const quoteCurrency = quoteCurrencyRaw?.toUpperCase();
  const markupModeRaw = Form.useWatch(
    [formPath, "local_office", "markup", "mode"],
    form,
  ) as GraceMarkMarkupMode | undefined;
  const markupMode = markupModeRaw ?? DEFAULT_GRACEMARK_MARKUP.mode;

  const defaults = useLocalOfficeDefaults(countryCode, quoteCurrency);

  // Tracks the last `(country, currency)` combo we seeded for. Used solely to
  // detect whether to override hydrated state on first mount.
  const lastSeededKey = useRef<string | null>(null);

  useEffect(() => {
    if (!countryCode || !quoteCurrency) return;
    if (defaults.isLoading) return;
    const combineKey = `${countryCode}::${quoteCurrency}`;
    const existing = form.getFieldValue([
      formPath,
      "local_office",
    ]) as LocalOfficeFormState | undefined;
    // First mount with hydrated state: don't overwrite. Otherwise always seed
    // on a (country, currency) combo change.
    if (existing !== undefined && lastSeededKey.current === null) {
      if (!existing.markup) {
        form.setFieldValue(
          [formPath, "local_office", "markup"],
          { ...DEFAULT_GRACEMARK_MARKUP },
        );
      }
      lastSeededKey.current = combineKey;
      return;
    }
    form.setFieldsValue({
      [formPath]: {
        local_office: {
          values: defaults.values,
          markup: { ...DEFAULT_GRACEMARK_MARKUP },
          custom_lines: [],
        },
      },
    });
    lastSeededKey.current = combineKey;
  }, [
    countryCode,
    quoteCurrency,
    defaults.isLoading,
    defaults.values,
    form,
    formPath,
  ]);

  const rowLoading = defaults.isLoading;
  const customBadgeCurrency = quoteCurrency ?? "—";

  return (
    <div>
      {defaults.isFallback ? (
        <Typography.Paragraph
          type="secondary"
          style={{ marginTop: 0, marginBottom: 12 }}
        >
          Default rates — country-specific data not tracked
        </Typography.Paragraph>
      ) : null}

      <Typography.Title level={5} style={FIRST_SUB_HEADING_STYLE}>
        Monthly
      </Typography.Title>
      {rowLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : (
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12} md={8}>
            <MonetaryRow
              formPath={formPath}
              field="meal_voucher"
              label="Meal Voucher"
              currency={defaults.perRowCurrency.meal_voucher}
              loading={false}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <MonetaryRow
              formPath={formPath}
              field="transportation"
              label="Transportation"
              currency={defaults.perRowCurrency.transportation}
              loading={false}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <MonetaryRow
              formPath={formPath}
              field="wfh"
              label="WFH"
              currency={defaults.perRowCurrency.wfh}
              loading={false}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <MonetaryRow
              formPath={formPath}
              field="health_insurance"
              label="Health Insurance"
              currency={defaults.perRowCurrency.health_insurance}
              loading={false}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <MonetaryRow
              formPath={formPath}
              field="local_office"
              label="Local Office"
              currency={defaults.perRowCurrency.local_office}
              loading={false}
            />
          </Col>
        </Row>
      )}

      <Typography.Title level={5} style={SUB_HEADING_STYLE}>
        VAT
      </Typography.Title>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Rate" required style={{ marginBottom: 12 }}>
            <Space.Compact style={{ width: "100%", display: "flex" }}>
              <Form.Item
                name={[formPath, "local_office", "values", "vat"]}
                noStyle
                rules={[
                  { required: true, type: "number", min: 0, max: 100, message: "Required" },
                ]}
              >
                <InputNumber<number>
                  style={{ width: "100%", flex: 1 }}
                  controls={false}
                  min={0}
                  max={100}
                  precision={2}
                  onKeyDown={blockNonNumericKeys}
                />
              </Form.Item>
              <Input
                value="%"
                disabled
                style={{
                  width: 64,
                  flex: "0 0 64px",
                  textAlign: "center",
                  color: "rgba(0,0,0,0.85)",
                  backgroundColor: "#fafafa",
                  cursor: "default",
                }}
              />
            </Space.Compact>
          </Form.Item>
        </Col>
      </Row>

      <Typography.Title level={5} style={SUB_HEADING_STYLE}>
        GraceMark markup
      </Typography.Title>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item
            name={[formPath, "local_office", "markup", "mode"]}
            label="Calculation"
            rules={[{ required: true, message: "Select a markup type" }]}
          >
            <Segmented
              block
              options={[
                { value: "percentage", label: "Percentage" },
                { value: "fixed_usd", label: "Fixed USD" },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          {markupMode === "fixed_usd" ? (
            <Form.Item label="Monthly fixed markup" required>
              <Space.Compact style={{ width: "100%", display: "flex" }}>
                <Form.Item
                  name={[formPath, "local_office", "markup", "fixed_usd"]}
                  noStyle
                  rules={[
                    {
                      required: true,
                      type: "number",
                      min: 0,
                      message: "Enter a fixed USD markup",
                    },
                  ]}
                >
                  <InputNumber<number>
                    style={{ width: "100%", flex: 1 }}
                    controls={false}
                    min={0}
                    precision={2}
                    onKeyDown={blockNonNumericKeys}
                  />
                </Form.Item>
                <Input
                  value="USD"
                  disabled
                  style={{
                    width: 64,
                    flex: "0 0 64px",
                    textAlign: "center",
                    color: "rgba(0,0,0,0.85)",
                    backgroundColor: "#fafafa",
                    cursor: "default",
                  }}
                />
              </Space.Compact>
            </Form.Item>
          ) : (
            <Form.Item label="Markup over total employer cost" required>
              <Space.Compact style={{ width: "100%", display: "flex" }}>
                <Form.Item
                  name={[formPath, "local_office", "markup", "percentage"]}
                  noStyle
                  rules={[
                    {
                      required: true,
                      type: "number",
                      min: 0,
                      max: 100,
                      message: "Enter a percentage from 0 to 100",
                    },
                  ]}
                >
                  <InputNumber<number>
                    style={{ width: "100%", flex: 1 }}
                    controls={false}
                    min={0}
                    max={100}
                    precision={2}
                    onKeyDown={blockNonNumericKeys}
                  />
                </Form.Item>
                <Input
                  value="%"
                  disabled
                  style={{
                    width: 64,
                    flex: "0 0 64px",
                    textAlign: "center",
                    color: "rgba(0,0,0,0.85)",
                    backgroundColor: "#fafafa",
                    cursor: "default",
                  }}
                />
              </Space.Compact>
            </Form.Item>
          )}
        </Col>
      </Row>

      <Typography.Title level={5} style={SUB_HEADING_STYLE}>
        One-time at Hire
      </Typography.Title>
      {rowLoading ? (
        <Skeleton active paragraph={{ rows: 2 }} />
      ) : (
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={12} md={8}>
            <MonetaryRow
              formPath={formPath}
              field="pre_employment_med"
              label="Pre-Employment Medical"
              currency={defaults.perRowCurrency.pre_employment_med}
              loading={false}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <MonetaryRow
              formPath={formPath}
              field="drug_test"
              label="Drug Test"
              currency={defaults.perRowCurrency.drug_test}
              loading={false}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <MonetaryRow
              formPath={formPath}
              field="background_check"
              label="Background Check (via Deel)"
              currency={defaults.perRowCurrency.background_check}
              loading={false}
            />
          </Col>
        </Row>
      )}

      <Typography.Title level={5} style={SUB_HEADING_STYLE}>
        Custom cost lines
      </Typography.Title>
      <Form.List name={[formPath, "local_office", "custom_lines"]}>
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Row key={field.key} gutter={[12, 0]} align="top">
                <Col xs={24} md={10}>
                  <Form.Item
                    name={[field.name, "name"]}
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input placeholder="Cost name" />
                  </Form.Item>
                </Col>
                <Col xs={12} md={7}>
                  <Form.Item
                    name={[field.name, "amount"]}
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Space.Compact style={{ width: "100%", display: "flex" }}>
                      <InputNumber<number>
                        style={{ width: "100%", flex: 1 }}
                        controls={false}
                        min={0}
                        precision={2}
                        placeholder="Amount"
                        onKeyDown={blockNonNumericKeys}
                      />
                      <Input
                        value={customBadgeCurrency}
                        disabled
                        style={{
                          width: 64,
                          flex: "0 0 64px",
                          textAlign: "center",
                          color: "rgba(0,0,0,0.85)",
                          backgroundColor: "#fafafa",
                          cursor: "default",
                        }}
                      />
                    </Space.Compact>
                  </Form.Item>
                </Col>
                <Col xs={20} md={5}>
                  <Form.Item
                    name={[field.name, "cadence"]}
                    initialValue="monthly"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Segmented
                      options={[
                        { value: "monthly", label: "Monthly" },
                        { value: "one_time", label: "One-time" },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col xs={4} md={2}>
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    aria-label="Remove custom cost line"
                    onClick={() => remove(field.name)}
                  />
                </Col>
              </Row>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() =>
                add({
                  name: "",
                  amount: 0,
                  cadence: "monthly",
                })
              }
              block
            >
              Add custom cost
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
}
