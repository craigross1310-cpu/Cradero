/**
 * Brand & content configuration. Edit these values to rebrand the site.
 * All contact details below are fictional demo information.
 */
export const SITE = {
  name: "Morrow Cleaning Co.",
  shortName: "Morrow",
  url: "https://morrow-cleaning-demo.vercel.app",
  description:
    "Professional home cleaning, tailored to your space and your schedule. Get your personalised quote and book online in minutes.",
  contact: {
    phone: "020 7946 0321",
    phoneHref: "tel:+442079460321",
    email: "hello@morrowcleaning.example",
    address: "14 Juniper Yard, London EC1V 2NX",
    hours: "Mon–Sat · 8am–7pm",
  },
  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "Facebook", href: "https://www.facebook.com/" },
    { label: "TikTok", href: "https://www.tiktok.com/" },
  ],
  stats: {
    satisfaction: 98,
    rating: 4.9,
    reviews: 2400,
    homes: "12,000+",
  },
  agency: {
    name: "Saltra Solutions",
  },
} as const;

export const NAV_LINKS = [
  { label: "Services", href: "/#services" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Results", href: "/#results" },
  { label: "Reviews", href: "/#reviews" },
  { label: "FAQ", href: "/#faq" },
] as const;
