import type { PropertyTypeId } from "@/config/pricing";

export function PropertyIcon({ type, className = "h-10 w-10" }: { type: PropertyTypeId; className?: string }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (type === "apartment")
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden>
        <rect x="12" y="6" width="24" height="36" rx="2.5" {...stroke} />
        <path d="M18 13h3M27 13h3M18 20h3M27 20h3M18 27h3M27 27h3" {...stroke} />
        <path d="M21 42v-7h6v7" {...stroke} />
        <path d="M6 42h36" {...stroke} />
      </svg>
    );
  if (type === "house")
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden>
        <path d="M8 22 24 9l16 13" {...stroke} />
        <path d="M12 19v23h24V19" {...stroke} />
        <path d="M17 26h4M27 26h4" {...stroke} />
        <path d="M21 42v-8h6v8" {...stroke} />
        <path d="M32 13V8h4v8" {...stroke} />
        <path d="M6 42h36" {...stroke} />
      </svg>
    );
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path d="M4 27 24 16l20 11" {...stroke} />
      <path d="M8 25v17h32V25" {...stroke} />
      <path d="M13 31h5M30 31h5" {...stroke} />
      <path d="M21 42v-8h6v8" {...stroke} />
      <path d="M2 42h44" {...stroke} />
    </svg>
  );
}
