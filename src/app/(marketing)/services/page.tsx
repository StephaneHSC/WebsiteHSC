import type { Metadata } from "next";
import { ServicesHero } from "@/components/sections/services/ServicesHero";
import { ServicesGrid } from "@/components/sections/services/ServicesGrid";
import { ValueAddedAccordion } from "@/components/sections/services/ValueAddedAccordion";
import { QuoteFormShell } from "@/components/sections/_shared/QuoteFormShell";
import { OfficesGlobal } from "@/components/sections/_shared/OfficesGlobal";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "End-to-end helicopter logistics — ocean Ro/Ro, Lo/Lo, FCL, road freight, air commercial and air charter — with eight value-added services to support every shipment.",
};

export default function ServicesPage() {
  return (
    <main className="flex flex-1 flex-col">
      <ServicesHero />
      <ServicesGrid />
      <ValueAddedAccordion />
      <QuoteFormShell
        photo={{
          src: "/quote/services-quote.webp",
          alt: "Antonov 124 freighter loading helicopter cargo at sunset",
        }}
      />
      <OfficesGlobal />
    </main>
  );
}
