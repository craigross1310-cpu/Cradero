/**
 * Centralised pricing engine.
 *
 * Pure functions only — no React, no side effects — so the same logic powers
 * the live summary, the booking review, the confirmation screen and the
 * automated pricing tests (scripts/test-pricing.ts).
 *
 * All arithmetic is done in integer pence to avoid floating-point drift, and
 * the total is always the exact sum of the displayed line items.
 */
import {
  BATHROOM_OPTIONS,
  BEDROOM_OPTIONS,
  BOOKING_RULES,
  CURRENCY,
  EXTRAS,
  FLOOR_OPTIONS,
  FREQUENCIES,
  PRICE_ROUNDING_PENCE,
  PROPERTY_SIZES,
  PROPERTY_TYPES,
  SERVICES,
  TIME_SLOTS,
} from "../config/pricing.ts";
import type {
  ExtraConfig,
  ExtraId,
  FrequencyConfig,
  FrequencyId,
  PropertySizeId,
  PropertyTypeId,
  ServiceConfig,
  ServiceId,
} from "../config/pricing.ts";

/* ───────────────────────────── Types ───────────────────────────── */

export interface QuoteSelections {
  service: ServiceId | null;
  propertyType: PropertyTypeId | null;
  bedrooms: number | null;
  bathrooms: number | null;
  size: PropertySizeId | null;
  floors: number | null;
  frequency: FrequencyId | null;
  extras: ExtraId[];
  /** ISO date, YYYY-MM-DD */
  date: string | null;
  /** Time slot id, e.g. "09:30" */
  time: string | null;
}

export const EMPTY_SELECTIONS: QuoteSelections = {
  service: null,
  propertyType: null,
  bedrooms: null,
  bathrooms: null,
  size: null,
  floors: null,
  frequency: null,
  extras: [],
  date: null,
  time: null,
};

export type QuoteLineKind = "base" | "adjustment" | "discount" | "extra";

export interface QuoteLine {
  id: string;
  kind: QuoteLineKind;
  label: string;
  detail?: string;
  /** Signed amount in pence. */
  amount: number;
}

export interface Quote {
  lines: QuoteLine[];
  /** Clean price before any frequency discount (pence). */
  cleanSubtotal: number;
  /** Positive number of pence saved per visit. */
  discount: number;
  extrasTotal: number;
  /** Final per-visit price (pence) — always equals the sum of `lines`. */
  total: number;
  /** Total labour minutes for one cleaner. */
  labourMinutes: number;
  cleaners: number;
  /** Approximate time on site (minutes), rounded to 15 minutes. */
  onSiteMinutes: number;
  isRecurring: boolean;
  /** Actual saving per visit vs. the undiscounted clean, after any minimum charge (pence). */
  visitSaving: number;
  /** Estimated saving over a year vs. booking one-off cleans (pence). */
  annualSaving: number;
  /** True when every price-affecting selection has been made. */
  isPriceFinal: boolean;
  /** "From" price shown before a service is chosen (pence). */
  fromPrice: number;
}

/* ───────────────────────────── Lookups ───────────────────────────── */

export const getService = (id: ServiceId | null): ServiceConfig | undefined =>
  SERVICES.find((s) => s.id === id);
export const getFrequency = (id: FrequencyId | null): FrequencyConfig | undefined =>
  FREQUENCIES.find((f) => f.id === id);
export const getPropertyType = (id: PropertyTypeId | null) => PROPERTY_TYPES.find((p) => p.id === id);
export const getPropertySize = (id: PropertySizeId | null) => PROPERTY_SIZES.find((p) => p.id === id);
export const getFloorOption = (value: number | null) => FLOOR_OPTIONS.find((f) => f.value === value);
export const getExtra = (id: ExtraId): ExtraConfig | undefined => EXTRAS.find((e) => e.id === id);
export const getTimeSlot = (id: string | null) => TIME_SLOTS.find((t) => t.id === id);
export const bedroomLabel = (value: number | null) =>
  value === null ? null : value === 0 ? "Studio" : `${BEDROOM_OPTIONS.find((b) => b.value === value)?.label ?? value} bedroom${value === 1 ? "" : "s"}`;
