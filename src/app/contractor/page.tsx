"use client";

import { ContractorForm } from "@/components/contractor/ContractorForm";
import { PageShell } from "@/components/PageShell";

export default function ContractorPage() {
  return (
    <PageShell
      title="Gracemark Contractor Quotation"
      subtitle="Estimate Independent Contractor engagement costs."
    >
      <ContractorForm />
    </PageShell>
  );
}
