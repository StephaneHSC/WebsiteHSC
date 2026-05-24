import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { SHARED_DETAIL_HERO_BENEFITS, type Service, type ServiceBenefit } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ServiceDetailHeroProps = {
  service: Service;
};

/**
 * Service-detail page hero (Figma frames `345:8253`/`529:8213` and the 5
 * sibling frames). Identical layout across all 6 services — only eyebrow,
 * H1 lines, and background photo vary. Benefit chips default to the shared
 * 4 (`SHARED_DETAIL_HERO_BENEFITS`) and can be overridden per-Service.
 *
 * Mobile (<md): 4 chips overflow horizontally with scroll-snap.
 * Desktop (>=lg): all 4 chips visible in a row.
 */
export function ServiceDetailHero({ service }: ServiceDetailHeroProps) {
  const benefits = service.detailHeroBenefits ?? SHARED_DETAIL_HERO_BENEFITS;
  const titleLines = service.detailHeroTitle;

  return (
    <section className="text-surface relative isolate w-full overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src={service.detailHeroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: service.detailHeroImagePosition ?? "center" }}
        />
        {/* Mobile 36% / desktop 40% black overlay per Figma. */}
        <span className="bg-ink/[0.36] md:bg-ink/40 absolute inset-0" />
      </div>

      <Container>
        {/*
         * Layout is bottom-anchored on mobile/md (chips + title stacked
         * against the bottom edge), but switches to top-anchored
         * (`justify-between`) on lg so the eyebrow + title sit at Figma's
         * fixed coordinates (eyebrow `y=281`, title `y=342`) regardless of
         * title line-count. The chip strip stays pinned to the bottom via
         * `lg:pb-[63px]` (chip bottom `y=642`), and the gap between title
         * and chips auto-fills the remaining space — matches Figma's 103px
         * gap for 2-line titles and ~185px gap for 1-line titles.
         */}
        <div className="flex min-h-[470px] flex-col justify-end pt-32 pb-10 md:min-h-[640px] md:pt-44 md:pb-16 lg:min-h-[705px] lg:justify-between lg:pt-[281px] lg:pb-[63px]">
          <div>
            <Reveal>
              <SectionEyebrow variant="red" className="px-3 py-2">
                {service.detailEyebrow}
              </SectionEyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="font-body text-surface mt-6 text-[32px] leading-[42px] font-bold capitalize md:mt-8 md:text-5xl md:leading-[1.2] lg:mt-6 lg:text-[64px] lg:leading-[82px]">
                {titleLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="mt-8 md:mt-12 lg:mt-0">
            <BenefitsStrip benefits={benefits} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function BenefitsStrip({ benefits }: { benefits: readonly ServiceBenefit[] }) {
  return (
    <ul
      role="list"
      aria-label="Service benefits"
      tabIndex={0}
      className={cn(
        // Mobile: horizontal scroll-snap carousel; first chip flush-left at
        // 24px page padding via the parent Container; chips overflow to the
        // right and snap into view as the user swipes. Tabbable on mobile so
        // keyboard users can scroll the strip with arrow keys.
        "-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6",
        // Desktop: 4 fixed-width chips spread edge-to-edge so the dark photo
        // shows through the gaps (Figma frame `345:8253` shows ~108px gaps
        // at 1600 viewport — `justify-between` matches that proportion at
        // any container width).
        "lg:mx-0 lg:justify-between lg:gap-0 lg:overflow-visible lg:px-0",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      )}
    >
      {benefits.map((benefit) => (
        <BenefitChip key={benefit.slug} benefit={benefit} />
      ))}
    </ul>
  );
}

function BenefitChip({ benefit }: { benefit: ServiceBenefit }) {
  return (
    <li
      className={cn(
        "flex shrink-0 snap-start items-center gap-3 px-6",
        "h-[70px] w-[276px] lg:w-[clamp(220px,18vw,276px)]",
        // Exact Figma chip styling — all 6 service hero frames use the same
        // values (verified via get_design_context on node 501:447 and its
        // 5 siblings). Note: no spaces inside the rgba(...) — Tailwind
        // drops arbitrary values containing whitespace.
        "bg-[rgba(0,0,0,0.31)] backdrop-blur-[16.8px]",
      )}
    >
      <Image src={benefit.icon} alt="" width={22} height={22} className="size-[22px] shrink-0" />
      <span className="font-display-alt text-surface text-base font-normal capitalize">
        {benefit.label}
      </span>
    </li>
  );
}
