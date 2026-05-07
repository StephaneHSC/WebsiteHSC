import type { Metadata } from "next";
import { WhyChooseHero } from "@/components/sections/why-choose/WhyChooseHero";
import { GlobalReachCallout } from "@/components/sections/why-choose/GlobalReachCallout";
import { StatsBand } from "@/components/sections/_shared/StatsBand";
import { IntroPhotoBand } from "@/components/sections/why-choose/IntroPhotoBand";
import { FeatureBlock } from "@/components/sections/why-choose/FeatureBlock";
import { TrackabilityCallout } from "@/components/sections/why-choose/TrackabilityCallout";
import { OfficesGlobal } from "@/components/sections/_shared/OfficesGlobal";
import { QuoteFormShell } from "@/components/sections/_shared/QuoteFormShell";
import { WHY_CHOOSE_FEATURE_BLOCKS } from "@/lib/constants";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Why Choose Heli Skycargo",
  description:
    "Bespoke helicopter shipping with global reach, dedicated specialists, and end-to-end tracking. Tailored logistics solutions built around your aircraft.",
};

/**
 * /why-choose-us — M5. Hero → Global Reach → Stats → Intro photo band →
 * Feature blocks (Seamless image-left, Tailored image-right) → Trackability
 * red callout → Offices (Hong Kong featured) → Quote form.
 */
export default function WhyChooseUsPage() {
  return (
    <main className="flex flex-1 flex-col">
      <WhyChooseHero />
      <GlobalReachCallout />
      <StatsBand />
      <IntroPhotoBand />
      {WHY_CHOOSE_FEATURE_BLOCKS.map((block, i) => (
        <FeatureBlock key={i} block={block} />
      ))}
      <TrackabilityCallout />
      <div id="request-quote" className="scroll-mt-24">
        <QuoteFormShell
          photo={{
            src: "/quote/services-quote.webp",
            alt: "Antonov 124 freighter loading helicopter cargo at sunset",
          }}
        />
      </div>
      <OfficesGlobal defaultActive="hk" />
    </main>
  );
}
