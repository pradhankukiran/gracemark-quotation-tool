"use client";

import {
  Button,
  Card,
  Col,
  Form,
  InputNumber,
  message,
  Row,
  Segmented,
  Select,
  Space,
  Switch,
  Typography,
} from "antd";
import { ClearOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { InputNumberRef } from "rc-input-number";
import {
  countries,
  currencies,
  getCountryByCode,
} from "@/data/deel/lookups";
import { submitProviderQuote } from "@/lib/api";
import { blockNonNumericKeys } from "@/lib/form-utils";
import { providerQuoteQueryKey } from "@/lib/query-keys";
import {
  clearPersisted,
  eorSnapshotToRequestMulti,
  overwriteEorQuote,
  resolveEorFormHydration,
  saveEorQuote,
  saveLastEorForm,
  type EorFormSnapshot,
  type EorQuoteType,
  type LocalOfficeFormState,
  type QuoteFormCountryInputs,
} from "@/lib/quote-state";
import { FLAG_SIZES } from "@/lib/theme";
import { CountryFlag } from "@/lib/twemoji";
import { PROVIDERS_META } from "@/providers/_meta";
import type { EmploymentType } from "@/providers/_core/types";
import { LocalOfficeCostsPanel } from "./LocalOfficeCostsPanel";
import { ValidationRulesPanel } from "./ValidationRulesPanel";

const STALE_QUERY_MS = 5 * 60 * 1000;

/**
 * Nested form shape so AntD `name={["primary", "country_code"]}` etc. works
 * directly. The submit handler folds this into an `EorFormSnapshot`.
 */
interface CountryFieldValues {
  country_code?: string;
  state?: string | null;
  currency?: string;
  annual_salary?: number | null;
  local_office?: LocalOfficeFormState;
}

interface QuoteFormValues {
  primary: CountryFieldValues;
  comparison: CountryFieldValues;
  employment_type: EmploymentType;
  work_hours_per_week: number;
  work_visa: boolean;
  quote_type: EorQuoteType;
}

const initialValues: Partial<QuoteFormValues> = {
  primary: {},
  comparison: {},
  employment_type: "Full-time",
  work_hours_per_week: 40,
  work_visa: false,
  quote_type: "recurring_only",
};

function formatThousands(value: number | string | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  const str = String(value);
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseThousands(value: string | undefined): string {
  if (!value) return "";
  return value.replace(/,/g, "").replace(/[^\d.]/g, "");
}

type SalaryPeriod = "annual" | "monthly";

/**
 * Salary input that lets the user type in either annual or monthly terms.
 * The form always stores `annual_salary` (annual), but the display value
 * shown to the user respects the chosen period. Switching the toggle
 * recomputes the display without changing the underlying annual value.
 */
const SalaryInput = forwardRef<
  InputNumberRef,
  {
    value?: number | null;
    onChange?: (next: number | null) => void;
    period: SalaryPeriod;
    currency: string;
  }
>(function SalaryInput({ value, onChange, period, currency }, ref) {
  const displayValue =
    value != null && period === "monthly" ? value / 12 : value;

  const handleChange = (next: number | null) => {
    if (next == null) {
      onChange?.(null);
      return;
    }
    const annual = period === "monthly" ? next * 12 : next;
    onChange?.(annual);
  };

  return (
    <InputNumber<number>
      ref={ref}
      value={displayValue}
      onChange={handleChange}
      style={{ width: "100%" }}
      min={0}
      step={period === "monthly" ? 100 : 1000}
      prefix={currency || "—"}
      onKeyDown={blockNonNumericKeys}
      formatter={(v) => formatThousands(v)}
      parser={(v) => {
        const parsed = parseThousands(v);
        // Returning "" lets rc-input-number emit onChange(null) for empty input.
        return (parsed === "" ? "" : Number(parsed)) as unknown as number;
      }}
    />
  );
});

/** Compact country row: Twemoji flag + name. Used in both Select dropdown and selected-value display. */
function CountryRow({ code, name }: { code: string; name: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <CountryFlag
        code={code}
        width={FLAG_SIZES.sm}
        height={FLAG_SIZES.sm}
        style={{ borderRadius: 3, flexShrink: 0 }}
      />
      <span>{name}</span>
    </span>
  );
}

/**
 * Country | State (when applicable) | Currency row for one slot.
 * The country → default-currency / clear-state cascade is handled by the
 * parent Form's `onValuesChange` (see `handleValuesChange` in `QuoteForm`).
 */
function CountryCurrencyRow({
  slot,
  form,
  countryOptions,
  currencyOptions,
  salaryRef,
}: {
  slot: "primary" | "comparison";
  form: ReturnType<typeof Form.useForm<QuoteFormValues>>[0];
  countryOptions: { label: string; value: string }[];
  currencyOptions: { label: string; value: string }[];
  salaryRef: React.RefObject<InputNumberRef | null>;
}) {
  const countryCode = Form.useWatch([slot, "country_code"], form);
  const currencyCode = Form.useWatch([slot, "currency"], form);

  const selectedCountry = useMemo(
    () => (countryCode ? getCountryByCode(countryCode) : undefined),
    [countryCode]
  );

  const stateOptions = useMemo(
    () =>
      (selectedCountry?.states ?? []).map((s) => ({
        label: s.name,
        value: s.code,
      })),
    [selectedCountry]
  );

  const hasState = !!selectedCountry?.state_type;
  const countryMd = hasState ? 8 : 12;
  const currencyMd = hasState ? 8 : 12;

  return (
    <Row gutter={[24, 0]}>
      <Col xs={24} md={countryMd}>
        <Form.Item
          name={[slot, "country_code"]}
          label="Country"
          rules={[{ required: true, message: "Pick a country" }]}
        >
          <Select
            showSearch
            virtual={false}
            placeholder="Select country"
            options={countryOptions}
            optionRender={(option) => (
              <CountryRow
                code={String(option.value)}
                name={String(option.label)}
              />
            )}
            labelRender={(item) => (
              <CountryRow
                code={String(item.value)}
                name={String(item.label)}
              />
            )}
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Col>

      {hasState ? (
        <Col xs={24} md={8}>
          <Form.Item
            name={[slot, "state"]}
            label={
              selectedCountry!.state_type!.charAt(0).toUpperCase() +
              selectedCountry!.state_type!.slice(1)
            }
          >
            <Select
              showSearch
              allowClear
              placeholder={`Select ${selectedCountry!.state_type}`}
              options={stateOptions}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>
      ) : null}

      <Col xs={24} md={currencyMd}>
        <Form.Item
          name={[slot, "currency"]}
          label="Currency"
          rules={[{ required: true, message: "Pick a currency" }]}
          extra={
            selectedCountry &&
            currencyCode &&
            currencyCode !== selectedCountry.default_currency ? (
              <Button
                type="link"
                size="small"
                style={{ padding: 0, height: "auto", fontSize: 13 }}
                onClick={() =>
                  form.setFieldValue(
                    [slot, "currency"],
                    selectedCountry.default_currency
                  )
                }
              >
                Reset to {selectedCountry.default_currency}
              </Button>
            ) : null
          }
        >
          <Select
            showSearch
            virtual={false}
            placeholder="Select currency"
            options={currencyOptions}
            onChange={() => {
              salaryRef.current?.focus();
            }}
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Col>
    </Row>
  );
}

/**
 * Salary type segmented | Salary input row for one slot.
 */
function SalaryRow({
  slot,
  form,
  salaryPeriod,
  setSalaryPeriod,
  salaryRef,
}: {
  slot: "primary" | "comparison";
  form: ReturnType<typeof Form.useForm<QuoteFormValues>>[0];
  salaryPeriod: SalaryPeriod;
  setSalaryPeriod: (p: SalaryPeriod) => void;
  salaryRef: React.RefObject<InputNumberRef | null>;
}) {
  const currencyCode = Form.useWatch([slot, "currency"], form);
  return (
    <Row gutter={[24, 0]}>
      <Col xs={24} md={12}>
        <Form.Item label="Salary entered as">
          <Segmented
            value={salaryPeriod}
            options={[
              { label: "Annual", value: "annual" },
              { label: "Monthly", value: "monthly" },
            ]}
            onChange={(v) => setSalaryPeriod(v as SalaryPeriod)}
          />
        </Form.Item>
      </Col>
      <Col xs={24} md={12}>
        <Form.Item
          name={[slot, "annual_salary"]}
          label="Gross salary"
          rules={[
            { required: true, message: "Enter a salary" },
            {
              type: "number",
              min: 1,
              message: "Salary must be greater than zero",
            },
          ]}
        >
          <SalaryInput
            ref={salaryRef}
            period={salaryPeriod}
            currency={currencyCode || ""}
          />
        </Form.Item>
      </Col>
    </Row>
  );
}

export function QuoteForm() {
  const [form] = Form.useForm<QuoteFormValues>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [navigating, setNavigating] = useState(false);
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>("annual");
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const primarySalaryRef = useRef<InputNumberRef>(null);
  const comparisonSalaryRef = useRef<InputNumberRef>(null);

  const primaryCountry = Form.useWatch(["primary", "country_code"], form);
  const primaryCurrency = Form.useWatch(["primary", "currency"], form);
  const primarySalary = Form.useWatch(["primary", "annual_salary"], form);

  const comparisonCountry = Form.useWatch(
    ["comparison", "country_code"],
    form
  );
  const comparisonCurrency = Form.useWatch(["comparison", "currency"], form);
  const comparisonSalary = Form.useWatch(
    ["comparison", "annual_salary"],
    form
  );

  const countryOptions = useMemo(
    () =>
      countries
        .filter((c) => c.eor_support)
        .map((c) => ({ label: c.name, value: c.code }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  const currencyOptions = useMemo(
    () =>
      currencies.map((c) => ({
        label: `${c.code} — ${c.name}`,
        value: c.code,
      })),
    []
  );

  // Hydrate from URL params / localStorage AFTER mount, so SSR and first
  // client render agree on the empty form. Effects only run on the client.
  useEffect(() => {
    const hydration = resolveEorFormHydration();
    if (hydration.form) {
      const snap = hydration.form;
      // Preserve any saved local_office data; otherwise leave undefined and
      // let the LocalOfficeCostsPanel re-seed it via its FX effect.
      const primaryLocalOffice: LocalOfficeFormState | undefined =
        snap.primary.local_office;
      const comparisonLocalOffice: LocalOfficeFormState | undefined =
        snap.comparison?.local_office;

      form.setFieldsValue({
        primary: {
          country_code: snap.primary.country_code ?? undefined,
          state: snap.primary.state ?? null,
          currency: snap.primary.currency ?? undefined,
          annual_salary: snap.primary.annual_salary ?? null,
          local_office: primaryLocalOffice,
        },
        comparison: snap.comparison
          ? {
              country_code: snap.comparison.country_code ?? undefined,
              state: snap.comparison.state ?? null,
              currency: snap.comparison.currency ?? undefined,
              annual_salary: snap.comparison.annual_salary ?? null,
              local_office: comparisonLocalOffice,
            }
          : {},
        employment_type: snap.employment_type ?? "Full-time",
        work_hours_per_week: snap.work_hours_per_week ?? 40,
        work_visa: snap.work_visa ?? false,
        quote_type: snap.quote_type ?? "recurring_only",
      });

      const supportedCodes = new Set(countryOptions.map((o) => o.value));
      let cleared = false;
      if (
        snap.primary.country_code &&
        !supportedCodes.has(snap.primary.country_code)
      ) {
        form.setFieldsValue({
          primary: {
            country_code: undefined,
            currency: undefined,
            state: undefined,
            annual_salary: null,
            local_office: undefined,
          },
        });
        cleared = true;
      }
      if (
        snap.comparison?.country_code &&
        !supportedCodes.has(snap.comparison.country_code)
      ) {
        form.setFieldsValue({
          comparison: {
            country_code: undefined,
            currency: undefined,
            state: undefined,
            annual_salary: null,
            local_office: undefined,
          },
        });
        cleared = true;
      }
      if (cleared) {
        message.warning("Saved country no longer supports EOR — please re-select.");
      }

      if (snap.comparison) {
        setCompareEnabled(true);
      }
    }
    if (hydration.edit_id) {
      setEditId(hydration.edit_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleCompare = (checked: boolean) => {
    setCompareEnabled(checked);
    // When turning OFF, blank the comparison fields so a re-toggle starts
    // empty (per spec: comparison must never inherit primary values).
    if (!checked) {
      form.setFieldValue("comparison", {});
    }
  };

  const onFinish = (values: QuoteFormValues) => {
    const buildCountry = (
      v: CountryFieldValues | undefined
    ): QuoteFormCountryInputs => ({
      country_code: v?.country_code ?? null,
      state: v?.state ?? null,
      currency: v?.currency ?? null,
      annual_salary: v?.annual_salary ?? null,
      local_office: v?.local_office,
    });

    const snapshot: EorFormSnapshot = {
      primary: buildCountry(values.primary),
      comparison: compareEnabled ? buildCountry(values.comparison) : null,
      employment_type: values.employment_type,
      work_hours_per_week: values.work_hours_per_week,
      work_visa: values.work_visa,
      quote_type: values.quote_type ?? "recurring_only",
    };

    setNavigating(true);
    saveLastEorForm(snapshot);
    let targetId: string;
    if (editId && overwriteEorQuote(editId, snapshot)) {
      // Drop every (provider × country) cache entry for this saved-quote so
      // the refetch picks up the new inputs instead of returning the stale
      // result from before the edit.
      PROVIDERS_META.forEach((meta) => {
        for (const slot of ["primary", "comparison"] as const) {
          const cc = snapshot[slot]?.country_code;
          if (cc) {
            queryClient.removeQueries({
              queryKey: providerQuoteQueryKey(editId, meta.id, cc),
            });
          }
        }
      });
      targetId = editId;
    } else {
      targetId = saveEorQuote(snapshot);
    }

    // Fire-and-forget pre-fetch: kick off every provider × country cell in
    // parallel with the navigation. By the time the quote page mounts, each
    // useQueries cell either finds a hit in the React Query cache or attaches
    // to an in-flight request.
    const request = eorSnapshotToRequestMulti(snapshot);
    if (request) {
      for (const country of request.countries) {
        for (const meta of PROVIDERS_META) {
          queryClient.prefetchQuery({
            queryKey: providerQuoteQueryKey(
              targetId,
              meta.id,
              country.country_code
            ),
            queryFn: () => submitProviderQuote(meta.id, country),
            staleTime: STALE_QUERY_MS,
          });
        }
      }
    }

    // Strip ?edit=<id> so a refresh of the form page doesn't re-enter edit mode.
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    router.push(`/eor/quote/${targetId}`);
  };

  const onClear = () => {
    form.resetFields();
    clearPersisted();
    setEditId(null);
    setCompareEnabled(false);
    router.replace("/eor");
  };

  // antd-blessed cascade: fires AFTER user-driven changes are applied, and
  // does NOT fire for programmatic setFieldsValue/setFieldValue — so the
  // hydration block stays clean and doesn't trigger spurious cascades.
  const handleValuesChange = (changedValues: Record<string, unknown>) => {
    for (const slot of ["primary", "comparison"] as const) {
      const slotChange = changedValues[slot] as
        | { country_code?: string; currency?: string }
        | undefined;
      if (!slotChange) continue;

      // `"country_code" in slotChange` distinguishes "country was set to
      // undefined (cleared)" from "country wasn't in this change at all".
      if ("country_code" in slotChange) {
        const newCode = slotChange.country_code;
        if (!newCode) {
          form.setFieldsValue({
            [slot]: {
              currency: undefined,
              state: undefined,
              annual_salary: null,
              local_office: undefined,
            },
          });
          continue;
        }
        const country = getCountryByCode(newCode);
        if (!country) continue;
        // Clear local_office — the panel re-seeds it via its own FX effect
        // once both country code and quote currency are known.
        form.setFieldsValue({
          [slot]: {
            currency: country.default_currency,
            state: undefined,
            annual_salary: null,
            local_office: undefined,
          },
        });
        continue;
      }

      // User manually changed currency (no country change in this same event)
      // — clear salary; the panel re-seeds local_office via its own hook.
      if ("currency" in slotChange) {
        form.setFieldsValue({
          [slot]: {
            annual_salary: null,
          },
        });
      }
    }
  };

  return (
    <Form<QuoteFormValues>
      form={form}
      layout="vertical"
      size="large"
      requiredMark="optional"
      initialValues={initialValues}
      onFinish={onFinish}
      onValuesChange={handleValuesChange}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* ---------- Card 1: Employee info ---------- */}
        <Card
          title="Employee info"
          extra={
            <Button
              type="text"
              icon={<ClearOutlined />}
              onClick={onClear}
              disabled={navigating}
            >
              Clear form
            </Button>
          }
        >
          {/* Row 1: Country | (State) | Currency */}
          <CountryCurrencyRow
            slot="primary"
            form={form}
            countryOptions={countryOptions}
            currencyOptions={currencyOptions}
            salaryRef={primarySalaryRef}
          />

          {/* Row 2: Employment type | Work hours | Work visa */}
          <Row gutter={[24, 0]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="employment_type"
                label="Employment type"
                rules={[{ required: true }]}
              >
                <Segmented
                  options={[
                    { label: "Full-time", value: "Full-time" },
                    { label: "Part-time", value: "Part-time" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="work_hours_per_week"
                label="Work hours per week"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber
                  min={1}
                  max={168}
                  suffix="hrs"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="work_visa"
                label="Work visa needed"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 3: Salary type | Salary input */}
          <SalaryRow
            slot="primary"
            form={form}
            salaryPeriod={salaryPeriod}
            setSalaryPeriod={setSalaryPeriod}
            salaryRef={primarySalaryRef}
          />
        </Card>

        {/* ---------- Card 2: Country reference ---------- */}
        {primaryCountry ? (
          <Card title="Country reference">
            <ValidationRulesPanel
              label={compareEnabled ? "Primary" : undefined}
              countryCode={primaryCountry ?? null}
              currency={primaryCurrency ?? null}
              annualSalary={
                typeof primarySalary === "number" ? primarySalary : null
              }
            />
          </Card>
        ) : null}

        {/* ---------- Card 3: Local office costs ---------- */}
        {primaryCountry ? (
          <Card title="Local office costs">
            <LocalOfficeCostsPanel
              formPath="primary"
              label={compareEnabled ? "Primary" : undefined}
            />
          </Card>
        ) : null}

        {/* ---------- Compare toggle ---------- */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Switch checked={compareEnabled} onChange={handleToggleCompare} />
          <Typography.Text>Compare with another country</Typography.Text>
        </div>

        {/* ---------- Comparison: country inputs ---------- */}
        {compareEnabled ? (
          <Card title="Comparison country">
            <CountryCurrencyRow
              slot="comparison"
              form={form}
              countryOptions={countryOptions}
              currencyOptions={currencyOptions}
              salaryRef={comparisonSalaryRef}
            />

            <SalaryRow
              slot="comparison"
              form={form}
              salaryPeriod={salaryPeriod}
              setSalaryPeriod={setSalaryPeriod}
              salaryRef={comparisonSalaryRef}
            />
          </Card>
        ) : null}

        {/* ---------- Comparison: country reference ---------- */}
        {compareEnabled && comparisonCountry ? (
          <Card title="Country reference">
            <ValidationRulesPanel
              label="Comparison"
              countryCode={comparisonCountry ?? null}
              currency={comparisonCurrency ?? null}
              annualSalary={
                typeof comparisonSalary === "number" ? comparisonSalary : null
              }
            />
          </Card>
        ) : null}

        {/* ---------- Comparison: local office costs ---------- */}
        {compareEnabled && comparisonCountry ? (
          <Card title="Local office costs">
            <LocalOfficeCostsPanel
              formPath="comparison"
              label="Comparison"
            />
          </Card>
        ) : null}

        {/* ---------- Submit ---------- */}
        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={navigating}
            >
              Generate quote
            </Button>
          </div>
        </Form.Item>
      </Space>
    </Form>
  );
}
