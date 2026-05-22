"use client";

import { CloseX } from "@/components/icons/quote";

export type QuoteFormErrorBannerProps = {
  message: string;
  onDismiss: () => void;
};

export function QuoteFormErrorBanner({ message, onDismiss }: QuoteFormErrorBannerProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="bg-brand-red/10 border-brand-red mb-[24px] flex items-start gap-[12px] border-l-4 p-[16px] lg:p-[20px]"
    >
      <div className="min-w-0 flex-1">
        <p className="font-body text-ink text-[13px] font-bold lg:text-[14px]">Submission failed</p>
        <p className="font-body text-ink-soft mt-[4px] text-[12px] leading-[18px] lg:text-[13px] lg:leading-[20px]">
          {message}
        </p>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        className="text-ink-soft hover:text-ink flex size-[20px] shrink-0 items-center justify-center"
      >
        <CloseX className="size-[14px]" />
      </button>
    </div>
  );
}
