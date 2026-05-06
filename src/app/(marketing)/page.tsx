import { Hero } from "@/components/sections/home/Hero";
import { OurSolutions } from "@/components/sections/home/OurSolutions";
import { VideoSection } from "@/components/sections/home/VideoSection";
import { SmartTracking } from "@/components/sections/home/SmartTracking";
import { ServicesTeaser } from "@/components/sections/home/ServicesTeaser";
import { TeamTeaser } from "@/components/sections/home/TeamTeaser";
import { PartnersStrip } from "@/components/sections/home/PartnersStrip";
import { CustomerTestimonials } from "@/components/sections/home/CustomerTestimonials";
import { ProjectsMosaic } from "@/components/sections/home/ProjectsMosaic";
import { MilestonesTimeline } from "@/components/sections/home/MilestonesTimeline";
import { RequestQuoteCta } from "@/components/sections/home/RequestQuoteCta";
import { OfficesGlobal } from "@/components/sections/home/OfficesGlobal";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <OurSolutions />
      <VideoSection />
      <SmartTracking />
      <ServicesTeaser />
      <TeamTeaser />
      <PartnersStrip />
      <CustomerTestimonials />
      <ProjectsMosaic />
      <MilestonesTimeline />
      <RequestQuoteCta />
      <OfficesGlobal />
    </main>
  );
}
