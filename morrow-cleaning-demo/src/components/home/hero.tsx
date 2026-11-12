"use client";

import Image from "next/image";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, BadgeCheck, CalendarCheck, Check, ShieldCheck, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { AnimatedPrice } from "@/components/ui/animated-price";
import { SITE } from "@/config/site";
import { EMPTY_SELECTIONS, calculateQuote, formatDuration, getService } from "@/lib/pricing";
import type { QuoteSelections } from "@/lib/pricing";
import { formatShortDate, nextAvailableSlot } from "@/lib/availability";
import { useBooking } from "@/lib/booking-store";

const PREVIEWS: { selections: QuoteSelections; summary: string; tags: string[] }[] = [
  {
    selections: { ...EMPTY_SELECTIONS, service: "standard", propertyType: "apartment", bedrooms: 2, bathrooms: 1, size: "average", floors: 1, frequency: "fortnightly" },
    summary: "2 bed apartment",
    tags: ["Fortnightly", "−15%"],
  },
  {
    selections: { ...EMPTY_SELECTIONS, service: "deep", propertyType: "house", bedrooms: 3, bathrooms: 2, size: "spacious", floors: 2, frequency: "one-off", extras: ["oven"] },
    summary: "3 bed house",
    tags: ["One-off", "+ Oven"],
  },
  {
    selections: { ...EMPTY_SELECTIONS, service: "end-of-tenancy", propertyType: "apartment", bedrooms: 2, bathrooms: 2, size: "average", floors: 1, frequency: "one-off", extras: ["windows"] },
    summary: "2 bed apartment",
    tags: ["One-off", "+ Windows"],
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section ref={ref} className="grain relative overflow-hidden bg-gradient-to-b from-blush via-cream to-cream pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24">
      <div className="pointer-events-none absolute -left-32 top-10 h-[30rem] w-[30rem] rounded-full bg-mustard/15 blur-[110px]" aria-hidden />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[26rem] w-[26rem] rounded-full bg-blush-deep blur-[100px]" aria-hidden />

      <div className="container-page relative grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 py-1.5 pl-1.5 pr-4 text-sm font-medium text-ink-soft shadow-soft backdrop-blur"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-cream">
              <Star className="h-3 w-3 fill-mustard text-mustard" aria-hidden /> {SITE.stats.rating}
            </span>
            Rated excellent by {SITE.stats.reviews.toLocaleString("en-GB")}+ households
          </motion.div>

          <h1 className="heading-xl mt-7 text-[2.75rem] text-ink sm:text-6xl lg:text-[4.35rem]">
            <motion.span className="block" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.05, ease }}>
              Your home, beautifully clean.
            </motion.span>
            <motion.span className="mt-1 block text-ink-soft" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15, ease }}>
              Your price,{" "}
              <span className="relative inline-block whitespace-nowrap italic text-ink">
                in seconds.
                <motion.svg
                  viewBox="0 0 300 20"
                  className="absolute -bottom-2 left-0 h-3.5 w-full text-mustard"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <motion.path
                    d="M4 14 C 70 4, 160 4, 296 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.7, ease }}
                  />
                </motion.svg>
              </span>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft sm:text-xl"
          >
            Professional home cleaning, tailored to your space and your schedule. Get your personalised quote and book online in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <ButtonLink href="/#quote" variant="primary" size="lg">
              Get my instant quote
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/#services" variant="outline" size="lg">
              Explore our services
            </ButtonLink>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-10 grid max-w-xl grid-cols-1 gap-x-6 gap-y-3 text-sm font-medium text-ink-soft sm:grid-cols-3"
          >
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-[18px] w-[18px] text-sage" aria-hidden /> Vetted &amp; fully insured
            </li>
            <li className="flex items-center gap-2">
              <BadgeCheck className="h-[18px] w-[18px] text-sage" aria-hidden /> No hidden fees
            </li>
            <li className="flex items-center gap-2">
              <CalendarCheck className="h-[18px] w-[18px] text-sage" aria-hidden /> Free rescheduling
            </li>
          </motion.ul>
        </div>

        {/* Visual */}
        <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease }}
            className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-stone shadow-lift sm:aspect-[5/5.4]"
          >
            <motion.div style={{ y: imageY }} className="absolute inset-[-6%_0_-6%_0]">
              <Image
                src="/images/hero-home.jpg"
                alt="A bright, freshly cleaned living room with sage walls, plants and a woven rug"
                fill
                priority
                sizes="(min-width: 1024px) 46vw, 92vw"
                className="object-cover object-[35%_center]"
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" aria-hidden />
          </motion.div>

          {/* Cleaner detail */}
          <motion.figure
            initial={{ opacity: 0, y: 24, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ duration: 0.9, delay: 0.85, ease }}
            className="absolute -left-6 bottom-16 hidden w-40 overflow-hidden rounded-[1.5rem] border-4 border-white bg-white shadow-lift sm:block xl:-left-12 xl:w-44"
          >
            <div className="relative aspect-square">
              <Image src="/images/cleaner-detail.jpg" alt="A Morrow cleaner in yellow gloves polishing a window" fill sizes="176px" className="object-cover" />
            </div>
            <figcaption className="px-3 py-2 text-xs font-semibold text-ink">Trained in-house</figcaption>
          </motion.figure>

          {/* Satisfaction badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
            className="absolute -left-2 top-6 rounded-3xl bg-white/90 p-3 shadow-lift backdrop-blur sm:-left-8 sm:top-8 sm:p-4"
          >
            <div className="flex items-center gap-3">
              <SatisfactionRing value={SITE.stats.satisfaction} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Satisfaction</p>
                <p className="text-sm font-semibold text-ink">{SITE.stats.homes} homes cleaned</p>
              </div>
            </div>
          </motion.div>

          {/* Live quote preview */}
          <motion.div style={{ y: cardY }} className="relative z-10 mx-auto -mt-20 w-[88%] max-w-[20rem] sm:absolute sm:-bottom-8 sm:-right-6 sm:mx-0 sm:mt-0 sm:w-[19rem]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease }}
            >
              <QuotePreview />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SatisfactionRing({ value }: { value: number }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-14 w-14">
      <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90" aria-hidden>
        <circle cx="24" cy="24" r={r} fill="none" stroke="#efece8" strokeWidth="5" />
        <motion.circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke="#e9b52c"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1.6, delay: 0.9, ease }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink">{value}%</span>
    </div>
  );
}

