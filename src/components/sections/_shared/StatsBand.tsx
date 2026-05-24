import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { client } from "@/lib/sanity/client";
import { siteStatsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import { PLACEHOLDER_SITE_STATS, STAT_DESCRIPTIONS } from "@/lib/constants";
import type { SanityImage, SiteStats } from "@/types/sanity";
import { cn } from "@/lib/utils";

/**
 * Stats KPI band. Used by /why-choose-us today; promoted to `_shared/` so the
 * home page can reuse it later (CMS_SCHEMAS §5: siteStats is "reusable on Home
 * page"). Reads `siteStatsQuery` server-side and falls back to
 * `PLACEHOLDER_SITE_STATS` when Sanity is empty.
 *
 * Layout: 4-up row at >=lg, 2x2 grid <lg, with 1px dividers between cells.
 */
export async function StatsBand({ className }: { className?: string }) {
  // TODO(seed): drop the placeholder fallback once Sanity is populated via
  // `npm run seed:sanity`.
  const doc = await client.fetch<SiteStats | null>(
    siteStatsQuery,
    {},
    { next: { revalidate: 60 } },
  );
  const stats: readonly StatRow[] =
    doc?.stats && doc.stats.length > 0
      ? doc.stats.map((s) => ({ value: s.value, label: s.label, icon: s.icon }))
      : PLACEHOLDER_SITE_STATS.map((s) => ({ value: s.value, label: s.label }));

  if (stats.length === 0) return null;

  // Default 4-stat Figma layout: mobile reads `50+, 1000+, 24/7, 2014` (2×2
  // with the CSS-order reorder hack below), desktop reads `1000+, 24/7, 50+,
  // 2014` in DOM order. The schema warns on non-4 counts but doesn't block;
  // if an editor publishes a different count, fall back to a safe generic
  // layout (vertical stack on mobile, N-column row on desktop) so the band
  // never breaks visually.
  const isFourStatLayout = stats.length === 4;

  const fourStatCellLayout = (i: number): { order: string; borders: string } => {
    switch (i) {
      // Index 0 — `1000+`: mobile pos 2 (top-right), desktop pos 1.
      case 0:
        return { order: "order-2 lg:order-1", borders: "border-l lg:border-l-0" };
      // Index 1 — `24/7`: mobile pos 3 (bottom-left), desktop pos 2.
      case 1:
        return { order: "order-3 lg:order-2", borders: "border-t lg:border-t-0 lg:border-l" };
      // Index 2 — `50+`: mobile pos 1 (top-left), desktop pos 3.
      case 2:
        return { order: "order-1 lg:order-3", borders: "lg:border-l" };
      // Index 3 — `2014`: mobile pos 4 (bottom-right), desktop pos 4.
      case 3:
        return { order: "order-4", borders: "border-t border-l lg:border-t-0" };
      default:
        return { order: "", borders: "" };
    }
  };

  // Static class map so Tailwind JIT keeps these in the bundle. Counts outside
  // 1–6 fall through to the 4-col grid (cells wrap naturally).
  const genericLgColsByCount: Record<number, string> = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  };

  const gridColsClass = isFourStatLayout
    ? "grid-cols-2 lg:grid-cols-4"
    : cn("grid-cols-1", genericLgColsByCount[stats.length] ?? "lg:grid-cols-4");

  return (
    <section className={cn("bg-surface w-full", className)}>
      <Container>
        {/*
         * At lg+ the band sits inside the Figma hero "content" frame width
         * (1045px), centered. Mobile stays edge-to-edge so the 2×2 grid still
         * fills the screen.
         */}
        <div role="list" className={cn("grid lg:mx-auto lg:max-w-[1045px]", gridColsClass)}>
          {stats.map((stat, i) => {
            const { order, borders } = isFourStatLayout
              ? fourStatCellLayout(i)
              : {
                  order: "",
                  // Mobile (1-col): top divider between rows. Desktop (row):
                  // left divider between cells. Skip on the first cell.
                  borders: i === 0 ? "" : "border-t lg:border-t-0 lg:border-l",
                };
            return (
              <Reveal
                key={`${stat.label}-${i}`}
                delay={Math.min(i * 0.05, 0.2)}
                role="listitem"
                className={cn("border-border", order, borders)}
              >
                <StatCell stat={stat} />
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

type StatRow = { value: string; label: string; icon?: SanityImage };

function StatCell({ stat }: { stat: StatRow }) {
  const description = STAT_DESCRIPTIONS[stat.label];
  const iconUrl = stat.icon?.asset?._ref
    ? urlFor(stat.icon).width(96).height(96).fit("max").format("webp").quality(82).url()
    : null;
  return (
    <div className="flex h-full flex-col px-4 py-6 md:px-5 md:py-8 lg:px-5 lg:py-10">
      <p className="font-display text-ink text-[12px] leading-[16px] font-bold tracking-[0.06em] uppercase md:leading-[20px]">
        {stat.label}
      </p>
      {iconUrl ? (
        <Image
          src={iconUrl}
          alt=""
          width={48}
          height={48}
          className="mt-3 h-10 w-10 object-contain md:h-12 md:w-12"
        />
      ) : null}
      <p
        className={cn(
          "font-display text-ink mt-2 font-black tabular-nums",
          "text-[36px] leading-[40px] md:text-[40px] md:leading-[44px] lg:text-[48px] lg:leading-[48px]",
        )}
      >
        {stat.value}
      </p>
      {description ? (
        <p className="font-body text-ink mt-3 text-[12px] leading-[16px] md:text-[13px] md:leading-[18px]">
          {description[0]}
          <br />
          {description[1]}
        </p>
      ) : null}
    </div>
  );
}
