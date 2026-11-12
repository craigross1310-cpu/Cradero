# Morrow Cleaning Co. — Interactive Website Concept

A premium, fully interactive cleaning-company website with a live multi-step quote calculator and a full booking journey. It was built as a demonstration project. **Morrow Cleaning Co. is a fictional brand**: no bookings are made, no payments are taken and no customer data leaves the browser.

_Website concept by Saltra Solutions._

---

## Highlights

- **Five-step quote calculator:** service → property → frequency → extras → date & time.
  - The price updates live and animates, with an itemised breakdown.
  - Recurring discounts, minimum-visit logic and estimated duration and team size are all calculated.
  - The customer can jump back to any step, and selections persist across reloads (`sessionStorage`).
  - Invalid combinations are corrected automatically, and the customer is told why. Examples: a bungalow can't have 2 floors, and end-of-tenancy cleans can't be weekly.
- **Booking flow:** details form with validation (UK phone and postcode) → final review → demo confirmation.
  - The confirmation shows a reference number and can be copied, added to a calendar (`.ics`) or printed.
- **Homepage:**
  - Animated hero with a live-quote preview that uses the real pricing engine.
  - Services that deep-link into the calculator.
  - Animated "How it works" section.
  - Draggable before/after comparison (also works with the keyboard).
  - Reviews and an FAQ accordion.
  - Final call to action and a footer.
- **Mobile-first details:**
  - Sticky quote bar with a swipe-to-close summary drawer.
  - Large tap targets and a mobile-friendly calendar.
  - Safe-area padding for iPhone.
- **Accessibility:**
  - Semantic radio and checkbox roles and labelled controls.
  - Focus moves to each new step's heading.
  - Respects `prefers-reduced-motion`, and includes a skip link.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion (Framer Motion) · Lucide icons. There is no database and no backend.

## Getting started

```bash
cd morrow-cleaning-demo
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
npm run test:pricing   # 17 pricing-engine tests, incl. a 1,000+ combination sweep
npm run lint           # TypeScript type-check
```

Requires Node.js 20.9 or newer.

## Project structure

```
src/
  config/
    pricing.ts      ← ALL prices, discounts, durations, extras, time slots, booking rules
    site.ts         ← brand name, contact details, social links, headline stats, nav
  lib/
    pricing.ts      ← pure pricing engine (integer pence, total = sum of line items)
    availability.ts ← demo calendar availability (swap for a real scheduling API)
    booking-store.tsx ← React context + sessionStorage persistence
    validation.ts   ← form validation & reference generation
  components/
    calculator/     ← steps, summary panel, mobile drawer
    booking/        ← details form, review, confirmation
    home/           ← homepage sections
    layout/         ← header, footer, legal page shell
    ui/             ← buttons, reveal animation, animated price, icons, logo
  app/              ← routes: /, /book, /book/confirmed, /privacy, /terms
public/images/      ← all photography
scripts/test-pricing.ts
```

## Editing prices

Open **`src/config/pricing.ts`**. Every value is commented. Common edits:

| Change | Where |
| --- | --- |
| Service base price, per-bedroom and per-bathroom charges | `SERVICES[].basePrice`, `perExtraBedroom`, `perExtraBathroom` |
| Frequencies a service allows | `SERVICES[].allowedFrequencies`, `defaultFrequency` |
| Recurring discounts | `FREQUENCIES[].discount` (`0.15` = 15%) |
| House or bungalow uplift | `PROPERTY_TYPES[].multiplier` |
| Size bands | `PROPERTY_SIZES[]` |
| Floor surcharges | `FLOOR_OPTIONS[]` |
| Extras (price, duration, per-bed pricing) | `EXTRAS[]` |
| Minimum visit charge, two-cleaner threshold, booking window, closed days | `BOOKING_RULES` |
| Arrival times | `TIME_SLOTS` |
| Round to whole pounds or exact pence | `PRICE_ROUNDING_PENCE` |

