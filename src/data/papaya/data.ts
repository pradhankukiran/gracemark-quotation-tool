// GENERATED FILE — do not edit by hand.
// Source: providers/papaya/data/*.json (173 files)
// Regenerate via: node providers/papaya/scripts/build-data.mjs

import type { PapayaCountryEntry } from "./types";

export const PAPAYA_DATA: Readonly<Record<string, readonly PapayaCountryEntry[]>> = {
  AE: [
    {
      "country": "United Arab Emirates",
      "country_code": "AE",
      "state": null,
      "state_code": null,
      "currency": "AED",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 12.5,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 20000,
              "currency": "AED",
              "frequency": "Monthly"
            },
            "max": {
              "value": 70000,
              "currency": "AED",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.175,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Gratuity",
          "rate_percent": 5.75,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 5
    }
  ],
  AL: [
    {
      "country": "Albania",
      "country_code": "AL",
      "state": null,
      "state_code": null,
      "currency": "ALL",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 15,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 40000,
              "currency": "ALL",
              "frequency": "Monthly"
            },
            "max": {
              "value": 176416,
              "currency": "ALL",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.7,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 40000,
              "currency": "ALL",
              "frequency": "Monthly"
            },
            "max": {
              "value": 176416,
              "currency": "ALL",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 20
    }
  ],
  AM: [
    {
      "country": "Armenia",
      "country_code": "AM",
      "state": null,
      "state_code": null,
      "currency": "AMD",
      "employer_costs": [],
      "vat_standard_percent": 20
    }
  ],
  AR: [
    {
      "country": "Argentina",
      "country_code": "AR",
      "state": null,
      "state_code": null,
      "currency": "ARS",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 12.16,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 3.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Life Insurance",
          "fixed_amount": {
            "value": 334.67,
            "currency": "ARS"
          },
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "Notice Pay-in-Lieu",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 21
    }
  ],
  AU: [
    {
      "country": "Australia",
      "country_code": "AU",
      "state": null,
      "state_code": null,
      "currency": "AUD",
      "employer_costs": [
        {
          "name": "State Payroll Tax",
          "rate_percent": 5.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 3.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 12,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 30000,
            "currency": "AUD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 10
    },
    {
      "country": "Australia",
      "country_code": "AU",
      "state": "New South Wales",
      "state_code": "NSW",
      "currency": "AUD",
      "employer_costs": [
        {
          "name": "State Payroll Tax",
          "rate_percent": 5.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 12,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 30000,
            "currency": "AUD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 10
    },
    {
      "country": "Australia",
      "country_code": "AU",
      "state": "Queensland",
      "state_code": "QLD",
      "currency": "AUD",
      "employer_costs": [
        {
          "name": "State Payroll Tax",
          "rate_percent": 4.975,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 12,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 30000,
            "currency": "AUD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 10
    },
    {
      "country": "Australia",
      "country_code": "AU",
      "state": "South Australia",
      "state_code": "SA",
      "currency": "AUD",
      "employer_costs": [
        {
          "name": "State Payroll Tax",
          "rate_percent": 4.95,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 12,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 30000,
            "currency": "AUD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 10
    },
    {
      "country": "Australia",
      "country_code": "AU",
      "state": "Victoria",
      "state_code": "VIC",
      "currency": "AUD",
      "employer_costs": [
        {
          "name": "State Payroll Tax",
          "rate_percent": 5.9,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 12,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 30000,
            "currency": "AUD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 10
    },
    {
      "country": "Australia",
      "country_code": "AU",
      "state": "Western Australia",
      "state_code": "WA",
      "currency": "AUD",
      "employer_costs": [
        {
          "name": "State Payroll Tax",
          "rate_percent": 6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 12,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 30000,
            "currency": "AUD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 10
    }
  ],
  AZ: [
    {
      "country": "Azerbaijan",
      "country_code": "AZ",
      "state": null,
      "state_code": null,
      "currency": "AZN",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 22,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 0.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 18
    }
  ],
  BA: [
    {
      "country": "Bosnia and Herzegovina",
      "country_code": "BA",
      "state": null,
      "state_code": null,
      "currency": "BAM",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 4,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 0.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Natural Disasters Fund",
          "rate_percent": 0.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Water Fund",
          "rate_percent": 0.01,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 17
    }
  ],
  BD: [
    {
      "country": "Bangladesh",
      "country_code": "BD",
      "state": null,
      "state_code": null,
      "currency": "BDT",
      "employer_costs": [
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "14th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "Notice Pay-in-Lieu",
          "rate_percent": 33.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 15
    }
  ],
  BE: [
    {
      "country": "Belgium",
      "country_code": "BE",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 28,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 21
    }
  ],
  BG: [
    {
      "country": "Bulgaria",
      "country_code": "BG",
      "state": null,
      "state_code": null,
      "currency": "BGN",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 13.72,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 1077,
              "currency": "BGN",
              "frequency": "Monthly"
            },
            "max": {
              "value": 4130,
              "currency": "BGN",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 4.8,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 1077,
              "currency": "BGN",
              "frequency": "Monthly"
            },
            "max": {
              "value": 4130,
              "currency": "BGN",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.75,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 20
    }
  ],
  BH: [
    {
      "country": "Bahrain",
      "country_code": "BH",
      "state": null,
      "state_code": null,
      "currency": "BHD",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 16,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Gratuity",
          "rate_percent": 6.3,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 10
    }
  ],
  BO: [
    {
      "country": "Bolivia",
      "country_code": "BO",
      "state": null,
      "state_code": null,
      "currency": "BOB",
      "employer_costs": [
        {
          "name": "Housing Fund",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1.71,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 10,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Solidarity Tax",
          "rate_percent": 3,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 13
    }
  ],
  BR: [
    {
      "country": "Brazil",
      "country_code": "BR",
      "state": null,
      "state_code": null,
      "currency": "BRL",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 23.4,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "FGTS",
          "rate_percent": 8,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Terceiros",
          "rate_percent": 3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 338880,
            "currency": "BRL",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Vacation Bonus",
          "rate_percent": 2.78,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "FGTS Termination Penalty",
          "rate_percent": 3.2,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "Notice Pay-in-Lieu",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "Meal Voucher",
          "fixed_amount": {
            "value": 35,
            "currency": "BRL"
          },
          "frequency": "Daily",
          "type": "mandatory_allowance"
        },
        {
          "name": "Grocery Voucher",
          "fixed_amount": {
            "value": 163.83,
            "currency": "BRL"
          },
          "frequency": "Monthly",
          "type": "mandatory_allowance"
        },
        {
          "name": "Transport Allowance",
          "fixed_amount": {
            "value": 350,
            "currency": "BRL"
          },
          "frequency": "Monthly",
          "type": "mandatory_allowance"
        }
      ],
      "vat_standard_percent": 17
    }
  ],
  CA: [
    {
      "country": "Canada",
      "country_code": "CA",
      "state": null,
      "state_code": null,
      "currency": "CAD",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 5.95,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 3500,
              "currency": "CAD",
              "frequency": "Annual"
            },
            "max": {
              "value": 68500,
              "currency": "CAD",
              "frequency": "Annual"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund CPP2",
          "rate_percent": 4,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 68500,
              "currency": "CAD",
              "frequency": "Annual"
            },
            "max": {
              "value": 73200,
              "currency": "CAD",
              "frequency": "Annual"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 2.32,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 61500,
            "currency": "CAD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 5
    },
    {
      "country": "Canada",
      "country_code": "CA",
      "state": "Alberta",
      "state_code": "AB",
      "currency": "CAD",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 5.95,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 3500,
              "currency": "CAD",
              "frequency": "Annual"
            },
            "max": {
              "value": 71300,
              "currency": "CAD",
              "frequency": "Annual"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund CPP2",
          "rate_percent": 4,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 71300,
              "currency": "CAD",
              "frequency": "Annual"
            },
            "max": {
              "value": 81200,
              "currency": "CAD",
              "frequency": "Annual"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1.64,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 65700,
            "currency": "CAD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 2.615,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 106400,
            "currency": "CAD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 5
    },
    {
      "country": "Canada",
      "country_code": "CA",
      "state": "British Columbia",
      "state_code": "BC",
      "currency": "CAD",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 5.95,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 3500,
              "currency": "CAD",
              "frequency": "Annual"
            },
            "max": {
              "value": 71300,
              "currency": "CAD",
              "frequency": "Annual"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund (CPP2)",
          "rate_percent": 4,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 71300,
              "currency": "CAD",
              "frequency": "Annual"
            },
            "max": {
              "value": 81200,
              "currency": "CAD",
              "frequency": "Annual"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1.64,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 65700,
            "currency": "CAD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1.55,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 121500,
            "currency": "CAD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "State Payroll Tax",
          "rate_percent": 1.95,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 12
    },
    {
      "country": "Canada",
      "country_code": "CA",
      "state": "Nova Scotia",
      "state_code": "NS",
      "currency": "CAD",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 5.95,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 3500,
              "currency": "CAD",
              "frequency": "Annual"
            },
            "max": {
              "value": 71300,
              "currency": "CAD",
              "frequency": "Annual"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund (CPP2)",
          "rate_percent": 4,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 71300,
              "currency": "CAD",
              "frequency": "Annual"
            },
            "max": {
              "value": 81200,
              "currency": "CAD",
              "frequency": "Annual"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1.64,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 65700,
            "currency": "CAD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 2.65,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 76300,
            "currency": "CAD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 15
    },
    {
      "country": "Canada",
      "country_code": "CA",
      "state": "Ontario",
      "state_code": "ON",
      "currency": "CAD",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 5.95,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 3500,
              "currency": "CAD",
              "frequency": "Annual"
            },
            "max": {
              "value": 71300,
              "currency": "CAD",
              "frequency": "Annual"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund (CPP2)",
          "rate_percent": 4,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 71300,
              "currency": "CAD",
              "frequency": "Annual"
            },
            "max": {
              "value": 81200,
              "currency": "CAD",
              "frequency": "Annual"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1.64,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 65700,
            "currency": "CAD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1.815,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 117000,
            "currency": "CAD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "State Payroll Tax",
          "rate_percent": 1.95,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 13
    },
    {
      "country": "Canada",
      "country_code": "CA",
      "state": "Quebec",
      "state_code": "QC",
      "currency": "CAD",
      "employer_costs": [
        {
          "name": "Health Insurance",
          "rate_percent": 2.755,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1.78,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 65700,
            "currency": "CAD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Parental Insurance",
          "rate_percent": 0.692,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 98000,
            "currency": "CAD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund (QPP2)",
          "rate_percent": 5.4,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 3500,
              "currency": "CAD",
              "frequency": "Annual"
            },
            "max": {
              "value": 71300,
              "currency": "CAD",
              "frequency": "Annual"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Labor Standards",
          "rate_percent": 0.06,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 98000,
            "currency": "CAD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 5
    }
  ],
  CH: [
    {
      "country": "Switzerland",
      "country_code": "CH",
      "state": null,
      "state_code": null,
      "currency": "CHF",
      "employer_costs": [],
      "vat_standard_percent": null,
      "_note": "sparse source data"
    }
  ],
  CI: [
    {
      "country": "Cote D'Ivoire",
      "country_code": "CI",
      "state": null,
      "state_code": null,
      "currency": "XOF",
      "employer_costs": [
        {
          "name": "Family Allowance Fund",
          "rate_percent": 5.75,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 70000,
            "currency": "XOF",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 70000,
            "currency": "XOF",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 7.7,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 2700000,
            "currency": "XOF",
            "frequency": "Monthly"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 18
    }
  ],
  CL: [
    {
      "country": "Chile",
      "country_code": "CL",
      "state": null,
      "state_code": null,
      "currency": "CLP",
      "employer_costs": [
        {
          "name": "Unemployment Insurance",
          "rate_percent": 2.4,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 4859205.27,
            "currency": "CLP",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Disability Insurance",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 3234966.14,
            "currency": "CLP",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.95,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 3234966.14,
            "currency": "CLP",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "Notice Pay-in-Lieu",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 19
    }
  ],
  CM: [
    {
      "country": "Cameroon",
      "country_code": "CM",
      "state": null,
      "state_code": null,
      "currency": "XAF",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 4.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 750000,
            "currency": "XAF",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Family Allowance Fund",
          "rate_percent": 7,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 750000,
            "currency": "XAF",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Housing Fund",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 3.375,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 19.25
    }
  ],
  CN: [
    {
      "country": "China",
      "country_code": "CN",
      "state": null,
      "state_code": null,
      "currency": "CNY",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 16,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 35283,
            "currency": "CNY",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 0.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 35283,
            "currency": "CNY",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 9.8,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 35283,
            "currency": "CNY",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1.05,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 35283,
            "currency": "CNY",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Housing Fund",
          "rate_percent": 8.5,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 13
    }
  ],
  CO: [
    {
      "country": "Colombia",
      "country_code": "CO",
      "state": null,
      "state_code": null,
      "currency": "COP",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 12,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 8.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 3.74,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Family Allowance Fund",
          "rate_percent": 4,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Family Welfare (ICBF)",
          "rate_percent": 3,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "Severance Interest",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "accrual"
        }
      ],
      "vat_standard_percent": 19
    }
  ],
  CR: [
    {
      "country": "Costa Rica",
      "country_code": "CR",
      "state": null,
      "state_code": null,
      "currency": "CRC",
      "employer_costs": [
        {
          "name": "Health Insurance",
          "rate_percent": 9.25,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 5.42,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Banco Popular Employer Fee",
          "rate_percent": 0.25,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Family Allowance Fund",
          "rate_percent": 5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Aid IMAS",
          "rate_percent": 0.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Banco Popular Contribution",
          "rate_percent": 0.25,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Labor Capitalization Fund",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Complementary Pension Fund",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 5.34,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "Notice Pay-in-Lieu",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 13
    }
  ],
  CY: [
    {
      "country": "Cyprus",
      "country_code": "CY",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 8.8,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 66612,
            "currency": "EUR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Cohesion Fund",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Severance Fund",
          "rate_percent": 1.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 66612,
            "currency": "EUR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 0.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 66612,
            "currency": "EUR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 2.9,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 180000,
            "currency": "EUR",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 19
    }
  ],
  CZ: [
    {
      "country": "Czech Republic",
      "country_code": "CZ",
      "state": null,
      "state_code": null,
      "currency": "CZK",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 24.8,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 2234736,
            "currency": "CZK",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 9,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 21
    }
  ],
  DE: [
    {
      "country": "Germany",
      "country_code": "DE",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Health Insurance",
          "rate_percent": 8.15,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 5512.5,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 9.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 8050,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 8050,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Long-Term Care Insurance",
          "rate_percent": 1.7,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 5512.5,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Umlage U1/U2/U3",
          "rate_percent": 0.64,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 19
    }
  ],
  DK: [
    {
      "country": "Denmark",
      "country_code": "DK",
      "state": null,
      "state_code": null,
      "currency": "DKK",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "fixed_amount": {
            "value": 2376,
            "currency": "DKK"
          },
          "frequency": "Annual",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "fixed_amount": {
            "value": 5300,
            "currency": "DKK"
          },
          "frequency": "Annual",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "fixed_amount": {
            "value": 5000,
            "currency": "DKK"
          },
          "frequency": "Annual",
          "type": "statutory"
        },
        {
          "name": "Maternity Leave Fund",
          "fixed_amount": {
            "value": 1500,
            "currency": "DKK"
          },
          "frequency": "Annual",
          "type": "statutory"
        },
        {
          "name": "Holiday Allowance",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "accrual"
        }
      ],
      "vat_standard_percent": 25
    }
  ],
  DO: [
    {
      "country": "Dominican Republic",
      "country_code": "DO",
      "state": null,
      "state_code": null,
      "currency": "DOP",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 7.1,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 269640,
            "currency": "DOP",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 7.09,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 134820,
            "currency": "DOP",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 53928,
            "currency": "DOP",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 5.75,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 18
    }
  ],
  EC: [
    {
      "country": "Ecuador",
      "country_code": "EC",
      "state": null,
      "state_code": null,
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 12.15,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Reserve Fund",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "14th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 15
    }
  ],
  EE: [
    {
      "country": "Estonia",
      "country_code": "EE",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 20,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 13,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 0.8,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 24
    }
  ],
  EG: [
    {
      "country": "Egypt",
      "country_code": "EG",
      "state": null,
      "state_code": null,
      "currency": "EGP",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 18.75,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 2700,
              "currency": "EGP",
              "frequency": "Annual"
            },
            "max": {
              "value": 16700,
              "currency": "EGP",
              "frequency": "Annual"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Emergency Relief Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 2540,
            "currency": "EGP",
            "frequency": "Monthly"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 14
    }
  ],
  ES: [
    {
      "country": "Spain",
      "country_code": "ES",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 24.27,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 1260,
              "currency": "EUR",
              "frequency": "Monthly"
            },
            "max": {
              "value": 5101.2,
              "currency": "EUR",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 5.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Salary Guarantee Fund",
          "rate_percent": 0.2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 0.6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 2.05,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Solidarity Tax",
          "rate_percent": 0.865,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 21
    }
  ],
  ET: [
    {
      "country": "Ethiopia",
      "country_code": "ET",
      "state": null,
      "state_code": null,
      "currency": "ETB",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 11,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 15
    }
  ],
  FI: [
    {
      "country": "Finland",
      "country_code": "FI",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 17.4,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.87,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 0.27,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 2478000,
            "currency": "EUR",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 24
    }
  ],
  FR: [
    {
      "country": "France",
      "country_code": "FR",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Health Insurance",
          "rate_percent": 10,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Solidarity Tax",
          "rate_percent": 0.3,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 8.55,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 3864,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security Uncapped",
          "rate_percent": 1.9,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Family Allowance Fund",
          "rate_percent": 4.35,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 4.25,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 15456,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Wage Guarantee Insurance",
          "rate_percent": 0.15,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 6.22,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 3864,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund Tier 2",
          "rate_percent": 14.78,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 20
    }
  ],
  GB: [
    {
      "country": "United Kingdom",
      "country_code": "GB",
      "state": null,
      "state_code": null,
      "currency": "GBP",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 3,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 520,
              "currency": "GBP",
              "frequency": "Monthly"
            },
            "max": {
              "value": 4189,
              "currency": "GBP",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 0.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 13.8,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 417,
              "currency": "GBP",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 20
    }
  ],
  GE: [
    {
      "country": "Georgia",
      "country_code": "GE",
      "state": null,
      "state_code": null,
      "currency": "GEL",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 18
    }
  ],
  GH: [
    {
      "country": "Ghana",
      "country_code": "GH",
      "state": null,
      "state_code": null,
      "currency": "GHS",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 13,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 61000,
            "currency": "GHS",
            "frequency": "Monthly"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 15
    }
  ],
  GR: [
    {
      "country": "Greece",
      "country_code": "GR",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 13.33,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7572.62,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 4.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7572.62,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health in Benefit",
          "rate_percent": 0.25,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7572.62,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Supplementary Insurance",
          "rate_percent": 3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7572.62,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1.41,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7572.62,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "14th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        }
      ],
      "vat_standard_percent": 24
    }
  ],
  GT: [
    {
      "country": "Guatemala",
      "country_code": "GT",
      "state": null,
      "state_code": null,
      "currency": "GTQ",
      "employer_costs": [
        {
          "name": "Workers Recreational Institute",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 10.67,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "14th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 12
    }
  ],
  HK: [
    {
      "country": "Hong Kong",
      "country_code": "HK",
      "state": null,
      "state_code": null,
      "currency": "HKD",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 30000,
            "currency": "HKD",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 0
    }
  ],
  HN: [
    {
      "country": "Honduras",
      "country_code": "HN",
      "state": null,
      "state_code": null,
      "currency": "HNL",
      "employer_costs": [
        {
          "name": "Health Insurance",
          "rate_percent": 5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 3.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 10282.37,
            "currency": "HNL",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 4,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Collective Capitalization Pillar",
          "rate_percent": 2.6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "14th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        }
      ],
      "vat_standard_percent": 15
    }
  ],
  HR: [
    {
      "country": "Croatia",
      "country_code": "HR",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Health Insurance",
          "rate_percent": 16.5,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 25
    }
  ],
  HU: [
    {
      "country": "Hungary",
      "country_code": "HU",
      "state": null,
      "state_code": null,
      "currency": "HUF",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 13,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 27
    }
  ],
  ID: [
    {
      "country": "Indonesia",
      "country_code": "ID",
      "state": null,
      "state_code": null,
      "currency": "IDR",
      "employer_costs": [
        {
          "name": "Workers Compensation",
          "rate_percent": 0.99,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 3.7,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Death Insurance",
          "rate_percent": 0.3,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 11086300,
            "currency": "IDR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 4,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 12000000,
            "currency": "IDR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        }
      ],
      "vat_standard_percent": 11
    }
  ],
  IE: [
    {
      "country": "Ireland",
      "country_code": "IE",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 10.025,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 23
    }
  ],
  IL: [
    {
      "country": "Israel",
      "country_code": "IL",
      "state": null,
      "state_code": null,
      "currency": "ILS",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 3.55,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7522,
            "currency": "ILS",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 7.6,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 7522,
              "currency": "ILS",
              "frequency": "Monthly"
            },
            "max": {
              "value": 49030,
              "currency": "ILS",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 6.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 18
    }
  ],
  IN: [
    {
      "country": "India",
      "country_code": "IN",
      "state": null,
      "state_code": null,
      "currency": "INR",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 12,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 15000,
            "currency": "INR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 3.25,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 21000,
            "currency": "INR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Deposit Linked Insurance",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Gratuity",
          "rate_percent": 4.11,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": null
    }
  ],
  IS: [
    {
      "country": "Iceland",
      "country_code": "IS",
      "state": null,
      "state_code": null,
      "currency": "ISK",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 6.35,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 12,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Holiday Allowance",
          "rate_percent": 10.17,
          "frequency": "Monthly",
          "type": "accrual"
        }
      ],
      "vat_standard_percent": null
    }
  ],
  IT: [
    {
      "country": "Italy",
      "country_code": "IT",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 30.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.7,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Termination Indemnity",
          "rate_percent": 7.41,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 22
    }
  ],
  JM: [
    {
      "country": "Jamaica",
      "country_code": "JM",
      "state": null,
      "state_code": null,
      "currency": "JMD",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 5000000,
            "currency": "JMD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Housing Fund",
          "rate_percent": 3,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Education Tax",
          "rate_percent": 3.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 3,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 15
    }
  ],
  JO: [
    {
      "country": "Jordan",
      "country_code": "JO",
      "state": null,
      "state_code": null,
      "currency": "JOD",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 14.25,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 16
    }
  ],
  JP: [
    {
      "country": "Japan",
      "country_code": "JP",
      "state": null,
      "state_code": null,
      "currency": "JPY",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 9.15,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 650000,
            "currency": "JPY",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 4.94,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 1390000,
            "currency": "JPY",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Nursing Care Insurance",
          "rate_percent": 0.8,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 1390000,
            "currency": "JPY",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 0.88,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 4.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Child-rearing Contribution",
          "rate_percent": 0.36,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 650000,
            "currency": "JPY",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Childcare Support Contribution",
          "rate_percent": 0.06,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 10
    }
  ],
  KE: [
    {
      "country": "Kenya",
      "country_code": "KE",
      "state": null,
      "state_code": null,
      "currency": "KES",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 6,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 108000,
            "currency": "KES",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Housing Fund",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "fixed_amount": {
            "value": 50,
            "currency": "KES"
          },
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 16
    }
  ],
  KH: [
    {
      "country": "Cambodia",
      "country_code": "KH",
      "state": null,
      "state_code": null,
      "currency": "KHR",
      "employer_costs": [
        {
          "name": "Health Insurance",
          "rate_percent": 2.6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 0.8,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 1200000,
            "currency": "KHR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 1200000,
            "currency": "KHR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 4.17,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 10
    }
  ],
  KR: [
    {
      "country": "South Korea",
      "country_code": "KR",
      "state": null,
      "state_code": null,
      "currency": "KRW",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 4.75,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 3.595,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Long-Term Care Insurance",
          "rate_percent": 0.9448,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.76,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1.15,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 10
    }
  ],
  KZ: [
    {
      "country": "Kazakhstan",
      "country_code": "KZ",
      "state": null,
      "state_code": null,
      "currency": "KZT",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 3,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Tax",
          "rate_percent": 11,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 2.5,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 12
    }
  ],
  LK: [
    {
      "country": "Sri Lanka",
      "country_code": "LK",
      "state": null,
      "state_code": null,
      "currency": "LKR",
      "employer_costs": [
        {
          "name": "Family Allowance Fund",
          "rate_percent": 5.75,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 3.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 12,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Employees Trust Fund",
          "rate_percent": 3,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Gratuity",
          "rate_percent": 4.17,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 8
    }
  ],
  LT: [
    {
      "country": "Lithuania",
      "country_code": "LT",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 2.13,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 21
    }
  ],
  LU: [
    {
      "country": "Luxembourg",
      "country_code": "LU",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 8.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 2.93,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 12854.64,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.5525,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 12854.64,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Mutual Health Benefit",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 12854.64,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Occupational Medicine",
          "rate_percent": 0.14,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 12854.64,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 17
    }
  ],
  LV: [
    {
      "country": "Latvia",
      "country_code": "LV",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 22.18,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 105300,
            "currency": "EUR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "Notice Pay-in-Lieu",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 21
    }
  ],
  MA: [
    {
      "country": "Morocco",
      "country_code": "MA",
      "state": null,
      "state_code": null,
      "currency": "MAD",
      "employer_costs": [
        {
          "name": "Family Allowance Fund",
          "rate_percent": 6.4,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 8.6,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 6000,
            "currency": "MAD",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 4.11,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 1.6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Solidarity Tax",
          "rate_percent": 2.5,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 20
    }
  ],
  MD: [
    {
      "country": "Moldova, Republic of",
      "country_code": "MD",
      "state": null,
      "state_code": null,
      "currency": "MDL",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 24,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 20
    }
  ],
  ME: [
    {
      "country": "Montenegro",
      "country_code": "ME",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 5.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 53371,
            "currency": "EUR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 2.3,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 0.5,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 21
    }
  ],
  MG: [
    {
      "country": "Madagascar",
      "country_code": "MG",
      "state": null,
      "state_code": null,
      "currency": "MGA",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 13,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 1910400,
            "currency": "MGA",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 1910400,
            "currency": "MGA",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 14,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 2.74,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 20
    }
  ],
  MK: [
    {
      "country": "North Macedonia",
      "country_code": "MK",
      "state": null,
      "state_code": null,
      "currency": "MKD",
      "employer_costs": [],
      "vat_standard_percent": 18
    }
  ],
  MN: [
    {
      "country": "Mongolia",
      "country_code": "MN",
      "state": null,
      "state_code": null,
      "currency": "MNT",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 8.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 1,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 6600000,
            "currency": "MNT",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 6600000,
            "currency": "MNT",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 0.5,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 10
    }
  ],
  MO: [
    {
      "country": "Macao",
      "country_code": "MO",
      "state": null,
      "state_code": null,
      "currency": "MOP",
      "employer_costs": [
        {
          "name": "Social Security",
          "fixed_amount": {
            "value": 60,
            "currency": "MOP"
          },
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": null
    }
  ],
  MT: [
    {
      "country": "Malta",
      "country_code": "MT",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 10,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 27679,
            "currency": "EUR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Statutory Bonus",
          "fixed_amount": {
            "value": 512.52,
            "currency": "EUR"
          },
          "frequency": "Annual",
          "type": "mandatory_allowance"
        },
        {
          "name": "Cost of Living Allowance (COLA)",
          "fixed_amount": {
            "value": 272.48,
            "currency": "EUR"
          },
          "frequency": "Annual",
          "type": "mandatory_allowance"
        }
      ],
      "vat_standard_percent": 18
    }
  ],
  MU: [
    {
      "country": "Mauritius",
      "country_code": "MU",
      "state": null,
      "state_code": null,
      "currency": "MUR",
      "employer_costs": [
        {
          "name": "Solidarity Tax",
          "rate_percent": 4.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 2.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 24315,
            "currency": "MUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        }
      ],
      "vat_standard_percent": 15
    }
  ],
  MX: [
    {
      "country": "Mexico",
      "country_code": "MX",
      "state": null,
      "state_code": null,
      "currency": "MXN",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 31,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 234199.8,
            "currency": "MXN",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "State Payroll Tax",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 4.11,
          "frequency": "Monthly",
          "type": "accrual"
        }
      ],
      "vat_standard_percent": 16
    }
  ],
  MY: [
    {
      "country": "Malaysia",
      "country_code": "MY",
      "state": null,
      "state_code": null,
      "currency": "MYR",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 12.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 1.75,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 0.2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 8
    }
  ],
  MZ: [
    {
      "country": "Mozambique",
      "country_code": "MZ",
      "state": null,
      "state_code": null,
      "currency": "MZN",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 4,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": null
    }
  ],
  NA: [
    {
      "country": "Namibia",
      "country_code": "NA",
      "state": null,
      "state_code": null,
      "currency": "NAD",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 0.9,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 9000,
            "currency": "NAD",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 4.5,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": null
    }
  ],
  NG: [
    {
      "country": "Nigeria",
      "country_code": "NG",
      "state": null,
      "state_code": null,
      "currency": "NGN",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 10,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 6.63,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 7.5
    }
  ],
  NI: [
    {
      "country": "Nicaragua",
      "country_code": "NI",
      "state": null,
      "state_code": null,
      "currency": "NIO",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 13,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "War Victims",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 15
    }
  ],
  NL: [
    {
      "country": "Netherlands",
      "country_code": "NL",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 6.55,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 75864,
            "currency": "EUR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 5.24,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 75864,
            "currency": "EUR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 6.57,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 75864,
            "currency": "EUR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "WHK Work Resumption Fund",
          "rate_percent": 1.74,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 75864,
            "currency": "EUR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Family Allowance Fund",
          "rate_percent": 0.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 75864,
            "currency": "EUR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Holiday Allowance",
          "rate_percent": 8,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 2.78,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "Notice Pay-in-Lieu",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 21
    }
  ],
  NO: [
    {
      "country": "Norway",
      "country_code": "NO",
      "state": null,
      "state_code": null,
      "currency": "NOK",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 16.6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Holiday Allowance",
          "rate_percent": 10.2,
          "frequency": "Monthly",
          "type": "accrual"
        }
      ],
      "vat_standard_percent": 25
    }
  ],
  NP: [
    {
      "country": "Nepal",
      "country_code": "NP",
      "state": null,
      "state_code": null,
      "currency": "NPR",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 10,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Gratuity",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 1.67,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "Notice Pay-in-Lieu",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 13
    }
  ],
  NZ: [
    {
      "country": "New Zealand",
      "country_code": "NZ",
      "state": null,
      "state_code": null,
      "currency": "NZD",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 3.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1.53,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 142283,
            "currency": "NZD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 15
    }
  ],
  OM: [
    {
      "country": "Oman",
      "country_code": "OM",
      "state": null,
      "state_code": null,
      "currency": "OMR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 10.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Gratuity",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 5
    }
  ],
  PA: [
    {
      "country": "Panama",
      "country_code": "PA",
      "state": null,
      "state_code": null,
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 12.25,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1.92,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Education Tax",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 3.33,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        }
      ],
      "vat_standard_percent": 7
    }
  ],
  PE: [
    {
      "country": "Peru",
      "country_code": "PE",
      "state": null,
      "state_code": null,
      "currency": "PEN",
      "employer_costs": [
        {
          "name": "Health Insurance",
          "rate_percent": 9.38,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 9.72,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "13th Salary",
          "rate_percent": 16.67,
          "frequency": "Monthly",
          "type": "accrual"
        }
      ],
      "vat_standard_percent": 18
    }
  ],
  PH: [
    {
      "country": "Philippines",
      "country_code": "PH",
      "state": null,
      "state_code": null,
      "currency": "PHP",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 10,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 5000,
              "currency": "PHP",
              "frequency": "Monthly"
            },
            "max": {
              "value": 35000,
              "currency": "PHP",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 2.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Housing Fund",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "Notice Pay-in-Lieu",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 12
    }
  ],
  PK: [
    {
      "country": "Pakistan",
      "country_code": "PK",
      "state": null,
      "state_code": null,
      "currency": "PKR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 444000,
            "currency": "PKR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "Notice Pay-in-Lieu",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 17
    }
  ],
  PL: [
    {
      "country": "Poland",
      "country_code": "PL",
      "state": null,
      "state_code": null,
      "currency": "PLN",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 9.76,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 260190,
            "currency": "PLN",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Disability Fund",
          "rate_percent": 6.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 260190,
            "currency": "PLN",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 2.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Guaranteed Employee Benefits Fund",
          "rate_percent": 0.1,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 23
    }
  ],
  PR: [
    {
      "country": "Puerto Rico",
      "country_code": "PR",
      "state": null,
      "state_code": null,
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "State Unemployment Tax",
          "rate_percent": 3.4,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Holiday Allowance",
          "rate_percent": 2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 600,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 11.5
    }
  ],
  PT: [
    {
      "country": "Portugal",
      "country_code": "PT",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 23.75,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 1.88,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Wage Guarantee Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "14th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        }
      ],
      "vat_standard_percent": 23
    }
  ],
  PY: [
    {
      "country": "Paraguay",
      "country_code": "PY",
      "state": null,
      "state_code": null,
      "currency": "PYG",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 16.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 4.17,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 10
    }
  ],
  QA: [
    {
      "country": "Qatar",
      "country_code": "QA",
      "state": null,
      "state_code": null,
      "currency": "QAR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 14,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 100000,
            "currency": "QAR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Nationalization Fee",
          "rate_percent": 5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Gratuity",
          "rate_percent": 5.75,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": null
    }
  ],
  RO: [
    {
      "country": "Romania",
      "country_code": "RO",
      "state": null,
      "state_code": null,
      "currency": "RON",
      "employer_costs": [
        {
          "name": "Unemployment Insurance",
          "rate_percent": 2.25,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 4,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 19
    }
  ],
  RS: [
    {
      "country": "Serbia",
      "country_code": "RS",
      "state": null,
      "state_code": null,
      "currency": "RSD",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 10,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 45950,
              "currency": "RSD",
              "frequency": "Monthly"
            },
            "max": {
              "value": 732820,
              "currency": "RSD",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 5.15,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 20
    }
  ],
  RW: [
    {
      "country": "Rwanda",
      "country_code": "RW",
      "state": null,
      "state_code": null,
      "currency": "RWF",
      "employer_costs": [
        {
          "name": "Workers Compensation",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Family Allowance Fund",
          "rate_percent": 0.3,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 7.5,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 18
    }
  ],
  SA: [
    {
      "country": "Saudi Arabia",
      "country_code": "SA",
      "state": null,
      "state_code": null,
      "currency": "SAR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 9,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 1500,
              "currency": "SAR",
              "frequency": "Monthly"
            },
            "max": {
              "value": 45000,
              "currency": "SAR",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 1500,
              "currency": "SAR",
              "frequency": "Monthly"
            },
            "max": {
              "value": 45000,
              "currency": "SAR",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Gratuity",
          "rate_percent": 4.17,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 15
    }
  ],
  SE: [
    {
      "country": "Sweden",
      "country_code": "SE",
      "state": null,
      "state_code": null,
      "currency": "SEK",
      "employer_costs": [
        {
          "name": "Health Insurance",
          "rate_percent": 3.55,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Family Allowance Fund",
          "rate_percent": 2.6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 10.21,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Survivors Pension",
          "rate_percent": 0.6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 2.65,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "General Payroll Tax",
          "rate_percent": 11.62,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Holiday Allowance",
          "rate_percent": 12,
          "frequency": "Monthly",
          "type": "accrual"
        }
      ],
      "vat_standard_percent": 25
    }
  ],
  SG: [
    {
      "country": "Singapore",
      "country_code": "SG",
      "state": null,
      "state_code": null,
      "currency": "SGD",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 17,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 8000,
            "currency": "SGD",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 0.25,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 9
    }
  ],
  SI: [
    {
      "country": "Slovenia",
      "country_code": "SI",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 8.85,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 6.56,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 0.06,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.53,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Family Allowance Fund",
          "rate_percent": 0.1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Meal Voucher",
          "fixed_amount": {
            "value": 7.96,
            "currency": "EUR"
          },
          "frequency": "Daily",
          "type": "mandatory_allowance"
        }
      ],
      "vat_standard_percent": 22
    }
  ],
  SK: [
    {
      "country": "Slovakia",
      "country_code": "SK",
      "state": null,
      "state_code": null,
      "currency": "EUR",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 14,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 15730,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 1.4,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 15730,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 15730,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 15730,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Guarantee Insurance",
          "rate_percent": 0.25,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 15730,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.8,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Solidarity Reserve Fund",
          "rate_percent": 4.75,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 15730,
            "currency": "EUR",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 11,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Meal Voucher",
          "fixed_amount": {
            "value": 3.43,
            "currency": "EUR"
          },
          "frequency": "Daily",
          "type": "mandatory_allowance"
        }
      ],
      "vat_standard_percent": 20
    }
  ],
  SN: [
    {
      "country": "Senegal",
      "country_code": "SN",
      "state": null,
      "state_code": null,
      "currency": "XOF",
      "employer_costs": [
        {
          "name": "Family Allowance Fund",
          "rate_percent": 7,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 63000,
            "currency": "XOF",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 63000,
            "currency": "XOF",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 4.75,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 250000,
            "currency": "XOF",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 10.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 432000,
            "currency": "XOF",
            "frequency": "Monthly"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 18
    }
  ],
  SV: [
    {
      "country": "El Salvador",
      "country_code": "SV",
      "state": null,
      "state_code": null,
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 7.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 1000,
            "currency": "USD",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 7.75,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 6523.2,
            "currency": "USD",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 1000,
            "currency": "USD",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 5,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 13
    }
  ],
  TH: [
    {
      "country": "Thailand",
      "country_code": "TH",
      "state": null,
      "state_code": null,
      "currency": "THB",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 3,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 1650,
              "currency": "THB",
              "frequency": "Monthly"
            },
            "max": {
              "value": 17500,
              "currency": "THB",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 1650,
              "currency": "THB",
              "frequency": "Monthly"
            },
            "max": {
              "value": 17500,
              "currency": "THB",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 0.5,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 1650,
              "currency": "THB",
              "frequency": "Monthly"
            },
            "max": {
              "value": 17500,
              "currency": "THB",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.6,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 20000,
            "currency": "THB",
            "frequency": "Monthly"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 7
    }
  ],
  TN: [
    {
      "country": "Tunisia",
      "country_code": "TN",
      "state": null,
      "state_code": null,
      "currency": "TND",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 16.57,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Housing Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 3.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        },
        {
          "name": "Notice Pay-in-Lieu",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 19
    }
  ],
  TR: [
    {
      "country": "Turkey",
      "country_code": "TR",
      "state": null,
      "state_code": null,
      "currency": "TRY",
      "employer_costs": [
        {
          "name": "Workers Compensation",
          "rate_percent": 2.25,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 195041.4,
            "currency": "TRY",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 11,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 195041.4,
            "currency": "TRY",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 7.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 195041.4,
            "currency": "TRY",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 195041.4,
            "currency": "TRY",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 46655.43,
            "currency": "TRY",
            "frequency": "Monthly"
          },
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 18
    }
  ],
  TW: [
    {
      "country": "Taiwan",
      "country_code": "TW",
      "state": null,
      "state_code": null,
      "currency": "TWD",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 8.05,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 0.7,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 6,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 4.84,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 28590,
              "currency": "TWD",
              "frequency": "Monthly"
            },
            "max": {
              "value": 313000,
              "currency": "TWD",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance Supplementary Premium",
          "rate_percent": 2.11,
          "frequency": "Monthly",
          "salary_band": {
            "min": {
              "value": 28590,
              "currency": "TWD",
              "frequency": "Monthly"
            },
            "max": {
              "value": 313000,
              "currency": "TWD",
              "frequency": "Monthly"
            }
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.13,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 5
    }
  ],
  UA: [
    {
      "country": "Ukraine",
      "country_code": "UA",
      "state": null,
      "state_code": null,
      "currency": "UAH",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 22,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 160000,
            "currency": "UAH",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Military Tax",
          "rate_percent": 5,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 20
    }
  ],
  UG: [
    {
      "country": "Uganda",
      "country_code": "UG",
      "state": null,
      "state_code": null,
      "currency": "UGX",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 10,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": null
    }
  ],
  US: [
    {
      "country": "United States",
      "country_code": "US",
      "state": "Alaska",
      "state_code": "AK",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 51700,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": null
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Alabama",
      "state_code": "AL",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 2.8,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 8000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 4
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Arkansas",
      "state_code": "AR",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 5.15,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6.5
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Arizona",
      "state_code": "AZ",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 4.88,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 8000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 5.6
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "California",
      "state_code": "CA",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.85,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 7.25
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Colorado",
      "state_code": "CO",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.01,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 2.9
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Connecticut",
      "state_code": "CT",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 26100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6.35
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "District Of Columbia",
      "state_code": "DC",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 4.65,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 9000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 160200,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.6,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 5.75
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Delaware",
      "state_code": "DE",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 2.9,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 12500,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": null
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Federal",
      "state_code": "FED",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": null
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Florida",
      "state_code": "FL",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance",
          "rate_percent": 2.75,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Federal Unemployment Tax (FUTA)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Georgia",
      "state_code": "GA",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 4.07,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 9500,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 4
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Hawaii",
      "state_code": "HI",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 2.8,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 62000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 4
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Iowa",
      "state_code": "IA",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.75,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 30600,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Idaho",
      "state_code": "ID",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 2.81,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 55300,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Illinois",
      "state_code": "IL",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 4.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 13916,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6.25
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Indiana",
      "state_code": "IN",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.95,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 9500,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 7
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Kansas",
      "state_code": "KS",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.33,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 14000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6.5
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Kentucky",
      "state_code": "KY",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 4.65,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 11700,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Louisiana",
      "state_code": "LA",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.15,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7700,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Massachusetts",
      "state_code": "MA",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 2.72,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 15000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Employer Medical Assistance Contribution (EMAC)",
          "rate_percent": 0.23,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 15000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Workforce Training Fund",
          "rate_percent": 0.056,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6.25
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Maryland",
      "state_code": "MD",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.9,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 8500,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Maine",
      "state_code": "ME",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.16,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 12000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 5.5
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Michigan",
      "state_code": "MI",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 5.45,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 9000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Minnesota",
      "state_code": "MN",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 4.65,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 43000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6.875
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Missouri",
      "state_code": "MO",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.33,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 9500,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 4.225
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Northern Mariana Islands",
      "state_code": "MP",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": null
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Mississippi",
      "state_code": "MS",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 2.8,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 14000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 7
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Montana",
      "state_code": "MT",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 0.71,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 45100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": null
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "North Carolina",
      "state_code": "NC",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 2.91,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 32600,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 4.75
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "North Dakota",
      "state_code": "ND",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 4.885,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 45100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 5
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Nebraska",
      "state_code": "NE",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 0.95,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 9000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 5.5
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "New Hampshire",
      "state_code": "NH",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.8,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 14000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": null
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "New Jersey",
      "state_code": "NJ",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 43300,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Family Leave Insurance",
          "rate_percent": 0.33,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6.625
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "New Mexico",
      "state_code": "NM",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 2.865,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 33200,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 5.125
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Nevada",
      "state_code": "NV",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 2.85,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 41800,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6.85
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "New York",
      "state_code": "NY",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 6,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 12800,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 4
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Ohio",
      "state_code": "OH",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 5.25,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 5.75
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Oklahoma",
      "state_code": "OK",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 4.75,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 28200,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 4.5
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Oregon",
      "state_code": "OR",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.15,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 54300,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Benefit Fund",
          "fixed_amount": {
            "value": 0.01,
            "currency": "USD"
          },
          "frequency": "Hourly",
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": null
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Pennsylvania",
      "state_code": "PA",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 5.55,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 10000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Rhode Island",
      "state_code": "RI",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 5.4,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 29800,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Job Development Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 29800,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 7
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "South Carolina",
      "state_code": "SC",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 2.76,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 14000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "South Dakota",
      "state_code": "SD",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 4.675,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 15000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 4.2
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Tennessee",
      "state_code": "TN",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 5.005,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 7
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Texas",
      "state_code": "TX",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.25,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 9000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6.25
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Utah",
      "state_code": "UT",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.7,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 48900,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 4.85
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Virginia",
      "state_code": "VA",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 3.15,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 8000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 4.3
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Virgin Islands",
      "state_code": "VI",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 2.75,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 31100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 6,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": null
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Vermont",
      "state_code": "VT",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 2.9,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 14800,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Washington",
      "state_code": "WA",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 4.21,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 72800,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 6.5
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Wisconsin",
      "state_code": "WI",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 6,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 14000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 5
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "West Virginia",
      "state_code": "WV",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 9500,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": null
    },
    {
      "country": "United States",
      "country_code": "US",
      "state": "Wyoming",
      "state_code": "WY",
      "currency": "USD",
      "employer_costs": [
        {
          "name": "Unemployment Insurance (State)",
          "rate_percent": 4.94,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 32400,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Social Security",
          "rate_percent": 6.2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 176100,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1.45,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance (Federal)",
          "rate_percent": 3.3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 7000,
            "currency": "USD",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Workers Compensation",
          "rate_percent": 0.6,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 4
    }
  ],
  UY: [
    {
      "country": "Uruguay",
      "country_code": "UY",
      "state": null,
      "state_code": null,
      "currency": "UYU",
      "employer_costs": [
        {
          "name": "Health Insurance",
          "rate_percent": 5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 0.1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 7.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 256821,
            "currency": "UYU",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Labor Credit Guarantee Fund",
          "rate_percent": 0.025,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "13th Salary",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Vacation Bonus",
          "rate_percent": 4.5,
          "frequency": "Monthly",
          "type": "accrual"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 22
    }
  ],
  UZ: [
    {
      "country": "Uzbekistan",
      "country_code": "UZ",
      "state": null,
      "state_code": null,
      "currency": "UZS",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 12,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Pension Fund",
          "rate_percent": 0.1,
          "frequency": "Monthly",
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 12
    }
  ],
  VN: [
    {
      "country": "Vietnam",
      "country_code": "VN",
      "state": null,
      "state_code": null,
      "currency": "VND",
      "employer_costs": [
        {
          "name": "Social Security",
          "rate_percent": 17.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 46800000,
            "currency": "VND",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 3,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 46800000,
            "currency": "VND",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1.5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 99200000,
            "currency": "VND",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Trade Union Fee",
          "rate_percent": 2,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 46800000,
            "currency": "VND",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Severance Liability",
          "rate_percent": 4.17,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": 8
    }
  ],
  ZA: [
    {
      "country": "South Africa",
      "country_code": "ZA",
      "state": null,
      "state_code": null,
      "currency": "ZAR",
      "employer_costs": [
        {
          "name": "Training Fund",
          "rate_percent": 1,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 212544,
            "currency": "ZAR",
            "frequency": "Annual"
          },
          "type": "statutory"
        },
        {
          "name": "Unemployment Insurance",
          "rate_percent": 1,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 212544,
            "currency": "ZAR",
            "frequency": "Annual"
          },
          "type": "statutory"
        }
      ],
      "vat_standard_percent": 15
    }
  ],
  ZM: [
    {
      "country": "Zambia",
      "country_code": "ZM",
      "state": null,
      "state_code": null,
      "currency": "ZMW",
      "employer_costs": [
        {
          "name": "Pension Fund",
          "rate_percent": 5,
          "frequency": "Monthly",
          "salary_cap": {
            "value": 1708.2,
            "currency": "ZMW",
            "frequency": "Monthly"
          },
          "type": "statutory"
        },
        {
          "name": "Health Insurance",
          "rate_percent": 1,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Training Fund",
          "rate_percent": 0.5,
          "frequency": "Monthly",
          "type": "statutory"
        },
        {
          "name": "Notice Pay-in-Lieu",
          "rate_percent": 8.33,
          "frequency": "Monthly",
          "type": "termination_liability"
        }
      ],
      "vat_standard_percent": null
    }
  ],
} as const;
