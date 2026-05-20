import { Container } from "@/components/sections/_shared/Container";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { client } from "@/lib/sanity/client";
import { siteStatsQuery } from "@/lib/sanity/queries";
import { PLACEHOLDER_SITE_STATS, STAT_DESCRIPTIONS } from "@/lib/constants";
import type { SiteStats } from "@/types/sanity";
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
      ? doc.stats.map((s) => ({ value: s.value, label: s.label }))
      : PLACEHOLDER_SITE_STATS.map((s) => ({ value: s.value, label: s.label }));

  if (stats.length === 0) return null;

  // Mobile reading order per Figma (`505:7491` middle): `50+, 1000+, 24/7,
  // 2014`. Map each DOM cell to its mobile visual position via CSS `order`.
  // At lg+ we revert to DOM order so desktop reads `1000+, 24/7, 50+, 2014`
  // (matching the user-supplied desktop screenshot).
  const cellLayout = (i: number): { order: string; borders: string } => {
    switch (i) {
      // Index 0 — `1000+`: mobile pos 2 (top-right), desktop pos 1.
      case 0:
        return {
          order: "order-2 lg:order-1",
          // Mobile pos 2 → left divider, no top. Desktop pos 1 → no left.
          borders: "border-l lg:border-l-0",
        };
      // Index 1 — `24/7`: mobile pos 3 (bottom-left), desktop pos 2.
      case 1:
        return {
          order: "order-3 lg:order-2",
          // Mobile pos 3 → top divider. Desktop pos 2 → left divider.
          borders: "border-t lg:border-t-0 lg:border-l",
        };
      // Index 2 — `50+`: mobile pos 1 (top-left), desktop pos 3.
      case 2:
        return {
          order: "order-1 lg:order-3",
          // Mobile pos 1 → no dividers. Desktop pos 3 → left divider.
          borders: "lg:border-l",
        };
      // Index 3 — `2014`: mobile pos 4 (bottom-right), desktop pos 4.
      case 3:
        return {
          order: "order-4",
          // Mobile pos 4 → top + left. Desktop pos 4 → left.
          borders: "border-t border-l lg:border-t-0",
        };
      default:
        return { order: "", borders: "" };
    }
  };

  return (
    <section className={cn("bg-surface w-full", className)}>
      <Container>
        <div role="list" className="grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const { order, borders } = cellLayout(i);
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

type StatRow = { value: string; label: string };

function StatCell({ stat }: { stat: StatRow }) {
  const description = STAT_DESCRIPTIONS[stat.label];
  return (
    <div className="flex h-full flex-col px-4 py-6 md:px-5 md:py-8 lg:px-5 lg:py-10">
      <p className="font-display text-ink text-[12px] leading-[16px] font-bold tracking-[0.06em] uppercase md:leading-[20px]">
        {stat.label}
      </p>
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
