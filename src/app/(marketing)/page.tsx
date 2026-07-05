import { Hero2 } from "@/components/sections/home/Hero2";
import { OurSolutions } from "@/components/sections/home/OurSolutions";
import { VideoSection } from "@/components/sections/home/VideoSection";
import { SmartTracking } from "@/components/sections/home/SmartTracking";
import { ServicesTeaser } from "@/components/sections/home/ServicesTeaser";
import { TeamTeaser } from "@/components/sections/home/TeamTeaser";
import { PartnersStrip } from "@/components/sections/home/PartnersStrip";
import { CustomerTestimonials } from "@/components/sections/home/CustomerTestimonials";
import { ProjectsMosaic } from "@/components/sections/_shared/ProjectsMosaic";
import { SHOWCASE_TILES } from "@/lib/constants";
import { MilestonesTimeline } from "@/components/sections/home/MilestonesTimeline";
import { client } from "@/lib/sanity/client";
import { allShowcaseGalleriesQuery } from "@/lib/sanity/queries";
import type { ShowcaseItemGallery } from "@/types/sanity";
import { QuoteFormShell } from "@/components/sections/_shared/QuoteFormShell";
import { OfficesGlobal } from "@/components/sections/_shared/OfficesGlobal";

export default async function Home() {
  const galleryDocs = await client.fetch<ShowcaseItemGallery[]>(allShowcaseGalleriesQuery);
  const galleries = Object.fromEntries(galleryDocs.map((doc) => [doc.slug, doc.gallery_images]));

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
      <ProjectsMosaic
        tiles={SHOWCASE_TILES.slice(0, 8)}
        mobileMaxVisible={4}
        galleries={galleries}
      />
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
