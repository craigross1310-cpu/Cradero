import { Sparkle } from "lucide-react";

const ITEMS = [
  "Vetted, DBS-checked cleaners",
  "£5m public liability cover",
  "Eco-friendly products as standard",
  "Same cleaner every visit",
  "Reschedule free up to 24h before",
  "72-hour re-clean promise",
  "Pet-friendly products",
  "Instant, transparent pricing",
];

export function TrustMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-line bg-white/50 py-5" aria-label="Why customers choose Morrow">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-cream to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-cream to-transparent" aria-hidden />
      <ul className="flex w-max animate-marquee gap-10 motion-reduce:animate-none">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <li key={i} aria-hidden={i >= ITEMS.length} className="flex items-center gap-10 whitespace-nowrap text-sm font-semibold text-ink-soft">
            {item}
            <Sparkle className="h-4 w-4 fill-mustard text-mustard" aria-hidden />
          </li>
        ))}
      </ul>
    </div>
  );
}
