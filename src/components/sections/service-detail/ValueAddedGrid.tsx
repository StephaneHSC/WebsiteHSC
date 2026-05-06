import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { VALUE_ADDED_SERVICES, type ValueAddedService } from "@/lib/constants";

/**
 * Service-detail Value-Added grid (Figma frame `345:8693` desktop / `529:8669`
 * mobile). Distinct from M3's `ValueAddedAccordion`: cards always show
 * icon + label + short description, no expand/collapse.
 *
 * Desktop: 4 columns × 2 rows. Mobile: 2 columns × 4 rows.
 */
export function ValueAddedGrid() {
  return (
    <Section tone="alt" spacing="loose">
      <Container>
        <div className="flex flex-col items-center gap-4 text-center">
          <Reveal>
            <SectionEyebrow variant="gray">Value-Added Services</SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-ink text-[24px] leading-[34px] tracking-tight uppercase md:text-[36px] md:leading-[44px] lg:text-[54px] lg:leading-[66px]">
              <span className="block font-black">Beyond Standard Logistic.</span>
              <span className="block font-bold">Extra Support, Every Step.</span>
            </h2>
          </Reveal>
        </div>

        {/* 2 cols mobile/tablet, 4 cols desktop. Skipping a 3-col tablet
            layout because 8 items don't tile evenly into 3 columns and the
            Figma audit only specifies 2x4 (mobile) / 4x2 (desktop). */}
        <div className="mt-12 grid grid-cols-2 gap-3.5 md:gap-5 lg:mt-16 lg:grid-cols-4 lg:gap-6">
          {VALUE_ADDED_SERVICES.map((vas, i) => (
            <Reveal key={vas.slug} delay={0.15 + (i % 4) * 0.04}>
              <Card service={vas} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function Card({ service }: { service: ValueAddedService }) {
  return (
    <article className="bg-surface group h-full border border-[#f5f5f5] p-4 transition-all duration-200 hover:border-[#e5e7eb] hover:shadow-sm md:p-5 lg:px-6 lg:py-7">
      <Image src={service.iconM4} alt="" width={48} height={48} className="size-6 lg:size-12" />
      <h3 className="font-display text-ink mt-6 text-[16px] leading-[20px] font-semibold uppercase lg:mt-10 lg:text-[20px] lg:leading-[24px]">
        {service.label}
      </h3>
      <p className="font-body text-ink mt-3 text-[14px] leading-[22px] lg:mt-4 lg:text-[16px] lg:leading-[27px]">
        {service.shortDescription}
      </p>
    </article>
  );
}
