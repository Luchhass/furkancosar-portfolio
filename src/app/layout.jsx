import { Geist, Geist_Mono } from "next/font/google";
import { baseKeywords, siteConfig } from "@/lib/seo";
import "./globals.css";
import PageIntroAnimation from "@/components/layout/PageIntroAnimation/PageIntroAnimation";
import PageIntroPrepaintMask from "@/components/layout/PageIntroPrepaintMask/PageIntroPrepaintMask";
import ScrollReveal from "@/components/layout/ScrollReveal/ScrollReveal";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import BackToTop from "@/components/ui/BackToTop/BackToTop";
import SeoStructuredData from "@/components/layout/SeoStructuredData/SeoStructuredData";
import GoogleAnalytics from "@/components/layout/GoogleAnalytics/GoogleAnalytics";

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
  title: {
    default: siteConfig.title,
    template: "%s",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.creator,
  publisher: siteConfig.name,
  keywords: baseKeywords,
  category: "portfolio",
  classification: "Frontend Developer Portfolio",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Furkan Cosar frontend developer portfolio preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    creator: "@luchhass",
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
    "msapplication-TileColor": "#000000",
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
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SeoStructuredData />
        <GoogleAnalytics />
        <PageIntroPrepaintMask />
        <PageIntroAnimation />
        <ScrollReveal />
        <BackToTop />

        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