After editing, run `npm run test:pricing`. A few tests assert the demo values from the brief (for example, standard cleaning from £55). Update those expectations to match your new prices. The structural tests must still pass: the total equals the sum of the line items, there are no duplicate extras, and invalid frequencies are corrected.

## Editing branding

- **Name, contact details, social links and stats:** `src/config/site.ts`.
- **Colours:** the `@theme` block in `src/app/globals.css`. For example, `--color-mustard` is the accent and `--color-ink` is the text colour.
- **Fonts:** `src/app/layout.tsx` (Fraunces for display text, Manrope for body text, both via `next/font`).
- **Logo:** `src/components/ui/logo.tsx` and `src/app/icon.svg` (the favicon).
- **Copy:** each homepage section lives in its own file under `src/components/home/`.
- **Social sharing image:** `src/app/opengraph-image.tsx`.

## Editing imagery

Replace the files in `public/images/`, keeping the same file names, or update the paths:

- Service cards: `SERVICES[].image` in `src/config/pricing.ts`.
- Hero: `hero-home.jpg` and `cleaner-detail.jpg`.
- Before/after: `kitchen-before.jpg` and `kitchen-after.jpg`. Use a matched pair of real photos for a live site.
- Why-choose and final CTA: `eco-products.jpg` and `bedroom.jpg`.

Images are optimised automatically (AVIF/WebP, responsive sizes) by `next/image`. The demo photography comes from Unsplash (Unsplash Licence). The "before" kitchen is a digitally aged version of the "after" photo and is labelled as illustrative on the page.

## Deploying to Vercel

The app is in the `morrow-cleaning-demo/` subfolder of this repository, so set that folder as Vercel's **Root Directory**.

**Option A — Vercel dashboard (no CLI):**
1. Go to <https://vercel.com/new> and import this GitHub repository.
2. Set **Root Directory** to `morrow-cleaning-demo`. Vercel detects the Framework Preset (Next.js) automatically.
3. Name the project `morrow-cleaning-demo` and click **Deploy**. No environment variables are needed.
4. Your site is live at `https://morrow-cleaning-demo.vercel.app`, or a similar URL if that name is taken.

**Option B — Vercel CLI:**
```bash
npm i -g vercel
cd morrow-cleaning-demo
vercel login
vercel --prod     # accept the defaults; project name: morrow-cleaning-demo
```

If the final URL differs, update `SITE.url` in `src/config/site.ts` so social-sharing links resolve correctly.

The site is set to `noindex` because the brand is fictional. Remove the `robots` entry in `src/app/layout.tsx` for a real business.

## Adapting this for a real cleaning business

1. **Prices:** replace the values in `src/config/pricing.ts` with the business's rate card. Every part of the site reads from that file.
2. **Real availability:** replace `getDayAvailability` in `src/lib/availability.ts` with a fetch from a route such as `/api/availability`. That route would be backed by the business's scheduling tool (for example Google Calendar, Jobber, ServiceM8 or Launch27) or a simple database of cleaner shifts.
3. **Real bookings:**
   - Replace the timeout in `confirm()` (`src/components/booking/booking-flow.tsx`) with a `POST` to a Next.js Route Handler.
   - That handler should re-calculate the price on the server with the same `calculateQuote()` engine, so the browser can't tamper with it.
   - It should then save the booking (Postgres, Supabase or Airtable) and send confirmation emails and SMS (Resend, Postmark or Twilio).
4. **Payments:** add a Stripe Checkout or Payment Element step after the review, or save a card with a SetupIntent to charge after the clean.
5. **Content and trust:** swap in genuine reviews (for example from a Trustpilot or Google Reviews widget), real team photography and real before/after pairs.
6. **Operations:** add an admin view of upcoming jobs, automated reminders 48 hours before each visit, and links that let recurring customers manage their own plans.
7. **Compliance:** finalise the privacy policy and terms with a legal professional, add cookie consent if analytics are introduced, and remove the demo disclaimers.
