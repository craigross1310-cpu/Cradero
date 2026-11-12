"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { CalendarDays, Home, PoundSterling } from "lucide-react";
import { useRef } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";

const STEPS = [
  {
    icon: Home,
    title: "Tell us about your home",
    body: "Choose your clean, then tap through bedrooms, bathrooms and size. No forms, no phone calls.",
    meta: "About 30 seconds",
  },
  {
    icon: PoundSterling,
    title: "Get your instant price",
    body: "Watch your price update live as you go — with every adjustment, saving and extra itemised.",
    meta: "Fixed, transparent pricing",
  },
  {
    icon: CalendarDays,
    title: "Choose your booking time",
    body: "Pick a date and a morning, afternoon or evening slot that suits you. We'll handle the rest.",
    meta: "Free rescheduling",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="how-it-works" aria-labelledby="how-title" className="bg-stone py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          id="how-title"
          align="center"
          eyebrow="How it works"
          title="Three steps to a spotless home"
          intro="We've made booking a cleaner as easy as ordering a coffee."
        />

        <div ref={ref} className="relative mt-16">
          {/* Connector line (desktop) */}
          <div className="absolute left-[16.66%] right-[16.66%] top-10 hidden h-0.5 bg-stone-deep md:block" aria-hidden>
            <motion.div style={{ scaleX: lineScale }} className="h-full origin-left bg-mustard" />
          </div>

          <ol className="relative grid gap-6 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 0.12} className="relative flex flex-col items-center text-center">
                <div className="relative">
                  <span className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white text-ink shadow-soft ring-8 ring-stone">
                    <step.icon className="h-8 w-8" aria-hidden />
                  </span>
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-mustard text-sm font-bold text-ink">
                    {i + 1}
                  </span>
                </div>
                <div className="mt-6 w-full rounded-[1.75rem] bg-white/70 p-6 md:bg-transparent md:p-0">
                  <h3 className="font-display text-2xl text-ink">{step.title}</h3>
                  <p className="mx-auto mt-3 max-w-xs leading-relaxed text-ink-soft">{step.body}</p>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-mustard-deep">{step.meta}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>

        <Reveal className="mt-14 flex justify-center">
          <ButtonLink href="/#quote" size="lg">Start my quote</ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
