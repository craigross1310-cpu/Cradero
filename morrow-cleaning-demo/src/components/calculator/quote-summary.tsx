"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Clock, Info, PiggyBank, Users } from "lucide-react";
import type { ReactNode } from "react";
import { AnimatedPrice } from "@/components/ui/animated-price";
import { FLOOR_OPTIONS } from "@/config/pricing";
import {
  bathroomLabel,
  bedroomLabel,
  formatDuration,
  formatMoney,
  getFrequency,
  getPropertySize,
  getPropertyType,
  getService,
  getTimeSlot,
  getExtra,
} from "@/lib/pricing";
import type { Quote, QuoteSelections } from "@/lib/pricing";
import { formatShortDate } from "@/lib/availability";

interface QuoteSummaryProps {
  selections: QuoteSelections;
  quote: Quote;
  /** Rendered beneath the total, e.g. the Continue button. */
  action?: ReactNode;
  title?: string;
  /** Hide the itemised price lines (e.g. for compact contexts). */
  showLines?: boolean;
}

export function QuoteSummary({ selections, quote, action, title = "Your quote", showLines = true }: QuoteSummaryProps) {
  const service = getService(selections.service);
  const type = getPropertyType(selections.propertyType);
  const size = getPropertySize(selections.size);
  const freq = getFrequency(selections.frequency);
  const floors = FLOOR_OPTIONS.find((f) => f.value === selections.floors);
  const slot = getTimeSlot(selections.time);

  const details: { label: string; value: string | null }[] = [
    { label: "Service", value: service?.name ?? null },
    { label: "Property", value: type ? `${type.label}${size ? ` · ${size.range}` : ""}${floors ? ` · ${floors.label}` : ""}` : null },
    { label: "Bedrooms", value: bedroomLabel(selections.bedrooms) },
    { label: "Bathrooms", value: bathroomLabel(selections.bathrooms) },
    { label: "Frequency", value: freq?.label ?? null },
    { label: "Extras", value: selections.extras.length ? selections.extras.map((id) => getExtra(id)?.name).filter(Boolean).join(", ") : selections.service ? "None" : null },
    { label: "Date", value: selections.date ? formatShortDate(selections.date) : null },
    { label: "Time", value: slot ? `${slot.label} arrival` : null },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            {service ? (
              <>
                {!quote.isPriceFinal ? <span className="text-sm text-muted">from</span> : null}
                <AnimatedPrice value={quote.total} className="font-display text-[2.6rem] font-medium leading-none text-ink" />
                <span className="text-sm text-muted">{quote.isRecurring ? "per visit" : "total"}</span>
              </>
            ) : (
              <>
                <span className="text-sm text-muted">from</span>
                <span className="font-display text-[2.6rem] font-medium leading-none text-ink">{formatMoney(quote.fromPrice)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {service ? (
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone px-3 py-1.5 text-ink-soft">
            <Clock className="h-3.5 w-3.5" aria-hidden /> ≈ {formatDuration(quote.onSiteMinutes)} on site
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone px-3 py-1.5 text-ink-soft">
            <Users className="h-3.5 w-3.5" aria-hidden /> {quote.cleaners} cleaner{quote.cleaners > 1 ? "s" : ""}
          </span>
        </div>
      ) : null}

      <AnimatePresence initial={false}>
        {quote.visitSaving > 0 ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-sage-soft p-3 text-sm text-sage">
              <PiggyBank className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                You save <strong>{formatMoney(quote.visitSaving)}</strong> every visit — around <strong>{formatMoney(quote.annualSaving)}</strong> a year.
              </span>
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <dl className="mt-5 divide-y divide-line border-y border-line text-sm">
        {details.map((d) => (
          <div key={d.label} className="flex justify-between gap-4 py-2.5">
            <dt className="shrink-0 text-muted">{d.label}</dt>
            <dd className={`text-right ${d.value ? "font-medium text-ink" : "text-muted/60"}`}>{d.value ?? "—"}</dd>
          </div>
        ))}
      </dl>

      {showLines && quote.lines.length ? (
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Price breakdown</p>
          <ul className="mt-3 space-y-2 text-sm">
            <AnimatePresence initial={false}>
              {quote.lines.map((line) => (
                <motion.li
                  key={line.id}
                  layout="position"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-start justify-between gap-4"
                >
                  <span className="min-w-0">
                    <span className={line.kind === "discount" ? "font-medium text-sage" : "text-ink"}>{line.label}</span>
                    {line.detail ? <span className="block text-xs text-muted">{line.detail}</span> : null}
                  </span>
                  <span className={`shrink-0 tabular-nums ${line.kind === "discount" ? "font-semibold text-sage" : "font-medium text-ink"}`}>
                    {line.kind === "base" || line.amount < 0 ? formatMoney(line.amount) : `+${formatMoney(line.amount)}`}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-ink/20 pt-4">
            <span className="font-semibold text-ink">{quote.isRecurring ? "Total per visit" : "Total"}</span>
            <span className="font-display text-2xl text-ink">{formatMoney(quote.total)}</span>
          </div>
        </div>
      ) : null}

      {action ? <div className="mt-6">{action}</div> : null}

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Illustrative demo pricing. Final price confirmed after a quick review of your home details.
      </p>
    </div>
  );
}

export function ContinueHint({ text }: { text: string }) {
  return (
    <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
      <ArrowRight className="h-3 w-3" aria-hidden /> {text}
    </p>
  );
}
