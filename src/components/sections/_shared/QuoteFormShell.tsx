import Image from "next/image";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { QuoteFormCore } from "@/components/sections/quote/QuoteFormCore";
import { QuoteFormEmbedded } from "@/components/sections/quote/QuoteFormEmbedded";
import { QuoteFormDisabled } from "@/components/sections/quote/QuoteFormDisabled";
import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
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
 * CMS fields honored here (identical to the standalone /quote page):
 *   - `form_mode`         → routes between Custom React form / iframe embed
 *   - `form_enabled`      → swaps in the maintenance card
 *   - `form_embed_code`   → iframe HTML when form_mode === "embed"
 *   - `recipient_email`   → read server-side in /api/quote at submit time
 *   - `success_message`   → success state body + maintenance message
 *   - `hero_image`        → overrides the page-provided `photo` when set
 *   - `hero_headline`     → overrides the 3-line stack with a single line when set
 *
 * The hero_image / hero_headline overrides exist so an editor can change the
 * quote-form chrome SITE-WIDE from one place (not just on /quote) — by
 * default each placement passes its own context-appropriate photo and copy.
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

  const cmsImageSrc = config?.hero_image
    ? urlFor(config.hero_image).width(1600).format("webp").quality(85).url()
    : null;
  const photoSrc = cmsImageSrc || photo.src;
  const photoAlt = photo.alt;
  // Multi-line aware — editors author newlines in the Studio textarea; we
  // split + render each as its own block-span so the H2 stacks like Figma.
  const cmsHeadlineLines = config?.hero_headline
    ? config.hero_headline
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0)
    : null;

  return (
    <section className="relative w-full md:px-6 md:py-12 lg:px-12 lg:py-16 xl:px-20 xl:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left column — photo + brand red overlay + headline */}
        <div className="bg-brand-red text-surface relative overflow-hidden">
          <div aria-hidden="true" className="absolute inset-0">
            <Image
              src={photoSrc}
              alt={photoAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              // `object-bottom` keeps the Antonov + helicopter loading scene
              // visible in the tall narrow column — `object-center` was
              // showing only the sky portion (per Figma `344:3275` framing).
              className={cn("object-cover object-bottom", tinted && "mix-blend-multiply")}
            />
            {!tinted && <span className="bg-ink/30 absolute inset-0" />}
          </div>

          <div className="relative z-10 flex min-h-[450px] flex-col justify-center px-6 py-16 sm:px-10 md:px-16 lg:min-h-[900px] lg:px-[60px] lg:py-[99px]">
            <Reveal>
              <SectionEyebrow variant="outline-white">{eyebrow}</SectionEyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-6 lg:mt-[46px]">
                <div className="flex items-start gap-4">
                  <h2 className="font-display text-surface text-[32px] leading-[1.18] uppercase lg:text-[54px] lg:leading-[74px]">
                    {cmsHeadlineLines ? (
                      cmsHeadlineLines.map((line, i) => (
                        <span key={i} className="block font-bold">
                          {line}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="block font-black">{headline.line1}</span>
                        <span className="block font-bold">{headline.line2}</span>
                        <span className="block font-bold">{headline.line3}</span>
                      </>
                    )}
                  </h2>
                  <ChevronsRight
                    aria-hidden="true"
                    className="text-surface mt-4 hidden size-[48px] shrink-0 lg:block"
                  />
                </div>
                <ChevronsRight
                  aria-hidden="true"
                  className="text-surface mt-6 size-[44px] rotate-90 lg:hidden"
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

function ChevronsRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      aria-hidden="true"
      className={className}
    >
      <path d="m6 17 5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m13 17 5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
