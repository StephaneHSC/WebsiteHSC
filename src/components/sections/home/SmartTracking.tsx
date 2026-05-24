import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { AppBadgeRow } from "@/components/ui/AppBadge";
import { SmartTrackingCards } from "./SmartTrackingCards";

/**
 * Home page · Smart Tracking section.
 *
 * Two-column header (eyebrow + heading on the left; lede + app badges on the
 * right; stacks on mobile) followed by a horizontal scroll-snap row of 5
 * feature cards. Cards live in a separate client island so this section stays
 * server-rendered.
 */
export function SmartTracking() {
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
                badgeClassName="border-2 border-ink"
                className="md:hidden"
              />
              <AppBadgeRow
                variant="light"
                badgeClassName="border-2 border-ink"
                className="hidden md:flex"
              />
            </Reveal>
          </div>
        </div>
      </Container>

      <SmartTrackingCards />
    </Section>
  );
}
