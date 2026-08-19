import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Section routes resolve to the single cinematic page; project pages are real routes.
  async redirects() {
    const sections = ["about", "journey", "experience", "achievements", "skills", "contact", "leadership"];
    return [
      ...sections.map((s) => ({ source: `/${s}`, destination: `/#${s}`, permanent: false })),
      // Education has no section of its own any more — the block lives inside About,
      // so `/#education` would land nowhere. Keep the URL working, point it at About.
      { source: "/education", destination: "/#about", permanent: false },
    ];
  },
};

export default nextConfig;