function QuotePreview() {
  const [index, setIndex] = useState(0);
  const { today } = useBooking();

  useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % PREVIEWS.length), 3200);
    return () => window.clearInterval(id);
  }, []);

  const preview = PREVIEWS[index];
  const quote = useMemo(() => calculateQuote(preview.selections), [preview]);
  const service = getService(preview.selections.service);
  const next = useMemo(() => (today ? nextAvailableSlot(today) : null), [today]);

  return (
    <div className="rounded-[1.75rem] border border-white/60 bg-white/95 p-5 shadow-lift backdrop-blur" aria-label="Example instant quote" role="img">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sage" />
          </span>
          Live quote
        </span>
        <span className="text-xs text-muted">≈ {formatDuration(quote.onSiteMinutes)}</span>
      </div>

      <div className="relative mt-3 h-[3.25rem] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45, ease }}
            className="absolute inset-0"
          >
            <p className="font-display text-lg leading-tight text-ink">{service?.shortName}</p>
            <p className="text-sm text-muted">{preview.summary}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-3 flex gap-1.5">
        {preview.tags.map((t) => (
          <motion.span
            key={`${index}-${t}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${t.startsWith("−") ? "bg-sage-soft text-sage" : "bg-stone text-ink-soft"}`}
          >
            {t}
          </motion.span>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-line pt-4">
        <div>
          <p className="text-xs text-muted">{quote.isRecurring ? "Per visit" : "Total"}</p>
          <AnimatedPrice value={quote.total} className="font-display text-3xl font-medium text-ink" />
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-mustard text-ink">
          <Check className="h-5 w-5" aria-hidden />
        </span>
      </div>

      <p className="mt-3 min-h-4 text-xs text-ink-soft">
        {next ? (
          <>
            Next available: <span className="font-semibold">{formatShortDate(next.iso)}, {next.slot.label}</span>
          </>
        ) : (
          " "
        )}
      </p>
    </div>
  );
}
