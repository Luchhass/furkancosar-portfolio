const isPreview = process.env.VERCEL_ENV === "preview" || process.env.SEO_NOINDEX === "true";
const indexNowKey = process.env.INDEXNOW_KEY?.trim() || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    if (isPreview || !/^[a-zA-Z0-9-]{8,128}$/.test(indexNowKey)) return [];
    return [{ source: `/${indexNowKey}.txt`, destination: `/api/indexnow/${indexNowKey}` }];
  },
  async headers() {
    const noindex = { key: "X-Robots-Tag", value: "noindex" };
    return [
      ...(isPreview ? [{ source: "/:path*", headers: [noindex] }] : []),
      { source: "/offline.html", headers: [noindex] },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }, noindex] },
    ];
  },
  allowedDevOrigins: [
    "mainstream-islamic-president-promotion.trycloudflare.com",
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    "172.17.*.*",
    "172.18.*.*",
    "172.19.*.*",
    "172.20.*.*",
    "172.21.*.*",
    "172.22.*.*",
    "172.23.*.*",
    "172.24.*.*",
    "172.25.*.*",
    "172.26.*.*",
    "172.27.*.*",
    "172.28.*.*",
    "172.29.*.*",
    "172.30.*.*",
    "172.31.*.*",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
};

export default nextConfig;
