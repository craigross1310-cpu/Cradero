"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { ExtraId, FrequencyId, PropertySizeId, PropertyTypeId, ServiceId } from "@/config/pricing";
import { EMPTY_SELECTIONS, STEPS, calculateQuote, normaliseSelections } from "@/lib/pricing";
import type { Quote, QuoteSelections, StepId } from "@/lib/pricing";
import { isSlotAvailable } from "@/lib/availability";

/* ───────────────────────────── State ───────────────────────────── */

interface BookingState {
  selections: QuoteSelections;
  step: StepId;
  /** Furthest step index the customer has reached — used to allow jumping back and forth. */
  maxStepIndex: number;
  notice: { id: number; text: string } | null;
}

type Action =
  | { type: "hydrate"; state: BookingState }
  | { type: "update"; patch: Partial<QuoteSelections> }
  | { type: "toggleExtra"; id: ExtraId }
  | { type: "goTo"; step: StepId }
  | { type: "chooseService"; id: ServiceId; advance: boolean }
  | { type: "dismissNotice" }
  | { type: "reset" };

const INITIAL: BookingState = { selections: EMPTY_SELECTIONS, step: "service", maxStepIndex: 0, notice: null };

const stepIndex = (id: StepId) => STEPS.findIndex((s) => s.id === id);

function apply(state: BookingState, next: QuoteSelections): BookingState {
  const { selections, notices } = normaliseSelections(next);
  return {
    ...state,
    selections,
    notice: notices.length ? { id: Date.now(), text: notices.join(" ") } : state.notice,
  };
}

function reducer(state: BookingState, action: Action): BookingState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "update":
      return apply(state, { ...state.selections, ...action.patch });
    case "toggleExtra": {
      const has = state.selections.extras.includes(action.id);
      const extras = has ? state.selections.extras.filter((e) => e !== action.id) : [...state.selections.extras, action.id];
      return apply(state, { ...state.selections, extras });
    }
    case "chooseService": {
      const next = apply(state, { ...state.selections, service: action.id });
      if (!action.advance) return next;
      const idx = Math.max(stepIndex("property"), state.step === "service" ? stepIndex("property") : stepIndex(state.step));
      return { ...next, step: STEPS[idx].id, maxStepIndex: Math.max(state.maxStepIndex, idx) };
    }
    case "goTo": {
      const idx = stepIndex(action.step);
      return { ...state, step: action.step, maxStepIndex: Math.max(state.maxStepIndex, idx) };
    }
    case "dismissNotice":
      return { ...state, notice: null };
    case "reset":
      return INITIAL;
  }
}

/* ───────────────────────────── Persistence ───────────────────────────── */

const STORAGE_KEY = "morrow:booking:v1";
const CONFIRMATION_KEY = "morrow:confirmation:v1";

function readStorage<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) — the session still works in memory */
  }
}

/* ───────────────────────────── Customer & confirmation ───────────────────────────── */

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  postcode: string;
  address: string;
  instructions: string;
}

export interface Confirmation {
  reference: string;
  createdAt: string;
  selections: QuoteSelections;
  customer: CustomerDetails;
  quote: Quote;
}

/* ───────────────────────────── Context ───────────────────────────── */

interface BookingContextValue {
  ready: boolean;
  today: Date | null;
  selections: QuoteSelections;
  quote: Quote;
  step: StepId;
  maxStepIndex: number;
  notice: BookingState["notice"];
  setService: (id: ServiceId, opts?: { advance?: boolean }) => void;
  setPropertyType: (id: PropertyTypeId) => void;
  setBedrooms: (n: number) => void;
  setBathrooms: (n: number) => void;
  setSize: (id: PropertySizeId) => void;
  setFloors: (n: number) => void;
  setFrequency: (id: FrequencyId) => void;
  toggleExtra: (id: ExtraId) => void;
  setDate: (iso: string) => void;
  setTime: (slotId: string) => void;
  goTo: (step: StepId) => void;
  dismissNotice: () => void;
  reset: () => void;
  confirmation: Confirmation | null;
  saveConfirmation: (c: Confirmation) => void;
  customerDraft: CustomerDetails | null;
  saveCustomerDraft: (c: CustomerDetails) => void;
}

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState<Date | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [customerDraft, setCustomerDraft] = useState<CustomerDetails | null>(null);
  const hydrated = useRef(false);

  // Restore from sessionStorage once on the client.
  useEffect(() => {
    const now = new Date();
    const saved = readStorage<BookingState>(STORAGE_KEY);
    if (saved?.selections) {
      const { selections } = normaliseSelections({ ...EMPTY_SELECTIONS, ...saved.selections });
      // Drop a saved slot that is no longer bookable (e.g. a date now in the past).
      if (selections.date && selections.time && !isSlotAvailable(selections.date, selections.time, now)) {
        selections.date = null;
        selections.time = null;
      }
      const step = STEPS.some((s) => s.id === saved.step) ? saved.step : "service";
      dispatch({
        type: "hydrate",
        state: { selections, step, maxStepIndex: Math.min(saved.maxStepIndex ?? 0, STEPS.length - 1), notice: null },
      });
    }
    setConfirmation(readStorage<Confirmation>(CONFIRMATION_KEY));
    setCustomerDraft(readStorage<CustomerDetails>("morrow:customer:v1"));
    hydrated.current = true;
    setToday(now);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    writeStorage(STORAGE_KEY, { selections: state.selections, step: state.step, maxStepIndex: state.maxStepIndex });
  }, [state.selections, state.step, state.maxStepIndex]);

  const quote = useMemo(() => calculateQuote(state.selections), [state.selections]);

  const update = useCallback((patch: Partial<QuoteSelections>) => dispatch({ type: "update", patch }), []);

  const value = useMemo<BookingContextValue>(
    () => ({
      ready,
      today,
      selections: state.selections,
      quote,
      step: state.step,
      maxStepIndex: state.maxStepIndex,
      notice: state.notice,
      setService: (id, opts) => dispatch({ type: "chooseService", id, advance: opts?.advance ?? false }),
      setPropertyType: (id) => update({ propertyType: id }),
      setBedrooms: (n) => update({ bedrooms: n }),
      setBathrooms: (n) => update({ bathrooms: n }),
      setSize: (id) => update({ size: id }),
      setFloors: (n) => update({ floors: n }),
      setFrequency: (id) => update({ frequency: id }),
      toggleExtra: (id) => dispatch({ type: "toggleExtra", id }),
      setDate: (iso) => {
        // Keep the chosen time only if it is still free on the new date.
        const keepTime = state.selections.time && today ? isSlotAvailable(iso, state.selections.time, today) : false;
        update({ date: iso, time: keepTime ? state.selections.time : null });
      },
      setTime: (slotId) => update({ time: slotId }),
      goTo: (step) => dispatch({ type: "goTo", step }),
      dismissNotice: () => dispatch({ type: "dismissNotice" }),
      reset: () => {
        dispatch({ type: "reset" });
        setCustomerDraft(null);
        writeStorage("morrow:customer:v1", null);
      },
      confirmation,
      saveConfirmation: (c) => {
        setConfirmation(c);
        writeStorage(CONFIRMATION_KEY, c);
      },
      customerDraft,
      saveCustomerDraft: (c) => {
        setCustomerDraft(c);
        writeStorage("morrow:customer:v1", c);
      },
    }),
    [ready, today, state, quote, update, confirmation, customerDraft],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}
