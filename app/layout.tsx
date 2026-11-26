import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BayTech — Bay Area Engineering Jobs, Mapped",
  description: "Find software engineering and forward deployed engineering jobs in San Francisco and the Peninsula. On-site and hybrid roles, mapped from company career boards.",
  applicationName: "BayTech",
  openGraph: {
    title: "BayTech — Bay Area Engineering Jobs, Mapped",
    description: "A clearer way to find your next local engineering role.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
