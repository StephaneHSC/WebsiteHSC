"use client";

import { TextField } from "@/components/sections/quote/fields/TextField";
import { AddSquare, CloseX } from "@/components/icons/quote";
import type { QuoteFormErrors, QuoteFormRoute } from "@/types/quoteForm";

export type Step02Props = {
  routes: QuoteFormRoute[];
  onChangeRoute: (index: number, route: QuoteFormRoute) => void;
  onAddRoute: () => void;
  onRemoveRoute: (index: number) => void;
  errors: QuoteFormErrors;
  /** Embedded variant stacks origin+destination instead of side-by-side. */
  stackFields?: boolean;
  /**
   * Shell variant hides the "Add Another Route" multi-route affordance (Figma
   * `344:3275` shows a single origin+destination row, no multi-route UI).
   */
  hideMultiRoute?: boolean;
};

const MAX_ROUTES = 5;

export function Step02RouteInformation({
  routes,
  onChangeRoute,
  onAddRoute,
  onRemoveRoute,
  errors,
  stackFields,
  hideMultiRoute,
}: Step02Props) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="sr-only">Route information</legend>
      <div className="flex flex-col gap-[20px]">
        {routes.map((route, index) => {
          const originErrorKey = `routes.${index}.origin` as const;
          const destErrorKey = `routes.${index}.destination` as const;
          return (
            <div key={index}>
              {index > 0 ? (
                <div className="mb-[8px] flex items-center justify-between">
                  <span className="font-body text-text-muted-2 text-[10px] tracking-[0.04em] uppercase lg:text-[12px]">
                    Route {index + 1}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove route ${index + 1}`}
                    onClick={() => onRemoveRoute(index)}
                    className="text-text-muted-2 hover:text-brand-red flex size-[20px] items-center justify-center rounded-full"
                  >
                    <CloseX className="size-[14px]" />
                  </button>
                </div>
              ) : null}
              <div
                className={
                  stackFields
                    ? "flex flex-col gap-[16px]"
                    : "flex flex-col gap-[16px] lg:grid lg:grid-cols-2 lg:gap-[20px]"
                }
              >
                <TextField
                  label="Origin — Country / City / ZIP"
                  required
                  placeholder="e.g. United States / Houston / 77001"
                  value={route.origin}
                  onChange={(e) =>
                    onChangeRoute(index, { ...route, origin: e.currentTarget.value })
                  }
                  error={errors[originErrorKey]}
                />
                <TextField
                  label="Destination — Country / City / ZIP"
                  required
                  placeholder="e.g. UAE / Dubai / 00000"
                  value={route.destination}
                  onChange={(e) =>
                    onChangeRoute(index, { ...route, destination: e.currentTarget.value })
                  }
                  error={errors[destErrorKey]}
                />
              </div>
            </div>
          );
        })}
      </div>

      {!hideMultiRoute && routes.length < MAX_ROUTES ? (
        <div className="mt-[20px]">
          <p className="font-body text-text-muted-2 mb-[10px] text-[10px] tracking-[0.04em] uppercase lg:text-[12px]">
            Multiple routes supported — add as many as needed
          </p>
          <button
            type="button"
            onClick={onAddRoute}
            className={
              stackFields
                ? "border-brand-red text-brand-red font-display hover:bg-brand-red/5 flex h-[50px] w-full items-center justify-center gap-[10px] border-2 border-dashed bg-white text-[13px] font-semibold tracking-[0.04em] uppercase transition-colors lg:h-[60px]"
                : "border-brand-red text-brand-red font-display hover:bg-brand-red/5 flex h-[50px] w-full items-center justify-center gap-[10px] border-2 border-dashed bg-white text-[13px] font-semibold tracking-[0.04em] uppercase transition-colors lg:h-[60px] lg:w-[510px]"
            }
          >
            <AddSquare className="size-[20px]" />
            Add Another Route
          </button>
        </div>
      ) : null}
    </fieldset>
  );
}
