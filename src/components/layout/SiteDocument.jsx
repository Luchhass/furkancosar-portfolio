import { PRIMARY_COLOR } from "@/data/brand";
import { Geist, Geist_Mono } from "next/font/google";
import { isIndexable, siteConfig } from "@/lib/seo";
import "@/app/globals.css";
import "lenis/dist/lenis.css";
import "@/app/motion.css";
import "@/app/ui.css";
import PageIntroAnimation from "@/components/layout/PageIntroAnimation/PageIntroAnimation";
import PageIntroPrepaintMask from "@/components/layout/PageIntroPrepaintMask/PageIntroPrepaintMask";
import ScrollReveal from "@/components/layout/ScrollReveal/ScrollReveal";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import BackToTop from "@/components/ui/BackToTop/BackToTop";
import GoogleAnalytics from "@/components/layout/GoogleAnalytics/GoogleAnalytics";
import MotionExperience from "@/components/layout/MotionExperience";
import { LanguageEffects } from "@/hooks/useLanguage";
import RouteSeoSync from "@/components/layout/RouteSeoSync";
import RegisterServiceWorker from "@/components/layout/RegisterServiceWorker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const siteMetadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/brand/favicons/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/brand/favicons/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  verification: isIndexable ? {
    google: process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined,
    other: process.env.BING_SITE_VERIFICATION?.trim()
      ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION.trim() }
      : undefined,
  } : undefined,
  appleWebApp: {
    capable: true,
    title: siteConfig.brand,
    statusBarStyle: "black-translucent",
  },
};

export const siteViewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: PRIMARY_COLOR,
};

export default function SiteDocument({ children, locale }) {
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Browser extensions can inject attributes into <body> before hydration. */}
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <LanguageEffects />
        <RouteSeoSync />
        {isIndexable && <RegisterServiceWorker />}
        <GoogleAnalytics />
        <noscript><style>{"[data-intro-prepaint], [data-page-intro] { display: none !important; }"}</style></noscript>
        <PageIntroPrepaintMask />
        <PageIntroAnimation />
        <ScrollReveal />
        <MotionExperience />
        <BackToTop />

        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
