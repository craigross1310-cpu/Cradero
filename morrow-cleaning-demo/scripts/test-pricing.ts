/**
 * Pricing engine tests — run with `npm run test:pricing`.
 * Uses only Node's built-in test runner and assert module.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_SELECTIONS,
  calculateQuote,
  formatMoney,
  isQuoteComplete,
  normaliseSelections,
  roundPrice,
  stepIssues,
} from "../src/lib/pricing.ts";
import type { QuoteSelections } from "../src/lib/pricing.ts";
import { EXTRAS, FREQUENCIES, PROPERTY_SIZES, PROPERTY_TYPES, SERVICES } from "../src/config/pricing.ts";
import { getDayAvailability, isSlotAvailable, nextAvailableSlot, toISODate } from "../src/lib/availability.ts";

const base: QuoteSelections = {
  ...EMPTY_SELECTIONS,
  service: "standard",
  propertyType: "apartment",
  bedrooms: 1,
  bathrooms: 1,
  size: "average",
  floors: 1,
  frequency: "one-off",
};

const sum = (q: ReturnType<typeof calculateQuote>) => q.lines.reduce((a, l) => a + l.amount, 0);

test("no service selected shows a from-price and no total", () => {
  const q = calculateQuote(EMPTY_SELECTIONS);
  assert.equal(q.total, 0);
  assert.equal(q.fromPrice, Math.min(...SERVICES.map((s) => s.basePrice * 100)));
});

test("every service's base property costs exactly its base price", () => {
  for (const s of SERVICES) {
    const q = calculateQuote({ ...base, service: s.id, frequency: s.defaultFrequency });
    const freq = FREQUENCIES.find((f) => f.id === s.defaultFrequency)!;
    const expectedClean = s.basePrice * 100;
    const expected = Math.max(roundPrice(expectedClean * (1 - freq.discount)), 5000);
    assert.equal(q.cleanSubtotal, expectedClean, s.id);
    assert.equal(q.total, expected, s.id);
    assert.equal(sum(q), q.total);
  }
});

test("demo starting prices match the brief", () => {
  const price = (id: string) => SERVICES.find((s) => s.id === id)!.basePrice;
  assert.equal(price("standard"), 55);
  assert.equal(price("deep"), 110);
  assert.equal(price("end-of-tenancy"), 160);
  assert.equal(price("move-in"), 130);
});

test("bedrooms and bathrooms add per-room charges", () => {
  const q = calculateQuote({ ...base, bedrooms: 3, bathrooms: 2 });
  // 55 + 2×12 + 1×10 = 89
  assert.equal(q.total, 8900);
  const studio = calculateQuote({ ...base, bedrooms: 0 });
  assert.equal(studio.total, 5500);
  const fivePlus = calculateQuote({ ...base, bedrooms: 5, bathrooms: 4 });
  // 55 + 4×12 + 3×10 = 133
  assert.equal(fivePlus.total, 13300);
});

test("property type and size multipliers compound correctly", () => {
  const house = calculateQuote({ ...base, propertyType: "house" });
  const mult = PROPERTY_TYPES.find((p) => p.id === "house")!.multiplier;
  assert.equal(house.total, 5500 + roundPrice(5500 * (mult - 1)));
  const large = calculateQuote({ ...base, propertyType: "house", size: "large" });
  const typeAdj = roundPrice(5500 * (mult - 1));
  const sizeMult = PROPERTY_SIZES.find((p) => p.id === "large")!.multiplier;
  assert.equal(large.total, 5500 + typeAdj + roundPrice((5500 + typeAdj) * (sizeMult - 1)));
  assert.equal(sum(large), large.total);
});

test("floors add a flat surcharge", () => {
  const q = calculateQuote({ ...base, propertyType: "house", floors: 2 });
  const q1 = calculateQuote({ ...base, propertyType: "house", floors: 1 });
  assert.equal(q.total - q1.total, 800);
});

test("frequency discounts apply to the clean but not to extras", () => {
  const sel = { ...base, bedrooms: 3, bathrooms: 2, extras: ["oven" as const] };
  const oneOff = calculateQuote(sel);
  const weekly = calculateQuote({ ...sel, frequency: "weekly" });
  assert.equal(oneOff.total, 8900 + 3500);
  const weeklyClean = roundPrice(8900 * 0.8); // £71.20 → £71
  assert.equal(weeklyClean, 7100);
  assert.equal(weekly.discount, 8900 - weeklyClean);
  assert.equal(weekly.total, weeklyClean + 3500);
  assert.equal(weekly.annualSaving, (8900 - weeklyClean) * 52);
  assert.ok(weekly.isRecurring);
});

test("minimum visit charge tops up very small recurring cleans", () => {
  const q = calculateQuote({ ...base, service: "regular", frequency: "weekly", size: "compact" });
  assert.equal(q.total, 5000);
  assert.ok(q.lines.some((l) => l.id === "minimum"));
  // 52 × 0.95 compact = 49.40 → £49; fortnightly/weekly saving can't exceed what the customer actually saves
  assert.equal(q.visitSaving, q.cleanSubtotal - 5000 > 0 ? q.cleanSubtotal - 5000 : 0);
  assert.equal(sum(q), q.total);
});

test("extras are charged once each and per-bedroom extras scale", () => {
  const q = calculateQuote({ ...base, bedrooms: 3, extras: ["beds", "beds", "fridge"] as QuoteSelections["extras"] });
  const n = normaliseSelections({ ...base, extras: ["beds", "beds", "fridge"] as QuoteSelections["extras"] });
  assert.deepEqual(n.selections.extras, ["beds", "fridge"]);
  const nq = calculateQuote({ ...n.selections, bedrooms: 3 });
  assert.equal(nq.extrasTotal, 3 * 800 + 2200);
  assert.ok(q.extrasTotal >= nq.extrasTotal);
});

test("all extras together sum correctly", () => {
  const all = EXTRAS.map((e) => e.id);
  const q = calculateQuote({ ...base, bedrooms: 2, extras: all });
  const expected = EXTRAS.reduce((a, e) => a + e.price * 100 * (e.perBedroom ? 2 : 1), 0);
  assert.equal(q.extrasTotal, expected);
  assert.equal(q.total, 5500 + 1200 + expected);
  assert.equal(sum(q), q.total);
});

test("changing service repairs an invalid frequency", () => {
  const { selections, notices } = normaliseSelections({ ...base, service: "end-of-tenancy", frequency: "weekly" });
  assert.equal(selections.frequency, "one-off");
  assert.equal(notices.length, 1);
  const r = normaliseSelections({ ...base, service: "regular", frequency: "one-off" });
  assert.equal(r.selections.frequency, "fortnightly");
});

test("bungalows are forced to a single floor", () => {
  const { selections } = normaliseSelections({ ...base, propertyType: "bungalow", floors: 3 });
  assert.equal(selections.floors, 1);
});

test("all calculated prices land on whole pounds", () => {
  const q = calculateQuote({ ...base, propertyType: "house", bedrooms: 2, size: "spacious", frequency: "fortnightly" });
  assert.equal(q.total % 100, 0);
  for (const l of q.lines) assert.equal(Math.abs(l.amount % 100), 0, l.id);
});

test("exhaustive sweep: total always equals the sum of the line items and is positive", () => {
  let count = 0;
  for (const s of SERVICES)
    for (const f of s.allowedFrequencies)
      for (const t of PROPERTY_TYPES)
        for (const beds of [0, 1, 2, 3, 4, 5])
          for (const baths of [1, 2, 3, 4])
            for (const size of PROPERTY_SIZES)
              for (const floors of [1, 2, 3].filter((x) => x <= t.maxFloors)) {
                const q = calculateQuote({ ...base, service: s.id, frequency: f, propertyType: t.id, bedrooms: beds, bathrooms: baths, size: size.id, floors, extras: ["oven", "beds"] });
                assert.equal(sum(q), q.total);
                assert.ok(q.total >= 5000);
                assert.ok(q.onSiteMinutes >= 60);
                count++;
              }
  assert.ok(count > 1000);
});

test("step validation reports missing fields", () => {
  assert.deepEqual(stepIssues("service", EMPTY_SELECTIONS), ["Choose a cleaning service"]);
  assert.equal(stepIssues("property", { ...EMPTY_SELECTIONS, propertyType: "house" }).length, 1);
  assert.equal(stepIssues("property", base).length, 0);
  assert.equal(isQuoteComplete(base), false);
  assert.equal(isQuoteComplete({ ...base, date: "2030-01-01", time: "09:30" }), true);
});

test("money formatting", () => {
  assert.equal(formatMoney(5500), "£55");
  assert.equal(formatMoney(5550), "£55.50");
  assert.equal(formatMoney(-1335), "−£13.35");
});

test("availability is deterministic, closed on Sundays and never in the past", () => {
  const today = new Date(2026, 10, 12); // Thu 12 Nov 2026
  assert.equal(getDayAvailability(today, today).status, "past");
  const sunday = new Date(2026, 10, 15);
  assert.equal(getDayAvailability(sunday, today).status, "closed");
  const a = getDayAvailability(new Date(2026, 10, 17), today);
  const b = getDayAvailability(new Date(2026, 10, 17), today);
  assert.deepEqual(a, b);
  const next = nextAvailableSlot(today);
  assert.ok(next);
  assert.ok(isSlotAvailable(next!.iso, next!.slot.id, today));
  assert.ok(next!.iso > toISODate(today));
});
