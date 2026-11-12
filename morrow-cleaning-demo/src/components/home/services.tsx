"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { SERVICE_ICONS } from "@/components/ui/icons";
import { SERVICES } from "@/config/pricing";
import type { ServiceId } from "@/config/pricing";
import { formatMoney } from "@/lib/pricing";
import { useBooking } from "@/lib/booking-store";

export function scrollToQuote() {
  // Wait for the calculator to re-render with the new step before scrolling,
  // otherwise the layout change can cancel the smooth scroll.
  window.setTimeout(() => {
    const el = document.getElementById("quote");
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: reduce ? "auto" : "smooth" });
  }, 80);
}

export function Services() {
  const { setService } = useBooking();

  const choose = (id: ServiceId) => {
    setService(id, { advance: true });
    scrollToQuote();
  };

  return (
    <section id="services" aria-labelledby="services-title" className="py-24 sm:py-32">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            id="services-title"
            eyebrow="Our services"
            title={<>A clean for every <em className="text-ink-soft">chapter</em> of home life</>}
            intro="From the weekly reset to the final key handover — choose a service and we'll take you straight to your personalised price."
          />
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          {SERVICES.map((service, i) => {
            const Icon = SERVICE_ICONS[service.icon];
            const wide = i < 2;
            return (
              <Reveal key={service.id} delay={i * 0.06} className={wide ? "lg:col-span-3" : "lg:col-span-2"}>
                <motion.button
                  type="button"
                  onClick={() => choose(service.id)}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="group relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-line bg-white text-left shadow-soft transition-shadow duration-500 hover:shadow-lift"
                  aria-label={`${service.name} — from ${formatMoney(service.basePrice * 100)}. Get a quote`}
                >
                  <div className={`relative w-full overflow-hidden ${wide ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes={wide ? "(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 92vw" : "(min-width: 1024px) 27vw, (min-width: 768px) 50vw, 92vw"}
                      className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-ink/0 to-transparent" aria-hidden />
                    <span className="absolute left-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 text-ink shadow-soft backdrop-blur">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    {service.popular ? (
                      <span className="absolute right-4 top-4 rounded-full bg-mustard px-3 py-1 text-xs font-bold text-ink">Most booked</span>
                    ) : null}
                    <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-ink backdrop-blur">
                      From {formatMoney(service.basePrice * 100)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-mustard-deep">{service.tagline}</p>
                    <h3 className="mt-2 font-display text-2xl text-ink">{service.name}</h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{service.description}</p>
                    <ul className="mt-4 grid gap-1.5 text-sm text-ink-soft sm:grid-cols-2">
                      {service.includes.map((inc) => (
                        <li key={inc} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden />
                          {inc}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                      Price this clean
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </div>
                </motion.button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
