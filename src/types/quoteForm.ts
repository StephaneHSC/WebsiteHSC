/**
 * M8 — Request a Quote form types.
 *
 * Why a dedicated file rather than extending sanity.ts:
 * the form has client-state types (errors, route handler results, prefill
 * payload) that aren't Sanity-shaped. The CMS-shaped `QuoteFormConfig`
 * stays in sanity.ts (single source of truth for GROQ return shapes) and
 * is re-exported below so component imports only touch one path.
 */

export type TransportMode =
  | "Air Commercial"
  | "Air Charter"
  | "Ocean RoRo"
  | "Ocean Breakbulk (Lo/Lo)"
  | "Ocean Container"
  | "Land";

export type TransactionType = "Civilian" | "Military";

export interface QuoteFormRoute {
  origin: string;
  destination: string;
}

export interface QuoteFormState {
  modes: TransportMode[];
  routes: QuoteFormRoute[];
  shippingPeriod: string;
  helicopterBrands: string[];
  helicopterModels: string[];
  helicopterQuantity: string;
  transactionType: TransactionType | null;
  additionalInformation: string;
  companyName: string;
  companyWebsite: string;
  fullName: string;
  email: string;
  turnstileToken: string | null;
}

export type QuoteFieldKey =
  | "modes"
  | "shippingPeriod"
  | "helicopterBrands"
  | "helicopterModels"
  | "helicopterQuantity"
  | "transactionType"
  | "additionalInformation"
  | "companyName"
  | "companyWebsite"
  | "fullName"
  | "email"
  | `routes.${number}.origin`
  | `routes.${number}.destination`;

export type QuoteFormErrors = Partial<Record<QuoteFieldKey, string>>;

export type QuoteFormSubmitResult =
  | { ok: true; message: string }
  | { ok: false; error: string; field?: QuoteFieldKey };

/** URL/CustomEvent prefill payload — every field optional. */
export type QuoteFormPrefill = Partial<
  Pick<QuoteFormState, "modes" | "routes" | "companyName" | "email">
>;

export type { QuoteFormConfig } from "@/types/sanity";
