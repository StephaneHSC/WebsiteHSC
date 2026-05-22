"use client";

import { SelectField } from "@/components/sections/quote/fields/SelectField";
import { TextareaField } from "@/components/sections/quote/fields/TextareaField";
import { QUOTE_TRANSACTION_TYPES } from "@/lib/constants";
import type { QuoteFormErrors, QuoteFormState, TransactionType } from "@/types/quoteForm";

export type Step04Props = {
  state: Pick<QuoteFormState, "transactionType" | "additionalInformation">;
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
  stackFields,
  variant = "standalone",
}: Step04Props) {
  const isShell = variant === "shell";
  return (
    <fieldset className="flex flex-col gap-[28px] border-0 p-0">
      <legend className="sr-only">Transaction details</legend>
      <div
        className={
          stackFields
            ? "flex flex-col gap-[20px]"
            : "flex flex-col gap-[20px] lg:grid lg:grid-cols-2 lg:gap-[20px]"
        }
      >
        <SelectField
          label="Transaction Type"
          options={QUOTE_TRANSACTION_TYPES}
          value={state.transactionType}
          onChange={(value) => onChange({ transactionType: value as TransactionType })}
          placeholder="Select level"
          error={errors.transactionType}
        />
        <TextareaField
          label="Additional Information"
          required
          rows={isShell ? 2 : 1}
          maxLength={2000}
          showCounter={!isShell}
          placeholder="Instructions, cargo dimensions, certifications, or any relevant notes…"
          value={state.additionalInformation}
          onChange={(e) => onChange({ additionalInformation: e.currentTarget.value })}
          error={errors.additionalInformation}
        />
      </div>
    </fieldset>
  );
}
