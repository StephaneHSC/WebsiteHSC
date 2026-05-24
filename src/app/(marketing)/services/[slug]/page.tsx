import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailHero } from "@/components/sections/service-detail/ServiceDetailHero";
import { ServiceOverview } from "@/components/sections/service-detail/ServiceOverview";
import { WhenToChoose } from "@/components/sections/service-detail/WhenToChoose";
import { ValueAddedGrid } from "@/components/sections/service-detail/ValueAddedGrid";
import { ProjectsMosaic } from "@/components/sections/_shared/ProjectsMosaic";
import { QuoteFormShell } from "@/components/sections/_shared/QuoteFormShell";
import { OfficesGlobal } from "@/components/sections/_shared/OfficesGlobal";
import { SERVICES, SHOWCASE_TILES, QUOTE_MODE_BY_SERVICE_SLUG } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";

type RouteParams = Promise<{ slug: string }>;

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return {};
  return pageMetadata({
    title: service.name,
    description: service.description,
    path: `/services/${service.slug}`,
  });
}

/**
 * Service Detail Page (M4). Hero → Overview → When-to-Choose → Value-Added
 * grid → Projects Showcase (filtered by service slug) → Quote Form Shell
 * → Offices. All content driven by the matching `Service` record in
 * `src/lib/constants.ts`.
 */
export default async function ServiceDetailPage({ params }: { params: RouteParams }) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <ServiceDetailHero service={service} />
      <ServiceOverview service={service} />
      <WhenToChoose service={service} />
      <ValueAddedGrid />
      {/*
        Pre-M7 legacy: service-detail renders the canonical 8-tile mosaic (no
        serviceSlug filter). The filter mechanism on `ProjectsMosaic` exists
        but wiring it on per service requires curated `relatedServices` data
        — punt to M9 polish.
      */}
      <ProjectsMosaic tiles={SHOWCASE_TILES.slice(0, 8)} />
      <div id="request-quote" className="scroll-mt-24">
        <QuoteFormShell
          photo={{
            src: "/quote/services-quote.webp",
            alt: "Antonov 124 freighter loading helicopter cargo at sunset",
          }}
          defaultMode={QUOTE_MODE_BY_SERVICE_SLUG[slug]}
        />
      </div>
      <OfficesGlobal />
    </main>
  );
}
