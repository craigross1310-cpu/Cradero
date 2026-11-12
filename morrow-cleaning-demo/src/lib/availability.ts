/**
 * Demo availability — deterministic, so the same dates and slots are always
 * shown as booked. Replace `getDayAvailability` with a call to a real
 * scheduling system (e.g. a /api/availability route) when going live.
 */
import { BOOKING_RULES, TIME_SLOTS } from "../config/pricing.ts";
import type { TimeSlot } from "../config/pricing.ts";

export type DayStatus = "available" | "limited" | "full" | "closed" | "past";

export interface DayAvailability {
  iso: string;
  status: DayStatus;
  slots: { slot: TimeSlot; available: boolean }[];
}

/** YYYY-MM-DD in local time. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function lastBookableDate(today: Date): Date {
  const d = startOfDay(today);
  d.setDate(d.getDate() + BOOKING_RULES.bookingWindowWeeks * 7);
  return d;
}

export function getDayAvailability(date: Date, today: Date): DayAvailability {
  const iso = toISODate(date);
  const day = startOfDay(date);
  const t = startOfDay(today);

  // Bookings open from tomorrow.
  if (day.getTime() <= t.getTime() || day.getTime() > lastBookableDate(today).getTime()) {
    return { iso, status: "past", slots: [] };
  }
  if (BOOKING_RULES.closedWeekdays.includes(day.getDay())) {
    return { iso, status: "closed", slots: [] };
  }
  // Roughly one in seven working days is fully booked.
  if (hash(`day:${iso}`) % 7 === 0) {
    return { iso, status: "full", slots: TIME_SLOTS.map((slot) => ({ slot, available: false })) };
  }

  const isSaturday = day.getDay() === 6;
  const slots = TIME_SLOTS.map((slot) => {
    if (isSaturday && slot.period === "evening") return { slot, available: false };
    return { slot, available: hash(`slot:${iso}:${slot.id}`) % 3 !== 0 };
  });
  const open = slots.filter((s) => s.available).length;
  if (open === 0) return { iso, status: "full", slots };
  return { iso, status: open <= 3 ? "limited" : "available", slots };
}

export function isSlotAvailable(iso: string, slotId: string, today: Date): boolean {
  return getDayAvailability(fromISODate(iso), today).slots.some((s) => s.slot.id === slotId && s.available);
}

export function nextAvailableSlot(today: Date): { iso: string; slot: TimeSlot } | null {
  const d = startOfDay(today);
  for (let i = 1; i <= BOOKING_RULES.bookingWindowWeeks * 7; i++) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    const a = getDayAvailability(day, today);
    const s = a.slots.find((x) => x.available);
    if (s) return { iso: a.iso, slot: s.slot };
  }
  return null;
}

export function formatLongDate(iso: string): string {
  return fromISODate(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function formatShortDate(iso: string): string {
  return fromISODate(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}
