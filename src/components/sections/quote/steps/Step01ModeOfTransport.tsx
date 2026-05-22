"use client";

import { ModeRadioGrid } from "@/components/sections/quote/fields/ModeRadioGrid";
import { ModeMobilePill } from "@/components/sections/quote/fields/ModeMobilePill";
import type { TransportMode } from "@/types/quoteForm";

export type Step01Props = {
  value: TransportMode;
  onChange: (mode: TransportMode) => void;
  /** Embedded variant uses a two-row grid; standalone uses single row. */
  desktopLayout?: "single-row" | "two-rows";
  variant?: "standalone" | "shell";
};

export function Step01ModeOfTransport({
  value,
  onChange,
  desktopLayout,
  variant = "standalone",
}: Step01Props) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="sr-only">Mode of transport</legend>
      <div className="lg:hidden">
        <ModeMobilePill value={value} onChange={onChange} variant={variant} />
      </div>
      <div className="hidden lg:block">
        <ModeRadioGrid value={value} onChange={onChange} layout={desktopLayout} variant={variant} />
      </div>
    </fieldset>
  );
}
