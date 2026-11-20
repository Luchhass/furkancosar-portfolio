import { createPageMetadata } from "@/lib/seo";
export { default } from "../../(en)/about/page";
export const metadata = createPageMetadata("about", { locale: "tr" });
export const revalidate = 3600;