export const bathroomLabel = (value: number | null) =>
  value === null ? null : `${BATHROOM_OPTIONS.find((b) => b.value === value)?.label ?? value} bathroom${value === 1 ? "" : "s"}`;

const toPence = (pounds: number) => Math.round(pounds * 100);
/** Rounds a calculated (percentage-based) amount to the configured precision. */
export const roundPrice = (pence: number) => Math.round(pence / PRICE_ROUNDING_PENCE) * PRICE_ROUNDING_PENCE;

/** Price of an extra (pence) given the current bedroom count. */
export function extraPrice(extra: ExtraConfig, bedrooms: number | null): number {
  const qty = extra.perBedroom ? Math.max(1, bedrooms ?? 1) : 1;
  return toPence(extra.price) * qty;
}

export function extraQuantity(extra: ExtraConfig, bedrooms: number | null): number {
  return extra.perBedroom ? Math.max(1, bedrooms ?? 1) : 1;
}

/* ───────────────────────────── Normalisation ───────────────────────────── */

export interface NormaliseResult {
  selections: QuoteSelections;
  /** Human-readable notes describing any automatic corrections. */
  notices: string[];
}

/**
 * Repairs combinations that are no longer valid after a change — e.g. a
 * one-off frequency on a Regular Maintenance plan, or two floors on a
 * bungalow — and removes unknown/duplicate extras.
 */
export function normaliseSelections(input: QuoteSelections): NormaliseResult {
  const s: QuoteSelections = { ...input, extras: [...input.extras] };
  const notices: string[] = [];

  const service = getService(s.service);
  if (s.service && !service) s.service = null;

  if (service) {
    if (!s.frequency) {
      s.frequency = service.defaultFrequency;
    } else if (!service.allowedFrequencies.includes(s.frequency)) {
      const replaced = getFrequency(s.frequency)?.label ?? s.frequency;
      s.frequency = service.defaultFrequency;
      notices.push(
        `${replaced} isn't available for ${service.shortName}, so we've switched to ${getFrequency(s.frequency)?.label}.`,
      );
    }
  }

  const type = getPropertyType(s.propertyType);
  if (s.propertyType && !type) s.propertyType = null;
  if (type && s.floors !== null && s.floors > type.maxFloors) {
    s.floors = type.maxFloors;
    notices.push(`A ${type.label.toLowerCase()} is set to ${getFloorOption(s.floors)?.label}.`);
  }
  if (type && s.floors === null && type.maxFloors === 1) s.floors = 1;

  if (s.bedrooms !== null && !BEDROOM_OPTIONS.some((b) => b.value === s.bedrooms)) s.bedrooms = null;
  if (s.bathrooms !== null && !BATHROOM_OPTIONS.some((b) => b.value === s.bathrooms)) s.bathrooms = null;
  if (s.size && !getPropertySize(s.size)) s.size = null;
  if (s.floors !== null && !getFloorOption(s.floors)) s.floors = null;

  s.extras = Array.from(new Set(s.extras)).filter((id) => EXTRAS.some((e) => e.id === id));

  if (s.time && !getTimeSlot(s.time)) s.time = null;
  if (!s.date) s.time = null;

  return { selections: s, notices };
}

/* ───────────────────────────── Calculation ───────────────────────────── */

export function cheapestStartingPrice(): number {
  return Math.min(...SERVICES.map((s) => toPence(s.basePrice)));
}

