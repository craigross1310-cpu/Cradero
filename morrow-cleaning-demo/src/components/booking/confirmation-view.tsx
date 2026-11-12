"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CalendarPlus, Check, Copy, Home, Mail, Printer, RotateCcw, Sparkles, UserCheck } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { useBooking } from "@/lib/booking-store";
import type { Confirmation } from "@/lib/booking-store";
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
} from "@/lib/pricing";
import { formatLongDate } from "@/lib/availability";
import { SITE } from "@/config/site";

const ease = [0.22, 1, 0.36, 1] as const;

export function ConfirmationView() {
  const { ready, confirmation } = useBooking();

  if (!ready) {
    return (
      <Shell>
        <div className="mx-auto h-[36rem] max-w-3xl animate-pulse rounded-[2rem] bg-stone" aria-hidden />
      </Shell>
    );
  }

  if (!confirmation) {
    return (
      <Shell>
        <div className="mx-auto max-w-xl rounded-[2rem] border border-line bg-white p-10 text-center shadow-soft">
          <h1 className="heading-lg text-3xl text-ink">No booking to show yet</h1>
          <p className="mt-4 text-ink-soft">Build your quote and choose a time — your demo confirmation will appear here.</p>
          <ButtonLink href="/#quote" size="lg" className="mt-8">
            Get my instant quote
          </ButtonLink>
        </div>
      </Shell>
    );
  }

  return <Confirmed c={confirmation} />;
}

