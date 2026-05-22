// SERVER COMPONENT — no "use client"
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { fetchWithCmsFallback } from "../_shared/cmsFallback";
import { milestonesQuery } from "@/lib/sanity/queries";
import type { Milestone } from "@/types/sanity";
import { MilestonesScroller } from "./MilestonesScroller";

type PlaceholderMilestone = {
  _id: string;
  year: number;
  headline: string;
  description: string;
  placeholderImage: string;
};

export type MilestoneRow = Milestone | PlaceholderMilestone;

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
  {
    _id: "p5",
    year: 2020,
    headline: "On the Road",
    description:
      "Heli Skycargo starts exhibiting at HAI Atlanta, European Rotors in Madrid, Spain and Verticon Anaheim.",
    placeholderImage: "/milestones/2020-on-the-road.webp",
  },
  {
    _id: "p6",
    year: 2019,
    headline: "On the Road",
    description:
      "Heli Skycargo starts exhibiting at HAI Atlanta, European Rotors in Madrid, Spain and Verticon Anaheim.",
    placeholderImage: "/milestones/2020-on-the-road.webp",
  },
  {
    _id: "p7",
    year: 2018,
    headline: "On the Road",
    description:
      "Heli Skycargo starts exhibiting at HAI Atlanta, European Rotors in Madrid, Spain and Verticon Anaheim.",
    placeholderImage: "/milestones/2020-on-the-road.webp",
  },
  {
    _id: "p8",
    year: 2017,
    headline: "On the Road",
    description:
      "Heli Skycargo starts exhibiting at HAI Atlanta, European Rotors in Madrid, Spain and Verticon Anaheim.",
    placeholderImage: "/milestones/2020-on-the-road.webp",
  },
];

export async function MilestonesTimeline() {
  const display = await fetchWithCmsFallback<Milestone, PlaceholderMilestone>(
    milestonesQuery,
    PLACEHOLDER_MILESTONES,
    4,
  );

  return (
    <Section tone="light" spacing="loose" className="relative overflow-visible">
      {/* Heading */}
      <Container className="overflow-visible">
        <div className="flex flex-col items-center gap-4 text-center">
          <Reveal>
            <SectionEyebrow variant="outline">Our Journey</SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-ink text-3xl leading-[1.1] font-semibold tracking-tight uppercase md:text-4xl lg:text-[54px] lg:leading-[64px] lg:tracking-[1.08px]">
              <span className="font-extrabold">Heli Skycargo</span> Milestones
            </h2>
          </Reveal>
        </div>
      </Container>

      {/* Client island — handles scroll ref + nav buttons */}
      <MilestonesScroller milestones={display} />
    </Section>
  );
}
