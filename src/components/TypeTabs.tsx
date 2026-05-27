"use client";
import { Segmented } from "antd";
import { usePathname, useRouter } from "next/navigation";

type QuoteType = "eor" | "contractor";

export function TypeTabs() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname !== "/eor" && pathname !== "/contractor") {
    return null;
  }
  const active: QuoteType = pathname.startsWith("/contractor") ? "contractor" : "eor";

  return (
    <div className="page-type-switcher">
      <Segmented
        value={active}
        options={[
          { label: "EOR", value: "eor" },
          { label: "Contractor", value: "contractor" },
        ]}
        onChange={(val) => router.push(`/${val as QuoteType}`)}
      />
    </div>
  );
}
