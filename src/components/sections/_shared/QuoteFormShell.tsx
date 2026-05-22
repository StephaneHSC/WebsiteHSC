import Image from "next/image";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { QuoteFormCore } from "@/components/sections/quote/QuoteFormCore";
import { QuoteFormEmbedded } from "@/components/sections/quote/QuoteFormEmbedded";
import { QuoteFormDisabled } from "@/components/sections/quote/QuoteFormDisabled";
import { client } from "@/lib/sanity/client";
import { quoteFormConfigQuery } from "@/lib/sanity/queries";
import type { QuoteFormConfig } from "@/types/sanity";
import type { QuoteFormPrefill, TransportMode } from "@/types/quoteForm";
import { cn } from "@/lib/utils";

export type QuoteFormShellProps = {
  photo: { src: string; alt: string };
  /** Three-line H2 — defaults to "Start Your / Global Transport / Request". */
  headline?: { line1: string; line2: string; line3: string };
  /** Optional eyebrow override (defaults to "Request a Quote"). */
  eyebrow?: string;
  /**
   * When true, renders the photo with `mix-blend-multiply` against the brand
   * red so light areas of the image bleed red — matches Figma node 344:3275
   * (home variant). Service pages don't set this so the photo renders flat
   * with just the dark overlay.
   */
  tinted?: boolean;
  /**
   * Preselect a transport mode (e.g. service-detail page passes
   * `QUOTE_MODE_BY_SERVICE_SLUG[slug]`). Honored on first render only.
   */
  defaultMode?: TransportMode;
};

const DEFAULT_HEADLINE = {
  line1: "Start Your",
  line2: "Global Transport",
  line3: "Request",
};

/**
 * Embedded quote form — the M3 split-pane layout (left photo + right form).
 * Hosts the shared `QuoteFormCore` engine inside the right column.
 *
 * CMS fields honored here (scoped to form behavior — hero photo/headline are
 * NOT pulled from CMS because the shell's tall-left-pane crop and 3-line H2
 * are layout-specific and don't share assets with the standalone /quote page):
 *   - `form_mode`         → routes between Custom React form / iframe embed
 *   - `form_enabled`      → swaps in the maintenance card
 *   - `form_embed_code`   → iframe HTML when form_mode === "embed"
 *   - `recipient_email`   → read server-side in /api/quote at submit time
 *   - `success_message`   → success state body + maintenance message
 */
