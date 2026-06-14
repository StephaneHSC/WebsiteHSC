"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { ShowcaseModal } from "@/components/sections/_shared/ShowcaseModal";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { SHOWCASE_TILES, type ShowcaseTile, type TileShape } from "@/lib/constants";
import type { ShowcaseGalleryImage } from "@/types/sanity";

const MOBILE_BATCH_INCREMENT = 4;
const GAP_PX_DESKTOP = 26;
const GAP_PX_MOBILE = 10;
const TILE_W_DESKTOP = 340;
const TILE_W_MOBILE = 186;

/**
 * Per-shape natural height in Figma pixel units. Drives both the flex-grow
 * weights (so tiles share their column's height proportionally) and the
 * outer aspect-ratio container (so every column ends at the same y across
 * every viewport, regardless of which tile shapes occupy them).
 */
const DESKTOP_WEIGHT: Record<TileShape, number> = {
  tall: 560,
  medium: 494,
  short: 300,
  "extra-short": 270,
};

const MOBILE_WEIGHT: Record<TileShape, number> = {
  tall: 280,
  medium: 330,
  // Mobile collapses `short` and `extra-short` to the same aspect — see M7_PLAN.md §3.2.2.
  short: 160,
  "extra-short": 160,
};

export type ProjectsMosaicHeading = {
  eyebrow?: string;
  title?: {
    pre: string;
    emphasis: string;
    post: string;
    /**
     * Optional alternate trailing text shown below the `md` breakpoint. The
     * /showcase page uses this so desktop reads " and More" while mobile
     * reads " & More" (Figma `344:4108` vs `505:6414`).
     */
    postMobile?: string;
  };
};

export type ProjectsMosaicProps = {
  /** Tile dataset. Defaults to all 14 entries in `SHOWCASE_TILES`. */
  tiles?: readonly ShowcaseTile[];
  /**
   * Optional mobile-only tile dataset. When provided, the 2-column mobile
   * masonry uses this array instead of `tiles` — useful when the mobile
   * Figma layout reorders tiles or substitutes per-tile fields (e.g. a
   * different image on /showcase mobile) without disturbing the desktop
   * column layout. Defaults to `tiles`.
   */
  mobileTiles?: readonly ShowcaseTile[];
  /**
   * Filter tiles by service slug. When set, only tiles whose
   * `relatedServices` contains the slug (or whose `relatedServices` is
   * undefined) are kept.
   */
  serviceSlug?: string;
  /** Initial visible tile count on desktop. Defaults to all tiles (no Load More). */
  initialDesktop?: number;
  /** Initial visible tile count on mobile. Defaults to all tiles (no Load More). */
  initialMobile?: number;
  /**
   * Cap on total visible tiles in the mobile masonry. Defaults to all tiles
   * (no cap). /showcase passes 12 so the last 2 tiles only appear at md+.
   */
  mobileMaxVisible?: number;
  /**
   * Whether to render a "Load More" pill below the grid. When true,
   * desktop reveals every remaining tile in a single click; mobile reveals
   * 4 tiles per click (clamped to `mobileMaxVisible`). The button hides
   * once that viewport's count reaches its max.
   */
  showLoadMore?: boolean;
  /**
   * URL for the bottom "View All Showcase" CTA. `null` hides the CTA — used
   * by /showcase since we're already there. Default `/showcase`.
   */
  ctaHref?: string | null;
  /** CTA label text. Defaults to "View All Showcase". */
  ctaLabel?: string;
  /** Override heading copy (eyebrow + mixed-weight title parts). */
  heading?: ProjectsMosaicHeading;
  /**
   * CMS gallery images keyed by showcase tile slug. Fetched server-side by
   * the parent page and passed here so the modal can render thumbnail strips
   * without a client-side Sanity fetch.
   */
  galleries?: Record<string, ShowcaseGalleryImage[]>;
};

const DEFAULT_HEADING: Required<ProjectsMosaicHeading> = {
  eyebrow: "Case Visuals",
  title: { pre: "Some of ", emphasis: "Our Projects", post: " and More", postMobile: " & More" },
};

