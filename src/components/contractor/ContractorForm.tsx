"use client";

import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Segmented,
  Select,
  Space,
  Switch,
} from "antd";
import { ClearOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  countries,
  currencies,
  getCountryByCode,
} from "@/data/deel/lookups";
import { fetchFxRate } from "@/lib/api";
import { blockNonNumericKeys } from "@/lib/form-utils";
import {
  isQuoteId,
  readContractorQuote,
  saveContractorQuote,
  type ContractorFormSnapshot,
} from "@/lib/quote-state";
import { FLAG_SIZES } from "@/lib/theme";
import { CountryFlag } from "@/lib/twemoji";

/**
 * Antd Form values. NOTE: `display_in_usd` is deliberately NOT a member of
 * this interface — it lives outside the antd Form store as a plain React
 * `useState<boolean>` slice (see `displayInUSD` below), mirroring the legacy
 * `useICForm` pattern. Pairing a controlled antd Switch with a Form.Item
 * value created a feedback loop; lifting it out of the form store resolves
 * that entirely. The flag is still persisted in `ContractorFormSnapshot`
 * for `?edit=` hydration and the result page.
 */
interface ContractorFormValues {
  contractor_name?: string;
  country_code?: string;
  currency?: string;
  rate_basis: "hourly" | "monthly";
  pay_rate?: number;
  markup_percentage?: number;
  total_monthly_hours: number;
  contract_duration?: number;
  contract_duration_unit: "months" | "years";
  payment_frequency: "weekly" | "biweekly" | "monthly";
  msp_percentage?: number | null;
  background_check_required: boolean;
}

const initialValues: Partial<ContractorFormValues> = {
  rate_basis: "hourly",
  total_monthly_hours: 160,
  contract_duration_unit: "months",
  payment_frequency: "monthly",
  background_check_required: false,
  msp_percentage: null,
};

/** Compact country row: Twemoji flag + name. */
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

