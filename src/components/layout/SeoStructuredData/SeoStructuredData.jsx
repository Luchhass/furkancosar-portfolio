import { createJsonLd } from "@/lib/seo";

export default function SeoStructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(createJsonLd()).replace(/</g, "\\u003c") }} />;
}
