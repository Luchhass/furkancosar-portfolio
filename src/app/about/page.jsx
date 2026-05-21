import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Furkan Cosar | About",
  description:
    "Learn about Furkan Cosar, a frontend developer focused on clean UI, responsive websites, creative motion, React, Next.js, GSAP and real project experience.",
  path: "/about",
  keywords: [
    "about Furkan Cosar",
    "frontend developer about",
    "React Next.js GSAP developer",
    "frontend experience",
  ],
});

export default function AboutPage() {
  return (
    <main>
      <p>About Page</p>
    </main>
  );
}
