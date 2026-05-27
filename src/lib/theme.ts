import type { ThemeConfig } from "antd";

export const BRAND = {
  // Primary — a deeper, more grown-up emerald that pairs with warm off-white
  primary: "#047857", // emerald-700
  primaryHover: "#065f46", // emerald-800
  primaryActive: "#064e3b", // emerald-900
  primarySoft: "#d1fae5", // emerald-100 — soft success backgrounds

  // Surfaces — warm cream palette, not stone gray
  bg: "#f5f3ee", // page background — warm off-white
  bgContainer: "#fcfaf5", // cards — soft cream, distinct from page
  bgSubtle: "#efece5", // table header / row hover — slightly darker than page
  border: "#e8e3d8", // warm border to match

  // Text
  text: "#1c1917", // stone-900 — main copy
  textSecondary: "#57534e", // stone-600 — secondary
  textMuted: "#a8a29e", // stone-400 — IDs, timestamps

  // Category palette (used by ProviderQuoteCard tags) — coordinated set
  categoryBaseSalary: "#047857", // emerald-700 — match new primary
  categoryStatutory: "#64748b", // slate-500 — neutral, most rows
  categoryAccruals: "#3b82f6", // blue-500 — distinct from statutory
  categorySeverance: "#dc2626", // red-600 — warning
  categoryBonuses: "#a855f7", // purple-500 — future-proof, distinct
  categoryAllowances: "#06b6d4", // cyan-500 — reimbursements / perks
  categoryMarkup: "#f59e0b", // amber-500 — IC markup tag
  categoryOneTime: "#c2410c", // orange-700 — one-time setup costs

  // Elevation
  shadow:
    "0 1px 3px rgba(28, 25, 23, 0.06), 0 1px 2px rgba(28, 25, 23, 0.04)",
  shadowHover:
    "0 4px 12px rgba(28, 25, 23, 0.08), 0 2px 4px rgba(28, 25, 23, 0.04)",
  dangerSoft: "#f3d9d3",
  danger: "#8a4337",

  chart: {
    deelAnchor: "#2f6f63",
    deelAnchorDark: "#234f48",
    inRangeLight: "#5fa888",
    outClay: "#c97161",
    outClayDark: "#a85a4d",
  },
} as const;

export const FLAG_SIZES = {
  sm: 20,
  md: 24,
  lg: 28,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: BRAND.primary,
    colorBgBase: BRAND.bg,
    colorBgContainer: BRAND.bgContainer,
    colorBgLayout: BRAND.bg,
    colorBorder: BRAND.border,
    colorBorderSecondary: BRAND.border,
    colorText: BRAND.text,
    colorTextSecondary: BRAND.textSecondary,
    colorTextTertiary: BRAND.textMuted,

    // Elevation tokens — picked up by Card, Modal, Dropdown
    boxShadow: BRAND.shadow,
    boxShadowSecondary: BRAND.shadowHover,
    boxShadowTertiary: BRAND.shadow,

    borderRadius: 10,
    borderRadiusLG: 12,
    fontSize: 16,
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    controlHeight: 48,
    controlHeightLG: 56,
  },
  components: {
    Button: {
      controlHeight: 48,
      controlHeightLG: 56,
      fontSize: 16,
      paddingInline: 24,
      primaryShadow: "0 1px 2px rgba(4, 120, 87, 0.18)",
    },
    Input: {
      controlHeight: 48,
      controlHeightLG: 56,
      fontSize: 16,
    },
    InputNumber: {
      controlHeight: 48,
      controlHeightLG: 56,
      fontSize: 16,
    },
    Select: {
      controlHeight: 48,
      controlHeightLG: 56,
      fontSize: 16,
      optionFontSize: 16,
      optionHeight: 40,
    },
    Form: {
      labelFontSize: 15,
      verticalLabelPadding: "0 0 6px",
      itemMarginBottom: 20,
    },
    Card: {
      paddingLG: 32,
      headerFontSize: 20,
      headerBg: "transparent",
      boxShadowTertiary: BRAND.shadow,
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 28,
    },
    Tabs: {
      titleFontSize: 16,
      titleFontSizeLG: 17,
      horizontalItemGutter: 32,
      inkBarColor: BRAND.primary,
    },
    Table: {
      headerBg: BRAND.bgSubtle,
      headerColor: BRAND.textSecondary,
      rowHoverBg: BRAND.bgSubtle,
      borderColor: BRAND.border,
    },
    Typography: {
      fontSizeHeading1: 40,
      fontSizeHeading2: 32,
      fontSizeHeading3: 24,
      fontSizeHeading4: 20,
    },
  },
};
