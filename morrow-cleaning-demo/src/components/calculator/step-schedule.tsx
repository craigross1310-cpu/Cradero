"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Moon, Sun, Sunrise, CalendarCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { TimeOfDay } from "@/config/pricing";
import { formatDuration, getTimeSlot } from "@/lib/pricing";
import { formatLongDate, fromISODate, getDayAvailability, lastBookableDate, startOfDay, toISODate } from "@/lib/availability";
import type { DayAvailability } from "@/lib/availability";
import { useBooking } from "@/lib/booking-store";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PERIODS: { id: TimeOfDay; label: string; icon: typeof Sun; range: string }[] = [
  { id: "morning", label: "Morning", icon: Sunrise, range: "8am – 12pm" },
  { id: "afternoon", label: "Afternoon", icon: Sun, range: "12pm – 5pm" },
  { id: "evening", label: "Evening", icon: Moon, range: "5pm – 7pm" },
];

export function StepSchedule() {
  const { today, selections, setDate, setTime, quote } = useBooking();

  if (!today) {
    return <div className="h-[26rem] animate-pulse rounded-3xl bg-stone" aria-hidden />;
  }
  return <Scheduler today={today} selectedDate={selections.date} selectedTime={selections.time} onDate={setDate} onTime={setTime} onSiteMinutes={quote.onSiteMinutes} cleaners={quote.cleaners} />;
}

interface SchedulerProps {
  today: Date;
  selectedDate: string | null;
  selectedTime: string | null;
  onDate: (iso: string) => void;
  onTime: (id: string) => void;
  onSiteMinutes: number;
  cleaners: number;
}

