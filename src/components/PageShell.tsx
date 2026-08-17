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
      {/* Logo, page heading, and EOR/Contractor switch share one responsive
          header. On mobile the logo and switch stay in the first row while
          the heading wraps below them. */}
      <div className="page-shell-header-container">
        <div className="page-shell-topbar">
          <Link href="/" aria-label="Gracemark home" className="page-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/gmk-logo.png" alt="Gracemark" />
          </Link>
          <div className="page-shell-heading-block">
            <div className="page-shell-header">
              <Typography.Title level={1} style={{ margin: 0 }}>
                {title}
              </Typography.Title>
              {actions ? (
                <div className="page-shell-actions">
                  {actions}
                </div>
              ) : null}
            </div>
            {subtitle ? (
              <Typography.Paragraph
                style={{
                  fontSize: 18,
                  color: BRAND.textSecondary,
                  margin: "8px 0 0",
                }}
              >
                {subtitle}
              </Typography.Paragraph>
            ) : null}
          </div>
          <TypeTabs />
        </div>
      </div>
      <div className="page-shell-content">
        {children}
      </div>
    </main>
  );
}
