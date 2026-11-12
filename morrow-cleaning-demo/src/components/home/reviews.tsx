import { Quote, Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { SITE } from "@/config/site";

const REVIEWS = [
  {
    name: "Hannah W.",
    area: "Islington",
    service: "Regular Maintenance",
    body: "Booking took two minutes and the price didn't change once. Same cleaner every fortnight, and she remembers exactly how we like things. Coming home on a Friday is a genuine joy now.",
    tone: "bg-mustard-soft",
  },
  {
    name: "Marcus O.",
    area: "Clapham",
    service: "End of Tenancy",
    body: "Our letting agent said it was the cleanest check-out they'd seen all year. Full deposit back, and they even sent photos of every room when they'd finished.",
    tone: "bg-sage-soft",
  },
  {
    name: "Priya S.",
    area: "Walthamstow",
    service: "Deep Clean",
    body: "The oven looks brand new and the bathroom grout is white again — I genuinely didn't think that was possible. Worth every penny.",
    tone: "bg-blush-deep",
  },
  {
    name: "Tom & Ellie R.",
    area: "Richmond",
    service: "Move-In Clean",
    body: "We moved in to a home that smelled fresh and felt properly ours. Being able to choose an evening slot around work made all the difference.",
    tone: "bg-stone-deep",
  },
  {
    name: "Grace L.",
    area: "Hackney",
    service: "Standard Clean",
    body: "Clear pricing, friendly team, beautiful results. I loved seeing exactly what I was paying for before I booked.",
    tone: "bg-mustard-soft",
  },
  {
    name: "Daniel K.",
    area: "Greenwich",
    service: "Regular Maintenance",
    body: "Skipping a week while we were on holiday was one tap. It's the most stress-free service I pay for.",
    tone: "bg-sage-soft",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => /^[a-z]/i.test(w))
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

function Stars() {
  return (
    <div className="flex gap-0.5" role="img" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-mustard text-mustard" aria-hidden />
      ))}
    </div>
  );
}

export function Reviews() {
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="py-24 sm:py-32">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <SectionHeading
            id="reviews-title"
            eyebrow="Customer reviews"
            title="Loved in homes across London"
            intro="Here's what a typical week of feedback looks like."
          />
          <Reveal className="flex items-center gap-5 rounded-[1.75rem] border border-line bg-white p-5 shadow-soft">
            <span className="font-display text-5xl text-ink">{SITE.stats.rating}</span>
            <div>
              <Stars />
              <p className="mt-1.5 text-sm text-ink-soft">
                Average from {SITE.stats.reviews.toLocaleString("en-GB")}+ reviews
              </p>
            </div>
          </Reveal>
        </div>

        <ul className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal as="li" key={r.name} delay={(i % 3) * 0.08} className="w-[85%] shrink-0 snap-center md:w-auto">
              <figure className="flex h-full flex-col rounded-[2rem] border border-line bg-white p-7 shadow-soft transition-shadow duration-500 hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <Stars />
                  <Quote className="h-7 w-7 text-stone-deep" aria-hidden />
                </div>
                <blockquote className="mt-5 flex-1 text-[1.02rem] leading-relaxed text-ink">“{r.body}”</blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full font-semibold text-ink ${r.tone}`} aria-hidden>
                    {initials(r.name)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{r.name}</span>
                    <span className="block text-xs text-muted">
                      {r.area} · {r.service}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted">
          Reviews shown are illustrative examples written for this website concept and do not represent real customers.
        </p>
      </div>
    </section>
  );
}
