"use client";
import Link from "next/link";
import { Button, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

interface QuoteNotFoundProps {
  formUrl: string;      // "/eor" or "/contractor"
  idIsValid: boolean;   // result of isQuoteId(id) check by the caller
}

/**
 * Body-only "quote not found" empty state. The caller is responsible for
 * wrapping it in a `<PageShell>` with a stable title (e.g. "Quote") so the
 * H1 doesn't change between SSR and the first client render — see
 * `src/app/eor/quote/[id]/page.tsx` and `src/app/contractor/quote/[id]/page.tsx`.
 */
export function QuoteNotFound({ formUrl, idIsValid }: QuoteNotFoundProps) {
  return (
    <div style={{ textAlign: "center", padding: "32px 16px" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/illustration-quote-not-found.svg"
        alt=""
        width={128}
        height={128}
        style={{ marginBottom: 24, display: "inline-block" }}
      />
      <Typography.Paragraph type="secondary" style={{ maxWidth: 480, margin: "0 auto 24px", fontSize: 16 }}>
        {idIsValid
          ? "We couldn't find this quote in your browser's storage. It may have been saved on a different device, or you may have cleared your browser data."
          : "That quote ID doesn't look right. Try going back to the form and creating a new quote."}
      </Typography.Paragraph>
      <Link href={formUrl}>
        <Button type="primary" icon={<ArrowLeftOutlined />}>Back to form</Button>
      </Link>
    </div>
  );
}
