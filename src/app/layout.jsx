import { PRIMARY_COLOR } from "@/data/brand";
import { Geist, Geist_Mono } from "next/font/google";
import { siteConfig, createPageMetadata } from "@/lib/seo";
import "./globals.css";
import "lenis/dist/lenis.css";
import "./motion.css";
import "./ui.css";
import PageIntroAnimation from "@/components/layout/PageIntroAnimation/PageIntroAnimation";
import PageIntroPrepaintMask from "@/components/layout/PageIntroPrepaintMask/PageIntroPrepaintMask";
import ScrollReveal from "@/components/layout/ScrollReveal/ScrollReveal";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import BackToTop from "@/components/ui/BackToTop/BackToTop";
import SeoStructuredData from "@/components/layout/SeoStructuredData/SeoStructuredData";
import GoogleAnalytics from "@/components/layout/GoogleAnalytics/GoogleAnalytics";
import MotionExperience from "@/components/layout/MotionExperience";
import { LanguageEffects } from "@/hooks/useLanguage";
import RouteSeoSync from "@/components/layout/RouteSeoSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.creator,
  publisher: siteConfig.name,
  category: "portfolio",
  classification: "Frontend Developer Portfolio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": PRIMARY_COLOR,
    "msapplication-TileImage": "/icon-512.png",
    "profile:first_name": "Furkan",
    "profile:last_name": "Coşar",
    "portfolio:role": "Frontend Developer",
    "portfolio:stack": "React, Next.js, GSAP, JavaScript, Tailwind CSS",
    "portfolio:brand": siteConfig.brand,
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.brand,
    statusBarStyle: "black-translucent",
  },
  ...createPageMetadata("home"),
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
  themeColor: PRIMARY_COLOR,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Browser extensions can inject attributes into <body> before hydration. */}
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <LanguageEffects />
        <SeoStructuredData />
        <RouteSeoSync />
        <GoogleAnalytics />
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
