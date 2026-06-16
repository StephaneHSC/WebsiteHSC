"use client";

import { TextareaField } from "@/components/sections/quote/fields/TextareaField";
import type { QuoteFormErrors, QuoteFormState } from "@/types/quoteForm";

export type Step04Props = {
  state: Pick<QuoteFormState, "additionalInformation">;
  onChange: (patch: Partial<QuoteFormState>) => void;
  errors: QuoteFormErrors;
  stackFields?: boolean;
  /** Shell variant per Figma `344:3275`: smaller note textbox (2 rows). */
  variant?: "standalone" | "shell";
};

export function Step04TransactionDetails({
  state,
  onChange,
  errors,
  variant = "standalone",
}: Step04Props) {
  const isShell = variant === "shell";
  return (
    <fieldset className="flex flex-col gap-[28px] border-0 p-0">
      <legend className="sr-only">Additional information</legend>
      <TextareaField
        label="Additional Information"
        rows={isShell ? 2 : 3}
        maxLength={2000}
        showCounter={!isShell}
        placeholder="Instructions, cargo dimensions, certifications, or any relevant notes…"
        value={state.additionalInformation}
        onChange={(e) => onChange({ additionalInformation: e.currentTarget.value })}
        error={errors.additionalInformation}
      />
    </fieldset>
  );
}
