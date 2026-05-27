"use client";

import { Suspense } from "react";
import { ContractorForm } from "@/components/contractor/ContractorForm";
import { PageShell } from "@/components/PageShell";

export default function ContractorPage() {
  return (
    <PageShell
      title="Gracemark Contractor Quotation"
      subtitle="Estimate Independent Contractor engagement costs."
    >
      <Suspense fallback={null}>
        <ContractorForm />
      </Suspense>
    </PageShell>
  );
}
