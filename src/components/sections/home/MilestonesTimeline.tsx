import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { ScrollSnapRow } from "@/components/sections/_shared/ScrollSnapRow";
import { fetchWithCmsFallback } from "@/components/sections/_shared/cmsFallback";
import { milestonesQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { Milestone } from "@/types/sanity";
import { cn } from "@/lib/utils";

// TODO(seed): drop once Sanity is populated.
type PlaceholderMilestone = {
  _id: string;
  year: number;
  headline: string;
  description: string;
  placeholderImage: string;
};

const PLACEHOLDER_MILESTONES: readonly PlaceholderMilestone[] = [
  {
    _id: "p1",
    year: 2026,
    headline: "Customer Satisfaction",
    description:
      "Global customer satisfaction survey is launched to receive our customers' feedback in the aim to exceed our customer's expectation.",
    placeholderImage: "/milestones/2026-customer-satisfaction.webp",
  },
  {
    _id: "p2",
    year: 2024,
    headline: "Global Headquarter Relocates",
    description: "Heli Skycargo Corporate office and Global Customer Support Center to Dubai, UAE.",
    placeholderImage: "/milestones/2024-hq-relocates.webp",
  },
  {
    _id: "p3",
    year: 2023,
    headline: "Customer Support Expansion for Japan",
    description: "Our Japan desk is opened to cater to our Japanese customers.",
    placeholderImage: "/milestones/2023-japan-desk.webp",
  },
  {
    _id: "p4",
    year: 2021,
    headline: "On the Road",
    description:
      "Heli Skycargo starts exhibiting at HAI Atlanta, European Rotors in Madrid, Spain and Verticon Anaheim.",
    placeholderImage: "/milestones/2021-on-the-road.webp",
  },
];

type MilestoneRow = Milestone | PlaceholderMilestone;

function isPlaceholder(m: MilestoneRow): m is PlaceholderMilestone {
  return "placeholderImage" in m;
}

export async function MilestonesTimeline() {
  const display = await fetchWithCmsFallback<Milestone, PlaceholderMilestone>(
    milestonesQuery,
    PLACEHOLDER_MILESTONES,
    4,
  );

  return (
    <Section tone="light" spacing="loose" className="relative overflow-hidden">
      <Container>
        <div className="flex flex-col items-center gap-4 text-center">
          <Reveal>
            <SectionEyebrow variant="outline">Our Journey</SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-ink text-3xl leading-[1.1] font-bold tracking-tight uppercase md:text-4xl lg:text-[54px] lg:leading-[64px] lg:tracking-[1.08px]">
              <span className="font-extrabold">Heli Skycargo</span> Milestones
            </h2>
          </Reveal>
        </div>
      </Container>

      <Container className="mt-12 lg:mt-16">
        {/* Desktop / tablet — 4-col timeline */}
        <div className="hidden md:block">
          <ul
            className="grid gap-4 lg:gap-6"
            style={{ gridTemplateColumns: `repeat(${display.length}, minmax(0, 1fr))` }}
          >
            {display.map((m, i) => (
              <li key={m._id} className="flex justify-center">
                <Reveal delay={0.2 + i * 0.05}>
                  <span
                    className={cn(
                      "font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-[64px] lg:leading-[50px] lg:tracking-[1.28px]",
                      i === 0 ? "text-brand-red" : "text-ink",
                    )}
                  >
                    {m.year}
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>

          {/* Helicopter sits between dot 1 and dot 2 — `1/N` from the left
              keeps it centred there as the CMS list grows past 4. */}
          <div className="relative mt-6">
            <span aria-hidden="true" className="bg-ink/15 block h-px w-full" />
            <Image
              src="/milestones/helicopter.svg"
              alt=""
              width={99}
              height={42}
              aria-hidden="true"
              style={{ left: `${100 / Math.max(display.length, 1)}%` }}
              className="pointer-events-none absolute top-1/2 h-auto w-24 -translate-x-1/2 -translate-y-full -scale-x-100 lg:w-28"
            />
            <ul
              className="absolute inset-x-0 top-1/2 grid gap-4 lg:gap-6"
              style={{ gridTemplateColumns: `repeat(${display.length}, minmax(0, 1fr))` }}
            >
              {display.map((m, i) => (
                <li key={m._id} className="flex justify-center">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block h-3 w-3 -translate-y-1/2 rounded-full",
                      i === 0 ? "bg-brand-red" : "bg-ink-muted",
                    )}
                  />
                </li>
              ))}
            </ul>
          </div>

          <ul
            className="mt-12 grid items-stretch gap-4 lg:gap-6"
            style={{ gridTemplateColumns: `repeat(${display.length}, minmax(0, 1fr))` }}
          >
            {display.map((m, i) => (
              <li key={m._id} className="relative h-full">
                <Image
                  src={
                    i === 0
                      ? "/milestones/connector-active.svg"
                      : "/milestones/connector-inactive.svg"
                  }
                  alt=""
                  aria-hidden="true"
                  width={128}
                  height={27}
                  className="pointer-events-none absolute -top-[27px] left-1/2 z-10 h-[27px] w-32 -translate-x-1/2"
                />
                <Reveal delay={0.3 + i * 0.08} className="h-full">
                  <MilestoneCard milestone={m} active={i === 0} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile — horizontal scroll-snap, one card visible with peek */}
        <ScrollSnapRow
          ariaLabel="Heli Skycargo milestones timeline"
          className="gap-4 px-4 pb-4 md:hidden"
        >
          {display.map((m, i) => (
            <li key={m._id} className="w-72 shrink-0 snap-center sm:w-80">
              <Reveal delay={0.2 + i * 0.05}>
                <div className="mb-6 flex justify-center">
                  <span
                    className={cn(
                      "font-display text-4xl font-bold tracking-tight",
                      i === 0 ? "text-brand-red" : "text-ink",
                    )}
                  >
                    {m.year}
                  </span>
                </div>
                <div className="relative">
                  <Image
                    src={
                      i === 0
                        ? "/milestones/connector-active.svg"
                        : "/milestones/connector-inactive.svg"
                    }
                    alt=""
                    aria-hidden="true"
                    width={128}
                    height={27}
                    className="pointer-events-none absolute -top-[20px] left-1/2 z-10 h-[20px] w-24 -translate-x-1/2"
                  />
                  <MilestoneCard milestone={m} active={i === 0} />
                </div>
              </Reveal>
            </li>
          ))}
        </ScrollSnapRow>
      </Container>
    </Section>
  );
}

type MilestoneCardProps = {
  milestone: MilestoneRow;
  active: boolean;
};

function MilestoneCard({ milestone: m, active }: MilestoneCardProps) {
  const imageSrc = isPlaceholder(m)
    ? m.placeholderImage
    : urlFor(m.image).width(800).height(600).format("webp").quality(82).url();

  return (
    <article
      className={cn(
        // All 4 sides share the same color; top edge is 3px thick.
        "bg-surface flex h-full flex-col border border-t-[3px] transition-shadow",
        active ? "border-brand-red shadow-[0_0_10px_2px_rgba(0,0,0,0.07)]" : "border-[#f5f5f5]",
      )}
    >
      <div className="flex flex-1 flex-col items-center px-6 pt-6 pb-6 text-center">
        <h3 className="font-display text-ink text-xl leading-[36px] font-bold tracking-[0.48px] uppercase md:text-[24px]">
          {m.headline}
        </h3>
        <p className="font-body text-ink-soft mt-3 text-sm leading-[22px] md:text-[15px]">
          {m.description}
        </p>
      </div>
      <div className="relative mt-auto aspect-[366/270] w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={m.headline}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 25vw, 320px"
          className="object-cover"
        />
      </div>
    </article>
  );
}
