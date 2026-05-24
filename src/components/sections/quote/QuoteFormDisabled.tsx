import { Reveal } from "@/components/sections/_shared/Reveal";

export type QuoteFormDisabledProps = {
  message: string;
};

/**
 * Maintenance card shown when `quoteFormConfig.form_enabled === false`.
 * Replaces the form everywhere (standalone + embedded placements).
 */
export function QuoteFormDisabled({ message }: QuoteFormDisabledProps) {
  return (
    <div className="flex flex-col items-center px-[24px] py-[48px] text-center lg:py-[80px]">
      <Reveal>
        <h2 className="font-display text-ink mb-[16px] text-[22px] leading-[1.2] font-bold lg:text-[28px]">
          Quote requests temporarily unavailable
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="font-body text-ink-soft max-w-[480px] text-[14px] leading-[22px] lg:text-[16px] lg:leading-[26px]">
          {message}
        </p>
      </Reveal>
    </div>
  );
}
