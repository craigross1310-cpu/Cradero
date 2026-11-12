import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "accent" | "outline" | "ghost" | "light";
type Size = "md" | "lg" | "sm";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 ease-out select-none disabled:pointer-events-none disabled:opacity-45 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-3";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-cream hover:bg-[#33302c] shadow-[0_10px_30px_-12px_rgb(31_29_27/0.6)] hover:shadow-[0_16px_36px_-14px_rgb(31_29_27/0.7)] hover:-translate-y-0.5",
  accent: "bg-mustard text-ink hover:bg-mustard-bright shadow-[0_10px_30px_-12px_rgb(185_138_13/0.7)] hover:-translate-y-0.5",
  outline: "border border-ink/15 bg-white/60 text-ink backdrop-blur hover:border-ink/40 hover:bg-white",
  ghost: "text-ink hover:bg-ink/5",
  light: "bg-cream text-ink hover:bg-white hover:-translate-y-0.5",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.95rem]",
  lg: "h-14 px-7 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className = "") {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size; children: ReactNode };

export function Button({ variant = "primary", size = "md", className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; children: ReactNode };

export function ButtonLink({ variant = "primary", size = "md", className = "", ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
