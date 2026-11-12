"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, ChevronUp, Info, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { AnimatedPrice } from "@/components/ui/animated-price";
import { STEPS, firstIncompleteStep, formatMoney, stepIssues } from "@/lib/pricing";
import type { StepId } from "@/lib/pricing";
import { useBooking } from "@/lib/booking-store";
import { QuoteSummary } from "./quote-summary";
import { StepService } from "./step-service";
import { StepProperty } from "./step-property";
import { StepFrequency } from "./step-frequency";
import { StepExtras } from "./step-extras";
import { StepSchedule } from "./step-schedule";

const STEP_COMPONENTS: Record<StepId, ComponentType> = {
  service: StepService,
  property: StepProperty,
  frequency: StepFrequency,
  extras: StepExtras,
  schedule: StepSchedule,
};

const STEP_INTROS: Record<StepId, string> = {
  service: "Select the type of clean you need — you can change it at any time.",
  property: "A few quick details so we can tailor your price and time on site.",
  frequency: "Regular visits keep your home effortlessly clean — and cost less each time.",
  extras: "Optional add-ons, priced individually. Select as many as you like.",
  schedule: "Choose a day and arrival time that suits you. We're open Monday to Saturday.",
};

export function QuoteCalculator() {
  const router = useRouter();
  const { selections, quote, step, maxStepIndex, goTo, notice, dismissNotice, ready, reset } = useBooking();
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const userNavigated = useRef(false);
  const [direction, setDirection] = useState(1);
  const [inView, setInView] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showIssues, setShowIssues] = useState(false);

  const index = STEPS.findIndex((s) => s.id === step);
  const current = STEPS[index];
  const issues = stepIssues(step, selections);
  const isLast = index === STEPS.length - 1;
  const nextIncomplete = firstIncompleteStep(selections);
  const complete = nextIncomplete === null;
  const StepComponent = STEP_COMPONENTS[step];

  // Show the mobile quote bar only while the calculator is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "-30% 0px -30% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-dismiss notices.
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(dismissNotice, 6000);
    return () => window.clearTimeout(id);
  }, [notice, dismissNotice]);

  // After a user-initiated step change: bring the card into view and move focus to the new heading.
  useEffect(() => {
    setShowIssues(false);
    if (!userNavigated.current) return;
    userNavigated.current = false;
    const card = cardRef.current;
    if (card && card.getBoundingClientRect().top < 72) {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => {
    document.documentElement.style.overflow = drawerOpen ? "hidden" : "";
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const navigate = (target: StepId) => {
    const targetIndex = STEPS.findIndex((s) => s.id === target);
    setDirection(targetIndex >= index ? 1 : -1);
    userNavigated.current = true;
    if (notice) dismissNotice();
    goTo(target);
  };

  const handleNext = () => {
    if (issues.length) {
      setShowIssues(true);
      return;
    }
    if (!isLast) navigate(STEPS[index + 1].id);
    else handleContinue();
  };

  const handleContinue = () => {
    if (complete) {
      setDrawerOpen(false);
      router.push("/book");
    } else if (nextIncomplete) {
      setDrawerOpen(false);
      navigate(nextIncomplete);
      setShowIssues(true);
    }
  };

  const canVisit = (i: number) => i <= maxStepIndex || STEPS.slice(0, i).every((s) => stepIssues(s.id, selections).length === 0);

  const continueButton = (
    <div>
      <Button variant={complete ? "accent" : "primary"} size="lg" className="w-full" onClick={handleContinue}>
        {complete ? "Continue to booking" : "Continue"}
        <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" aria-hidden />
      </Button>
      {!complete && nextIncomplete ? (
        <p className="mt-2 text-center text-xs text-muted">Next: {STEPS.find((s) => s.id === nextIncomplete)?.title.toLowerCase()}</p>
      ) : null}
    </div>
  );

  return (
    <section id="quote" ref={sectionRef} aria-labelledby="quote-title" className="relative bg-gradient-to-b from-cream via-blush/60 to-cream pt-24 pb-36 sm:pt-28 lg:pb-28">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">Instant quote</p>
            <h2 id="quote-title" className="heading-lg mt-4 text-[2.25rem] text-ink sm:text-5xl">
              Build your clean, <em className="text-ink-soft">see your price</em>
            </h2>
            <p className="mt-4 text-lg text-ink-soft">Five quick steps. Your price updates live with every choice — no email required.</p>
          </div>
          {ready && (selections.service || maxStepIndex > 0) ? (
            <button type="button" onClick={() => { setDirection(-1); reset(); }} className="self-start text-sm font-semibold text-ink-soft underline decoration-ink/20 underline-offset-4 hover:text-ink md:self-auto">
              Start over
            </button>
          ) : null}
        </div>

        {/* Progress */}
        <nav aria-label="Quote progress" className="mt-10">
          <ol className="flex items-center gap-1.5 sm:gap-2">
            {STEPS.map((s, i) => {
              const done = i < index && stepIssues(s.id, selections).length === 0;
              const active = i === index;
              const visitable = canVisit(i);
              return (
                <li key={s.id} className="flex flex-1 items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => visitable && navigate(s.id)}
                    disabled={!visitable}
                    aria-current={active ? "step" : undefined}
                    aria-label={`Step ${i + 1}: ${s.label}${done ? " (complete)" : ""}`}
                    className="group flex w-full min-w-0 flex-col gap-2 text-left disabled:cursor-not-allowed"
                  >
                    <span className="relative h-1.5 w-full overflow-hidden rounded-full bg-stone-deep">
                      <motion.span
                        className="absolute inset-y-0 left-0 rounded-full bg-ink"
                        initial={false}
                        animate={{ width: i < index ? "100%" : active ? "50%" : "0%", backgroundColor: i < index ? "#1f1d1b" : "#e9b52c" }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </span>
                    <span className={`hidden items-center gap-1.5 text-xs font-semibold sm:flex ${active ? "text-ink" : visitable ? "text-ink-soft group-hover:text-ink" : "text-muted/60"}`}>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[0.65rem] ${
                          done ? "bg-ink text-cream" : active ? "bg-mustard text-ink" : "bg-stone-deep text-muted"
                        }`}
                      >
                        {done ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : i + 1}
                      </span>
                      <span className="truncate">{s.label}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-sm font-semibold text-ink sm:hidden">
            Step {index + 1} of {STEPS.length} · <span className="text-ink-soft">{current.label}</span>
          </p>
        </nav>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] xl:grid-cols-[minmax(0,1fr)_25rem]">
          {/* Step card */}
          <div ref={cardRef} className="scroll-mt-24 rounded-[2rem] border border-line bg-white/80 p-5 shadow-soft backdrop-blur sm:p-8">
            <AnimatePresence>
              {notice ? (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                  role="status"
                >
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-mustard/40 bg-mustard-soft p-3.5 text-sm text-ink">
                    <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <p className="flex-1">{notice.text}</p>
                    <button type="button" onClick={dismissNotice} aria-label="Dismiss" className="rounded-full p-0.5 hover:bg-ink/10">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction * 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -28 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-mustard-deep">
                  Step {index + 1} of {STEPS.length}
                </p>
                <h3 ref={headingRef} tabIndex={-1} className="mt-2 font-display text-[1.75rem] leading-tight text-ink outline-none sm:text-3xl">
                  {current.title}
                </h3>
                <p className="mt-2 text-ink-soft">{STEP_INTROS[step]}</p>
                <div className="mt-7">
                  <StepComponent />
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {showIssues && issues.length ? (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="mt-6 rounded-2xl bg-[#fbe9e5] px-4 py-3 text-sm font-medium text-danger"
                >
                  {issues[0]} to continue.
                </motion.p>
              ) : null}
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
              <Button variant="ghost" onClick={() => navigate(STEPS[index - 1].id)} disabled={index === 0} className="!px-4">
                <ArrowLeft className="h-4 w-4" aria-hidden /> Back
              </Button>
              <Button
                variant={isLast && complete ? "accent" : "primary"}
                onClick={handleNext}
                className={issues.length ? "opacity-60" : ""}
              >
                {isLast ? (complete ? "Continue to booking" : "Review quote") : step === "extras" && selections.extras.length === 0 ? "Skip extras" : "Next step"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden />
              </Button>
            </div>
          </div>

          {/* Desktop summary */}
          <aside aria-label="Quote summary" className="hidden lg:sticky lg:top-24 lg:block">
            <div className="rounded-[2rem] border border-line bg-white p-7 shadow-lift">
              <QuoteSummary selections={selections} quote={quote} action={continueButton} />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile quote bar */}
      <AnimatePresence>
        {inView && !drawerOpen ? (
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
          >
            <div className="mx-auto flex max-w-xl items-center gap-3 rounded-[1.5rem] border border-ink/10 bg-ink p-2.5 pl-5 text-cream shadow-[0_20px_50px_-12px_rgb(31_29_27/0.6)]">
              <button type="button" onClick={() => setDrawerOpen(true)} className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left" aria-haspopup="dialog" aria-label="View full quote breakdown">
                <span className="min-w-0">
                  <span className="block text-[0.7rem] font-semibold uppercase tracking-wider text-cream/60">
                    {selections.service ? (quote.isRecurring ? "Per visit" : quote.isPriceFinal ? "Your quote" : "Estimate from") : "Prices from"}
                  </span>
                  {selections.service ? (
                    <AnimatedPrice value={quote.total} className="font-display text-2xl leading-tight" />
                  ) : (
                    <span className="font-display text-2xl leading-tight">{formatMoney(quote.fromPrice)}</span>
                  )}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-cream/80">
                  Details <ChevronUp className="h-4 w-4" aria-hidden />
                </span>
              </button>
              <Button variant="accent" size="md" className="!h-12 shrink-0 !px-5" onClick={complete ? handleContinue : handleNext}>
                {complete ? "Book" : isLast ? "Review" : "Next"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Mobile summary drawer */}
      <AnimatePresence>
        {drawerOpen ? (
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Quote summary">
            <motion.button
              type="button"
              aria-label="Close quote summary"
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => info.offset.y > 120 && setDrawerOpen(false)}
              className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[2rem] bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-lift"
            >
              <div className="sticky top-0 z-10 -mx-5 flex items-center justify-between bg-white px-5 pb-3 pt-1">
                <span className="mx-auto h-1.5 w-12 rounded-full bg-stone-deep" aria-hidden />
                <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Close" className="absolute right-4 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-stone">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <QuoteSummary selections={selections} quote={quote} action={continueButton} />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
