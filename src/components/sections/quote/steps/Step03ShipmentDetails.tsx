"use client";

import { TextField } from "@/components/sections/quote/fields/TextField";
import { SelectField } from "@/components/sections/quote/fields/SelectField";
import { MultiSelectField } from "@/components/sections/quote/fields/MultiSelectField";
import {
  QUOTE_HELICOPTER_BRANDS,
  QUOTE_HELICOPTER_MODELS_BY_BRAND,
  QUOTE_QUANTITIES,
  QUOTE_TRANSACTION_TYPES,
} from "@/lib/constants";
import type { QuoteFormErrors, QuoteFormState, TransactionType } from "@/types/quoteForm";

export type Step03Props = {
  state: Pick<
    QuoteFormState,
    | "shippingPeriod"
    | "helicopterBrands"
    | "helicopterModels"
    | "helicopterQuantity"
    | "transactionType"
  >;
  onChange: (patch: Partial<QuoteFormState>) => void;
  errors: QuoteFormErrors;
  /** Embedded variant stacks all fields vertically (half-width column). */
  stackFields?: boolean;
  /**
   * Shell variant: keep the outer 2-col grid but stack Brand/Model/Quantity
   * vertically inside the right column.
   */
  compactRow?: boolean;
};

export function Step03ShipmentDetails({
  state,
  onChange,
  errors,
  stackFields,
  compactRow,
}: Step03Props) {
  const models = state.helicopterBrands.flatMap(
    (brand) => QUOTE_HELICOPTER_MODELS_BY_BRAND[brand] ?? [],
  );

  // When brands change, drop any selected models that no longer belong to a
  // selected brand.
  const handleBrandsChange = (helicopterBrands: string[]) => {
    const valid = helicopterBrands.flatMap(
      (brand) => QUOTE_HELICOPTER_MODELS_BY_BRAND[brand] ?? [],
    );
    onChange({
      helicopterBrands,
      helicopterModels: state.helicopterModels.filter((m) => valid.includes(m)),
    });
  };

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
        {/* Left column: Shipping Period + Transaction Type */}
        <div className="flex flex-col gap-[20px]">
          <TextField
            label="Helicopter Shipping Period"
            required
            placeholder="e.g. Q3 2026"
            value={state.shippingPeriod}
            onChange={(e) => onChange({ shippingPeriod: e.currentTarget.value })}
            maxLength={80}
            error={errors.shippingPeriod}
          />
          <SelectField
            label="Transaction Type"
            options={QUOTE_TRANSACTION_TYPES}
            value={state.transactionType}
            onChange={(value) => onChange({ transactionType: value as TransactionType })}
            placeholder="Select level"
            error={errors.transactionType}
          />
        </div>

        {/* Right column: Helicopter Model & Quantity */}
        <div>
          <span className="font-body text-text-muted-2 mb-[6px] block text-[10px] tracking-[0.04em] uppercase lg:mb-[8px] lg:text-[12px]">
            Helicopter Model &amp; Quantity
          </span>
          <div
            className={
              stackFields || compactRow
                ? "flex flex-col gap-[12px]"
                : "flex flex-col gap-[12px] lg:flex-row lg:gap-[7px]"
            }
          >
            <MultiSelectField
              placeholder="Brand"
              options={QUOTE_HELICOPTER_BRANDS}
              values={state.helicopterBrands}
              onChange={handleBrandsChange}
              className={stackFields || compactRow ? "" : "lg:w-[180px]"}
              ariaLabel="Helicopter brand"
              error={errors.helicopterBrands}
            />
            {compactRow ? (
              <div className="flex gap-[7px]">
                <MultiSelectField
                  placeholder="Select e.g. Airbus H125"
                  options={models}
                  values={state.helicopterModels}
                  onChange={(helicopterModels) => onChange({ helicopterModels })}
                  disabled={state.helicopterBrands.length === 0}
                  className="min-w-0 flex-1"
                  ariaLabel="Helicopter model"
                  error={errors.helicopterModels}
                />
                <SelectField
                  compact
                  placeholder="Qty"
                  options={QUOTE_QUANTITIES}
                  value={state.helicopterQuantity}
                  onChange={(qty) => onChange({ helicopterQuantity: qty })}
                  className="w-[80px] shrink-0"
                  ariaLabel="Quantity"
                  error={errors.helicopterQuantity}
                />
              </div>
            ) : (
              <>
                <MultiSelectField
                  placeholder="Select e.g. Airbus H125"
                  options={models}
                  values={state.helicopterModels}
                  onChange={(helicopterModels) => onChange({ helicopterModels })}
                  disabled={state.helicopterBrands.length === 0}
                  className={stackFields ? "" : "lg:flex-1"}
                  ariaLabel="Helicopter model"
                  error={errors.helicopterModels}
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
              </>
            )}
          </div>
        </div>
      </div>
    </fieldset>
  );
}
