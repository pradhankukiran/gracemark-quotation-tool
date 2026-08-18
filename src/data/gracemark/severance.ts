/**
 * Monthly severance/termination accrual rates supplied by GraceMark.
 *
 * Each value is a percentage of monthly gross salary. The source document
 * uses a conservative, worst-case methodology that includes severance,
 * notice pay, and unused leave exposure.
 */
export const GRACEMARK_SEVERANCE_RATES: Readonly<Record<string, number>> = {
  AE: 41.7, // United Arab Emirates
  AL: 31.1, // Albania
  AM: 30.6, // Armenia
  AR: 34.7, // Argentina
  AU: 43.9, // Australia
  AZ: 39.2, // Azerbaijan
  BA: 22.2, // Bosnia and Herzegovina
  BD: 20.8, // Bangladesh
  BE: 105.6, // Belgium
  BG: 38.9, // Bulgaria
  BH: 24.4, // Bahrain
  BO: 20.8, // Bolivia
  BR: 36.5, // Brazil
  CA: 18.2, // Canada
  CH: 40.3, // Switzerland
  CI: 40, // Cote D'Ivoire
  CL: 20.8, // Chile
  CM: 40, // Cameroon
  CN: 20.8, // China
  CO: 12.5, // Colombia
  CR: 20.6, // Costa Rica
  CY: 30.6, // Cyprus
  CZ: 47.2, // Czech Republic
  DE: 68.1, // Germany
  DK: 81.9, // Denmark
  DO: 19.2, // Dominican Republic
  EC: 14.6, // Ecuador
  EE: 41.1, // Estonia
  EG: 41.7, // Egypt
  ES: 21.7, // Spain
  ET: 21.1, // Ethiopia
  FI: 58.3, // Finland
  FR: 26.3, // France
  GB: 34.2, // United Kingdom
  GE: 31.7, // Georgia
  GH: 20.8, // Ghana
  GR: 15.6, // Greece
  GT: 20.8, // Guatemala
  HK: 17.8, // Hong Kong
  HN: 20.8, // Honduras
  HR: 33.3, // Croatia
  HU: 41.7, // Hungary
  ID: 20, // Indonesia
  IE: 25.2, // Ireland
  IL: 28.6, // Israel
  IN: 18.3, // India
  IS: 35.6, // Iceland
  IT: 40.6, // Italy
  JM: 28.9, // Jamaica
  JO: 22.5, // Jordan
  JP: 13.9, // Japan
  KE: 18.3, // Kenya
  KH: 21.7, // Cambodia
  KR: 12.5, // South Korea
  KZ: 23.3, // Kazakhstan
  LK: 20.6, // Sri Lanka
  LT: 41.1, // Lithuania
  LU: 65.6, // Luxembourg
  LV: 41.1, // Latvia
  MA: 35.8, // Morocco
  MD: 32.8, // Moldova
  ME: 22.2, // Montenegro
  MG: 40, // Madagascar
  MK: 30, // North Macedonia
  MN: 20.8, // Mongolia
  MO: 16.4, // Macao
  MT: 31.7, // Malta
  MU: 30.6, // Mauritius
  MX: 37.2, // Mexico
  MY: 25.4, // Malaysia
  MZ: 21.7, // Mozambique
  NA: 19.2, // Namibia
  NG: 28.3, // Nigeria
  NI: 20.8, // Nicaragua
  NL: 25, // Netherlands
  NO: 56.9, // Norway
  NP: 21.7, // Nepal
  NZ: 22.2, // New Zealand
  OM: 25, // Oman
  PA: 26.9, // Panama
  PE: 20.8, // Peru
  PH: 18.1, // Philippines
  PK: 20.6, // Pakistan
  PL: 40.6, // Poland
  PR: 10.4, // Puerto Rico
  PT: 39.4, // Portugal
  PY: 20.8, // Paraguay
  QA: 21.9, // Qatar
  RO: 13.9, // Romania
  RS: 22.2, // Serbia
  RW: 21.7, // Rwanda
  SA: 30.8, // Saudi Arabia
  SE: 56.9, // Sweden
  SG: 28.9, // Singapore
  SI: 30.6, // Slovenia
  SK: 40.3, // Slovakia
  SN: 40, // Senegal
  SR: 29.2, // Suriname
  SV: 20.8, // El Salvador
  TH: 35, // Thailand
  TN: 21.7, // Tunisia
  TR: 19.3, // Turkey
  TW: 18.1, // Taiwan
  UA: 48.3, // Ukraine
  UG: 39.2, // Uganda
  US: 29.2, // United States
  UY: 13.9, // Uruguay
  UZ: 20.8, // Uzbekistan
  VN: 19.2, // Vietnam
  XK: 22.2, // Kosovo
  ZA: 17.3, // South Africa
  ZM: 23.3, // Zambia
};

export function getGraceMarkSeveranceRate(
  countryCode: string,
): number | null {
  const rate = GRACEMARK_SEVERANCE_RATES[countryCode.toUpperCase()];
  return rate ?? null;
}
