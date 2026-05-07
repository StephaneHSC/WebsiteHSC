import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { AppBadgeRow } from "@/components/ui/AppBadge";
import { WHY_CHOOSE_TRACKABILITY } from "@/lib/constants";

/**
 * /why-choose-us · "Trackability" red callout (Figma `373:15` desktop /
 * `505:7551` mobile).
 *
 * Layout: full-bleed brand-red band with a decorative blend-overlay shape.
 * Desktop puts the phone mockup on the LEFT and the headline+badges on the
 * RIGHT; mobile stacks phone-on-top, headline-below, with a pair of small
 * floating overlay cards beside the phone that hint at the app's tracking
 * surface.
 */
export function TrackabilityCallout() {
  const { eyebrow, h2, lede } = WHY_CHOOSE_TRACKABILITY;

  return (
    <section className="bg-brand-red text-surface relative isolate w-full overflow-hidden">
      {/* Decorative shape, blended at 20% so it reads as a subtle texture
          rather than a literal overlay graphic. */}
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
        <div className="grid grid-cols-1 items-center gap-10 py-16 md:py-20 lg:grid-cols-2 lg:gap-16 lg:py-[120px]">
          {/* Phone mockup column. */}
          <div className="order-1 flex justify-center lg:order-1 lg:justify-start">
            <PhoneMockup />
          </div>

          {/* Headline column. */}
          <div className="order-2 lg:order-2">
            <Reveal>
              <SectionEyebrow variant="filled" className="bg-surface text-ink px-3 py-2">
                {eyebrow}
              </SectionEyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-display text-surface mt-6 text-[24px] leading-[34px] uppercase md:text-[40px] md:leading-[52px] lg:mt-8 lg:text-[54px] lg:leading-[66px]">
                <span className="block font-black">{h2.line1}</span>
                <span className="block font-bold">{h2.line2}</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="font-body text-surface mt-6 max-w-[600px] text-[14px] leading-[24px] md:text-[16px] md:leading-[28px] lg:mt-8 lg:text-[18px] lg:leading-[30px]">
                {lede}
              </p>
            </Reveal>
            <Reveal delay={0.3} className="mt-8 lg:mt-10">
              <AppBadgeRow variant="light" />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Composite phone mockup. Renders a phone-shaped device frame with a red
 * header (back-arrow + "Delivery Information"), a screen-content image, and
 * a small bottom strip — plus two floating frosted overlay cards positioned
 * beside it. All static; no interactivity.
 */
function PhoneMockup() {
  return (
    <Reveal className="relative w-full max-w-[520px]">
      {/* The mockup is sized via aspect-ratio so it scales gracefully from
          mobile (full-width inside its column) to desktop (~520px).
          Inner positions use percentages so they track at every breakpoint. */}
      <div className="relative aspect-[520/620] w-full">
        {/* Phone device — gray bottom + red top header. Centered horizontally
            inside the wrapper. */}
        <div className="absolute top-[10%] left-1/2 h-[88%] w-[52%] -translate-x-1/2 overflow-hidden rounded-[28px] bg-[#e8ecef] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)]">
          {/* Red header — keeps the rounded top corners. */}
          <div className="bg-brand-red absolute inset-x-0 top-0 flex h-[14%] items-center justify-center px-3">
            <span
              aria-hidden="true"
              className="absolute left-3 inline-flex size-7 items-center justify-center"
            >
              <Image
                src="/why-choose-us/arrow-square-left.svg"
                alt=""
                width={28}
                height={28}
                className="size-full"
              />
            </span>
            <p className="font-display text-surface text-[12px] font-bold capitalize md:text-[14px]">
              Delivery Information
            </p>
          </div>

          {/* Screen content image — covers the full phone area. The red
              header sits on top of it. */}
          <Image
            src="/why-choose-us/phone-screen.webp"
            alt=""
            fill
            sizes="(min-width: 1024px) 280px, 200px"
            className="object-cover object-top"
          />

          {/* Inner shipment-card overlay (helicopter image + route table). */}
          <div className="absolute top-[16%] left-1/2 h-[60%] w-[88%] -translate-x-1/2 overflow-hidden rounded-[10px]">
            <Image
              src="/why-choose-us/phone-card-inner.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 240px, 180px"
              className="object-cover"
            />
          </div>

          {/* Bottom dock strip. */}
          <div className="absolute bottom-[3%] left-1/2 h-[6%] w-[88%] -translate-x-1/2 overflow-hidden">
            <Image
              src="/why-choose-us/phone-bottom-strip.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 240px, 180px"
              className="object-contain"
            />
          </div>
        </div>

        {/* Floating card 1 — bottom-left, frosted, with shipment image. */}
        <div className="absolute bottom-[6%] left-0 hidden w-[44%] rounded-[20px] border border-white/10 bg-white/24 p-1.5 backdrop-blur-md md:block">
          <div className="relative aspect-[247/125] w-full overflow-hidden rounded-[10px]">
            <Image
              src="/why-choose-us/floating-card.webp"
              alt=""
              fill
              sizes="220px"
              className="object-cover"
            />
          </div>
        </div>

        {/* Floating card 2 — top-right, "delivery details" preview. */}
        <div className="absolute top-[28%] right-0 hidden w-[44%] rounded-[20px] border border-white/10 bg-white/24 p-1.5 backdrop-blur-md md:block">
          <div className="bg-surface flex items-center gap-3 rounded-[10px] px-4 py-3">
            <span
              aria-hidden="true"
              className="bg-surface-alt inline-flex size-8 shrink-0 items-center justify-center rounded-full"
            >
              <Image
                src="/why-choose-us/delivery-icon.svg"
                alt=""
                width={20}
                height={20}
                className="size-5"
              />
            </span>
            <span className="flex flex-col gap-1">
              <span className="flex gap-2">
                <span aria-hidden="true" className="block h-1.5 w-10 rounded-full bg-[#e5e2f0]" />
                <span aria-hidden="true" className="block h-1.5 w-12 rounded-full bg-[#ececec]" />
              </span>
              <span aria-hidden="true" className="block h-1.5 w-32 rounded-full bg-[#929292]" />
            </span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
