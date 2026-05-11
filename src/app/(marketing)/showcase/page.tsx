import type { Metadata } from "next";
import { ShowcaseHero } from "@/components/sections/showcase/ShowcaseHero";
import { ProjectsMosaic } from "@/components/sections/_shared/ProjectsMosaic";
import { QuoteFormShell } from "@/components/sections/_shared/QuoteFormShell";
import { OfficesGlobal } from "@/components/sections/_shared/OfficesGlobal";
import { SHOWCASE_GALLERY, SHOWCASE_TILES, type ShowcaseTile } from "@/lib/constants";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shipment Showcase",
  description:
    "Explore Heli Skycargo's past helicopter shipment projects across the globe — routes, aircraft, timelines, challenges, and outcomes.",
};

/**
 * /showcase-specific tile order: swap the canonical `china-guatemala` (idx 7,
 * `tall`) with `tile-video-1` (idx 8) in col3 so the column reads
 * khalifa → video-1 → china → video-3, and remap china to `medium` (494h)
 * per Figma `344:4887` so col3 ends flush with col0 / col1 / col2. The home
 * page keeps `SHOWCASE_TILES` untouched (china stays `tall` for the legacy
 * 4×2 brick).
 */
const SHOWCASE_PAGE_TILES: readonly ShowcaseTile[] = (() => {
  const arr = [...SHOWCASE_TILES];
  const china = SHOWCASE_TILES.find((t) => t.id === "china-guatemala")!;
  const video1 = SHOWCASE_TILES.find((t) => t.id === "tile-video-1")!;
  const chinaIdx = arr.findIndex((t) => t.id === "china-guatemala");
  const video1Idx = arr.findIndex((t) => t.id === "tile-video-1");
  arr[chinaIdx] = video1;
  arr[video1Idx] = { ...china, shape: "medium" };
  return arr;
})();

/**
 * /showcase — M7. Hero → 14-tile masonry with Load More + lightbox modal
 * → Quote form (USA office anchor) → Offices (USA featured).
 */
export default function ShowcasePage() {
  return (
    <main className="flex flex-1 flex-col">
      <ShowcaseHero />
      <ProjectsMosaic
        tiles={SHOWCASE_PAGE_TILES}
        showLoadMore
        initialDesktop={8}
        initialMobile={4}
        mobileMaxVisible={12}
        ctaHref={null}
        heading={{
          eyebrow: SHOWCASE_GALLERY.eyebrow,
          title: {
            pre: SHOWCASE_GALLERY.h2.pre,
            emphasis: SHOWCASE_GALLERY.h2.emphasis,
            post: SHOWCASE_GALLERY.h2.postDesktop,
            postMobile: SHOWCASE_GALLERY.h2.postMobile,
          },
        }}
      />
      <div id="request-quote" className="scroll-mt-24">
        <QuoteFormShell
          photo={{
            src: "/quote/services-quote.webp",
            alt: "Antonov 124 freighter loading helicopter cargo at sunset",
          }}
        />
      </div>
      <OfficesGlobal defaultActive="usa" />
    </main>
  );
}
