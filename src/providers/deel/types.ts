/**
 * Deel-specific request and response shapes.
 *
 * These mirror the wire format of api.letsdeel.com/rest/v2 endpoints that
 * the adapter consumes. They intentionally use `string` for numeric fields
 * because Deel returns money values as decimal strings ("12500.00"); the
 * adapter parses them into `number` when mapping to the normalized contract.
 */

// ---------------------------------------------------------------------------
// POST /eor/employment_cost
// ---------------------------------------------------------------------------

export interface DeelEmploymentCostRequestBody {
  data: {
    salary: number;
    country: string;
    country_code: string;
    currency: string;
    state?: string;
  };
}

export interface DeelCostLine {
  name: string;
  amount: string;
  frequency: "Monthly" | "Annual";
  country: string;
  country_code: string;
}

export interface DeelEmploymentCostResponse {
  created_at: string;
  salary: string;
  currency: string;
  country: string;
  country_code: string;
  state: Record<string, unknown> | string | null;
  deel_fee: string;
  severance_accural: string;
  total_costs: string;
  employer_costs: string;
  costs: DeelCostLine[];
  additional_data: {
    additional_notes?: string[];
  };
}

// ---------------------------------------------------------------------------
// GET /eor/validations/{country_code}
// ---------------------------------------------------------------------------

export interface DeelValidationsResponse {
  data: {
    holiday: {
      min: string | number | null;
      max: string | number | null;
      mostCommon: string | number | null;
    };
    part_time_holiday?: {
      type: string;
      min: string | number | null;
    };
    sick_days: {
      min: string | number | null;
      max: string | number | null;
    };
    salary: {
      min: string;
      max: string;
      frequency: "monthly" | "annual";
    };
    probation: {
      min: number | null;
      max: number | null;
      timeUnit?: string;
      minDisplayValue?: number | null;
      maxDisplayValue?: number | null;
    };
    part_time_probation?: {
      min: number | null;
      max: number | null;
      timeUnit?: string;
    };
    work_schedule: {
      days: { min: string; max: string };
      hours: { min: string; max: string };
    };
    currency: string;
    hiring_guide_country_name?: string;
    start_date_buffer: number;
    definite_contract: {
      type: "ALLOWED" | "NOT_ALLOWED" | string;
      maximum_limitation: unknown;
    };
    adjustments_information_box?: string;
    health_insurance?: unknown;
    pension?: unknown;
    mandatory_fields?: unknown[];
  };
}

