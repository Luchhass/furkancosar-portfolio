import SiteDocument, { siteMetadata, siteViewport } from "@/components/layout/SiteDocument";

export const metadata = siteMetadata;
export const viewport = siteViewport;

export default function EnglishLayout({ children }) {
  return <SiteDocument locale="en">{children}</SiteDocument>;
}
