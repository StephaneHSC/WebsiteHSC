/**
 * M8 — Quote form validation + submission helpers.
 *
 * Two callers:
 *  - `QuoteFormCore` (Client Component) calls `validateAll` and `submitQuoteForm`.
 *  - `/api/quote` (Route Handler) calls `validateServerSide` on the parsed
 *    FormData as a defense-in-depth check before invoking Resend.
 *
 * No Zod / no external deps — rules are simple enough that a hand-rolled
 * validator keeps the bundle and review surface minimal.
 */

import {
  QUOTE_HELICOPTER_MODELS_BY_BRAND,
  QUOTE_QUANTITIES,
  QUOTE_TRANSACTION_TYPES,
  QUOTE_TRANSPORT_MODES,
  QUOTE_FORM_DEFAULTS,
} from "@/lib/constants";
import type {
  QuoteFieldKey,
  QuoteFormConfig,
  QuoteFormErrors,
  QuoteFormState,
  QuoteFormSubmitResult,
  TransactionType,
  TransportMode,
} from "@/types/quoteForm";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/.*)?$/i;

export function initialQuoteFormState(prefill?: Partial<QuoteFormState>): QuoteFormState {
  return {
    modes: prefill?.modes && prefill.modes.length > 0 ? prefill.modes : ["Air Commercial"],
    routes:
      prefill?.routes && prefill.routes.length > 0
        ? prefill.routes.map((r) => ({ origin: r.origin ?? "", destination: r.destination ?? "" }))
        : [{ origin: "", destination: "" }],
    shippingPeriod: "",
    helicopterBrand: null,
    helicopterModels: [],
    helicopterQuantity: "01",
    transactionType: null,
    additionalInformation: "",
    companyName: prefill?.companyName ?? "",
    companyWebsite: "",
    fullName: "",
    email: prefill?.email ?? "",
    turnstileToken: null,
  };
}

export function validateAll(state: QuoteFormState): QuoteFormErrors {
  const errors: QuoteFormErrors = {};

  if (state.modes.length === 0 || state.modes.some((m) => !QUOTE_TRANSPORT_MODES.includes(m))) {
    errors.modes = "Please pick at least one mode of transport.";
  }

  state.routes.forEach((route, i) => {
    const o = route.origin.trim();
    const d = route.destination.trim();
    if (o.length < 2) errors[`routes.${i}.origin` as QuoteFieldKey] = "Please enter your origin.";
    else if (o.length > 200)
      errors[`routes.${i}.origin` as QuoteFieldKey] = "Origin is too long (max 200 chars).";
    if (d.length < 2)
      errors[`routes.${i}.destination` as QuoteFieldKey] = "Please enter your destination.";
    else if (d.length > 200)
      errors[`routes.${i}.destination` as QuoteFieldKey] =
        "Destination is too long (max 200 chars).";
  });

  const period = state.shippingPeriod.trim();
  if (period.length === 0) errors.shippingPeriod = "Please enter a shipping period.";
  else if (period.length > 80)
    errors.shippingPeriod = "Shipping period is too long (max 80 chars).";

  // Helicopter brand + model + quantity are OPTIONAL — customers often request
  // quotes before they've finalized the aircraft choice. If a brand IS picked,
  // we still validate that the model belongs to it.
  if (state.helicopterBrand && !QUOTE_HELICOPTER_MODELS_BY_BRAND[state.helicopterBrand]) {
    errors.helicopterBrand = "Please pick a brand from the list.";
  }
  if (state.helicopterBrand && state.helicopterModels.length > 0) {
    const validModels = QUOTE_HELICOPTER_MODELS_BY_BRAND[state.helicopterBrand] ?? [];
    if (state.helicopterModels.some((m) => !validModels.includes(m))) {
      errors.helicopterModels = "One or more models aren't available for the selected brand.";
    }
  }
  if (
    state.helicopterQuantity &&
    !QUOTE_QUANTITIES.includes(state.helicopterQuantity as (typeof QUOTE_QUANTITIES)[number])
  ) {
    errors.helicopterQuantity = "Please pick a quantity.";
  }

  if (state.transactionType && !QUOTE_TRANSACTION_TYPES.includes(state.transactionType)) {
    errors.transactionType = "Please pick a transaction type from the list.";
  }

  const info = state.additionalInformation.trim();
  if (info.length > 2000)
    errors.additionalInformation = "Please shorten your note (max 2000 chars).";

  if (state.companyName.trim().length === 0) errors.companyName = "Please enter your company name.";
  else if (state.companyName.length > 200)
    errors.companyName = "Company name is too long (max 200 chars).";

  const website = state.companyWebsite.trim();
  if (website.length === 0) errors.companyWebsite = "Please enter your company website.";
  else if (!URL_RE.test(website)) errors.companyWebsite = "Please enter a valid website.";

  const name = state.fullName.trim();
  if (name.length === 0) errors.fullName = "Please enter your full name.";
  else if (name.length < 2) errors.fullName = "Name must be at least 2 characters.";
  else if (name.length > 200) errors.fullName = "Name is too long (max 200 chars).";

  const email = state.email.trim();
  if (email.length === 0) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email)) errors.email = "Please enter a valid email address.";

  return errors;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export interface TurnstileRenderOptions {
  sitekey: string;
  size?: "normal" | "compact" | "flexible" | "invisible";
  action?: string;
  callback?: (token: string) => void;
  "error-callback"?: (errorCode?: string) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  appearance?: "always" | "execute" | "interaction-only";
  retry?: "auto" | "never";
}

