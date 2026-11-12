import type { Metadata } from "next";
import { ConfirmationView } from "@/components/booking/confirmation-view";

export const metadata: Metadata = {
  title: "Booking confirmed (demo)",
  description: "Your demonstration booking with Morrow Cleaning Co.",
};

export default function ConfirmedPage() {
  return <ConfirmationView />;
}