/**
 * Project showcase mosaic — column-based masonry driven by per-tile
 * `desktopColumn` / `mobileColumn` / `shape`. Used on the home page,
 * every service-detail page, and the M7 `/showcase` listing page.
 *
 * Defaults preserve the legacy 4×2 home brick (slice `SHOWCASE_TILES[0..7]`,
 * desktopColumn 0,0,1,1,2,2,3,3 producing tall|short|short|tall|tall|short|short|tall).
 *
 * The modal lives inside this component so every consumer (home, service-
 * detail, /showcase) has clickable tiles + lightbox for free.
 */
export function ProjectsMosaic({
  tiles = SHOWCASE_TILES,
  mobileTiles: mobileTilesProp,
  serviceSlug,
  initialDesktop,
  initialMobile,
  mobileMaxVisible,
  showLoadMore = false,
  ctaHref = "/showcase",
  ctaLabel = "View All Showcase",
  heading,
  galleries,
}: ProjectsMosaicProps) {
  const filteredTiles = useMemo(() => {
    if (!serviceSlug) return tiles;
    const matched = tiles.filter(
      (t) => t.relatedServices === undefined || t.relatedServices.includes(serviceSlug),
    );
    // Recycle round-robin to a minimum of 8 tiles to keep the bento full
    // (M4 decision — see DECISIONS.md 2026-05-06).
    if (matched.length === 0) return tiles.slice(0, 8);
    if (matched.length >= 8) return matched;
    const recycled: ShowcaseTile[] = [];
    for (let i = 0; i < 8; i++) recycled.push(matched[i % matched.length]!);
    return recycled;
  }, [tiles, serviceSlug]);

  // When a mobile-specific array is supplied, run it through the same
  // service-slug filter so detail pages get consistent behavior across
  // viewports. Otherwise fall back to the desktop-filtered list.
  const filteredMobileTiles = useMemo(() => {
    const source = mobileTilesProp ?? tiles;
    if (!serviceSlug) return source;
    const matched = source.filter(
      (t) => t.relatedServices === undefined || t.relatedServices.includes(serviceSlug),
    );
    if (matched.length === 0) return source.slice(0, 8);
    if (matched.length >= 8) return matched;
    const recycled: ShowcaseTile[] = [];
    for (let i = 0; i < 8; i++) recycled.push(matched[i % matched.length]!);
    return recycled;
  }, [mobileTilesProp, tiles, serviceSlug]);

  const total = filteredTiles.length;
  const mobileSourceTotal = filteredMobileTiles.length;
  const mobileTotal = Math.min(mobileMaxVisible ?? mobileSourceTotal, mobileSourceTotal);
  const initDesktop = Math.min(initialDesktop ?? total, total);
  const initMobile = Math.min(initialMobile ?? mobileTotal, mobileTotal);

  const [desktopVisible, setDesktopVisible] = useState(initDesktop);
  const [mobileVisible, setMobileVisible] = useState(initMobile);
  const [activeTile, setActiveTile] = useState<ShowcaseTile | null>(null);

  const headingCopy = {
    eyebrow: heading?.eyebrow ?? DEFAULT_HEADING.eyebrow,
    title: heading?.title ?? DEFAULT_HEADING.title,
  };

  const desktopTiles = filteredTiles.slice(0, desktopVisible);
  const mobileTiles = filteredMobileTiles.slice(0, mobileVisible);

  const desktopColumns: ShowcaseTile[][] = [[], [], [], []];
  for (const tile of desktopTiles) desktopColumns[tile.desktopColumn]!.push(tile);

  const mobileColumns: ShowcaseTile[][] = [[], []];
  for (const tile of mobileTiles) mobileColumns[tile.mobileColumn]!.push(tile);

  // Outer aspect ratio = total-row-width / tallest-column-height in Figma
  // units. Drives equal column heights at every viewport: the flex container
  // resolves to (parent width) × (max_col_h / row_w), each column stretches
  // to that height via `align-items: stretch`, and tile flex-grow inside
  // each column splits the height proportional to the per-shape weight.
  const desktopMaxColWeight = Math.max(
    1,
    ...desktopColumns.map((c) => {
      if (c.length === 0) return 0;
      const w = c.reduce((s, t) => s + DESKTOP_WEIGHT[t.shape], 0);
      return w + (c.length - 1) * GAP_PX_DESKTOP;
    }),
  );
  const desktopAspect = `${4 * TILE_W_DESKTOP + 3 * GAP_PX_DESKTOP} / ${desktopMaxColWeight}`;

  const mobileMaxColWeight = Math.max(
    1,
    ...mobileColumns.map((c) => {
      if (c.length === 0) return 0;
      const w = c.reduce((s, t) => s + MOBILE_WEIGHT[t.shape], 0);
      return w + (c.length - 1) * GAP_PX_MOBILE;
    }),
  );
  const mobileAspect = `${2 * TILE_W_MOBILE + GAP_PX_MOBILE} / ${mobileMaxColWeight}`;

  const desktopHasMore = desktopVisible < total;
  const mobileHasMore = mobileVisible < mobileTotal;
  const showLoadMoreDesktop = showLoadMore && desktopHasMore;
  const showLoadMoreMobile = showLoadMore && mobileHasMore;

  return (
    <Section tone="alt" spacing="loose" className="overflow-hidden">
      <Container>
        <div className="flex flex-col items-center gap-4 text-center">
          <Reveal>
            <SectionEyebrow variant="gray">{headingCopy.eyebrow}</SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            {/* Mobile uses a smaller H2 size + nowrap so the line fits in 375px
                (Figma 505:6417 — width 384, ~17px tall). md/lg unchanged. */}
            <h2 className="font-display text-ink text-[20px] leading-[1.1] font-bold tracking-tight whitespace-nowrap uppercase md:text-4xl md:whitespace-normal lg:text-5xl">
              {headingCopy.title.pre}
              <span className="font-black">{headingCopy.title.emphasis}</span>
              {headingCopy.title.postMobile ? (
                <>
                  <span className="md:hidden">{headingCopy.title.postMobile}</span>
                  <span className="hidden md:inline">{headingCopy.title.post}</span>
                </>
              ) : (
                headingCopy.title.post
              )}
            </h2>
          </Reveal>
        </div>
      </Container>

      <Container className="mt-12 lg:mt-16">
        {/* Desktop / tablet: 4-column masonry — visible at md+. Aspect-ratio
            on the outer flex container makes every column the same height at
            every viewport; tile flex-grow inside each column splits that
            height in proportion to each shape's natural weight. */}
        <div
          className="hidden gap-[26px] md:flex md:items-stretch"
          style={{ aspectRatio: desktopAspect }}
        >
          {desktopColumns.map((column, colIdx) => (
            <div key={`d-col-${colIdx}`} className="flex flex-1 flex-col gap-[26px]">
              {column.map((tile) => {
                const tileIdx = filteredTiles.indexOf(tile);
                return (
                  <Reveal
                    key={tile.id}
                    delay={tileIdx < initDesktop ? 0.2 + tileIdx * 0.05 : 0}
                    className="min-h-0"
                    style={{
                      flexGrow: DESKTOP_WEIGHT[tile.shape],
                      flexShrink: 0,
                      flexBasis: 0,
                    }}
                  >
                    <Tile tile={tile} viewport="desktop" onOpen={() => setActiveTile(tile)} />
                  </Reveal>
                );
              })}
            </div>
          ))}
        </div>

        {/* Mobile: 2-column masonry — same equal-column technique as desktop. */}
        <div className="flex gap-[10px] md:hidden" style={{ aspectRatio: mobileAspect }}>
          {mobileColumns.map((column, colIdx) => (
            <div key={`m-col-${colIdx}`} className="flex flex-1 flex-col gap-[10px]">
              {column.map((tile) => {
                const tileIdx = filteredMobileTiles.indexOf(tile);
                return (
                  <Reveal
                    key={tile.id}
                    delay={tileIdx < initMobile ? 0.1 + tileIdx * 0.05 : 0}
                    className="min-h-0"
                    style={{
                      flexGrow: MOBILE_WEIGHT[tile.shape],
                      flexShrink: 0,
                      flexBasis: 0,
                    }}
                  >
                    <Tile tile={tile} viewport="mobile" onOpen={() => setActiveTile(tile)} />
                  </Reveal>
                );
              })}
            </div>
          ))}
        </div>

        {/* Load More pill — separate per breakpoint so each viewport hides
            its button as soon as that viewport's `displayedCount >= total`. */}
        {showLoadMoreMobile ? (
          <Reveal delay={0.2} className="mt-8 flex justify-center md:hidden">
            <button
              type="button"
              onClick={() =>
                setMobileVisible((v) => Math.min(mobileTotal, v + MOBILE_BATCH_INCREMENT))
              }
              className="border-input-border text-ink font-body focus-visible:ring-brand-red inline-flex items-center justify-center rounded-[30px] border bg-white px-5 py-2.5 text-[12px] font-bold tracking-[0.72px] capitalize transition hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Loading More...
            </button>
          </Reveal>
        ) : null}
        {showLoadMoreDesktop ? (
          <Reveal delay={0.2} className="mt-12 hidden justify-center md:flex">
            <button
              type="button"
              onClick={() => setDesktopVisible(total)}
              className="text-ink font-body focus-visible:ring-brand-red inline-flex items-center justify-center rounded-[30px] bg-white px-[30px] py-[10px] text-[14px] font-bold tracking-[0.84px] capitalize transition hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Loading More...
            </button>
          </Reveal>
        ) : null}

        {ctaHref ? (
          <Reveal delay={0.7} className="mt-12 flex justify-center">
            <Link
              href={ctaHref}
              className={cn(
                buttonVariants({ variant: "secondary", size: "md" }),
                "border-ink/15 border hover:scale-[1.02]",
              )}
            >
              {ctaLabel}
            </Link>
          </Reveal>
        ) : null}
      </Container>

      <ShowcaseModal
        tile={activeTile}
        onClose={() => setActiveTile(null)}
        galleryImages={activeTile ? (galleries?.[activeTile.id] ?? undefined) : undefined}
      />
    </Section>
  );
}

