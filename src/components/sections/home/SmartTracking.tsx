import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { AppBadgeRow } from "@/components/ui/AppBadge";
import { SmartTrackingCards } from "./SmartTrackingCards";
import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { smartTrackingCardsQuery } from "@/lib/sanity/queries";
import { SMART_TRACKING_CARDS, type SmartTrackingCard } from "@/lib/constants";
import type { SmartTrackingCardsDoc } from "@/types/sanity";

/**
 * Home page · Smart Tracking section.
 *
 * Two-column header (eyebrow + heading on the left; lede + app badges on the
 * right; stacks on mobile) followed by a horizontal scroll-snap row of 5
 * feature cards. Cards live in a separate client island so this section stays
 * server-rendered.
 *
 * Card content is Sanity-managed (singleton `smartTrackingCards`, editors can
 * add/reorder cards) with the hardcoded `SMART_TRACKING_CARDS` composite SVGs
 * as fallback while Sanity is empty — same pattern as `StatsBand`.
 */
export async function SmartTracking() {
  const doc = await client.fetch<SmartTrackingCardsDoc | null>(
    smartTrackingCardsQuery,
    {},
    { next: { revalidate: 60 } },
  );
  // Only cards with an actual uploaded image count — an editor can add an
  // array entry in Studio before attaching the image, which would otherwise
  // crash `urlFor` (no asset until an image is uploaded). The query
  // dereferences the asset (`asset->{ url }`), so check `url` here, not
  // `_ref` — the raw reference field is gone once dereferenced.
  const validCards = doc?.cards?.filter((c) => Boolean(c.image?.asset?.url)) ?? [];
  const cards: readonly SmartTrackingCard[] =
    validCards.length > 0
      ? validCards.map((c, i) => ({
          id: i + 1,
          src: urlFor(c.image).width(1172).format("webp").quality(85).url(),
          alt: c.alt,
        }))
      : SMART_TRACKING_CARDS;

  return (
    <Section tone="light" spacing="loose" className="overflow-hidden">
      <Container className="max-w-[1440px] lg:px-12">
        <div className="grid items-end gap-6 md:grid-cols-2 md:gap-16">
          {/* Left: eyebrow + heading */}
          <div className="flex flex-col items-start gap-5">
            <Reveal>
              <SectionEyebrow variant="outline">Mobile App</SectionEyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-display text-[27px] leading-[1.05] font-bold tracking-tight uppercase md:text-[33px] lg:text-[43px]">
                <span className="font-black"> Smart Tracking Powered</span> By Our Bespoke App.
              </h2>
            </Reveal>
          </div>

          {/* Right: lede + badges */}
          <div className="flex flex-col items-start gap-6">
            <Reveal delay={0.2}>
              <p className="font-body text-ink-soft text-base md:text-lg">
                Our bespoke App enables end-to-end visibility on your helicopter shipments for you
                and your team.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <AppBadgeRow
                variant="light"
                size="sm"
                badgeClassName="border border-ink"
                className="md:hidden"
              />
              <AppBadgeRow
                variant="light"
                badgeClassName="border border-ink"
                className="hidden md:flex"
              />
            </Reveal>
          </div>
        </div>
      </Container>

      <SmartTrackingCards cards={cards} />
    </Section>
  );
}
