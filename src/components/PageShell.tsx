import type { ReactNode } from "react";
import Link from "next/link";
import { Typography } from "antd";
import { BRAND } from "@/lib/theme";
import { TypeTabs } from "@/components/TypeTabs";

interface PageShellProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional right-aligned content rendered on the same row as the title. */
  actions?: ReactNode;
  /** Use a wider container — for comparison views that need two cards side-by-side. */
  wide?: boolean;
  children: ReactNode;
}

export function PageShell({
  title,
  subtitle,
  actions,
  wide,
  children,
}: PageShellProps) {
  return (
    <main className={`page-shell${wide ? " is-wide" : ""}`}>
      <Link href="/" aria-label="Gracemark home" className="page-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/gmk-logo.png" alt="Gracemark" />
      </Link>
      <TypeTabs />
      <div className="page-shell-content">
        {/* Header container mirrors the body's max-width (1100 single / 1700
            wide) so the title aligns with the leftmost content and the
            actions align with the rightmost content. Width rules live in
            globals.css under .page-shell-header-container. */}
        <div className="page-shell-header-container">
          <div
            className="page-shell-header"
            style={{ marginBottom: subtitle ? 8 : 48 }}
          >
            <Typography.Title level={1} style={{ margin: 0 }}>
              {title}
            </Typography.Title>
            {actions ? (
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                {actions}
              </div>
            ) : null}
          </div>
          {subtitle ? (
            <Typography.Paragraph
              style={{
                fontSize: 18,
                color: BRAND.textSecondary,
                marginBottom: 48,
              }}
            >
              {subtitle}
            </Typography.Paragraph>
          ) : null}
        </div>
        {children}
      </div>
    </main>
  );
}
