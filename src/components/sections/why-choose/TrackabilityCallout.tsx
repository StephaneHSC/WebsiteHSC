"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { AppBadgeRow } from "@/components/ui/AppBadge";
import { WHY_CHOOSE_TRACKABILITY } from "@/lib/constants";

/**
 * /why-choose-us · "Trackability" red callout
 * (Figma `373:15` desktop / `3148:15` mobile, mockup composition `373:67` /
 * `505:7566`).
 *
 * The phone mockup is rebuilt as a layered composition — phone device,
 * shipment-info floating card (bottom-left), and notification preview
 * (top-right) are independently positioned and animated. All coordinates are
 * derived from the Figma `mobileapp` frame (707 × 547) and expressed as
 * percentages so the composition tracks at every viewport.
 *
 * Aspect ratio 707/547 ≈ 1.29 is preserved at every breakpoint — the same
 * ratio Figma uses for both the mobile (392×303) and desktop (707×547)
 * mockup frames.
 */
export function TrackabilityCallout() {
  const { eyebrow, h2 } = WHY_CHOOSE_TRACKABILITY;

  return (
    <section className="bg-brand-red text-surface relative isolate w-full overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 opacity-20 mix-blend-overlay">
        <Image
          src="/why-choose-us/red-bg-shape.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-8 py-14 md:gap-12 md:py-20 lg:grid-cols-2 lg:gap-12 lg:py-[120px]">
          <div className="order-1 flex justify-center lg:justify-start">
            <div className="w-full max-w-[420px] md:max-w-[560px] lg:max-w-[640px]">
              <PhoneMockup />
            </div>
          </div>

          <div className="order-2">
            <Reveal>
              <SectionEyebrow variant="filled" className="bg-surface text-ink px-3 py-2">
                {eyebrow}
              </SectionEyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-display text-surface mt-5 text-[28px] leading-[36px] uppercase md:mt-6 md:text-[40px] md:leading-[52px] lg:mt-8 lg:text-[44px] lg:leading-[56px]">
                <span className="block font-black">{h2.line1}</span>
                <span className="block font-bold">{h2.line2}</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              {/* Mobile: explicit break AFTER "while" → 2 lines.
                  Desktop: drop max-width and force nowrap so the sentence
                  stays on a single line. */}
              <p className="font-body text-surface mt-5 text-[14px] leading-[22px] md:mt-6 md:text-[16px] md:leading-[28px] lg:mt-8 lg:text-[16px] lg:leading-[26px] lg:whitespace-nowrap">
                Access real-time location of your helicopter while
                <br className="md:hidden" />
                <span className="md:inline"> </span>
                in transit, get push notification.
              </p>
            </Reveal>
            <Reveal delay={0.3} className="mt-6 lg:mt-8">
              <AppBadgeRow variant="light" size="sm" />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ── Phone composition ───────────────────────────────────────────────────────
//
// All positions are percentages of the parent box (the `mobileapp` frame in
// Figma: 707 × 547). Each piece animates in independently with its own
// directional offset — phone rises into place; the left card slides in from
// the left; the right card slides in from the right. After the entrance, the
// phone idles with a gentle float.

function PhoneMockup() {
  const reduced = useReducedMotion();

  const phoneEntrance = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-10% 0px" } as const,
        transition: { duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] } as const,
      };

  const leftCardEntrance = reduced
    ? {}
    : {
        initial: { opacity: 0, x: -32, y: 12 },
        whileInView: { opacity: 1, x: 0, y: 0 },
        viewport: { once: true, margin: "-10% 0px" } as const,
        transition: { duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] } as const,
      };

  const rightCardEntrance = reduced
    ? {}
    : {
        initial: { opacity: 0, x: 32, y: -8 },
        whileInView: { opacity: 1, x: 0, y: 0 },
        viewport: { once: true, margin: "-10% 0px" } as const,
        transition: { duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] } as const,
      };

  return (
    <div className="relative aspect-[707/547] w-full">
      {/* Phone — Figma 373:68. Position inside mobileapp: x=290.1 / w=276.9
          / y=126 / h=547.2 → relative 29.6% × 39.2% × 23.0% × 100%, BUT the
          device frame asset extends slightly above its bounding box (5%
          top inset in Figma), so we anchor `top: 0` and let the device
          chrome run the full vertical. */}
      <motion.div {...phoneEntrance} className="absolute top-0 left-[29.6%] h-full w-[39.2%]">
        <PhoneDevice />
      </motion.div>

      {/* Left floating card — Figma 373:79. Inside mobileapp: x=81 / y=389.6
          / w=265 / h=144.4. The card itself is a frosted-glass wrapper with
          the shipment-info bitmap layered inside (matches Figma 373:80 +
          373:81). */}
      <motion.div {...leftCardEntrance} className="absolute top-[48.2%] left-0 h-[26.4%] w-[37.5%]">
        <LeftCard />
      </motion.div>

      {/* Right floating card — Figma 373:82. Inside mobileapp: x=520.1 /
          y=307 / w=268 / h=82.5. Rendered fully in JSX since the contents
          are an icon + three bars — cheaper and sharper than rasterising. */}
      <motion.div
        {...rightCardEntrance}
        className="absolute top-[33.1%] left-[62.1%] h-[15.1%] w-[37.9%]"
      >
        <RightCard />
      </motion.div>
    </div>
  );
}

function PhoneDevice() {
  return (
    <Image
      src="/why-choose-us/trk/device.svg"
      alt="Heli Skycargo tracking app showing shipment delivery information"
      width={277}
      height={548}
      className="h-full w-full object-contain"
    />
  );
}

function LeftCard() {
  return (
    <div className="h-full w-full rounded-[10%/19%] border border-white/10 bg-white/24 p-[3.5%] backdrop-blur-md">
      <div className="relative h-full w-full overflow-hidden rounded-[7%/14%]">
        <Image
          src="/why-choose-us/trk/shipment-card.webp"
          alt="Shipment #89000 AW189 Ocean RORO from Vergiate to Toyoyam, airborne"
          fill
          sizes="(min-width: 1024px) 240px, 160px"
          className="object-cover"
        />
      </div>
    </div>
  );
}

function RightCard() {
  // Inside-frame coordinates: inner white card 92.4% × 75% at left:3.85%,
  // top:12.5%. Icon at 8.5%/31.2%, ~11.5% × 37.5%. Three bars below.
  return (
    <div className="h-full w-full rounded-[7%/24%] border border-white/10 bg-white/24 p-[3.85%] backdrop-blur-md">
      <div className="bg-surface relative flex h-full w-full items-center gap-[3%] rounded-[5%/19%] px-[4.6%]">
        <span className="bg-brand-red inline-flex aspect-square h-[55%] shrink-0 items-center justify-center rounded-full">
          <Image
            src="/why-choose-us/trk/delivery-icon.svg"
            alt=""
            width={18}
            height={18}
            className="size-[60%]"
          />
        </span>
        <span className="flex flex-1 flex-col gap-[14%]">
          <span className="flex gap-[3%]">
            <span aria-hidden="true" className="block h-[7px] w-[35%] rounded-full bg-[#e5e2f0]" />
            <span aria-hidden="true" className="block h-[7px] w-[44%] rounded-full bg-[#ececec]" />
          </span>
          <span aria-hidden="true" className="block h-[7px] w-[88%] rounded-full bg-[#929292]" />
        </span>
      </div>
    </div>
  );
}