export interface TurnstileApi {
  render: (container: HTMLElement | string, options: TurnstileRenderOptions) => string;
  execute: (container: string | HTMLElement) => void;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
  ready: (cb: () => void) => void;
  getResponse: (widgetId?: string) => string | undefined;
}

export async function submitQuoteForm(
  state: QuoteFormState,
  config: QuoteFormConfig | null,
  turnstileToken: string,
): Promise<QuoteFormSubmitResult> {
  const errors = validateAll(state);
  const firstField = Object.keys(errors)[0] as QuoteFieldKey | undefined;
  if (firstField) {
    return { ok: false, error: "Please fix the highlighted fields.", field: firstField };
  }

  if (!turnstileToken) {
    return {
      ok: false,
      error: "Browser verification didn't load. Please refresh the page and submit again.",
    };
  }

  const fd = new FormData();
  fd.append("modes", JSON.stringify(state.modes));
  fd.append("routes", JSON.stringify(state.routes));
  fd.append("shipping_period", state.shippingPeriod);
  fd.append("helicopter_brand", state.helicopterBrand ?? "");
  fd.append("helicopter_models", JSON.stringify(state.helicopterModels));
  fd.append("helicopter_quantity", state.helicopterQuantity);
  fd.append("transaction_type", state.transactionType ?? "");
  fd.append("additional_information", state.additionalInformation);
  fd.append("company_name", state.companyName);
  fd.append("company_website", state.companyWebsite);
  fd.append("full_name", state.fullName);
  fd.append("email", state.email);
  fd.append("cf-turnstile-response", turnstileToken);

  try {
    const res = await fetch("/api/quote", {
      method: "POST",
      body: fd,
      headers: { Accept: "application/json" },
    });
    const body = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      field?: QuoteFieldKey;
    };
    if (!res.ok || !body.ok) {
      return {
        ok: false,
        error: body.error ?? `Submission failed (HTTP ${res.status}).`,
        field: body.field,
      };
    }
    return { ok: true, message: config?.success_message ?? QUOTE_FORM_DEFAULTS.successMessage };
  } catch {
    return { ok: false, error: "Network error. Please check your connection and try again." };
  }
}

// ── Server-side validation (defense in depth) ─────────────────────────────

export type ServerValidationError = { message: string; field?: QuoteFieldKey };

function isStringValue(value: FormDataEntryValue | null): value is string {
  return typeof value === "string";
}

/**
 * Re-runs every rule from `validateAll` against parsed multipart FormData.
 * Returns the first error encountered (or null when clean). Also guards
 * against header-injection in fields used as email metadata.
 */
