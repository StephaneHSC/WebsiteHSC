import type { Metadata } from "next";
import { client } from "@/lib/sanity/client";
import { quoteFormConfigQuery } from "@/lib/sanity/queries";
import type { QuoteFormConfig } from "@/types/sanity";
import { urlFor } from "@/lib/sanity/image";
import { QUOTE_TRANSPORT_MODES } from "@/lib/constants";
import type { QuoteFormPrefill, TransportMode } from "@/types/quoteForm";
import { QuoteHero } from "@/components/sections/quote/QuoteHero";
import { QuoteFormCore } from "@/components/sections/quote/QuoteFormCore";
import { QuoteFormEmbedded } from "@/components/sections/quote/QuoteFormEmbedded";
import { QuoteFormDisabled } from "@/components/sections/quote/QuoteFormDisabled";
import { OfficesGlobal } from "@/components/sections/_shared/OfficesGlobal";
import { Reveal } from "@/components/sections/_shared/Reveal";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Tell us about your helicopter shipment — origin, destination, aircraft, and timeline. Our ops team replies within 24 hours.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function pickOne(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePrefill(params: SearchParams): QuoteFormPrefill {
  const prefill: QuoteFormPrefill = {};
  const mode = pickOne(params, "mode");
  if (mode && (QUOTE_TRANSPORT_MODES as readonly string[]).includes(mode)) {
    prefill.mode = mode as TransportMode;
  }
  const origin = pickOne(params, "origin")?.slice(0, 200);
  const destination = pickOne(params, "destination")?.slice(0, 200);
  if (origin || destination) {
    prefill.routes = [{ origin: origin ?? "", destination: destination ?? "" }];
  }
  const company = pickOne(params, "company")?.slice(0, 200);
  if (company) prefill.companyName = company;
  const email = pickOne(params, "email");
  if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) prefill.email = email;
  return prefill;
}

export default async function QuotePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const config = await client.fetch<QuoteFormConfig | null>(
    quoteFormConfigQuery,
    {},
    { next: { revalidate: 60 } },
  );
  const prefill = parsePrefill(sp);

  const heroHeadline = config?.hero_headline?.trim() || null;
  const heroImageSrc = config?.hero_image
    ? urlFor(config.hero_image).width(2400).format("webp").quality(85).url()
    : null;

  const formEnabled = config?.form_enabled !== false; // default true
  const formMode = config?.form_mode ?? "custom";

  return (
    <main className="flex flex-1 flex-col">
      <QuoteHero cmsHeadline={heroHeadline} imageSrc={heroImageSrc} />

      <section
        id="request-quote"
        className="bg-surface relative scroll-mt-24 py-[40px] lg:py-[80px]"
      >
        <div className="mx-auto w-full max-w-[1196px] px-[16px] lg:px-0">
          <Reveal>
            <h2 className="font-display text-ink mb-[16px] text-center text-[24px] leading-[1.2] font-bold uppercase lg:mb-[40px] lg:px-[78px] lg:text-left lg:text-[50px] lg:leading-[64px]">
              Request a Quote
            </h2>
          </Reveal>
          <div className="bg-surface shadow-[0_0_2px_rgba(0,0,0,0.09)] lg:shadow-[0_0_6px_rgba(0,0,0,0.09)]">
            <div className="px-[24px] py-[32px] lg:px-[78px] lg:py-[60px]">
              {!formEnabled ? (
                <QuoteFormDisabled
                  message={
                    config?.success_message?.trim() ||
                    "Quote requests are temporarily paused. Please email info@heliskycargo.com directly."
                  }
                />
              ) : formMode === "embed" ? (
                <QuoteFormEmbedded code={config?.form_embed_code} />
              ) : (
                <QuoteFormCore variant="standalone" config={config ?? null} prefill={prefill} />
              )}
            </div>
          </div>
        </div>
      </section>

      <OfficesGlobal defaultActive="uae" />
    </main>
  );
}
