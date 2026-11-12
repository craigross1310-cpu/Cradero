"use client";

import { EXTRAS } from "@/config/pricing";
import { EXTRA_ICONS } from "@/components/ui/icons";
import { extraPrice, extraQuantity, formatMoney } from "@/lib/pricing";
import { useBooking } from "@/lib/booking-store";
import { SelectCard } from "./options";

export function StepExtras() {
  const { selections, toggleExtra } = useBooking();
  return (
    <div>
      <div role="group" aria-label="Optional extras" className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        {EXTRAS.map((e) => {
          const Icon = EXTRA_ICONS[e.icon];
          const selected = selections.extras.includes(e.id);
          const qty = extraQuantity(e, selections.bedrooms);
          return (
            <SelectCard key={e.id} mode="checkbox" selected={selected} onSelect={() => toggleExtra(e.id)} className="!p-4">
              <div className="flex items-start gap-3.5 pr-7">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300 ${selected ? "bg-mustard text-ink" : "bg-stone text-ink-soft"}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold leading-tight text-ink">{e.name}</h3>
                  <p className="mt-1 text-xs leading-snug text-muted">{e.description}</p>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    +{formatMoney(extraPrice(e, selections.bedrooms))}
                    {e.perBedroom ? (
                      <span className="ml-1 font-normal text-muted">
                        ({formatMoney(e.price * 100)} {e.unit}
                        {qty > 1 ? ` × ${qty}` : ""})
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
            </SelectCard>
          );
        })}
      </div>
      <p className="mt-5 text-sm text-ink-soft">Extras are optional — skip this step if you don&apos;t need any.</p>
    </div>
  );
}
