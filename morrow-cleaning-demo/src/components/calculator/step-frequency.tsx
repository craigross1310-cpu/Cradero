"use client";

import { useMemo } from "react";
import { FREQUENCIES } from "@/config/pricing";
import { calculateQuote, formatMoney, getService } from "@/lib/pricing";
import { useBooking } from "@/lib/booking-store";
import { SelectCard } from "./options";

export function StepFrequency() {
  const { selections, setFrequency } = useBooking();
  const service = getService(selections.service);

  const options = useMemo(
    () =>
      FREQUENCIES.map((f) => {
        const allowed = service ? service.allowedFrequencies.includes(f.id) : true;
        const q = calculateQuote({ ...selections, frequency: f.id });
        return { f, allowed, q };
      }),
    [selections, service],
  );

  return (
    <div>
      <div role="radiogroup" aria-label="Cleaning frequency" className="grid gap-3 sm:grid-cols-2">
        {options.map(({ f, allowed, q }) => {
          const selected = selections.frequency === f.id;
          return (
            <SelectCard key={f.id} selected={selected} onSelect={() => setFrequency(f.id)} disabled={!allowed}>
              <div className="pr-8">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink">{f.label}</h3>
                  {f.discount > 0 ? (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${allowed ? "bg-sage-soft text-sage" : "bg-stone text-muted"}`}>
                      Save {Math.round(f.discount * 100)}%
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-sm text-ink-soft">{f.description}</p>
              </div>
              {allowed ? (
                <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
                  <span className="text-sm text-muted">{f.id === "one-off" ? "Total" : "Per visit"}</span>
                  <span className="text-right">
                    {q.visitSaving > 0 ? <span className="mr-2 text-sm text-muted line-through">{formatMoney(q.total + q.visitSaving)}</span> : null}
                    <span className="font-display text-xl text-ink">{formatMoney(q.total)}</span>
                  </span>
                </div>
              ) : (
                <p className="mt-4 border-t border-line pt-3 text-sm text-muted">Not available for {service?.shortName}</p>
              )}
              {allowed && q.annualSaving > 0 ? (
                <p className="mt-1.5 text-xs font-semibold text-sage">≈ {formatMoney(q.annualSaving)} saved per year</p>
              ) : null}
            </SelectCard>
          );
        })}
      </div>
      <p className="mt-5 text-sm text-ink-soft">
        Recurring discounts apply to every visit and cover the clean itself — extras are charged at their standard price. Skip or reschedule any visit free with 24 hours&apos; notice.
      </p>
    </div>
  );
}