function Scheduler({ today, selectedDate, selectedTime, onDate, onTime, onSiteMinutes, cleaners }: SchedulerProps) {
  const first = startOfDay(today);
  const last = lastBookableDate(today);
  const initialMonth = selectedDate ? fromISODate(selectedDate) : new Date(first.getFullYear(), first.getMonth(), first.getDate() + 1);
  const [month, setMonth] = useState(() => new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));
  const [direction, setDirection] = useState(1);

  const minMonth = new Date(first.getFullYear(), first.getMonth(), 1);
  const maxMonth = new Date(last.getFullYear(), last.getMonth(), 1);
  const canPrev = month > minMonth;
  const canNext = month < maxMonth;

  const days = useMemo(() => {
    const y = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(y, m, 1);
    const offset = (firstDay.getDay() + 6) % 7; // Monday-first
    const count = new Date(y, m + 1, 0).getDate();
    const cells: (DayAvailability & { day: number })[] = [];
    for (let d = 1; d <= count; d++) {
      const date = new Date(y, m, d);
      cells.push({ ...getDayAvailability(date, today), day: d });
    }
    return { offset, cells };
  }, [month, today]);

  const selectedDay = selectedDate ? getDayAvailability(fromISODate(selectedDate), today) : null;
  const monthLabel = month.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const todayIso = toISODate(today);

  const shift = (delta: number) => {
    setDirection(delta);
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
      {/* Calendar */}
      <div className="rounded-3xl border border-line bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl text-ink" aria-live="polite">
            {monthLabel}
          </h3>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => shift(-1)}
              disabled={!canPrev}
              aria-label="Previous month"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-stone disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => shift(1)}
              disabled={!canNext}
              aria-label="Next month"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:bg-stone disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 text-center text-[0.7rem] font-bold uppercase tracking-wider text-muted" aria-hidden>
          {WEEKDAYS.map((d) => (
            <span key={d} className="py-1">
              {d}
            </span>
          ))}
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={month.toISOString()}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-1 grid grid-cols-7 gap-1"
              aria-label={monthLabel}
            >
              {Array.from({ length: days.offset }).map((_, i) => (
                <span key={`pad-${i}`} aria-hidden />
              ))}
              {days.cells.map((c) => {
                const bookable = c.status === "available" || c.status === "limited";
                const selected = c.iso === selectedDate;
                const isToday = c.iso === todayIso;
                const statusText =
                  c.status === "full" ? "fully booked" : c.status === "closed" ? "closed" : c.status === "past" ? "unavailable" : c.status === "limited" ? "limited availability" : "available";
                return (
                  <button
                    key={c.iso}
                    type="button"
                    disabled={!bookable}
                    onClick={() => onDate(c.iso)}
                    aria-pressed={selected}
                    aria-label={`${formatLongDate(c.iso)}, ${statusText}`}
                    className={`relative flex aspect-square min-h-10 flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 ${
                      selected
                        ? "bg-ink text-cream shadow-[0_8px_20px_-10px_rgb(31_29_27/0.8)]"
                        : bookable
                          ? "text-ink hover:bg-mustard-soft active:scale-95"
                          : c.status === "full"
                            ? "cursor-not-allowed text-muted/70 line-through decoration-ink/30"
                            : "cursor-not-allowed text-muted/40"
                    } ${isToday && !selected ? "ring-1 ring-ink/20" : ""}`}
                  >
                    {c.day}
                    {bookable ? (
                      <span
                        className={`absolute bottom-1 h-1 w-1 rounded-full ${selected ? "bg-mustard" : c.status === "limited" ? "bg-mustard" : "bg-sage"}`}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3 text-xs text-muted">
          <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-sage" aria-hidden /> Available</li>
          <li className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-mustard" aria-hidden /> Limited</li>
          <li className="flex items-center gap-1.5"><span className="text-muted/70 line-through">12</span> Fully booked</li>
          <li className="flex items-center gap-1.5"><span className="text-muted/40">12</span> Closed / unavailable</li>
        </ul>
      </div>

      {/* Time slots */}
      <div className="rounded-3xl border border-line bg-white p-4 sm:p-5">
        <AnimatePresence mode="wait" initial={false}>
          {selectedDay && selectedDate ? (
            <motion.div key={selectedDate} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Arrival time</p>
              <h3 className="mt-1 font-display text-xl text-ink">{formatLongDate(selectedDate)}</h3>
              <div className="mt-4 space-y-4">
                {PERIODS.map((p) => {
                  const slots = selectedDay.slots.filter((s) => s.slot.period === p.id);
                  return (
                    <div key={p.id} role="radiogroup" aria-label={`${p.label} slots`}>
                      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <p.icon className="h-4 w-4 text-mustard-deep" aria-hidden /> {p.label}
                        <span className="font-normal text-muted">· {p.range}</span>
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {slots.map(({ slot, available }) => {
                          const selected = selectedTime === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              disabled={!available}
                              onClick={() => onTime(slot.id)}
                              aria-label={`${slot.label}${available ? "" : ", unavailable"}`}
                              className={`min-h-11 rounded-xl border px-2 text-sm font-semibold transition-all duration-200 ${
                                selected
                                  ? "border-ink bg-ink text-cream"
                                  : available
                                    ? "border-line bg-white text-ink hover:border-ink/40 active:scale-95"
                                    : "cursor-not-allowed border-transparent bg-stone/70 text-muted/60 line-through"
                              }`}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <AnimatePresence>
                {selectedTime ? (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 flex items-start gap-2 overflow-hidden rounded-2xl bg-sage-soft p-3 text-sm text-sage"
                  >
                    <CalendarCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span>
                      Arrival {getTimeSlot(selectedTime)?.label} · about {formatDuration(onSiteMinutes)} on site
                      {cleaners > 1 ? ` with a team of ${cleaners}` : ""}.
                    </span>
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full min-h-56 flex-col items-center justify-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mustard-soft">
                <CalendarCheck className="h-6 w-6 text-ink" aria-hidden />
              </span>
              <p className="mt-4 font-display text-lg text-ink">Choose a date first</p>
              <p className="mt-1 max-w-xs text-sm text-muted">Pick any highlighted day to see morning, afternoon and evening arrival times.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
