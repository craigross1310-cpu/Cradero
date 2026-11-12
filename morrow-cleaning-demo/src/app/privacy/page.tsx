import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Privacy policy", description: `How ${SITE.name} handles your information.` };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="November 2026">
      <section>
        <h2>Information on this demonstration site</h2>
        <p className="mt-3">
          This website is a demonstration. Quote selections and booking details you enter are kept only in your browser&apos;s session storage so that your
          progress survives page changes. Nothing is transmitted to a server, emailed or shared with third parties, and it is cleared when you close the tab.
        </p>
      </section>
      <section>
        <h2>What a live version would collect</h2>
        <p className="mt-3">A real cleaning business using this website would typically collect:</p>
        <ul className="mt-3">
          <li>Your name, email address and phone number, to confirm and manage bookings.</li>
          <li>Your property address and access instructions, so cleaners can reach your home.</li>
          <li>Details of the services you choose, to prepare an accurate quote and schedule.</li>
        </ul>
      </section>
      <section>
        <h2>How information would be used</h2>
        <p className="mt-3">
          Personal information would be used only to provide and improve the cleaning service, process payments, and send service updates. Marketing
          messages would only be sent with your explicit consent.
        </p>
      </section>
      <section>
        <h2>Your rights</h2>
        <p className="mt-3">
          Under UK GDPR you would have the right to access, correct, delete or restrict the use of your personal data, and to complain to the Information
          Commissioner&apos;s Office (ICO).
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p className="mt-3">
          Questions about this demonstration can be directed to {SITE.contact.email} (fictional demo address).
        </p>
      </section>
    </LegalPage>
  );
}
