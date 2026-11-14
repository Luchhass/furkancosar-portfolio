import { createPageMetadata } from "@/lib/seo";
export { default } from "../../about/page";
export const metadata = createPageMetadata("about", { locale: "tr" });
export const revalidate = 3600;
