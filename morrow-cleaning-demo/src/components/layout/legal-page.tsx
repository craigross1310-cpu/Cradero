import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="bg-gradient-to-b from-blush via-cream to-cream pb-24 pt-32 sm:pt-40">
      <article className="container-page max-w-3xl">
        <p className="eyebrow">Legal</p>
        <h1 className="heading-xl mt-4 text-4xl text-ink sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm text-muted">Last updated {updated}</p>
        <div className="mt-6 rounded-2xl border border-mustard/40 bg-mustard-soft p-4 text-sm text-ink">
          Morrow Cleaning Co. is a fictional business created to demonstrate a website concept. This page is illustrative and does not form a legal agreement.
        </div>
        <div className="mt-10 space-y-8 leading-relaxed text-ink-soft [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          {children}
        </div>
      </article>
    </div>
  );
}