export function calculateQuote(selections: QuoteSelections): Quote {
  const fromPrice = cheapestStartingPrice();
  const service = getService(selections.service);

  if (!service) {
    return {
      lines: [],
      cleanSubtotal: 0,
      discount: 0,
      extrasTotal: 0,
      total: 0,
      labourMinutes: 0,
      cleaners: 1,
      onSiteMinutes: 0,
      isRecurring: false,
      visitSaving: 0,
      annualSaving: 0,
      isPriceFinal: false,
      fromPrice,
    };
  }

  // Missing property details fall back to the base property so a sensible
  // "starting from" estimate can always be shown.
  const bedrooms = selections.bedrooms ?? 1;
  const bathrooms = selections.bathrooms ?? 1;
  const type = getPropertyType(selections.propertyType) ?? PROPERTY_TYPES[0];
  const size = getPropertySize(selections.size) ?? PROPERTY_SIZES.find((p) => p.id === "average")!;
  const floor = getFloorOption(selections.floors) ?? FLOOR_OPTIONS[0];
  const frequency =
    getFrequency(selections.frequency && service.allowedFrequencies.includes(selections.frequency) ? selections.frequency : null) ??
    getFrequency(service.defaultFrequency)!;

  const lines: QuoteLine[] = [];

  // 1. Base service
  lines.push({ id: "base", kind: "base", label: service.name, detail: "1 bedroom · 1 bathroom", amount: toPence(service.basePrice) });

  // 2. Rooms
  const extraBeds = Math.max(0, bedrooms - 1);
  const extraBaths = Math.max(0, bathrooms - 1);
  if (extraBeds > 0) {
    lines.push({
      id: "bedrooms",
      kind: "adjustment",
      label: `Additional bedroom${extraBeds === 1 ? "" : "s"}`,
      detail: `${extraBeds} × ${formatMoney(toPence(service.perExtraBedroom))}`,
      amount: extraBeds * toPence(service.perExtraBedroom),
    });
  }
  if (extraBaths > 0) {
    lines.push({
      id: "bathrooms",
      kind: "adjustment",
      label: `Additional bathroom${extraBaths === 1 ? "" : "s"}`,
      detail: `${extraBaths} × ${formatMoney(toPence(service.perExtraBathroom))}`,
      amount: extraBaths * toPence(service.perExtraBathroom),
    });
  }
  const roomsPrice = sumLines(lines);

  // 3. Property type
  const typeAdj = roundPrice(roomsPrice * (type.multiplier - 1));
  if (typeAdj !== 0) {
    lines.push({ id: "property-type", kind: "adjustment", label: `${type.label} adjustment`, detail: percentLabel(type.multiplier - 1), amount: typeAdj });
  }

  // 4. Property size
  const sizeAdj = roundPrice((roomsPrice + typeAdj) * (size.multiplier - 1));
  if (sizeAdj !== 0) {
    lines.push({ id: "size", kind: "adjustment", label: `${size.label} property`, detail: `${size.range} · ${percentLabel(size.multiplier - 1)}`, amount: sizeAdj });
  }

  // 5. Floors
  if (floor.surcharge > 0) {
    lines.push({ id: "floors", kind: "adjustment", label: `Multi-level home`, detail: floor.label, amount: toPence(floor.surcharge) });
  }

  const cleanSubtotal = sumLines(lines);

  // 6. Frequency discount (applies to the clean only)
  const discount = cleanSubtotal - roundPrice(cleanSubtotal * (1 - frequency.discount));
  if (discount > 0) {
    lines.push({ id: "frequency", kind: "discount", label: `${frequency.label} saving`, detail: `${Math.round(frequency.discount * 100)}% off every visit`, amount: -discount });
  }

  // 7. Minimum visit charge
  const minimum = toPence(BOOKING_RULES.minimumVisitPrice);
  const afterDiscount = cleanSubtotal - discount;
  if (afterDiscount < minimum) {
    lines.push({ id: "minimum", kind: "adjustment", label: "Minimum visit charge", detail: `Visits start at ${formatMoney(minimum)}`, amount: minimum - afterDiscount });
  }

  // 8. Extras
  let extrasTotal = 0;
  let extrasMinutes = 0;
  for (const id of selections.extras) {
    const extra = getExtra(id);
    if (!extra) continue;
    const qty = extraQuantity(extra, selections.bedrooms);
    const amount = extraPrice(extra, selections.bedrooms);
    extrasTotal += amount;
    extrasMinutes += extra.minutes * qty;
    lines.push({
      id: `extra-${extra.id}`,
      kind: "extra",
      label: extra.name,
      detail: qty > 1 ? `${qty} × ${formatMoney(toPence(extra.price))}` : undefined,
      amount,
    });
  }

  const total = sumLines(lines);

  // Duration
  const baseLabour =
    (service.baseMinutes + extraBeds * service.perExtraBedroomMinutes + extraBaths * service.perExtraBathroomMinutes) *
    type.multiplier *
    size.multiplier;
  const labourMinutes = Math.round(baseLabour + floor.extraMinutes + extrasMinutes);
  const cleaners = labourMinutes > BOOKING_RULES.maxSoloMinutes ? 2 : 1;
  const onSiteMinutes = Math.max(60, Math.ceil(labourMinutes / cleaners / 15) * 15);

  const isRecurring = frequency.id !== "one-off";
  const visitSaving = Math.max(0, cleanSubtotal - Math.max(afterDiscount, minimum));
  const annualSaving = isRecurring ? visitSaving * frequency.visitsPerYear : 0;

  const isPriceFinal =
    selections.propertyType !== null &&
    selections.bedrooms !== null &&
    selections.bathrooms !== null &&
    selections.size !== null &&
    selections.floors !== null &&
    selections.frequency !== null;

  return {
    lines,
    cleanSubtotal,
    discount,
    extrasTotal,
    total,
    labourMinutes,
    cleaners,
    onSiteMinutes,
    isRecurring,
    visitSaving,
    annualSaving,
    isPriceFinal,
    fromPrice,
  };
}

