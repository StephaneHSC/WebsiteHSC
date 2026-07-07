import { Hero2 } from "@/components/sections/home/Hero2";
import { OurSolutions } from "@/components/sections/home/OurSolutions";
import { VideoSection } from "@/components/sections/home/VideoSection";
import { SmartTracking } from "@/components/sections/home/SmartTracking";
import { ServicesTeaser } from "@/components/sections/home/ServicesTeaser";
import { TeamTeaser } from "@/components/sections/home/TeamTeaser";
import { PartnersStrip } from "@/components/sections/home/PartnersStrip";
import { CustomerTestimonials } from "@/components/sections/home/CustomerTestimonials";
import { ProjectsMosaic } from "@/components/sections/_shared/ProjectsMosaic";
import { MilestonesTimeline } from "@/components/sections/home/MilestonesTimeline";
import { getShowcaseData } from "@/lib/showcase";
import { QuoteFormShell } from "@/components/sections/_shared/QuoteFormShell";
import { OfficesGlobal } from "@/components/sections/_shared/OfficesGlobal";

export default async function Home() {
  const { tiles, galleries } = await getShowcaseData();

  return (
    <main className="flex flex-1 flex-col">
      <Hero2 />
      <OurSolutions />
      <VideoSection />
      <SmartTracking />
      <ServicesTeaser />
      <TeamTeaser />
      <PartnersStrip />
      <CustomerTestimonials />
      {/* Mobile caps at 4 (a 2x2 preview per Figma home-mobile spec); desktop
          renders the full 8-tile bento. */}
      <ProjectsMosaic tiles={tiles.slice(0, 8)} mobileMaxVisible={4} galleries={galleries} />
      <MilestonesTimeline />
      <div id="request-quote" className="scroll-mt-24">
        <QuoteFormShell
          tinted
          photo={{
            src: "/quote/home-quote.webp",
            alt: "Southern Air freight truck and helicopter on the tarmac",
          }}
        />
      </div>
      <OfficesGlobal />
    </main>
  );
}