export function validateServerSide(fd: FormData): ServerValidationError | null {
  const get = (k: string) => {
    const v = fd.get(k);
    return isStringValue(v) ? v : "";
  };

  let modes: TransportMode[] = [];
  try {
    const raw = get("modes");
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error();
    modes = parsed;
  } catch {
    return { message: "Please pick at least one mode of transport.", field: "modes" };
  }
  if (modes.some((m) => !QUOTE_TRANSPORT_MODES.includes(m as TransportMode))) {
    return { message: "Invalid mode of transport.", field: "modes" };
  }

  let routes: { origin: string; destination: string }[] = [];
  try {
    const raw = get("routes");
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return { message: "Invalid routes payload." };
    routes = parsed.map((r) => ({
      origin: String(r?.origin ?? "").trim(),
      destination: String(r?.destination ?? "").trim(),
    }));
  } catch {
    return { message: "Invalid routes payload." };
  }
  if (routes.length === 0 || routes.length > 5)
    return { message: "Please provide between 1 and 5 routes." };
  for (let i = 0; i < routes.length; i += 1) {
    const r = routes[i]!;
    if (r.origin.length < 2 || r.origin.length > 200) {
      return {
        message: "Please enter a valid origin.",
        field: `routes.${i}.origin` as QuoteFieldKey,
      };
    }
    if (r.destination.length < 2 || r.destination.length > 200) {
      return {
        message: "Please enter a valid destination.",
        field: `routes.${i}.destination` as QuoteFieldKey,
      };
    }
  }

  const period = get("shipping_period").trim();
  if (period.length === 0 || period.length > 80)
    return { message: "Please enter a shipping period.", field: "shippingPeriod" };

  // Helicopter brand + model + quantity are optional. Validate consistency
  // only when values are present.
  const brand = get("helicopter_brand");
  if (brand && !QUOTE_HELICOPTER_MODELS_BY_BRAND[brand]) {
    return { message: "Please select a brand from the list.", field: "helicopterBrand" };
  }
  let helicopterModels: string[] = [];
  try {
    const raw = get("helicopter_models");
    if (raw) helicopterModels = JSON.parse(raw);
  } catch {
    return { message: "Invalid helicopter models payload.", field: "helicopterModels" };
  }
  if (brand && helicopterModels.length > 0) {
    const validModels = QUOTE_HELICOPTER_MODELS_BY_BRAND[brand] ?? [];
    if (helicopterModels.some((m) => !validModels.includes(m))) {
      return { message: "Please select models from the list.", field: "helicopterModels" };
    }
  }
  const quantity = get("helicopter_quantity");
  if (quantity && !QUOTE_QUANTITIES.includes(quantity as (typeof QUOTE_QUANTITIES)[number])) {
    return { message: "Please pick a quantity.", field: "helicopterQuantity" };
  }

  const transactionType = get("transaction_type");
  if (transactionType && !QUOTE_TRANSACTION_TYPES.includes(transactionType as TransactionType))
    return { message: "Invalid transaction type.", field: "transactionType" };

  const info = get("additional_information").trim();
  if (info.length > 2000)
    return {
      message: "Please shorten your note (max 2000 chars).",
      field: "additionalInformation",
    };

  const companyName = get("company_name").trim();
  if (companyName.length === 0 || companyName.length > 200)
    return { message: "Please enter your company name.", field: "companyName" };

  const website = get("company_website").trim();
  if (website.length === 0 || !URL_RE.test(website))
    return { message: "Please enter a valid website.", field: "companyWebsite" };

  const fullName = get("full_name").trim();
  if (fullName.length < 2 || fullName.length > 200)
    return { message: "Please enter your full name.", field: "fullName" };

  const email = get("email").trim();
  if (!EMAIL_RE.test(email))
    return { message: "Please enter a valid email address.", field: "email" };

  // Header-injection guard — CR/LF anywhere in fields that get echoed into
  // the email subject or reply-to address.
  for (const key of ["company_name", "email", "full_name"]) {
    if (/[\r\n]/.test(get(key))) return { message: "Invalid characters detected.", field: "email" };
  }

  return null;
}