export function ContractorForm() {
  const [form] = Form.useForm<ContractorFormValues>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [navigating, setNavigating] = useState(false);
  // Toggle-FX is async; surface in-flight state so the Switch can show its
  // own loading indicator and we can disable Submit while a toggle resolves.
  const [togglePending, setTogglePending] = useState(false);
  // Surfaced when FX resolution fails inside `handleCurrencyToggle`. Cleared
  // on the next successful toggle. Rendered inline next to the Switch.
  const [toggleError, setToggleError] = useState<string | null>(null);

  // `display_in_usd` lives OUTSIDE antd's Form store entirely, as a plain
  // React state slice. This mirrors the legacy `useICForm` which keeps
  // `displayInUSD` as a `useState<boolean>` alongside the rest of `formData`.
  // Attempts to keep it inside antd's Form (via `Form.useWatch` +
  // `setFieldsValue`) kept creating render-loop / stale-watcher symptoms
  // because the Switch was simultaneously a controlled child and a form-bound
  // field. Lifting it out collapses to one source of truth.
  const [displayInUSD, setDisplayInUSD] = useState(false);

  // Cancels the in-flight `fetchFxRate` call when the user toggles again
  // before the previous resolves (legacy `currencyToggleAbortController`).
  const currencyToggleAbortController = useRef<AbortController | null>(null);

  // Round-trip prevention. Saves the rate from BEFORE the most recent toggle
  // so an inverse toggle restores the value verbatim instead of re-FX'ing
  // (which would compound rounding drift). Cleared after a round-trip or
  // when the user edits `pay_rate` between toggles (detected via
  // `expectedCurrentRate`). Mirrors legacy `previousRateSnapshot`.
  const previousRateSnapshot = useRef<{
    payRate: number;
    displayInUSD: boolean;
    expectedCurrentRate: number;
  } | null>(null);

  // Cancel any pending FX call on unmount.
  useEffect(() => {
    return () => {
      currencyToggleAbortController.current?.abort();
    };
  }, []);

  // Hydrate from `?edit=<id>` on mount. Mirrors the EOR form's URL-anchored
  // edit path (see `resolveEorFormHydration`); the contractor flow doesn't
  // currently persist a "last form" draft, so an absent `?edit=` leaves the
  // default initial values untouched. Effects only run on the client, which
  // also avoids any SSR/CSR mismatch — localStorage is only touched here.
  useEffect(() => {
    const editId = searchParams?.get("edit");
    if (!editId || !isQuoteId(editId)) return;
    const saved = readContractorQuote(editId);
    if (!saved) return;
    form.setFieldsValue(saved.form);
    // `display_in_usd` is NOT a form field — restore it onto the React state
    // slice so the Switch reflects the persisted toggle on rehydrate.
    setDisplayInUSD(saved.form.display_in_usd ?? false);
  }, [searchParams, form]);

  // Watch the currency so InputNumber prefixes update live. `preserve: true`
  // is REQUIRED because the Form.Item that owns `currency` is conditionally
  // unmounted (Branch A renders a readonly USD input when `displayInUSD &&
  // currencyCode !== "USD"`). Without `preserve`, `useWatch` reads from
  // `getFieldsValue()` which only contains REGISTERED fields — and on
  // unmount the watch fires with `undefined`, collapsing the conditional,
  // re-mounting the Select, re-registering, re-firing the watch with the
  // preserved store value, and looping. `preserve: true` makes the watch
  // read from `getFieldsValue(true)` (the full store) so the value survives
  // the field's brief unmount window.
  const currencyCode = Form.useWatch("currency", { form, preserve: true });
  // Watch the rate basis so the pay-rate suffix reflects /hour vs /month.
  const rateBasis = Form.useWatch("rate_basis", form);
  const rateSuffix = rateBasis === "monthly" ? "/month" : "/hour";
  // What the user actually sees as the working currency. When toggled, the
  // form-state `currency` stays at local (e.g. INR) but the visible chrome
  // — prefix + readonly currency field — reads "USD". Mirrors legacy's
  // `displayCurrency` (see `useICForm` line 101).
  const displayCurrency =
    displayInUSD && currencyCode && currencyCode !== "USD"
      ? "USD"
      : currencyCode ?? "USD";

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

  // Cascade: setting country auto-fills the currency to the country's default
  // AND wipes downstream currency-sensitive fields (pay_rate, msp_percentage)
  // so a stale BRL rate doesn't survive a flip to, say, CAD. Matches legacy
  // `useICForm.handleCountryChange` (clears rateAmount + mspPercentage on
  // every country change). Manual currency changes leave other fields alone.
  const handleValuesChange = (changedValues: Record<string, unknown>) => {
    if ("country_code" in changedValues) {
      // Country change wipes `pay_rate` (currency-sensitive) so any
      // round-trip snapshot keyed to the OLD currency / OLD rate is now
      // stale — drop it so a subsequent toggle treats the new rate fresh.
      previousRateSnapshot.current = null;
      currencyToggleAbortController.current?.abort();
      currencyToggleAbortController.current = null;
      // Legacy parity: country change forces the toggle back to OFF so the
      // user starts in the local working currency for the new country.
      setDisplayInUSD(false);
      setToggleError(null);
      const newCode = changedValues.country_code as string | undefined;
      if (!newCode) {
        form.setFieldsValue({
          currency: undefined,
          pay_rate: undefined,
          msp_percentage: null,
        });
        return;
      }
      const country = getCountryByCode(newCode);
      if (!country) {
        form.setFieldsValue({
          pay_rate: undefined,
          msp_percentage: null,
        });
        return;
      }
      form.setFieldsValue({
        currency: country.default_currency,
        pay_rate: undefined,
        msp_percentage: null,
      });
    }
  };

  /**
   * Atomically flip `displayInUSD` (React state) AND FX-convert `pay_rate`
   * (antd form field) so the form never reads a half-converted state. Ports
   * legacy `useICForm.handleCurrencyToggle` (~line 481). Differences from
   * legacy:
   *
   * 1. The new form doesn't surface bg-check / tx-cost rows — those are
   *    computed server-side from USD constants. So we only convert
   *    `pay_rate` here; the API handles the rest.
   * 2. FX hits `fetchFxRate` (returns `FxSnapshot | null`) instead of the
   *    legacy `convertCurrency` proxy. `null` means identity (USD→USD), in
   *    which case no math is needed.
   * 3. `displayInUSD` is a plain React state slice (NOT an antd form field),
   *    matching legacy's pattern. We update it via `setDisplayInUSD` only
   *    AFTER the FX call resolves — mirroring legacy's "update state only
   *    when FX completes" sequencing. React 18+ batches `setDisplayInUSD` +
   *    `setFieldsValue` inside the same event handler turn, so the Switch
   *    and the pay-rate input flip together.
   *
   * Round-trip detection: `previousRateSnapshot` captures the rate from
   * BEFORE the most recent toggle. If the user toggles back without editing
   * `pay_rate`, we restore that value verbatim — re-FX'ing would compound
   * rounding drift on each round trip (e.g. 5000 → 60.05 → 4998.something).
   *
   * Failure: on FX error we leave both `displayInUSD` and `pay_rate`
   * UNTOUCHED and surface an error via `toggleError`. The Switch's
   * `checked={displayInUSD}` prop pulls it back to its prior visual state
   * automatically since we never advanced the state.
   */
  const handleCurrencyToggle = async (useUSD: boolean) => {
    // Abort any in-flight toggle. Two paths can race: (a) the user mashes
    // the Switch and we have an old FX call still pending; (b) the user
    // edits `pay_rate` while a toggle resolves — newer state wins.
    currencyToggleAbortController.current?.abort();
    const controller = new AbortController();
    currencyToggleAbortController.current = controller;
    setToggleError(null);

    const localCurrency = form.getFieldValue("currency") as string | undefined;
    const currentRate = form.getFieldValue("pay_rate") as number | undefined;

    // No local currency yet (country not picked) — purely flip the flag.
    if (!localCurrency) {
      previousRateSnapshot.current = null;
      setDisplayInUSD(useUSD);
      currencyToggleAbortController.current = null;
      return;
    }

    const sourceCurrency = useUSD ? localCurrency : "USD";
    const targetCurrency = useUSD ? "USD" : localCurrency;

    // No-op currency case (e.g. country IS USA). The toggle is just a
    // display-state flip — nothing to convert.
    if (sourceCurrency.toUpperCase() === targetCurrency.toUpperCase()) {
      previousRateSnapshot.current = null;
      setDisplayInUSD(useUSD);
      currencyToggleAbortController.current = null;
      return;
    }

    // Round-trip detection: are we toggling back to the previous state with
    // an unmodified rate? If yes, restore the saved value verbatim and skip
    // FX entirely. Legacy stores `expectedCurrentRate` as a string of the
    // post-toggle rate; we use number equality since `pay_rate` is numeric.
    const snapshot = previousRateSnapshot.current;
    const isRoundTrip =
      snapshot !== null &&
      snapshot.displayInUSD === useUSD &&
      snapshot.expectedCurrentRate === (currentRate ?? 0);

    // Nothing to convert (e.g. user toggled before typing a rate). Just
    // flip the flag and clear the snapshot — no FX call needed.
    if (!isRoundTrip && (!currentRate || currentRate <= 0)) {
      previousRateSnapshot.current = null;
      setDisplayInUSD(useUSD);
      currencyToggleAbortController.current = null;
      return;
    }

    setTogglePending(true);

    try {
      let nextPayRate = currentRate ?? 0;

      if (isRoundTrip && snapshot) {
        // Round-trip restore: use the snapshotted rate verbatim, no FX.
        nextPayRate = snapshot.payRate;
      } else {
        // Forward conversion: fetch FX and round to 2 decimals (legacy parity
        // — see `useICForm.ts` line 568 `result.data.target_amount.toFixed(2)`).
        const fx = await fetchFxRate(sourceCurrency, targetCurrency);
        if (controller.signal.aborted) return;
        if (fx === null) {
          // Identity case (already handled above, but defensive). Keep rate.
          nextPayRate = currentRate ?? 0;
        } else {
          nextPayRate = Math.round((currentRate ?? 0) * fx.rate * 100) / 100;
        }
      }

      if (controller.signal.aborted) return;

      // Update the round-trip snapshot. Save the rate from BEFORE this
      // toggle so an inverse toggle can restore it verbatim. After a
      // successful round-trip restore, clear the snapshot so the next
      // toggle starts a fresh chain.
      if (!isRoundTrip) {
        previousRateSnapshot.current = {
          payRate: currentRate ?? 0,
          displayInUSD: !useUSD,
          expectedCurrentRate: nextPayRate,
        };
      } else {
        previousRateSnapshot.current = null;
      }

      // Atomic-ish update: React 18 batches the state update + the antd
      // setFieldsValue inside the same event handler turn, so the Switch
      // and the pay-rate input flip together on the next render.
      setDisplayInUSD(useUSD);
      form.setFieldsValue({ pay_rate: nextPayRate });
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error("Currency toggle conversion failed:", error);
      // FX failed — DO NOT advance `displayInUSD` or touch `pay_rate`. The
      // Switch's `checked` prop reads from state, so it snaps back to its
      // prior visual state automatically. Surface the error inline.
      setToggleError(
        error instanceof Error
          ? `Currency conversion failed: ${error.message}`
          : "Currency conversion failed. Please try again."
      );
    } finally {
      if (currencyToggleAbortController.current === controller) {
        currencyToggleAbortController.current = null;
      }
      setTogglePending(false);
    }
  };

  const onClear = () => {
    previousRateSnapshot.current = null;
    currencyToggleAbortController.current?.abort();
    currencyToggleAbortController.current = null;
    setDisplayInUSD(false);
    setToggleError(null);
    form.resetFields();
  };

  const onFinish = (values: ContractorFormValues) => {
    const snapshot: ContractorFormSnapshot = {
      contractor_name: values.contractor_name!.trim(),
      country_code: values.country_code!,
      currency: values.currency!,
      rate_basis: values.rate_basis,
      pay_rate: values.pay_rate!,
      markup_percentage: values.markup_percentage!,
      total_monthly_hours: values.total_monthly_hours,
      contract_duration: values.contract_duration!,
      contract_duration_unit: values.contract_duration_unit,
      payment_frequency: values.payment_frequency,
      msp_percentage:
        values.msp_percentage == null || Number.isNaN(values.msp_percentage)
          ? null
          : values.msp_percentage,
      background_check_required: values.background_check_required ?? false,
      // Pull `display_in_usd` from React state (not from antd values). When
      // `currency === "USD"` the toggle is hidden, so force the persisted
      // flag to `false` regardless of whatever the state slice happens to
      // be — the result page treats USD quotes as non-converted.
      display_in_usd: values.currency === "USD" ? false : displayInUSD,
    };

    setNavigating(true);
    const id = saveContractorQuote(snapshot);
    router.push(`/contractor/quote/${id}`);
  };

  return (
    <Form<ContractorFormValues>
      form={form}
      layout="vertical"
      size="large"
      initialValues={initialValues}
      onFinish={onFinish}
      onValuesChange={handleValuesChange}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* ---------- Section 1: Contractor info ---------- */}
        <Card
          title="Contractor info"
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
          <Row gutter={[24, 0]}>
            <Col xs={24} md={24}>
              <Form.Item
                name="contractor_name"
                label="Contractor name"
                rules={[{ required: true, message: "Enter a contractor name" }]}
              >
                <Input placeholder="e.g. Jane Doe" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="country_code"
                label="Country"
                rules={[{ required: true, message: "Pick a country" }]}
              >
                <Select
                  showSearch
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

            <Col xs={24} md={12}>
              {displayInUSD && currencyCode && currencyCode !== "USD" ? (
                // Toggle ON: the form-state `currency` field stays at local
                // (e.g. INR), but the visible chrome reads "USD" so the user
                // sees the working currency they're typing in. Matches the
                // legacy ContractorInfoForm readonly display (`displayCurrency
                // = displayInUSD ? "USD" : currency`).
                <Form.Item label="Currency">
                  <Input value="USD" disabled />
                </Form.Item>
              ) : (
                <Form.Item
                  name="currency"
                  label="Currency"
                  rules={[{ required: true, message: "Pick a currency" }]}
                >
                  <Select
                    showSearch
                    virtual={false}
                    placeholder="Select currency"
                    options={currencyOptions}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              )}
            </Col>
          </Row>

          {/* USD display toggle — only shown for non-USD currencies. */}
          {currencyCode && currencyCode !== "USD" && (
            <Row gutter={[24, 0]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Show in USD"
                  style={{ marginBottom: 0 }}
                  validateStatus={toggleError ? "error" : undefined}
                  help={toggleError ?? undefined}
                >
                  <Switch
                    checked={displayInUSD}
                    loading={togglePending}
                    disabled={togglePending}
                    onChange={(checked) => {
                      void handleCurrencyToggle(checked);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Card>

        {/* ---------- Section 2: Rate configuration ---------- */}
        <Card title="Rate configuration">
          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="rate_basis"
                label="Rate basis"
                rules={[{ required: true }]}
              >
                <Segmented
                  options={[
                    { label: "Hourly", value: "hourly" },
                    { label: "Monthly", value: "monthly" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="pay_rate"
                label="Pay rate"
                rules={[
                  { required: true, message: "Enter a pay rate" },
                  {
                    type: "number",
                    min: 1,
                    message: "Pay rate must be greater than zero",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  step={1}
                  style={{ width: "100%" }}
                  prefix={displayCurrency || "—"}
                  suffix={rateSuffix}
                  onKeyDown={blockNonNumericKeys}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="markup_percentage"
                label="Markup"
                rules={[
                  { required: true, message: "Enter a markup" },
                  {
                    type: "number",
                    min: 0,
                    max: 100,
                    message: "Markup must be between 0 and 100",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.5}
                  suffix="%"
                  style={{ width: "100%" }}
                  onKeyDown={blockNonNumericKeys}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="total_monthly_hours"
                label="Total monthly hours"
                rules={[
                  { required: true, message: "Enter monthly hours" },
                  {
                    type: "number",
                    min: 1,
                    max: 160,
                    message: "Hours must be between 1 and 160",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  max={160}
                  step={1}
                  suffix="hrs"
                  style={{ width: "100%" }}
                  onKeyDown={blockNonNumericKeys}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ---------- Section 3: Contract details ---------- */}
        <Card title="Contract details">
          <Row gutter={[24, 0]}>
            <Col xs={24} md={6}>
              <Form.Item
                name="contract_duration"
                label="Contract duration"
                rules={[
                  { required: true, message: "Enter a duration" },
                  {
                    type: "number",
                    min: 1,
                    message: "Duration must be greater than zero",
                  },
                ]}
              >
                <InputNumber
                  min={1}
                  step={1}
                  style={{ width: "100%" }}
                  onKeyDown={blockNonNumericKeys}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={6}>
              <Form.Item
                name="contract_duration_unit"
                label="Unit"
                rules={[{ required: true }]}
              >
                <Segmented
                  options={[
                    { label: "Months", value: "months" },
                    { label: "Years", value: "years" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="payment_frequency"
                label="Payment frequency"
                rules={[{ required: true }]}
              >
                <Segmented
                  options={[
                    { label: "Weekly", value: "weekly" },
                    { label: "Biweekly", value: "biweekly" },
                    { label: "Monthly", value: "monthly" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="msp_percentage"
                label="MSP fee (optional)"
                rules={[
                  {
                    type: "number",
                    min: 0,
                    max: 100,
                    message: "MSP fee must be between 0 and 100",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  max={100}
                  step={0.5}
                  suffix="%"
                  style={{ width: "100%" }}
                  onKeyDown={blockNonNumericKeys}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="background_check_required"
                label="Background check needed"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* ---------- Submit ---------- */}
        <Form.Item style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={navigating}
              // Block submit while a currency toggle is mid-FX so we don't
              // ship a half-converted snapshot to the result page.
              disabled={togglePending}
            >
              Generate quote
            </Button>
          </div>
        </Form.Item>
      </Space>
    </Form>
  );
}
