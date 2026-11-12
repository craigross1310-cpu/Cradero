/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  MORROW CLEANING CO. — PRICING CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 *  Every price, adjustment, discount and duration used by the quote calculator
 *  lives in this one file. To adapt the site for a real business, edit the
 *  values below — the calculator, summary panel, booking review and
 *  confirmation screen all read from here automatically.
 *
 *  • All money values are in GBP (£) and may include pence (e.g. 12.5).
 *  • Durations are in minutes for a single cleaner.
 *  • These are illustrative demo prices, not real quotations.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const CURRENCY = { code: "GBP", locale: "en-GB", symbol: "£" } as const;

/**
 * Percentage-based adjustments and discounts are rounded to this many pence.
 * 100 = whole pounds (cleaner-looking prices), 1 = exact to the penny.
 */
export const PRICE_ROUNDING_PENCE = 100;

/* ───────────────────────────── Services ───────────────────────────── */

export type ServiceId = "standard" | "deep" | "end-of-tenancy" | "move-in" | "regular";
export type FrequencyId = "one-off" | "weekly" | "fortnightly" | "monthly";

export interface ServiceConfig {
  id: ServiceId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  /** Price for a 1-bedroom, 1-bathroom property before adjustments. */
  basePrice: number;
  /** Added for each bedroom beyond the first. */
  perExtraBedroom: number;
  /** Added for each bathroom beyond the first. */
  perExtraBathroom: number;
  /** Labour time (minutes) for the base property. */
  baseMinutes: number;
  perExtraBedroomMinutes: number;
  perExtraBathroomMinutes: number;
  /** Which visit frequencies make sense for this service. */
  allowedFrequencies: FrequencyId[];
  /** Selected automatically when the service is chosen (or when the current frequency becomes invalid). */
  defaultFrequency: FrequencyId;
  /** What is included — shown on cards and in the booking review. */
  includes: string[];
  image: string;
  icon: "sparkles" | "spray" | "key" | "truck" | "repeat";
  popular?: boolean;
}

export const SERVICES: ServiceConfig[] = [
  {
    id: "standard",
    name: "Standard Home Cleaning",
    shortName: "Standard Clean",
    tagline: "The everyday refresh",
    description: "A thorough top-to-bottom tidy of kitchens, bathrooms, bedrooms and living spaces.",
    basePrice: 55,
    perExtraBedroom: 12,
    perExtraBathroom: 10,
    baseMinutes: 120,
    perExtraBedroomMinutes: 30,
    perExtraBathroomMinutes: 25,
    allowedFrequencies: ["one-off", "weekly", "fortnightly", "monthly"],
    defaultFrequency: "one-off",
    includes: ["Dusting & surface wipe-down", "Kitchen & bathroom clean", "Vacuum & mop all floors", "Bins emptied"],
    image: "/images/service-standard.jpg",
    icon: "sparkles",
    popular: true,
  },
  {
    id: "deep",
    name: "Deep Cleaning",
    shortName: "Deep Clean",
    tagline: "Every corner, reset",
    description: "An intensive clean for built-up grime — skirting boards, limescale, behind and beneath.",
    basePrice: 110,
    perExtraBedroom: 25,
    perExtraBathroom: 20,
    baseMinutes: 240,
    perExtraBedroomMinutes: 50,
    perExtraBathroomMinutes: 45,
    allowedFrequencies: ["one-off", "monthly"],
    defaultFrequency: "one-off",
    includes: ["Everything in Standard", "Limescale & grout treatment", "Skirting, doors & frames", "Behind movable furniture"],
    image: "/images/service-deep.jpg",
    icon: "spray",
  },
  {
    id: "end-of-tenancy",
    name: "End of Tenancy Cleaning",
    shortName: "End of Tenancy",
    tagline: "Deposit-ready finish",
    description: "A checklist-led clean built around typical letting-agent inventories.",
    basePrice: 160,
    perExtraBedroom: 35,
    perExtraBathroom: 25,
    baseMinutes: 300,
    perExtraBedroomMinutes: 60,
    perExtraBathroomMinutes: 50,
    allowedFrequencies: ["one-off"],
    defaultFrequency: "one-off",
    includes: ["Inventory-led checklist", "Inside all cupboards", "Appliance exteriors", "72-hour re-clean promise"],
    image: "/images/service-tenancy.jpg",
    icon: "key",
  },
  {
    id: "move-in",
    name: "Move-In Cleaning",
    shortName: "Move-In Clean",
    tagline: "Start fresh from day one",
    description: "A sanitising clean of your new home before the boxes arrive.",
    basePrice: 130,
    perExtraBedroom: 28,
    perExtraBathroom: 22,
    baseMinutes: 270,
    perExtraBedroomMinutes: 55,
    perExtraBathroomMinutes: 45,
    allowedFrequencies: ["one-off"],
    defaultFrequency: "one-off",
    includes: ["Full sanitisation", "Inside empty cupboards", "Light fittings & switches", "Floors deep-mopped"],
    image: "/images/service-movein.jpg",
    icon: "truck",
  },
  {
    id: "regular",
    name: "Regular Maintenance Cleaning",
    shortName: "Regular Maintenance",
    tagline: "Your home, always ready",
    description: "The same trusted cleaner on a schedule that suits you — homes that stay effortlessly clean.",
    basePrice: 52,
    perExtraBedroom: 11,
    perExtraBathroom: 9,
    baseMinutes: 110,
    perExtraBedroomMinutes: 25,
    perExtraBathroomMinutes: 20,
    allowedFrequencies: ["weekly", "fortnightly", "monthly"],
    defaultFrequency: "fortnightly",
    includes: ["Same dedicated cleaner", "Rotating focus areas", "Flexible skip & reschedule", "Recurring discount"],
    image: "/images/service-regular.jpg",
    icon: "repeat",
  },
];

