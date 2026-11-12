"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Lock, Pencil, ShieldCheck } from "lucide-react";
import { cloneElement, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FocusEvent, FormEvent, ReactElement, ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { QuoteSummary } from "@/components/calculator/quote-summary";
import { useBooking } from "@/lib/booking-store";
import type { CustomerDetails } from "@/lib/booking-store";
import { STEPS, firstIncompleteStep, formatDuration, formatMoney, getService, getTimeSlot, stepIssues } from "@/lib/pricing";
import { formatLongDate, isSlotAvailable } from "@/lib/availability";
import { INSTRUCTIONS_MAX, generateReference, normalisePostcode, validateCustomer, validateField } from "@/lib/validation";
import type { FieldErrors } from "@/lib/validation";

const EMPTY_CUSTOMER: CustomerDetails = { fullName: "", email: "", phone: "", postcode: "", address: "", instructions: "" };

type Phase = "details" | "review";

export function BookingFlow() {
  const router = useRouter();
  const { ready, today, selections, quote, customerDraft, saveCustomerDraft, saveConfirmation, goTo } = useBooking();
  const [phase, setPhase] = useState<Phase>("details");
  const [customer, setCustomer] = useState<CustomerDetails>(EMPTY_CUSTOMER);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerDetails, boolean>>>({});
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const loadedDraft = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready && customerDraft && !loadedDraft.current) {
      loadedDraft.current = true;
      setCustomer({ ...EMPTY_CUSTOMER, ...customerDraft });
    }
  }, [ready, customerDraft]);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase]);

  if (!ready) {
    return (
      <PageShell>
        <div className="h-[32rem] animate-pulse rounded-[2rem] bg-stone" aria-hidden />
      </PageShell>
    );
  }

  const missing = firstIncompleteStep(selections);
  const slotStillFree = selections.date && selections.time && today ? isSlotAvailable(selections.date, selections.time, today) : false;

  if (missing || !slotStillFree) {
    const target = missing ?? "schedule";
    const stepMeta = STEPS.find((s) => s.id === target)!;
    const issue = stepIssues(target, selections)[0] ?? "Pick a new time slot";
    return (
      <PageShell>
        <div className="mx-auto max-w-xl rounded-[2rem] border border-line bg-white p-8 text-center shadow-soft sm:p-12">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-mustard-soft">
            <AlertCircle className="h-6 w-6 text-ink" aria-hidden />
          </span>
          <h1 className="heading-lg mt-6 text-3xl text-ink sm:text-4xl">Your quote isn&apos;t quite finished</h1>
          <p className="mt-4 text-ink-soft">
            {selections.service ? (
              <>
                We still need a little more information at <strong>Step {STEPS.indexOf(stepMeta) + 1}: {stepMeta.label}</strong> — {issue.toLowerCase()}.
              </>
            ) : (
              <>Start by choosing a cleaning service — it only takes a minute.</>
            )}
          </p>
          <Button
            size="lg"
            className="mt-8"
            onClick={() => {
              goTo(target);
              router.push("/#quote");
            }}
          >
            {selections.service ? "Finish my quote" : "Get my instant quote"}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      </PageShell>
    );
  }

  const update = (field: keyof CustomerDetails) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...customer, [field]: e.target.value };
    setCustomer(next);
    saveCustomerDraft(next);
    if (touched[field]) setErrors((prev) => ({ ...prev, [field]: validateField(field, e.target.value) }));
  };

  const blur = (field: keyof CustomerDetails) => (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((t) => ({ ...t, [field]: true }));
    let value = e.target.value;
    if (field === "postcode" && !validateField("postcode", value)) {
      value = normalisePostcode(value);
      const next = { ...customer, postcode: value };
      setCustomer(next);
      saveCustomerDraft(next);
    }
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const submitDetails = (e: FormEvent) => {
    e.preventDefault();
    const found = validateCustomer(customer);
    setErrors(found);
    setTouched({ fullName: true, email: true, phone: true, postcode: true, address: true, instructions: true });
    const firstError = (Object.keys(found) as (keyof CustomerDetails)[])[0];
    if (firstError) {
      document.getElementById(`field-${firstError}`)?.focus();
      return;
    }
    const cleaned = { ...customer, postcode: normalisePostcode(customer.postcode), fullName: customer.fullName.trim(), email: customer.email.trim() };
    setCustomer(cleaned);
    saveCustomerDraft(cleaned);
    setPhase("review");
  };

  const confirm = () => {
    if (!consent) {
      setConsentError(true);
      return;
    }
    setSubmitting(true);
    // Demo only: nothing is sent anywhere. The booking is stored in this browser session.
    window.setTimeout(() => {
      saveConfirmation({ reference: generateReference(), createdAt: new Date().toISOString(), selections, customer, quote });
      router.push("/book/confirmed");
    }, 900);
  };

  const service = getService(selections.service)!;
  const slot = getTimeSlot(selections.time)!;

  return (
    <PageShell>
      <div ref={topRef} className="scroll-mt-28" />
      <BookingSteps phase={phase} />

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="rounded-[2rem] border border-line bg-white p-5 shadow-soft sm:p-9">
          <AnimatePresence mode="wait" initial={false}>
            {phase === "details" ? (
              <motion.form
                key="details"
                noValidate
                onSubmit={submitDetails}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="heading-lg text-3xl text-ink sm:text-4xl">Your details</h1>
                <p className="mt-2 text-ink-soft">Tell us who you are and where we&apos;ll be cleaning.</p>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <Field id="fullName" label="Full name" error={touched.fullName ? errors.fullName : undefined} className="sm:col-span-2">
                    <input id="field-fullName" type="text" autoComplete="name" value={customer.fullName} onChange={update("fullName")} onBlur={blur("fullName")} placeholder="e.g. Alex Morgan" />
                  </Field>
                  <Field id="email" label="Email" error={touched.email ? errors.email : undefined}>
                    <input id="field-email" type="email" inputMode="email" autoComplete="email" value={customer.email} onChange={update("email")} onBlur={blur("email")} placeholder="name@example.com" />
                  </Field>
                  <Field id="phone" label="Phone number" error={touched.phone ? errors.phone : undefined}>
                    <input id="field-phone" type="tel" inputMode="tel" autoComplete="tel" value={customer.phone} onChange={update("phone")} onBlur={blur("phone")} placeholder="07700 900123" />
                  </Field>
                  <Field id="postcode" label="Property postcode" error={touched.postcode ? errors.postcode : undefined}>
                    <input id="field-postcode" type="text" autoComplete="postal-code" autoCapitalize="characters" value={customer.postcode} onChange={update("postcode")} onBlur={blur("postcode")} placeholder="EC1V 2NX" />
                  </Field>
                  <Field id="address" label="Address" error={touched.address ? errors.address : undefined}>
                    <input id="field-address" type="text" autoComplete="street-address" value={customer.address} onChange={update("address")} onBlur={blur("address")} placeholder="Flat 2, 18 Elm Row" />
                  </Field>
                  <Field
                    id="instructions"
                    label="Instructions"
                    optional
                    hint={`${customer.instructions.length}/${INSTRUCTIONS_MAX}`}
                    error={touched.instructions ? errors.instructions : undefined}
                    className="sm:col-span-2"
                  >
                    <textarea
                      id="field-instructions"
                      rows={4}
                      value={customer.instructions}
                      onChange={update("instructions")}
                      onBlur={blur("instructions")}
                      placeholder="Access details, parking, pets, areas to focus on…"
                    />
                  </Field>
                </div>

                <p className="mt-6 flex items-start gap-2 text-xs text-muted">
                  <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  This is a demonstration. Your details stay in this browser tab and are never sent or stored on a server.
                </p>

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <ButtonLink href="/#quote" variant="ghost" className="!px-4">
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Edit quote
                  </ButtonLink>
                  <Button type="submit" size="lg">
                    Review booking <ArrowRight className="h-5 w-5" aria-hidden />
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="heading-lg text-3xl text-ink sm:text-4xl">Review &amp; confirm</h1>
                <p className="mt-2 text-ink-soft">Please check everything looks right before confirming your demo booking.</p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <ReviewCard title="Your clean" onEdit={() => router.push("/#quote")} editLabel="Edit quote">
                    <p className="font-semibold text-ink">{service.name}</p>
                    <p className="mt-1 text-sm text-ink-soft">{formatLongDate(selections.date!)}</p>
                    <p className="text-sm text-ink-soft">
                      Arrival {slot.label} · ≈ {formatDuration(quote.onSiteMinutes)}
                    </p>
                  </ReviewCard>
                  <ReviewCard title="Your details" onEdit={() => setPhase("details")} editLabel="Edit details">
                    <p className="font-semibold text-ink">{customer.fullName}</p>
                    <p className="mt-1 break-all text-sm text-ink-soft">{customer.email}</p>
                    <p className="text-sm text-ink-soft">{customer.phone}</p>
                    <p className="text-sm text-ink-soft">
                      {customer.address}, {customer.postcode}
                    </p>
                  </ReviewCard>
                  {customer.instructions.trim() ? (
                    <ReviewCard title="Instructions" className="sm:col-span-2">
                      <p className="whitespace-pre-line text-sm text-ink-soft">{customer.instructions.trim()}</p>
                    </ReviewCard>
                  ) : null}
                </div>

                <div className="mt-6 flex items-center justify-between rounded-3xl bg-ink p-6 text-cream">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-cream/60">{quote.isRecurring ? "Total per visit" : "Estimated total"}</p>
                    <p className="mt-1 font-display text-4xl">{formatMoney(quote.total)}</p>
                  </div>
                  <p className="max-w-[10rem] text-right text-xs text-cream/60">Pay after your clean. No payment is taken in this demo.</p>
                </div>

                <label className={`mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${consentError && !consent ? "border-danger bg-[#fbe9e5]" : "border-line hover:border-ink/30"}`}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      setConsentError(false);
                    }}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-ink"
                    aria-describedby={consentError && !consent ? "consent-error" : undefined}
                  />
                  <span className="text-sm text-ink-soft">
                    I understand this is a <strong className="text-ink">demonstration website</strong> — no real booking will be made, no payment taken and no details sent. I accept the{" "}
                    <Link href="/terms" className="font-semibold text-ink underline underline-offset-2" target="_blank">
                      terms
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-semibold text-ink underline underline-offset-2" target="_blank">
                      privacy policy
                    </Link>
                    .
                  </span>
                </label>
                {consentError && !consent ? (
                  <p id="consent-error" role="alert" className="mt-2 text-sm font-medium text-danger">
                    Please tick the box to confirm.
                  </p>
                ) : null}

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Button variant="ghost" onClick={() => setPhase("details")} className="!px-4">
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Back
                  </Button>
                  <Button variant="accent" size="lg" onClick={confirm} disabled={submitting} aria-busy={submitting}>
                    {submitting ? (
                      <>
                        <motion.span
                          className="h-4 w-4 rounded-full border-2 border-ink/30 border-t-ink"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          aria-hidden
                        />
                        Confirming…
                      </>
                    ) : (
                      <>
                        Confirm demo booking <Check className="h-5 w-5" aria-hidden />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside aria-label="Booking summary" className="lg:sticky lg:top-24">
          <div className="rounded-[2rem] border border-line bg-white p-6 shadow-lift sm:p-7">
            <QuoteSummary selections={selections} quote={quote} title="Booking summary" />
            <Link href="/#quote" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-ink">
              <Pencil className="h-3.5 w-3.5" aria-hidden /> Change your selections
            </Link>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/60 p-4 text-sm text-ink-soft">
            <ShieldCheck className="h-5 w-5 shrink-0 text-sage" aria-hidden />
            Free rescheduling up to 24 hours before your visit.
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-blush via-cream to-cream pb-24 pt-28 sm:pt-32">
      <div className="container-page">{children}</div>
    </div>
  );
}

function BookingSteps({ phase }: { phase: Phase }) {
  const items = [
    { label: "Quote", state: "done" },
    { label: "Your details", state: phase === "details" ? "active" : "done" },
    { label: "Review", state: phase === "review" ? "active" : "todo" },
    { label: "Confirmed", state: "todo" },
  ] as const;
  return (
    <ol className="flex items-center gap-2 overflow-x-auto text-sm no-scrollbar" aria-label="Booking progress">
      {items.map((item, i) => (
        <li key={item.label} className="flex shrink-0 items-center gap-2" aria-current={item.state === "active" ? "step" : undefined}>
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              item.state === "done" ? "bg-ink text-cream" : item.state === "active" ? "bg-mustard text-ink" : "bg-stone-deep text-muted"
            }`}
          >
            {item.state === "done" ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : i + 1}
          </span>
          <span className={`font-semibold ${item.state === "todo" ? "text-muted" : "text-ink"} ${item.state === "active" ? "" : "sr-only sm:not-sr-only"}`}>{item.label}</span>
          {i < items.length - 1 ? <span className="mx-1 h-px w-5 bg-ink/15 sm:w-10" aria-hidden /> : null}
        </li>
      ))}
    </ol>
  );
}

interface FieldProps {
  id: keyof CustomerDetails;
  label: string;
  error?: string;
  optional?: boolean;
  hint?: string;
  className?: string;
  children: ReactElement<{ className?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}

function Field({ id, label, error, optional, hint, className = "", children }: FieldProps) {
  const errorId = `error-${id}`;
  const control = cloneElement(children, {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    className: `w-full rounded-2xl border bg-cream/60 px-4 py-3.5 text-base text-ink placeholder:text-muted/70 transition-[border-color,box-shadow,background-color] duration-200 focus:bg-white focus:outline-none ${
      error ? "border-danger focus:shadow-[0_0_0_4px_rgb(180_67_47/0.15)]" : "border-line hover:border-ink/30 focus:border-ink focus:shadow-glow"
    } ${id === "instructions" ? "resize-y min-h-28" : "h-[3.25rem]"}`,
  });
  return (
    <div className={className}>
      <label htmlFor={`field-${id}`} className="flex items-baseline justify-between text-sm font-semibold text-ink">
        <span>
          {label} {optional ? <span className="font-normal text-muted">(optional)</span> : null}
        </span>
        {hint ? <span className="text-xs font-normal text-muted">{hint}</span> : null}
      </label>
      <div className="mt-2">{control}</div>
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden text-sm font-medium text-danger"
          >
            <span className="mt-1.5 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden /> {error}
            </span>
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ReviewCard({ title, children, onEdit, editLabel, className = "" }: { title: string; children: ReactNode; onEdit?: () => void; editLabel?: string; className?: string }) {
  return (
    <div className={`rounded-3xl border border-line bg-cream/50 p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">{title}</p>
        {onEdit ? (
          <button type="button" onClick={onEdit} className="inline-flex items-center gap-1 text-xs font-semibold text-ink underline decoration-ink/20 underline-offset-4 hover:decoration-ink">
            <Pencil className="h-3 w-3" aria-hidden /> {editLabel}
          </button>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
