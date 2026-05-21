export const siteConfig = {
  name: "Furkan Cosar",
  brand: "FURKANCOSAR",
  email: "furkancosar2005@gmail.com",
  phoneHref: "tel:+905061393220",
  phoneLabel: "+90 506 139 32 20",
};

export const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export const contactItems = [
  {
    href: `mailto:${siteConfig.email}`,
    label: siteConfig.email,
  },
  {
    href: siteConfig.phoneHref,
    label: siteConfig.phoneLabel,
  },
];

export const socialItems = [
  {
    href: "https://instagram.com",
    icon: "instagram",
    name: "Instagram",
  },
  {
    href: "https://linkedin.com",
    icon: "linkedin",
    name: "LinkedIn",
  },
  {
    href: "https://github.com",
    icon: "github",
    name: "GitHub",
  },
  {
    href: "https://x.com",
    icon: "x",
    name: "X",
  },
];