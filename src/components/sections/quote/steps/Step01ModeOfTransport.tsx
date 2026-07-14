"use client";

import { ModeRadioGrid } from "@/components/sections/quote/fields/ModeRadioGrid";
import { ModeMobilePill } from "@/components/sections/quote/fields/ModeMobilePill";
import type { TransportMode } from "@/types/quoteForm";

export type Step01Props = {
  values: TransportMode[];
  onChange: (modes: TransportMode[]) => void;
  /** Embedded variant uses a two-row grid; standalone uses single row. */
  desktopLayout?: "single-row" | "two-rows";
  variant?: "standalone" | "shell";
  error?: string;
};

export function Step01ModeOfTransport({
  values,
  onChange,
  desktopLayout,
  variant = "standalone",
  error,
}: Step01Props) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="sr-only">Mode of transport</legend>
      <div className="lg:hidden">
        <ModeMobilePill
          values={values}
          onChange={onChange}
          variant={variant}
          invalid={Boolean(error)}
        />
      </div>
      <div className="hidden lg:block">
        <ModeRadioGrid
          values={values}
          onChange={onChange}
          layout={desktopLayout}
          variant={variant}
          invalid={Boolean(error)}
        />
      </div>
      {error ? (
        <span
          id="step-01-mode-error"
          role="alert"
          className="text-brand-red font-body mt-[6px] block text-[12px]"
        >
          {error}
        </span>
      ) : null}
    </fieldset>
  );
}
