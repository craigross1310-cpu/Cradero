import type { Metadata } from "next";
import { BookingFlow } from "@/components/booking/booking-flow";

export const metadata: Metadata = {
  title: "Complete your booking",
  description: "Add your details and review your Morrow Cleaning Co. booking.",
};

export default function BookPage() {
  return <BookingFlow />;
}
