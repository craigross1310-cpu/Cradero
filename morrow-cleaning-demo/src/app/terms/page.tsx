import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Terms & conditions", description: `Terms of service for ${SITE.name}.` };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & conditions" updated="November 2026">
      <section>
        <h2>1. About this website</h2>
        <p className="mt-3">
          {SITE.name} is a fictional company. This site demonstrates an interactive quoting and booking experience. No services are offered, no bookings are
          made and no payments are taken.
        </p>
      </section>
      <section>
        <h2>2. Quotes and pricing</h2>
        <p className="mt-3">
          Prices shown by the calculator are illustrative. In a live service, quotes would be based on the information you provide and confirmed before your
          visit. If a home differed significantly from its description, the price could be reviewed with you before work began.
        </p>
      </section>
      <section>
        <h2>3. Bookings, rescheduling and cancellation</h2>
        <ul className="mt-3">
          <li>Visits could be rescheduled or cancelled free of charge up to 24 hours before the arrival time.</li>
          <li>Recurring plans could be paused or skipped without losing the recurring discount.</li>
          <li>Late cancellations might incur a charge of up to 50% of the visit price.</li>
        </ul>
      </section>
      <section>
        <h2>4. Satisfaction promise</h2>
        <p className="mt-3">
          If any area was not cleaned to the agreed standard, customers could report it within 72 hours and a re-clean of that area would be arranged at no
          additional cost.
        </p>
      </section>
      <section>
        <h2>5. Insurance and liability</h2>
        <p className="mt-3">
          Cleaning work would be covered by public liability insurance. Customers would be asked to secure valuables and let us know about delicate surfaces
          or items before the clean.
        </p>
      </section>
    </LegalPage>
  );
}
