"use client";

import { Reveal } from "@/components/sections/_shared/Reveal";
import { TickCircle } from "@/components/icons/quote";

export type QuoteFormSuccessProps = {
  message: string;
  onReset: () => void;
};

export function QuoteFormSuccess({ message, onReset }: QuoteFormSuccessProps) {
  return (
    <div className="flex flex-col items-center px-[24px] py-[48px] text-center lg:py-[80px]">
      <Reveal delay={0}>
        <TickCircle className="mb-[24px] size-[64px]" />
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display text-ink mb-[16px] text-[24px] leading-[1.2] font-bold lg:text-[32px]">
          Request received
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="font-body text-ink-soft mb-[28px] max-w-[480px] text-[14px] leading-[22px] lg:text-[16px] lg:leading-[26px]">
          {message}
        </p>
      </Reveal>
      <Reveal delay={0.3}>
        <button
          type="button"
          onClick={onReset}
          className="font-body border-ink text-ink hover:bg-ink hover:text-surface inline-flex items-center justify-center rounded-full border px-[30px] py-[14px] text-[13px] font-bold tracking-[0.06em] uppercase transition-colors lg:px-[34px] lg:py-[16px] lg:text-[14px]"
        >
          Submit another request
        </button>
      </Reveal>
    </div>
  );
}
