"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ButtonLink } from "@/components/ui/button";
import { SITE } from "@/config/site";

const FAQS = [
  {
    q: "How is my price calculated?",
    a: "Your price starts from the service you choose for a one-bedroom, one-bathroom home, then adjusts for extra rooms, property type, approximate size and number of floors. Recurring visits receive an automatic discount, and any extras are added at a fixed price. Every adjustment is itemised in your quote before you book.",
  },
  {
    q: "Do I need to provide cleaning products or equipment?",
    a: "No. Your cleaner arrives with professional equipment and our plant-based, refillable products. If you'd prefer we use your own products — for natural stone or specialist surfaces, for example — just add a note when you book.",
  },
  {
    q: "Do I need to be home during the clean?",
    a: "Not at all. Many customers leave a key with a concierge or in a key safe. You can add access instructions on the booking form, and your cleaner will message when they arrive and leave.",
  },
  {
    q: "Can I reschedule or cancel?",
    a: "Yes — reschedule or cancel free of charge up to 24 hours before your visit. Regular customers can also skip individual visits without affecting their recurring discount.",
  },
  {
    q: "Are your cleaners vetted and insured?",
    a: "Every cleaner is interviewed in person, reference-checked, DBS-checked and trained to our standards before their first visit. All work is covered by £5m public liability insurance.",
  },
  {
    q: "What if I'm not happy with the clean?",
    a: "Let us know within 72 hours and we'll return to re-clean the affected areas at no extra cost. It's rare — but it's our promise.",
  },
  {
    q: "Will I get the same cleaner each time?",
    a: "For Regular Maintenance and recurring Standard cleans, yes. We match you with a dedicated cleaner and arrange cover from someone familiar with your home if they're ever away.",
  },
  {
    q: "What's the difference between a standard and a deep clean?",
    a: "A standard clean keeps a well-maintained home fresh. A deep clean tackles built-up grime — limescale, grout, skirting boards, behind and beneath furniture. If it's been a while since your last professional clean, we recommend starting with a deep clean.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-stone py-24 sm:py-32">
      <div className="container-page grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="faq-title"
            eyebrow="FAQ"
            title="Questions, answered"
            intro="Everything you need to know before your first clean. Can't find what you're looking for? We're happy to help."
          />
          <Reveal delay={0.1} className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={SITE.contact.phoneHref} variant="outline">
              Call {SITE.contact.phone}
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <ul className="divide-y divide-ink/10 rounded-[2rem] border border-line bg-white px-6 shadow-soft sm:px-8">
            {FAQS.map((item, i) => {
              const isOpen = open === i;
              const panelId = `${baseId}-panel-${i}`;
              const buttonId = `${baseId}-button-${i}`;
              return (
                <li key={item.q}>
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left font-display text-lg text-ink transition-colors hover:text-ink-soft sm:text-xl"
                    >
                      {item.q}
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0, backgroundColor: isOpen ? "#e9b52c" : "#efece8" }}
                        transition={{ duration: 0.3 }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink"
                        aria-hidden
                      >
                        <Plus className="h-4 w-4" />
                      </motion.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 leading-relaxed text-ink-soft">{item.a}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
