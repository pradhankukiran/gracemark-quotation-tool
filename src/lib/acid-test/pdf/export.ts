"use client";

import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import React from "react";

import {
  AcidTestCostBreakdownDocument,
  type AcidTestPdfProps,
} from "./AcidTestCostBreakdownDocument";

function toSlug(value: string | undefined): string {
  if (!value) return "unknown";
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "unknown";
}

function defaultFilename(data: AcidTestPdfProps): string {
  const provider = toSlug(data.providerSlug);
  const country = toSlug(data.countrySlug);
  return `gracemark-acid-test-${provider}-${country}.pdf`;
}

export async function exportAcidTestPdf(
  data: AcidTestPdfProps,
  filename?: string,
): Promise<void> {
  // The component returns a <Document> root; cast the element type so the
  // pdf() helper accepts it. Keeping the file as .ts (no JSX) per spec.
  const element = React.createElement(
    AcidTestCostBreakdownDocument,
    data,
  ) as unknown as React.ReactElement<DocumentProps>;
  const instance = pdf(element);
  const blob = await instance.toBlob();
  saveAs(blob, filename ?? defaultFilename(data));
}
