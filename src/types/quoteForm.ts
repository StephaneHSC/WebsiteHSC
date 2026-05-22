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

export type TransactionType = "Purchase" | "Sale" | "Lease" | "Trade-in" | "Other";

export interface QuoteFormRoute {
  origin: string;
  destination: string;
}

export interface QuoteFormState {
  mode: TransportMode;
  routes: QuoteFormRoute[];
  shippingPeriod: string;
  helicopterBrand: string | null;
  helicopterModel: string | null;
  helicopterQuantity: string;
  transactionType: TransactionType | null;
  additionalInformation: string;
  companyName: string;
  companyWebsite: string;
  fullName: string;
  email: string;
  attachments: File[];
  turnstileToken: string | null;
}

export type QuoteFieldKey =
  | "mode"
  | "shippingPeriod"
  | "helicopterBrand"
  | "helicopterModel"
  | "helicopterQuantity"
  | "transactionType"
  | "additionalInformation"
  | "companyName"
  | "companyWebsite"
  | "fullName"
  | "email"
  | "attachments"
  | `routes.${number}.origin`
  | `routes.${number}.destination`;

export type QuoteFormErrors = Partial<Record<QuoteFieldKey, string>>;

export type QuoteFormSubmitResult =
  | { ok: true; message: string }
  | { ok: false; error: string; field?: QuoteFieldKey };

/** URL/CustomEvent prefill payload — every field optional. */
export type QuoteFormPrefill = Partial<
  Pick<QuoteFormState, "mode" | "routes" | "companyName" | "email">
>;

export type { QuoteFormConfig } from "@/types/sanity";
