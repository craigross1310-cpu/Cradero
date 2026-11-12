"use client";

import { SERVICES } from "@/config/pricing";
import { SERVICE_ICONS } from "@/components/ui/icons";
import { formatMoney } from "@/lib/pricing";
import { useBooking } from "@/lib/booking-store";
import { SelectCard } from "./options";

export function StepService() {
  const { selections, setService } = useBooking();
  return (
    <div role="radiogroup" aria-label="Cleaning service" className="grid gap-3 sm:grid-cols-2">
      {SERVICES.map((s, i) => {
        const Icon = SERVICE_ICONS[s.icon];
        const selected = selections.service === s.id;
        return (
          <SelectCard
            key={s.id}
            selected={selected}
            onSelect={() => setService(s.id)}
            className={i === SERVICES.length - 1 ? "sm:col-span-2" : ""}
          >
            <div className="flex items-start gap-4 pr-7">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300 ${
                  selected ? "bg-mustard text-ink" : "bg-stone text-ink-soft"
                }`}
              >
                <Icon className="h-[22px] w-[22px]" aria-hidden />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="font-semibold text-ink">{s.name}</h3>
                  {s.popular ? <span className="rounded-full bg-mustard-soft px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-mustard-deep">Popular</span> : null}
                </div>
                <p className="mt-1 text-sm leading-snug text-ink-soft">{s.description}</p>
                <p className="mt-2.5 text-sm text-muted">
                  From <span className="font-display text-lg font-medium text-ink">{formatMoney(s.basePrice * 100)}</span>
                  {s.allowedFrequencies.includes("one-off") ? null : <span> · recurring only</span>}
                </p>
              </div>
            </div>
          </SelectCard>
        );
      })}
    </div>
  );
}