export async function QuoteFormShell({
  photo,
  headline = DEFAULT_HEADLINE,
  eyebrow = "Request a Quote",
  tinted = false,
  defaultMode,
}: QuoteFormShellProps) {
  const config = await client.fetch<QuoteFormConfig | null>(
    quoteFormConfigQuery,
    {},
    { next: { revalidate: 60 } },
  );
  const formEnabled = config?.form_enabled !== false;
  const formMode = config?.form_mode ?? "custom";
  const prefill: QuoteFormPrefill | undefined = defaultMode ? { mode: defaultMode } : undefined;

  return (
    <section className="relative w-full px-6 py-10 md:px-6 md:py-12 lg:px-12 lg:py-16 xl:px-12 xl:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left column — photo + brand red overlay + headline */}
        <div className="bg-brand-red text-surface relative overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              // `object-bottom` keeps the Antonov + helicopter loading scene
              // visible in the tall narrow column — `object-center` was
              // showing only the sky portion (per Figma `344:3275` framing).
              className={cn("object-cover object-[80%_bottom]", tinted && "mix-blend-multiply")}
            />
            {!tinted && <span className="bg-ink/30 absolute inset-0" />}
          </div>

          <div className="relative z-10 flex min-h-[450px] flex-col justify-center px-16 py-16 sm:px-16 md:px-16 lg:min-h-[900px] lg:justify-start lg:px-10 lg:py-[99px] 2xl:px-[60px]">
            <Reveal>
              <SectionEyebrow variant="solid-white">{eyebrow}</SectionEyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-3 lg:mt-[16px]">
                <div className="flex items-start gap-4 lg:items-center lg:gap-3">
                  <h2 className="font-display text-surface text-[24px] leading-[34px] uppercase lg:text-[54px] lg:leading-[74px] lg:whitespace-nowrap">
                    <span className="block font-black">{headline.line1}</span>
                    <span className="block font-bold">{headline.line2}</span>
                    <span className="block font-bold">{headline.line3}</span>
                  </h2>
                  <ChevronsRight
                    aria-hidden="true"
                    className="text-surface hidden size-[38px] shrink-0 rotate-90 lg:block"
                  />
                </div>
                <ChevronsRight
                  aria-hidden="true"
                  className="text-surface mt-6 size-[38px] rotate-180 lg:hidden"
                />
              </div>
            </Reveal>
          </div>
        </div>

        {/* Right column — white form panel */}
        <div className="bg-surface relative shadow-[0_0_6px_rgba(0,0,0,0.09)]">
          <div className="px-6 py-12 sm:px-10 md:px-16 lg:px-[48px] lg:py-[85px]">
            {!formEnabled ? (
              <QuoteFormDisabled
                message={
                  config?.success_message?.trim() ||
                  "Quote requests are temporarily paused. Please email info@heliskycargo.com directly."
                }
              />
            ) : formMode === "embed" ? (
              <QuoteFormEmbedded code={config?.form_embed_code} />
            ) : (
              <QuoteFormCore variant="embedded" config={config ?? null} prefill={prefill} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Triple wide-shallow chevron from Figma node 494:59 (Isolation_Mode).
 * SVG ships pointing UP (`^^^`); rotate at the call site:
 *   `rotate-90`  → right (`>>>`)
 *   `rotate-180` → down  (`vvv`)
 * Each chevron spans the full 38px width with shallow vertical depth, so
 * the angle reads as a softer "movement" mark vs. a sharp lucide chevron.
 */
function ChevronsRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 38 38" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M0.075 38c-0.008-0.098-0.022-0.197-0.022-0.295-0.001-1.987-0.006-3.974 0.009-5.962 0.001-0.151 0.106-0.356 0.23-0.443 6.153-4.272 12.313-8.533 18.473-12.795 0.061-0.043 0.126-0.078 0.203-0.126 1.436 0.988 2.874 1.976 4.31 2.965 4.762 3.28 9.521 6.563 14.289 9.834 0.288 0.198 0.395 0.4 0.391 0.749-0.019 1.864-0.008 3.728-0.011 5.592 0 0.16-0.015 0.32-0.022 0.48h-0.075c-0.067-0.066-0.127-0.143-0.204-0.196-6.13-4.235-12.262-8.466-18.388-12.707-0.223-0.154-0.357-0.109-0.549 0.024-6.087 4.209-12.179 8.413-18.268 12.62-0.107 0.074-0.196 0.172-0.294 0.26H0.074L0.075 38z" />
      <path d="M37.918 28.831C31.594 24.466 25.311 20.130 19 15.773 12.710 20.115 6.418 24.457 0.077 28.834 0.066 28.661 0.051 28.545 0.051 28.430 0.050 26.504 0.056 24.578 0.044 22.652 0.042 22.384 0.135 22.230 0.349 22.082 6.453 17.867 12.552 13.648 18.647 9.423 18.874 9.265 19.026 9.254 19.259 9.415 25.393 13.649 31.533 17.875 37.666 22.110 37.796 22.200 37.935 22.390 37.936 22.534 37.953 24.571 37.947 26.608 37.946 28.645 37.946 28.681 37.935 28.717 37.917 28.831H37.918Z" />
      <path d="M0.077 19.670C0.065 19.500 0.052 19.395 0.051 19.289 0.050 17.351 0.053 15.412 0.046 13.474 0.045 13.242 0.108 13.096 0.309 12.958 6.453 8.715 12.593 4.466 18.733 0.218 18.804 0.169 18.877 0.123 18.964 0.066 20.199 0.917 21.432 1.765 22.665 2.614 27.651 6.049 32.635 9.487 37.627 12.913 37.874 13.083 37.957 13.258 37.955 13.546 37.943 15.435 37.949 17.323 37.949 19.212V19.687C37.761 19.560 37.642 19.483 37.524 19.402 31.461 15.218 25.396 11.035 19.339 6.842 19.084 6.666 18.921 6.662 18.663 6.840 12.605 11.033 6.541 15.216 0.477 19.401 0.360 19.482 0.240 19.560 0.077 19.670Z" />
    </svg>
  );
}
