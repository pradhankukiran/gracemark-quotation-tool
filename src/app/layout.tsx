import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ClientProviders } from "./client-providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Gracemark Quotation",
    template: "%s · Gracemark Quotation",
  },
  description: "Compare Employer-of-Record costs across global providers.",
  applicationName: "Gracemark Quotation",
  robots: { index: false, follow: false }, // internal tool
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#047857",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AntdRegistry>
          <ClientProviders>{children}</ClientProviders>
        </AntdRegistry>
      </body>
    </html>
  );
}