/* ───────────────────────────── Property ───────────────────────────── */

export type PropertyTypeId = "apartment" | "house" | "bungalow";

export interface PropertyTypeConfig {
  id: PropertyTypeId;
  label: string;
  description: string;
  /** Multiplier applied to the clean (1 = no change, 1.1 = +10%). */
  multiplier: number;
  /** Highest number of floors that can be selected for this property type. */
  maxFloors: number;
}

export const PROPERTY_TYPES: PropertyTypeConfig[] = [
  { id: "apartment", label: "Apartment", description: "Flat or maisonette", multiplier: 1, maxFloors: 2 },
  { id: "house", label: "House", description: "Terraced, semi or detached", multiplier: 1.1, maxFloors: 3 },
  { id: "bungalow", label: "Bungalow", description: "Single-storey home", multiplier: 1.05, maxFloors: 1 },
];

export interface CountOption {
  /** Stored value. */
  value: number;
  /** Button label. */
  label: string;
}

/** value 0 = studio. The top option represents "5+" and is priced as 5. */
export const BEDROOM_OPTIONS: CountOption[] = [
  { value: 0, label: "Studio" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5+" },
];

export const BATHROOM_OPTIONS: CountOption[] = [
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4+" },
];

export type PropertySizeId = "compact" | "average" | "spacious" | "large" | "very-large";

export interface PropertySizeConfig {
  id: PropertySizeId;
  label: string;
  range: string;
  /** Multiplier applied to the clean and its duration. */
  multiplier: number;
}

export const PROPERTY_SIZES: PropertySizeConfig[] = [
  { id: "compact", label: "Compact", range: "Under 50 m²", multiplier: 0.95 },
  { id: "average", label: "Average", range: "50–90 m²", multiplier: 1 },
  { id: "spacious", label: "Spacious", range: "90–140 m²", multiplier: 1.1 },
  { id: "large", label: "Large", range: "140–200 m²", multiplier: 1.2 },
  { id: "very-large", label: "Very large", range: "200 m²+", multiplier: 1.35 },
];

export interface FloorOption {
  value: number;
  label: string;
  /** Flat surcharge for carrying equipment between levels. */
  surcharge: number;
  extraMinutes: number;
}

export const FLOOR_OPTIONS: FloorOption[] = [
  { value: 1, label: "1 floor", surcharge: 0, extraMinutes: 0 },
  { value: 2, label: "2 floors", surcharge: 8, extraMinutes: 15 },
  { value: 3, label: "3+ floors", surcharge: 15, extraMinutes: 30 },
];

/* ───────────────────────────── Frequency ───────────────────────────── */

export interface FrequencyConfig {
  id: FrequencyId;
  label: string;
  description: string;
  /** Discount applied to the clean (not to extras). 0.15 = 15% off. */
  discount: number;
  /** Used to estimate annual savings. */
  visitsPerYear: number;
}

export const FREQUENCIES: FrequencyConfig[] = [
  { id: "one-off", label: "One-off", description: "A single visit", discount: 0, visitsPerYear: 1 },
  { id: "weekly", label: "Weekly", description: "Every week", discount: 0.2, visitsPerYear: 52 },
  { id: "fortnightly", label: "Fortnightly", description: "Every two weeks", discount: 0.15, visitsPerYear: 26 },
  { id: "monthly", label: "Monthly", description: "Every four weeks", discount: 0.1, visitsPerYear: 13 },
];

/* ───────────────────────────── Extras ───────────────────────────── */

export type ExtraId =
  | "oven"
  | "fridge"
  | "windows"
  | "carpet"
  | "upholstery"
  | "laundry"
  | "cupboards"
  | "beds";

export interface ExtraConfig {
  id: ExtraId;
  name: string;
  description: string;
  price: number;
  minutes: number;
  /** If true, price and time are charged per bedroom (minimum 1). */
  perBedroom?: boolean;
  /** Short unit note shown next to the price. */
  unit?: string;
  icon: "oven" | "fridge" | "window" | "carpet" | "sofa" | "shirt" | "cupboard" | "bed";
}

export const EXTRAS: ExtraConfig[] = [
  { id: "oven", name: "Inside oven", description: "Racks, glass & interior degreased", price: 35, minutes: 60, icon: "oven" },
  { id: "fridge", name: "Inside fridge", description: "Emptied, shelves washed & sanitised", price: 22, minutes: 30, icon: "fridge" },
  { id: "windows", name: "Interior windows", description: "Glass, frames & sills inside", price: 28, minutes: 40, icon: "window" },
  { id: "carpet", name: "Carpet cleaning", description: "Hot-water extraction, up to 2 rooms", price: 55, minutes: 75, icon: "carpet" },
  { id: "upholstery", name: "Upholstery cleaning", description: "Sofa & armchairs refreshed", price: 45, minutes: 50, icon: "sofa" },
  { id: "laundry", name: "Laundry & ironing", description: "One load washed, dried & pressed", price: 25, minutes: 60, icon: "shirt" },
  { id: "cupboards", name: "Inside cupboards", description: "Kitchen cupboards wiped inside", price: 24, minutes: 35, icon: "cupboard" },
  { id: "beds", name: "Bed changing", description: "Fresh linen fitted (yours)", price: 8, minutes: 10, perBedroom: true, unit: "per bed", icon: "bed" },
];

/* ───────────────────────────── Booking rules ───────────────────────────── */

export const BOOKING_RULES = {
  /** Jobs longer than this are split between two cleaners. */
  maxSoloMinutes: 300,
  /** Minimum charge for any single visit (after discounts, before extras). */
  minimumVisitPrice: 50,
  /** How many weeks ahead customers may book. */
  bookingWindowWeeks: 8,
  /** Days of the week with no service (0 = Sunday). */
  closedWeekdays: [0] as number[],
};

/* ───────────────────────────── Time slots ───────────────────────────── */

export type TimeOfDay = "morning" | "afternoon" | "evening";

export interface TimeSlot {
  id: string;
  label: string;
  period: TimeOfDay;
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: "08:00", label: "8:00 am", period: "morning" },
  { id: "09:30", label: "9:30 am", period: "morning" },
  { id: "11:00", label: "11:00 am", period: "morning" },
  { id: "12:30", label: "12:30 pm", period: "afternoon" },
  { id: "14:00", label: "2:00 pm", period: "afternoon" },
  { id: "15:30", label: "3:30 pm", period: "afternoon" },
  { id: "17:00", label: "5:00 pm", period: "evening" },
  { id: "18:30", label: "6:30 pm", period: "evening" },
];
