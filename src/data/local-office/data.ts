export interface LocalOfficeCosts {
  country_code: string;
  monthly: {
    meal_voucher: string;
    transportation: string;
    wfh: string;
    health_insurance: string;
    local_office: string;
  };
  vat: string | null;
  one_time: {
    pre_employment_med: string;
    drug_test: string;
    background_check: string;
  };
}

export const FALLBACK_LOCAL_OFFICE_COSTS: LocalOfficeCosts = {
  country_code: "FALLBACK",
  monthly: {
    meal_voucher: "N/A",
    transportation: "N/A",
    wfh: "N/A",
    health_insurance: "N/A",
    local_office: "250.00 USD",
  },
  vat: null,
  one_time: {
    pre_employment_med: "N/A",
    drug_test: "N/A",
    background_check: "N/A",
  },
};

export const LOCAL_OFFICE_COSTS: Record<string, LocalOfficeCosts> = {
  CO: {
    country_code: "CO",
    monthly: {
      meal_voucher: "N/A",
      transportation: "200000 COP",
      wfh: "200000 COP",
      health_insurance: "No",
      local_office: "150.00 USD",
    },
    vat: "19%",
    one_time: {
      pre_employment_med: "20.00 USD",
      drug_test: "30.00 USD",
      background_check: "200.00 USD",
    },
  },
  BR: {
    country_code: "BR",
    monthly: {
      meal_voucher: "880 BRL",
      transportation: "880 BRL",
      wfh: "N/A",
      health_insurance: "970 BRL",
      local_office: "120.00 USD",
    },
    vat: "19%",
    one_time: {
      pre_employment_med: "N/A",
      drug_test: "N/A",
      background_check: "200.00 USD",
    },
  },
  AR: {
    country_code: "AR",
    monthly: {
      meal_voucher: "0 ARS",
      transportation: "0 ARS",
      wfh: "100 USD",
      health_insurance: "No",
      local_office: "180.00 USD",
    },
    vat: "21%",
    one_time: {
      pre_employment_med: "40.00 USD",
      drug_test: "50.00 USD",
      background_check: "200.00 USD",
    },
  },
  MX: {
    country_code: "MX",
    monthly: {
      meal_voucher: "0 MXN",
      transportation: "0 MXN",
      wfh: "N/A",
      health_insurance: "No",
      local_office: "290.00 USD",
    },
    vat: "18%",
    one_time: {
      pre_employment_med: "N/A",
      drug_test: "N/A",
      background_check: "200.00 USD",
    },
  },
  CL: {
    country_code: "CL",
    monthly: {
      meal_voucher: "0 CLP",
      transportation: "0 CLP",
      wfh: "N/A",
      health_insurance: "No",
      local_office: "N/A",
    },
    vat: "19%",
    one_time: {
      pre_employment_med: "N/A",
      drug_test: "N/A",
      background_check: "N/A",
    },
  },
  PE: {
    country_code: "PE",
    monthly: {
      meal_voucher: "0 PEN",
      transportation: "0 PEN",
      wfh: "100 PEN",
      health_insurance: "No",
      local_office: "N/A",
    },
    vat: null,
    one_time: {
      pre_employment_med: "N/A",
      drug_test: "N/A",
      background_check: "N/A",
    },
  },
  FALLBACK: FALLBACK_LOCAL_OFFICE_COSTS,
};

export function getLocalOfficeCosts(countryCode: string): LocalOfficeCosts {
  return LOCAL_OFFICE_COSTS[countryCode] ?? FALLBACK_LOCAL_OFFICE_COSTS;
}
