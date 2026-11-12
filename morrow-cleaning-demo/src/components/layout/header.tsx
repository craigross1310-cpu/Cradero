"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { NAV_LINKS, SITE } from "@/config/site";

export function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // Close the mobile menu on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-all duration-500 ${
          scrolled || open ? "border-b border-line/80 bg-cream/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-6">
          <Logo />

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative rounded-full px-4 py-2 text-[0.92rem] font-medium text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={SITE.contact.phoneHref}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink xl:inline-flex"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {SITE.contact.phone}
            </a>
            <ButtonLink href="/#quote" size="sm" className="!px-4 sm:!px-5">
              <span className="sm:hidden">Get a quote</span>
              <span className="hidden sm:inline">Get my instant quote</span>
              <ArrowRight className="hidden h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 sm:block" aria-hidden />
            </ButtonLink>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white/70 text-ink lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="h-[calc(100dvh-4.5rem)] overflow-y-auto border-b border-line bg-cream lg:hidden"
          >
            <nav aria-label="Mobile" className="container-page flex flex-col py-6">
              {NAV_LINKS.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i + 0.05 }}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-line py-4 font-display text-2xl text-ink"
                  >
                    {link.label}
                    <ArrowRight className="h-5 w-5 text-muted" aria-hidden />
                  </Link>
                </motion.div>
              ))}
              <ButtonLink href="/#quote" size="lg" className="mt-8 w-full" onClick={() => setOpen(false)}>
                Get my instant quote
              </ButtonLink>
              <a href={SITE.contact.phoneHref} className="mt-4 inline-flex items-center justify-center gap-2 py-3 text-sm font-semibold text-ink-soft">
                <Phone className="h-4 w-4" aria-hidden /> {SITE.contact.phone} · {SITE.contact.hours}
              </a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
