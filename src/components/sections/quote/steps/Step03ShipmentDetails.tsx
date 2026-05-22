"use client";

import { TextField } from "@/components/sections/quote/fields/TextField";
import { SelectField } from "@/components/sections/quote/fields/SelectField";
import {
  QUOTE_HELICOPTER_BRANDS,
  QUOTE_HELICOPTER_MODELS_BY_BRAND,
  QUOTE_QUANTITIES,
} from "@/lib/constants";
import type { QuoteFormErrors, QuoteFormState } from "@/types/quoteForm";

export type Step03Props = {
  state: Pick<
    QuoteFormState,
    "shippingPeriod" | "helicopterBrand" | "helicopterModel" | "helicopterQuantity"
  >;
  onChange: (patch: Partial<QuoteFormState>) => void;
  errors: QuoteFormErrors;
  /** Embedded variant stacks all 4 fields vertically (half-width column). */
  stackFields?: boolean;
};

export function Step03ShipmentDetails({ state, onChange, errors, stackFields }: Step03Props) {
  const models = state.helicopterBrand
    ? (QUOTE_HELICOPTER_MODELS_BY_BRAND[state.helicopterBrand] ?? [])
    : [];

  return (
    <fieldset className="border-0 p-0">
      <legend className="sr-only">Shipment details</legend>
      <div
        className={
          stackFields
            ? "flex flex-col gap-[20px]"
            : "flex flex-col gap-[20px] lg:grid lg:grid-cols-2 lg:gap-[20px]"
        }
      >
        <TextField
          label="Helicopter Shipping Period"
          required
          placeholder="e.g. Q3 2026"
          value={state.shippingPeriod}
          onChange={(e) => onChange({ shippingPeriod: e.currentTarget.value })}
          maxLength={80}
          error={errors.shippingPeriod}
        />

        <div>
          <span className="font-body text-text-muted-2 mb-[6px] block text-[10px] tracking-[0.04em] uppercase lg:mb-[8px] lg:text-[12px]">
            Helicopter Model &amp; Quantity
          </span>
          <div
            className={
              stackFields
                ? "flex flex-col gap-[12px]"
                : "flex flex-col gap-[12px] lg:flex-row lg:gap-[7px]"
            }
          >
            <SelectField
              compact
              placeholder="Brand"
              options={QUOTE_HELICOPTER_BRANDS}
              value={state.helicopterBrand}
              onChange={(brand) => onChange({ helicopterBrand: brand, helicopterModel: null })}
              className={stackFields ? "" : "lg:w-[180px]"}
              ariaLabel="Helicopter brand"
              error={errors.helicopterBrand}
            />
            <SelectField
              compact
              placeholder="Select e.g. Airbus H125"
              options={models}
              value={state.helicopterModel}
              onChange={(model) => onChange({ helicopterModel: model })}
              disabled={!state.helicopterBrand}
              className={stackFields ? "" : "lg:flex-1"}
              ariaLabel="Helicopter model"
              error={errors.helicopterModel}
            />
            <SelectField
              compact
              placeholder="Qty"
              options={QUOTE_QUANTITIES}
              value={state.helicopterQuantity}
              onChange={(qty) => onChange({ helicopterQuantity: qty })}
              className={stackFields ? "" : "lg:w-[100px]"}
              ariaLabel="Quantity"
              error={errors.helicopterQuantity}
            />
          </div>
        </div>
      </div>
    </fieldset>
  );
}