type TileProps = {
  tile: ShowcaseTile;
  viewport: "desktop" | "mobile";
  onOpen: () => void;
};

function Tile({ tile, viewport, onOpen }: TileProps) {
  const hasLabel = tile.label && tile.label.length > 0;
  const dimAlpha = tile.id === "japan-desk" ? "bg-ink/40" : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={tile.modal?.title ?? tile.alt}
      className={cn(
        "group focus-visible:ring-brand-red relative block h-full w-full overflow-hidden rounded-[10px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      <Image
        src={tile.src}
        alt={tile.alt}
        fill
        sizes="(min-width: 1024px) 25vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        style={tile.objectPosition ? { objectPosition: tile.objectPosition } : undefined}
      />

      {dimAlpha ? <span aria-hidden="true" className={cn("absolute inset-0", dimAlpha)} /> : null}

      {hasLabel ? (
        <span
          aria-hidden="true"
          className="from-ink/0 via-ink/30 to-ink/65 group-hover:from-ink/10 group-hover:to-ink/75 absolute inset-0 bg-gradient-to-b transition-opacity duration-300"
        />
      ) : null}

      {tile.hasPlayIcon ? (
        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/showcase/icon-play.svg"
            alt=""
            width={113}
            height={113}
            className={cn(
              "transition-transform duration-300 group-hover:scale-[1.1]",
              viewport === "desktop"
                ? "h-[88px] w-[88px] lg:h-[113px] lg:w-[113px]"
                : "h-[60px] w-[60px]",
            )}
          />
        </span>
      ) : null}

      {hasLabel ? (
        <span className="text-surface absolute right-0 bottom-0 left-0 px-3 pb-3 text-left md:px-4 md:pb-4 lg:px-5 lg:pb-5">
          <span
            className={cn(
              "font-display block font-extrabold tracking-tight uppercase",
              viewport === "desktop"
                ? "text-[18px] leading-[22px] md:text-[20px] md:leading-[24px] lg:text-[26px] lg:leading-[32px] xl:text-[32px] xl:leading-[38px] 2xl:text-[40px] 2xl:leading-[48px]"
                : "text-[20px] leading-[24px] sm:text-2xl",
            )}
          >
            {(tile.label ?? []).map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </span>
        </span>
      ) : null}
    </button>
  );
}
