import type { ReactNode } from "react";
import { Reveal } from "./reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  id?: string;
}

export function SectionHeading({ eyebrow, title, intro, align = "left", id }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <Reveal className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={`eyebrow ${centered ? "justify-center" : ""}`}>{eyebrow}</p>
      <h2 id={id} className="heading-lg mt-4 text-[2.25rem] text-ink sm:text-5xl">
        {title}
      </h2>
      {intro ? <p className="mt-5 text-lg leading-relaxed text-ink-soft">{intro}</p> : null}
    </Reveal>
  );
}
