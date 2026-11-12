import Image from "next/image";
import { ArrowRight, Clock, ShieldCheck, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function FinalCTA() {
  return (
    <section aria-labelledby="cta-title" className="py-20 sm:py-28">
      <div className="container-page">
        <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-ink">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative z-10 p-8 sm:p-14 lg:p-16">
              <p className="eyebrow !text-cream/60">Book in minutes</p>
              <h2 id="cta-title" className="heading-xl mt-5 text-[2.5rem] text-cream sm:text-6xl">
                Your cleaner home <span className="italic text-mustard">starts here.</span>
              </h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/70">
                Get a fixed, personalised price in under a minute — then choose a time that works for you.
              </p>
              <ButtonLink href="/#quote" variant="accent" size="lg" className="mt-9">
                Get my instant quote
                <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" aria-hidden />
              </ButtonLink>
              <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-cream/70">
                <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-mustard" aria-hidden /> 60-second quote</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-mustard" aria-hidden /> Fully insured</li>
                <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-mustard" aria-hidden /> 72h re-clean promise</li>
              </ul>
            </div>
            <div className="relative min-h-[18rem] lg:min-h-full">
              <Image
                src="/images/bedroom.jpg"
                alt="A serene, freshly cleaned bedroom with crisp white linen"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/10 to-transparent lg:bg-gradient-to-r" aria-hidden />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
