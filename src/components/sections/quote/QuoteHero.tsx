import Image from "next/image";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { QUOTE_HERO } from "@/lib/constants";

export type QuoteHeroProps = {
  /**
   * Optional CMS hero copy override. Applies at every breakpoint — each
   * newline becomes a `<br>`-style break. Special case: when the value
   * matches the Figma-canonical headline (case-/punctuation-insensitive
   * fingerprint), the per-breakpoint Figma break patterns are used instead
   * of the editor's `\n` splits (desktop 2 lines, mobile 3 lines — Figma
   * 345:9554 / 529:8837 use different word groupings the editor can't
   * express in a single string).
   */
  cmsHeadline?: string | null;
  /** Optional CMS hero image override. When provided, used at every breakpoint. */
  imageSrc?: string | null;
  imageAlt?: string | null;
};

/**
 * Hero for the standalone /quote route. Single 1600×1200 source image
 * (object-cover everywhere — same asset on every breakpoint so the CMS
 * `hero_image` override round-trips with one upload):
 *   - Desktop (lg+) — aspect 1600/700 → object-bottom crops upper sky band
 *   - Mobile  (<lg) — aspect 430/470 → object-left-bottom keeps the plane
 *     nose + ramp loading scene framed in the tall portrait container
 *
 * The CSS wash (rgba 0.36 mobile / 0.40 desktop) is applied unconditionally
 * so readability is consistent whether the photo is the default or an
 * editor-uploaded asset.
 *
 * Server Component — LCP-eligible image uses `priority` + `sizes="100vw"`
 * + an aspect-ratio lock to keep CLS at zero.
 */
export function QuoteHero({ cmsHeadline, imageSrc, imageAlt }: QuoteHeroProps) {
  const photoSrc = imageSrc || QUOTE_HERO.photo.src;
  const photoAlt = imageAlt || QUOTE_HERO.photo.alt;
  // CMS override applies at every breakpoint (newlines = line breaks).
  // BUT — if the value's fingerprint matches the Figma-canonical headline
  // ("Share Your Shipment Details. We'll Handle The Rest." in any
  // case/punctuation/whitespace shape), we discard the editor's `\n`
  // splits and use the per-breakpoint Figma stacks (desktop 2 lines,
  // mobile 3 lines) so the rendering matches the design system. The
  // mobile pattern can't be expressed in one CMS string because its word
  // grouping differs from desktop ("Share Your Shipment / Details. We'll
  // / Handle The Rest." vs "Share Your Shipment Details / We'll Handle
  // The Rest.").
  const trimmedCms = cmsHeadline?.trim() || null;
  const useFigmaBreaks = !trimmedCms || isCanonicalFigmaHeadline(trimmedCms);
  const customLines = !useFigmaBreaks && trimmedCms ? splitLines(trimmedCms) : null;
  const desktopLines = customLines ?? QUOTE_HERO.headline.desktop;
  const mobileLines = customLines ?? QUOTE_HERO.headline.mobile;

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative aspect-[430/470] w-full lg:aspect-[1600/700]">
        <Image
          src={photoSrc}
          alt={photoAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_70%]"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-black/[0.36] lg:bg-black/40" />

        <div className="absolute inset-0 flex flex-col items-start justify-center px-[24px] pt-[180px] pb-[100px] lg:px-[79px] lg:pt-[281px] lg:pb-[120px]">
          <Reveal delay={0}>
            <SectionEyebrow variant="red">Request a Quote</SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="font-body text-surface mt-[24px] text-[32px] leading-[42px] font-bold capitalize lg:mt-[33px] lg:text-[64px] lg:leading-[82px]">
              <span className="block lg:hidden">
                {mobileLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </span>
              <span className="hidden lg:block">
                {desktopLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </h1>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
}

/**
 * Fingerprint = lowercase + strip everything that isn't a letter or digit.
 * Lets us detect the canonical headline regardless of casing, punctuation
 * (smart vs straight apostrophe, optional periods), or whitespace shape.
 */
function fingerprint(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const CANONICAL_HEADLINE_FINGERPRINT = fingerprint(QUOTE_HERO.headline.desktop.join(" "));

function isCanonicalFigmaHeadline(value: string): boolean {
  return fingerprint(value) === CANONICAL_HEADLINE_FINGERPRINT;
}
