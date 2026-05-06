import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { SHOWCASE_TILES, type ShowcaseTile } from "@/lib/constants";

/**
 * Desktop bento: 4 columns, each with one tall + one short tile. Even columns
 * start with the tall tile, odd columns with the short — creates the offset
 * stagger from Figma.
 */
const COLUMNS: readonly (readonly ShowcaseTile[])[] = [
  SHOWCASE_TILES.slice(0, 2),
  SHOWCASE_TILES.slice(2, 4),
  SHOWCASE_TILES.slice(4, 6),
  SHOWCASE_TILES.slice(6, 8),
];

export function ProjectsMosaic() {
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
          {COLUMNS.map((column, colIdx) => {
            const startsTall = colIdx % 2 === 0;
            const colKey = column.map((t) => t.id).join("-");
            return (
              <div key={colKey} className="flex flex-col gap-4 lg:gap-6">
                {column.map((tile, tileIdx) => {
                  const isTall = startsTall ? tileIdx === 0 : tileIdx === 1;
                  return (
                    <Reveal key={tile.id} delay={0.2 + (colIdx * 2 + tileIdx) * 0.05}>
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
              <Tile tile={SHOWCASE_TILES[0]!} variant="tall" />
            </Reveal>
            <Reveal delay={0.15}>
              <Tile tile={SHOWCASE_TILES[1]!} variant="short" />
            </Reveal>
          </div>
          <div className="flex flex-col gap-3">
            <Reveal delay={0.2}>
              <Tile tile={SHOWCASE_TILES[2]!} variant="short" />
            </Reveal>
            <Reveal delay={0.25}>
              <Tile tile={SHOWCASE_TILES[3]!} variant="tall" />
            </Reveal>
          </div>
        </div>

        <Reveal delay={0.7} className="mt-12 flex justify-center">
          <Link
            href="/showcase"
            className={cn(
              buttonVariants({ variant: "secondary", size: "md" }),
              "border-ink/15 border hover:scale-[1.02]",
            )}
          >
            View All Showcase
          </Link>
        </Reveal>
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
          {tile.showFlag ? (
            <Image
              src="/showcase/japan-flag.svg"
              alt=""
              width={113}
              height={113}
              className="absolute top-4 right-4 h-12 w-12 rounded-full md:top-6 md:right-6 md:h-16 md:w-16"
            />
          ) : null}
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
