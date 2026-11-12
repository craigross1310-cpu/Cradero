"use client";

import { BATHROOM_OPTIONS, BEDROOM_OPTIONS, FLOOR_OPTIONS, PROPERTY_SIZES, PROPERTY_TYPES } from "@/config/pricing";
import { getPropertyType } from "@/lib/pricing";
import { useBooking } from "@/lib/booking-store";
import { Chip, FieldGroup, SelectCard } from "./options";
import { PropertyIcon } from "./property-icons";

export function StepProperty() {
  const { selections, setPropertyType, setBedrooms, setBathrooms, setSize, setFloors } = useBooking();
  const type = getPropertyType(selections.propertyType);

  return (
    <div className="space-y-8">
      <FieldGroup id="ptype" label="Property type">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {PROPERTY_TYPES.map((p) => {
            const selected = selections.propertyType === p.id;
            return (
              <SelectCard key={p.id} selected={selected} onSelect={() => setPropertyType(p.id)} className="!p-3 sm:!p-4">
                <PropertyIcon type={p.id} className={`h-9 w-9 transition-colors sm:h-11 sm:w-11 ${selected ? "text-ink" : "text-ink-soft"}`} />
                <span className="mt-2 block font-semibold text-ink">{p.label}</span>
                <span className="mt-0.5 hidden text-xs text-muted sm:block">{p.description}</span>
              </SelectCard>
            );
          })}
        </div>
      </FieldGroup>

      <div className="grid gap-8">
        <FieldGroup id="beds" label="Bedrooms">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {BEDROOM_OPTIONS.map((b) => (
              <Chip
                key={b.value}
                selected={selections.bedrooms === b.value}
                onSelect={() => setBedrooms(b.value)}
                label={b.value === 0 ? "Studio" : `${b.label} bedrooms`}
              >
                {b.label}
              </Chip>
            ))}
          </div>
        </FieldGroup>
        <FieldGroup id="baths" label="Bathrooms">
          <div className="grid grid-cols-4 gap-2">
            {BATHROOM_OPTIONS.map((b) => (
              <Chip key={b.value} selected={selections.bathrooms === b.value} onSelect={() => setBathrooms(b.value)} label={`${b.label} bathrooms`}>
                {b.label}
              </Chip>
            ))}
          </div>
        </FieldGroup>
      </div>

      <FieldGroup id="size" label="Approximate size" hint="Your best guess is fine">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PROPERTY_SIZES.map((s) => {
            const selected = selections.size === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setSize(s.id)}
                className={`rounded-2xl border px-3 py-3 text-left transition-all duration-200 active:scale-[0.97] ${
                  selected ? "border-ink bg-ink text-cream" : "border-line bg-white text-ink hover:border-ink/40"
                } ${s.id === "very-large" ? "col-span-2 sm:col-span-1" : ""}`}
              >
                <span className="block text-sm font-semibold">{s.label}</span>
                <span className={`block text-xs ${selected ? "text-cream/70" : "text-muted"}`}>{s.range}</span>
              </button>
            );
          })}
        </div>
      </FieldGroup>

      <FieldGroup
        id="floors"
        label="Number of floors"
        hint={type ? (type.maxFloors === 1 ? "Bungalows are single-storey" : `Up to ${FLOOR_OPTIONS.find((f) => f.value === type.maxFloors)?.label} for ${type.label.toLowerCase()}s`) : undefined}
      >
        <div className="grid grid-cols-3 gap-2">
          {FLOOR_OPTIONS.map((f) => {
            const disabled = type ? f.value > type.maxFloors : false;
            return (
              <Chip key={f.value} selected={selections.floors === f.value} onSelect={() => setFloors(f.value)} disabled={disabled}>
                {f.label}
              </Chip>
            );
          })}
        </div>
      </FieldGroup>
    </div>
  );
}
