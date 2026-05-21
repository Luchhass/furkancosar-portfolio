export const siteConfig = {
  name: "Furkan Cosar",
  brand: "FURKANCOSAR",
  email: "furkancasar2005@gmail.com",
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
    label: "Instagram",
  },
  {
    href: "https://linkedin.com",
    icon: "linkedin",
    name: "LinkedIn",
    label: "LinkedIn",
  },
  {
    href: "https://github.com",
    icon: "github",
    name: "GitHub",
    label: "GitHub",
  },
  {
    href: "https://x.com",
    icon: "x",
    name: "X",
    label: "X",
  },
];