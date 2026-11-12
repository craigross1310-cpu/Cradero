"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

interface SelectCardProps {
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  label?: string;
  /** "radio" for single choice, "checkbox" for multi-select. */
  mode?: "radio" | "checkbox";
}

export function SelectCard({ selected, onSelect, disabled, children, className = "", label, mode = "radio" }: SelectCardProps) {
  return (
    <motion.button
      type="button"
      role={mode}
      aria-checked={selected}
      aria-label={label}
      disabled={disabled}
      onClick={onSelect}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`relative w-full rounded-3xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-300 sm:p-5 ${
        disabled
          ? "cursor-not-allowed border-line bg-stone/50 opacity-55"
          : selected
            ? "border-ink bg-white shadow-[0_0_0_1px_var(--color-ink),0_18px_40px_-24px_rgb(31_29_27/0.45)]"
            : "border-line bg-white/70 hover:border-ink/35 hover:bg-white hover:shadow-soft"
      } ${className}`}
    >
      <CheckBadge selected={selected} />
      {children}
    </motion.button>
  );
}

export function CheckBadge({ selected }: { selected: boolean }) {
  return (
    <span
      className={`absolute right-3.5 top-3.5 flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-300 ${
        selected ? "border-mustard bg-mustard" : "border-ink/15 bg-white"
      }`}
      aria-hidden
    >
      <AnimatePresence>
        {selected ? (
          <motion.span initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 26 }}>
            <Check className="h-3.5 w-3.5 text-ink" strokeWidth={3} />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

interface ChipProps {
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  children: ReactNode;
  label?: string;
  className?: string;
}

export function Chip({ selected, onSelect, disabled, children, label, className = "" }: ChipProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      disabled={disabled}
      onClick={onSelect}
      className={`relative flex min-h-12 items-center justify-center rounded-2xl border px-3 text-[0.95rem] font-semibold transition-all duration-200 active:scale-95 ${
        disabled
          ? "cursor-not-allowed border-line bg-stone/60 text-muted/60 line-through"
          : selected
            ? "border-ink bg-ink text-cream shadow-[0_10px_24px_-14px_rgb(31_29_27/0.8)]"
            : "border-line bg-white text-ink hover:border-ink/40"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function FieldGroup({ label, hint, children, id }: { label: string; hint?: string; children: ReactNode; id: string }) {
  return (
    <fieldset className="min-w-0" aria-describedby={hint ? `${id}-hint` : undefined}>
      <legend className="flex w-full items-baseline justify-between gap-3 text-sm font-bold text-ink">
        <span>{label}</span>
        {hint ? (
          <span id={`${id}-hint`} className="text-xs font-medium text-muted">
            {hint}
          </span>
        ) : null}
      </legend>
      <div className="mt-3" role="radiogroup" aria-label={label}>
        {children}
      </div>
    </fieldset>
  );
}
