import type { CustomerDetails } from "./booking-store";

export type FieldErrors = Partial<Record<keyof CustomerDetails, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UK_POSTCODE = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/i;

export const INSTRUCTIONS_MAX = 500;

export function normalisePostcode(value: string): string {
  const m = value.trim().match(UK_POSTCODE);
  return m ? `${m[1]} ${m[2]}`.toUpperCase() : value.trim().toUpperCase();
}

export function validateField(field: keyof CustomerDetails, raw: string): string | undefined {
  const value = raw.trim();
  switch (field) {
    case "fullName":
      if (!value) return "Please enter your full name.";
      if (value.length < 2 || !/[a-z]/i.test(value)) return "Please enter a valid name.";
      if (value.length > 80) return "Please keep your name under 80 characters.";
      return;
    case "email":
      if (!value) return "Please enter your email address.";
      if (!EMAIL.test(value)) return "Please enter a valid email, e.g. name@example.com.";
      return;
    case "phone": {
      if (!value) return "Please enter a phone number.";
      const digits = value.replace(/[\s\-().]/g, "");
      if (!/^(?:\+44|0)\d{9,10}$/.test(digits)) return "Please enter a valid UK number, e.g. 07700 900123.";
      return;
    }
    case "postcode":
      if (!value) return "Please enter the property postcode.";
      if (!UK_POSTCODE.test(value)) return "Please enter a valid UK postcode, e.g. EC1V 2NX.";
      return;
    case "address":
      if (!value) return "Please enter the property address.";
      if (value.length < 5) return "Please enter the full first line of the address.";
      return;
    case "instructions":
      if (value.length > INSTRUCTIONS_MAX) return `Please keep instructions under ${INSTRUCTIONS_MAX} characters.`;
      return;
  }
}

export function validateCustomer(c: CustomerDetails): FieldErrors {
  const errors: FieldErrors = {};
  (Object.keys(c) as (keyof CustomerDetails)[]).forEach((k) => {
    const e = validateField(k, c[k]);
    if (e) errors[k] = e;
  });
  return errors;
}

export function generateReference(date = new Date()): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  const stamp = `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}`;
  return `MRW-${stamp}-${code}`;
}