function sumLines(lines: QuoteLine[]): number {
  return lines.reduce((acc, l) => acc + l.amount, 0);
}

function percentLabel(fraction: number): string {
  const pct = Math.round(fraction * 100);
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

/* ───────────────────────────── Formatting ───────────────────────────── */

const wholeFormatter = new Intl.NumberFormat(CURRENCY.locale, { style: "currency", currency: CURRENCY.code, maximumFractionDigits: 0, minimumFractionDigits: 0 });
const penceFormatter = new Intl.NumberFormat(CURRENCY.locale, { style: "currency", currency: CURRENCY.code, minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Formats pence as currency — "£55" for whole pounds, "£55.50" otherwise. */
export function formatMoney(pence: number): string {
  const abs = Math.abs(pence);
  const str = abs % 100 === 0 ? wholeFormatter.format(abs / 100) : penceFormatter.format(abs / 100);
  return pence < 0 ? `−${str}` : str;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr${h === 1 ? "" : "s"}` : `${h} hr${h === 1 ? "" : "s"} ${m} min`;
}

/* ───────────────────────────── Step validation ───────────────────────────── */

export type StepId = "service" | "property" | "frequency" | "extras" | "schedule";

export const STEPS: { id: StepId; label: string; title: string }[] = [
  { id: "service", label: "Service", title: "Choose your clean" },
  { id: "property", label: "Property", title: "Tell us about your home" },
  { id: "frequency", label: "Frequency", title: "How often?" },
  { id: "extras", label: "Extras", title: "Add the finishing touches" },
  { id: "schedule", label: "Date & time", title: "Pick a date and time" },
];

/** Returns a list of what is still missing for the given step (empty = complete). */
export function stepIssues(step: StepId, s: QuoteSelections): string[] {
  switch (step) {
    case "service":
      return s.service ? [] : ["Choose a cleaning service"];
    case "property": {
      const missing: string[] = [];
      if (!s.propertyType) missing.push("property type");
      if (s.bedrooms === null) missing.push("bedrooms");
      if (s.bathrooms === null) missing.push("bathrooms");
      if (!s.size) missing.push("approximate size");
      if (s.floors === null) missing.push("number of floors");
      return missing.length ? [`Select ${joinList(missing)}`] : [];
    }
    case "frequency":
      return s.frequency ? [] : ["Choose how often you'd like us to visit"];
    case "extras":
      return [];
    case "schedule": {
      if (!s.date) return ["Pick a date"];
      if (!s.time) return ["Pick a time slot"];
      return [];
    }
  }
}

export function firstIncompleteStep(s: QuoteSelections): StepId | null {
  for (const step of STEPS) if (stepIssues(step.id, s).length) return step.id;
  return null;
}

export function isQuoteComplete(s: QuoteSelections): boolean {
  return firstIncompleteStep(s) === null;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
