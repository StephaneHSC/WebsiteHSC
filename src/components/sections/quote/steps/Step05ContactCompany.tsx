"use client";

import { TextField } from "@/components/sections/quote/fields/TextField";
import type { QuoteFormErrors, QuoteFormState } from "@/types/quoteForm";

export type Step05Props = {
  state: Pick<QuoteFormState, "companyName" | "companyWebsite" | "fullName" | "email">;
  onChange: (patch: Partial<QuoteFormState>) => void;
  errors: QuoteFormErrors;
  stackFields?: boolean;
};

export function Step05ContactCompany({ state, onChange, errors, stackFields }: Step05Props) {
  const cols = stackFields
    ? "flex flex-col gap-[20px]"
    : "flex flex-col gap-[20px] lg:grid lg:grid-cols-2 lg:gap-[20px]";
  return (
    <fieldset className="flex flex-col gap-[20px] border-0 p-0">
      <legend className="sr-only">Contact &amp; company</legend>
      <div className={cols}>
        <TextField
          label="Company Name"
          required
          placeholder="Your company name"
          value={state.companyName}
          onChange={(e) => onChange({ companyName: e.currentTarget.value })}
          error={errors.companyName}
          maxLength={200}
        />
        <TextField
          label="Company Website"
          required
          placeholder="yourcompany.com"
          inputMode="url"
          value={state.companyWebsite}
          onChange={(e) => onChange({ companyWebsite: e.currentTarget.value })}
          error={errors.companyWebsite}
        />
      </div>
      <div className={cols}>
        <TextField
          label="Your Full Name"
          required
          placeholder="Smith"
          autoComplete="name"
          value={state.fullName}
          onChange={(e) => onChange({ fullName: e.currentTarget.value })}
          error={errors.fullName}
          maxLength={200}
        />
        <TextField
          label="Email Address"
          required
          placeholder="john.smith@company.com"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={state.email}
          onChange={(e) => onChange({ email: e.currentTarget.value })}
          error={errors.email}
        />
      </div>
    </fieldset>
  );
}
