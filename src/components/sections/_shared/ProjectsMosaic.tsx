import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { cn } from "@/lib/utils";
import { SHOWCASE_TILES, type ShowcaseTile } from "@/lib/constants";

/**
 * Project showcase mosaic. Used on the home page AND every service-detail
 * page — the visual is identical in both contexts. The `serviceSlug` prop is
 * reserved for M7's Shipment Showcase page (where filter UI will reuse this
 * same data), but it is currently a no-op so detail pages render the
 * canonical 8-tile mosaic that matches the home page.
 *
 * Desktop: 4 columns × 2 rows of mixed tile heights creating the brick mosaic.
 * Mobile: first 4 tiles in a 2-column bento that preserves the offset stagger.
 */
export function ProjectsMosaic() {
  const tiles = SHOWCASE_TILES;

  const columns: readonly (readonly ShowcaseTile[])[] = [
    tiles.slice(0, 2),
    tiles.slice(2, 4),
    tiles.slice(4, 6),
    tiles.slice(6, 8),
  ];

  const mobileTiles = tiles.slice(0, 4);

  return (
    <Section tone="alt" spacing="loose" className="overflow-hidden">
      <Container>
        <div className="flex flex-col items-center gap-4 text-center">
          <Reveal>
            <SectionEyebrow className="bg-ink-muted text-surface">Case Visuals</SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-ink text-3xl leading-[1.1] font-bold tracking-tight uppercase md:text-4xl lg:text-5xl">
              Some of <span className="font-extrabold">Our Projects</span> and More
            </h2>
          </Reveal>
        </div>
      </Container>

      <Container className="mt-12 lg:mt-16">
        <div className="hidden gap-4 md:grid md:grid-cols-4 lg:gap-6">
          {columns.map((column, colIdx) => {
            const startsTall = colIdx % 2 === 0;
            return (
              <div key={`col-${colIdx}`} className="flex flex-col gap-4 lg:gap-6">
                {column.map((tile, tileIdx) => {
                  const isTall = startsTall ? tileIdx === 0 : tileIdx === 1;
                  return (
                    <Reveal
                      key={`col-${colIdx}-row-${tileIdx}`}
                      delay={0.2 + (colIdx * 2 + tileIdx) * 0.05}
                    >
                      <Tile tile={tile} variant={isTall ? "tall" : "short"} />
                    </Reveal>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Mobile — first 4 tiles only, in a 2-col bento that preserves the
            tall/short offset stagger of the desktop layout. */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          <div className="flex flex-col gap-3">
            <Reveal delay={0.1}>
              <Tile tile={mobileTiles[0]!} variant="tall" />
            </Reveal>
            <Reveal delay={0.15}>
              <Tile tile={mobileTiles[1]!} variant="short" />
            </Reveal>
          </div>
          <div className="flex flex-col gap-3">
            <Reveal delay={0.2}>
              <Tile tile={mobileTiles[2]!} variant="short" />
            </Reveal>
            <Reveal delay={0.25}>
              <Tile tile={mobileTiles[3]!} variant="tall" />
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}

type TileProps = {
  tile: ShowcaseTile;
  variant: "tall" | "short";
};

function Tile({ tile, variant }: TileProps) {
  const aspectClass = variant === "tall" ? "aspect-[340/560]" : "aspect-[340/300]";
  const hasLabel = tile.label && tile.label.length > 0;

  return (
    <article className={cn("group relative overflow-hidden rounded-xl", aspectClass)}>
      <Image
        src={tile.src}
        alt={tile.alt}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 25vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      {hasLabel ? (
        <>
          <span
            aria-hidden="true"
            className="from-ink/0 via-ink/20 to-ink/65 absolute inset-0 bg-gradient-to-b"
          />
          <div className="text-surface absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
            <p className="font-display text-base leading-[1.1] font-extrabold tracking-tight uppercase sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl">
              {(tile.label ?? []).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
        </>
      ) : null}
    </article>
  );
}
