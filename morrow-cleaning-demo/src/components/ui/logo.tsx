import Link from "next/link";
import { SITE } from "@/config/site";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="#1f1d1b" />
      <path d="M10 27V14.5l6.2 7.6 6.2-7.6V27" fill="none" stroke="#fbf7f4" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="29" cy="13" r="3.4" fill="#e9b52c" />
      <path d="M29 20.5v6.5" stroke="#e9b52c" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label={`${SITE.name} — home`}>
      <LogoMark className="h-9 w-9 transition-transform duration-500 group-hover:rotate-[-8deg]" />
      <span className={`font-display text-[1.35rem] font-medium leading-none tracking-tight ${tone === "light" ? "text-cream" : "text-ink"}`}>
        Morrow<span className="text-mustard">.</span>
      </span>
    </Link>
  );
}
