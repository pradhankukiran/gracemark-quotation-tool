"use client";

import { QuoteForm } from "@/components/eor/QuoteForm";
import { PageShell } from "@/components/PageShell";

export default function HomePage() {
  return (
    <PageShell
      title="EOR Quotation"
      subtitle="Compare Employer-of-Record costs across providers."
    >
      <QuoteForm />
    </PageShell>
  );
}
