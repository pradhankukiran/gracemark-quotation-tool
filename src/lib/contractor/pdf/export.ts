"use client";

import { pdf, type DocumentProps } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import React from "react";

import {
  ContractorPdfDocument,
  type ContractorPdfProps,
} from "./document";

function toSlug(value: string | undefined): string {
  if (!value) return "";
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug;
}

function defaultFilename(data: ContractorPdfProps): string {
  const contractor = toSlug(
    data.contractorSlug ?? data.data.contractorName,
  );
  if (contractor) {
    return `gracemark-ic-breakdown-${contractor}.pdf`;
  }
  const country = toSlug(data.countrySlug ?? data.data.country);
  if (country) {
    return `gracemark-ic-breakdown-${country}.pdf`;
  }
  return "gracemark-ic-breakdown.pdf";
}

export async function exportContractorPdf(
  data: ContractorPdfProps,
  filename?: string,
): Promise<void> {
  // The component returns a <Document> root; cast the element type so the
  // pdf() helper accepts it. Keeping the file as .ts (no JSX) per spec.
  const element = React.createElement(
    ContractorPdfDocument,
    data,
  ) as unknown as React.ReactElement<DocumentProps>;
  const instance = pdf(element);
  const blob = await instance.toBlob();
  saveAs(blob, filename ?? defaultFilename(data));
}
