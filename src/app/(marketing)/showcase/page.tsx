import { ShowcaseHero } from "@/components/sections/showcase/ShowcaseHero";
import { ProjectsMosaic } from "@/components/sections/_shared/ProjectsMosaic";
import { QuoteFormShell } from "@/components/sections/_shared/QuoteFormShell";
import { OfficesGlobal } from "@/components/sections/_shared/OfficesGlobal";
import { SHOWCASE_GALLERY, SHOWCASE_TILES, type ShowcaseTile } from "@/lib/constants";
import { pageMetadata } from "@/lib/seo";
import { getShowcaseData } from "@/lib/showcase";

export const revalidate = 60;

export const metadata = pageMetadata({
  title: "Shipment Showcase",
  description:
    "Explore Heli Skycargo's past helicopter shipment projects across the globe — routes, aircraft, timelines, challenges, and outcomes.",
  path: "/showcase",
});

/**
 * /showcase-specific desktop tile order: swap `china-guatemala` (idx 7,
 * `tall`) with `tile-video-1` (idx 8) in col3 so the column reads
 * khalifa → video-1 → china → video-3, remap china to `medium` (494h) per
 * Figma `344:4887` so col3 ends flush, and substitute the dockside
 * Switzerland → India photo (Figma `344:4058`) which differs from the
 * home-page tile. The home page keeps `SHOWCASE_TILES` untouched.
 */
const SHOWCASE_PAGE_TILES: readonly ShowcaseTile[] = (() => {
  const arr = [...SHOWCASE_TILES];
  const china = SHOWCASE_TILES.find((t) => t.id === "china-guatemala")!;
  const video1 = SHOWCASE_TILES.find((t) => t.id === "tile-video-1")!;
  const chinaIdx = arr.findIndex((t) => t.id === "china-guatemala");
  const video1Idx = arr.findIndex((t) => t.id === "tile-video-1");
  arr[chinaIdx] = video1;
  arr[video1Idx] = { ...china, shape: "medium" };

  // /showcase shows a different Switzerland → India photo per Figma
  // `344:4058` (wrapped helicopter dockside) — home + service-detail keep
  // the original. The modal's media carousel is preserved unchanged.
  const switzIdx = arr.findIndex((t) => t.id === "switzerland-india");
  const switz = arr[switzIdx]!;
  arr[switzIdx] = { ...switz, src: "/showcase/switzerland-to-india-showcase.webp" };
  return arr;
})();

/**
 * /showcase mobile-only tile order per Figma `505:6412` (430px-wide mosaic).
 * The desktop array above is iterated left-to-right inside each column, but
 * mobile needs a different weave so the play-icon video tile lands in col 1
 * row 3 (between Belgium and Khalifa Port) instead of falling at the end of
 * col 0. Figma shows 11 tiles in the "before Load More" state; all 14 are
 * still reachable via Load More to keep parity with desktop.
 *
 * Iteration order determines within-column row order (push order):
 * - col 0 (7 tiles) → switz, loading1, myanmar, tile9, video2, video3, tile13
 * - col 1 (7 tiles) → japan, belgium, video1, khalifa, loading2, china, tile11
 *
 * Mobile-only field overrides (mobileColumn / shape / src) go here so the
 * desktop layout — which the dev considers correct — is untouched.
 */
const SHOWCASE_PAGE_MOBILE_TILES: readonly ShowcaseTile[] = (() => {
  const byId = (id: string) => {
    const t = SHOWCASE_PAGE_TILES.find((x) => x.id === id);
    if (!t) throw new Error(`Missing tile id: ${id}`);
    return t;
  };
  const switz = byId("switzerland-india");
  const loading1 = byId("loading-1");
  const japan = byId("japan-desk");
  const belgium = byId("belgium-cameroon");
  const myanmar = byId("myanmar-gabon");
  const loading2 = byId("loading-2");
  const khalifa = byId("khalifa-port");
  const video1 = byId("tile-video-1");
  const china = byId("china-guatemala");
  const tile9 = byId("tile-9");
  const video2 = byId("tile-video-2");
  const tile11 = byId("tile-11");
  const video3 = byId("tile-video-3");
  const tile13 = byId("tile-13");
  // Mobile-only column re-assignments so the masonry matches Figma `505:6412`:
  //   tile-video-1 → col 1 (Figma col 1 row 3 — short, play icon)
  //   tile-11      → col 0 (Figma col 0 row 4 — tall, no label, man-with-back)
  //   tile-13      → col 0 (Figma col 0 row 5 — short no label)
  const video1Mobile: ShowcaseTile = { ...video1, mobileColumn: 1 };
  const tile11Mobile: ShowcaseTile = { ...tile11, mobileColumn: 0 };
  const tile13Mobile: ShowcaseTile = { ...tile13, mobileColumn: 0 };
  // Iteration order below alternates pushes so per-column row order matches
  // Figma exactly. Resulting columns (both = 7 tiles):
  //   col 0: switz, loading1, myanmar, tile-11, tile-13, tile-9, video-2
  //   col 1: japan, belgium, video-1, khalifa, loading2, china, video-3
  // The first 11 tiles reproduce the Figma "before Load More" state; the
  // remaining 3 (tile-9, video-2, video-3) appear after subsequent clicks.
  return [
    switz,
    japan,
    loading1,
    belgium,
    myanmar,
    video1Mobile,
    tile11Mobile,
    khalifa,
    tile13Mobile,
    loading2,
    tile9,
    china,
    video2,
    video3,
  ];
})();

/**
 * /showcase — M7. Hero → 14-tile masonry with Load More + lightbox modal
 * → Quote form (USA office anchor) → Offices (USA featured).
 */
export default async function ShowcasePage() {
  const { tiles, galleries, fromCms } = await getShowcaseData();
  // CMS tiles drive their own order (the `order` field) and columns; the
  // bespoke Figma reorder below only applies to the hardcoded fallback set.
  const desktopTiles = fromCms ? tiles : SHOWCASE_PAGE_TILES;
  const mobileTiles = fromCms ? undefined : SHOWCASE_PAGE_MOBILE_TILES;
  const mobileMax = fromCms ? tiles.length : SHOWCASE_PAGE_MOBILE_TILES.length;

  return (
    <main className="flex flex-1 flex-col">
      <ShowcaseHero />
      <ProjectsMosaic
        tiles={desktopTiles}
        mobileTiles={mobileTiles}
        showLoadMore
        initialDesktop={8}
        initialMobile={4}
        mobileMaxVisible={mobileMax}
        ctaHref={null}
        galleries={galleries}
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
