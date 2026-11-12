import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[80dvh] items-center bg-gradient-to-b from-blush to-cream pt-24">
      <div className="container-page text-center">
        <p className="font-display text-8xl text-mustard">404</p>
        <h1 className="heading-lg mt-4 text-4xl text-ink">This room&apos;s already spotless — and empty.</h1>
        <p className="mt-4 text-ink-soft">The page you&apos;re looking for doesn&apos;t exist.</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/#quote" variant="outline">Get a quote</ButtonLink>
        </div>
      </div>
    </div>
  );
}