function Confirmed({ c }: { c: Confirmation }) {
  const router = useRouter();
  const { reset } = useBooking();
  const [copied, setCopied] = useState(false);
  const s = c.selections;
  const q = c.quote;
  const service = getService(s.service);
  const slot = getTimeSlot(s.time);
  const freq = getFrequency(s.frequency);
  const type = getPropertyType(s.propertyType);
  const size = getPropertySize(s.size);
  const firstName = c.customer.fullName.split(" ")[0];

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(c.reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const downloadIcs = () => {
    if (!s.date || !slot) return;
    const [h, m] = slot.id.split(":").map(Number);
    const start = new Date(`${s.date}T00:00:00`);
    start.setHours(h, m);
    const end = new Date(start.getTime() + q.onSiteMinutes * 60000);
    const fmt = (d: Date) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Morrow Cleaning Co//Demo//EN",
      "BEGIN:VEVENT",
      `UID:${c.reference}@morrow-demo`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${service?.name} — Morrow (demo)`,
      `DESCRIPTION:Demo booking ${c.reference}. This is a demonstration and no real booking has been made.`,
      `LOCATION:${c.customer.address.replace(/,/g, "\\,")}\\, ${c.customer.postcode}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `morrow-${c.reference}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startOver = () => {
    reset();
    router.push("/#quote");
  };

  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-mustard"
          >
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-mustard"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.4, repeat: 2, ease: "easeOut" }}
              aria-hidden
            />
            <svg viewBox="0 0 24 24" className="h-11 w-11 text-ink" aria-hidden>
              <motion.path
                d="M5 12.5 10 17.5 19 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.3, ease }}
              />
            </svg>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25, ease }}>
            <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-mustard/50 bg-mustard-soft px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-ink">
              Demo confirmation
            </span>
            <h1 className="heading-xl mt-5 text-4xl text-ink sm:text-5xl">You&apos;re all booked in, {firstName}.</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">
              Here&apos;s your demonstration booking summary. In a live version, a confirmation email would now be on its way to{" "}
              <span className="font-semibold text-ink">{c.customer.email}</span>.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease }}
          className="mt-10 overflow-hidden rounded-[2rem] border border-line bg-white shadow-lift"
        >
          <div className="flex flex-col gap-4 bg-ink p-6 text-cream sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-cream/55">Confirmation reference</p>
              <p className="mt-1 font-mono text-2xl font-semibold tracking-wider">{c.reference}</p>
            </div>
            <button
              type="button"
              onClick={copyRef}
              className="inline-flex items-center gap-2 self-start rounded-full border border-cream/20 px-4 py-2 text-sm font-semibold transition-colors hover:bg-cream/10 sm:self-auto"
            >
              {copied ? <Check className="h-4 w-4 text-mustard" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? "Copied" : "Copy reference"}
            </button>
          </div>

          <div className="grid gap-px bg-line sm:grid-cols-2">
            <Detail label="Date" value={s.date ? formatLongDate(s.date) : "—"} />
            <Detail label="Arrival time" value={slot ? `${slot.label} · ≈ ${formatDuration(q.onSiteMinutes)}` : "—"} />
            <Detail label="Service" value={service?.name ?? "—"} />
            <Detail label="Frequency" value={freq?.label ?? "—"} />
            <Detail
              label="Property"
              value={[type?.label, bedroomLabel(s.bedrooms), bathroomLabel(s.bathrooms), size?.range].filter(Boolean).join(" · ")}
            />
            <Detail label="Address" value={`${c.customer.address}, ${c.customer.postcode}`} />
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Selected services</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {q.lines.map((l) => (
                <li key={l.id} className="flex justify-between gap-4">
                  <span className={l.kind === "discount" ? "font-medium text-sage" : "text-ink"}>
                    {l.label}
                    {l.detail ? <span className="ml-1.5 text-xs text-muted">{l.detail}</span> : null}
                  </span>
                  <span className={`tabular-nums ${l.kind === "discount" ? "font-semibold text-sage" : "font-medium text-ink"}`}>{formatMoney(l.amount)}</span>
                </li>
              ))}
            </ul>
            {s.extras.length === 0 ? <p className="mt-2 text-xs text-muted">No optional extras selected.</p> : null}
            <div className="mt-5 flex items-baseline justify-between border-t border-dashed border-ink/20 pt-5">
              <span className="font-semibold text-ink">{q.isRecurring ? "Estimated price per visit" : "Total estimated price"}</span>
              <span className="font-display text-3xl text-ink">{formatMoney(q.total)}</span>
            </div>
            {q.isRecurring && q.visitSaving > 0 ? (
              <p className="mt-2 text-right text-sm text-sage">
                Saving {formatMoney(q.visitSaving)} every visit with your {freq?.label.toLowerCase()} plan
              </p>
            ) : null}
            {c.customer.instructions.trim() ? (
              <div className="mt-6 rounded-2xl bg-stone/60 p-4 text-sm">
                <p className="font-semibold text-ink">Your instructions</p>
                <p className="mt-1 whitespace-pre-line text-ink-soft">{c.customer.instructions.trim()}</p>
              </div>
            ) : null}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-6 flex flex-wrap justify-center gap-3 print:hidden"
        >
          <Button variant="outline" onClick={downloadIcs}>
            <CalendarPlus className="h-4 w-4" aria-hidden /> Add to calendar
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden /> Print
          </Button>
          <Button variant="primary" onClick={startOver}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Start a new quote
          </Button>
        </motion.div>

        <section aria-labelledby="next-title" className="mt-16 print:hidden">
          <h2 id="next-title" className="text-center font-display text-2xl text-ink">
            What happens next
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Mail, title: "Confirmation", body: "You'd receive an email and SMS with your booking details." },
              { icon: UserCheck, title: "Meet your cleaner", body: "We'd introduce your cleaner 48 hours before the visit." },
              { icon: Sparkles, title: "Enjoy your home", body: "Relax — we'd follow up afterwards to make sure it's perfect." },
            ].map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-3xl border border-line bg-white p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mustard-soft">
                  <step.icon className="h-5 w-5 text-ink" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        <p className="mx-auto mt-12 max-w-xl rounded-2xl border border-dashed border-ink/20 p-4 text-center text-xs leading-relaxed text-muted">
          This is a demonstration confirmation for the {SITE.name} website concept. No real booking has been made, no payment has been taken and no
          personal information has been sent or stored outside your browser session.
        </p>
        <div className="mt-6 flex justify-center print:hidden">
          <ButtonLink href="/" variant="ghost">
            <Home className="h-4 w-4" aria-hidden /> Back to home
          </ButtonLink>
        </div>
      </div>
    </Shell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5 sm:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-blush via-cream to-cream pb-24 pt-28 sm:pt-36">
      <div className="container-page">{children}</div>
    </div>
  );
}

