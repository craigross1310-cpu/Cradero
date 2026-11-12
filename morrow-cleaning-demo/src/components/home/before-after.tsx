"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { MoveHorizontal } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

const HIGHLIGHTS = [
  { value: "47", label: "point deep-clean checklist" },
  { value: "4.5h", label: "average for a 2-bed deep clean" },
  { value: "100%", label: "of surfaces, edges & fittings" },
];

export function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = frame.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  return (
    <section id="results" aria-labelledby="results-title" className="bg-blush py-24 sm:py-32">
      <div className="container-page grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeading
            id="results-title"
            eyebrow="Before & after"
            title="The difference is in the detail"
            intro="Drag the slider to see what a Morrow deep clean does for a well-loved kitchen — degreased, descaled and polished, right down to the grout lines."
          />
          <Reveal delay={0.1}>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-ink/10 pt-8">
              {HIGHLIGHTS.map((h) => (
                <div key={h.label}>
                  <dt className="sr-only">{h.label}</dt>
                  <dd>
                    <span className="block font-display text-3xl text-ink">{h.value}</span>
                    <span className="mt-1 block text-sm leading-snug text-ink-soft">{h.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div
            ref={frame}
            className={`relative aspect-[3/2] w-full touch-pan-y select-none overflow-hidden rounded-[2rem] bg-stone shadow-lift ${dragging ? "cursor-grabbing" : "cursor-ew-resize"}`}
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture?.(e.pointerId);
              setDragging(true);
              updateFromClientX(e.clientX);
            }}
            onPointerMove={(e) => dragging && updateFromClientX(e.clientX)}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
          >
            <Image
              src="/images/kitchen-after.jpg"
              alt="The same kitchen after a Morrow deep clean — bright, spotless surfaces"
              fill
              sizes="(min-width: 1024px) 58vw, 92vw"
              className="pointer-events-none object-cover"
              draggable={false}
            />
            <div className="pointer-events-none absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
              <Image
                src="/images/kitchen-before.jpg"
                alt="A kitchen before cleaning — dull, greasy and marked surfaces"
                fill
                sizes="(min-width: 1024px) 58vw, 92vw"
                className="object-cover"
                draggable={false}
              />
            </div>

            <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-ink/75 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cream backdrop-blur">Before</span>
            <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-mustard px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-ink">After</span>

            <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgb(0_0_0/0.35)]" style={{ left: `${pos}%` }} aria-hidden>
              <motion.span
                animate={{ scale: dragging ? 1.12 : 1 }}
                className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lift"
              >
                <MoveHorizontal className="h-5 w-5" />
              </motion.span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(pos)}
              onChange={(e) => setPos(Number(e.target.value))}
              aria-label="Before and after comparison — move to reveal the cleaned kitchen"
              className="absolute inset-x-0 bottom-0 h-full w-full cursor-ew-resize opacity-0 [pointer-events:none] focus-visible:[pointer-events:auto]"
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted">Illustrative comparison for demonstration purposes.</p>
        </Reveal>
      </div>
    </section>
  );
}
