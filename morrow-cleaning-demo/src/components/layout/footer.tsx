import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { SocialIcon } from "@/components/ui/icons";
import { NAV_LINKS, SITE } from "@/config/site";
import { SERVICES } from "@/config/pricing";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-ink text-cream/80">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-mustard/10 blur-3xl" aria-hidden />
      <div className="container-page relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:py-20">
        <div>
          <Logo tone="light" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/65">
            Premium home cleaning with transparent pricing and online booking — tailored to your space and your schedule.
          </p>
          <ul className="mt-6 flex gap-2" aria-label="Social media">
            {SITE.social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s.label} (opens in a new tab)`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/15 text-cream/80 transition-colors hover:border-mustard hover:bg-mustard hover:text-ink"
                >
                  <SocialIcon name={s.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-cream/45">Explore</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-mustard">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#quote" className="transition-colors hover:text-mustard">
                Instant quote
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-cream/45">Services</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {SERVICES.map((s) => (
              <li key={s.id}>
                <Link href="/#services" className="transition-colors hover:text-mustard">
                  {s.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-cream/45">Contact</h2>
          <ul className="mt-5 space-y-3.5 text-sm">
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-mustard" aria-hidden />
              <a href={SITE.contact.phoneHref} className="hover:text-mustard">{SITE.contact.phone}</a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-mustard" aria-hidden />
              <a href={`mailto:${SITE.contact.email}`} className="break-all hover:text-mustard">{SITE.contact.email}</a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mustard" aria-hidden />
              <span>{SITE.contact.address}</span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-mustard" aria-hidden />
              <span>{SITE.contact.hours}</span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-cream/40">Demo contact details — not a real business.</p>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-cream/50 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {SITE.name} · A fictional brand created for demonstration purposes.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-cream">Privacy policy</Link>
            <Link href="/terms" className="hover:text-cream">Terms &amp; conditions</Link>
            <span className="text-cream/35">
              Website concept by <span className="font-semibold text-cream/60">{SITE.agency.name}</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
