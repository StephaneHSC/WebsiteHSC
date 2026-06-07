import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import type { FeatureBlockContent } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type FeatureBlockProps = {
  block: FeatureBlockContent;
};

/**
 * /why-choose-us · feature block — Figma `344:6702` (Seamless, image-left)
 * and `344:6703` (Tailored, image-right) desktop / `505:7528` and `505:7539`
 * mobile.
 *
 * Mobile: image-top, content-below regardless of `imageSide`. Desktop
 * (>=lg): swap image and content based on `imageSide`. Both photos render
 * inside the page Container with rounded-2xl corners.
 */
export function FeatureBlock({ block }: FeatureBlockProps) {
  const imageRight = block.imageSide === "right";

  return (
    <section className="bg-surface w-full">
      <Container className="py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Image column — order swap is desktop-only. */}
          <Reveal
            className={cn(
              "relative aspect-[713/625] w-full overflow-hidden",
              "transition-transform duration-300 ease-out lg:hover:-translate-y-1",
              imageRight ? "lg:order-2" : "lg:order-1",
            )}
          >
            {/* If `mobileSrc` is supplied, render both shots and toggle by
                viewport via display utilities. Each Image lazy-loads, so the
                hidden one doesn't ship over the wire. */}
            {block.photo.mobileSrc ? (
              <>
                <Image
                  src={block.photo.mobileSrc}
                  alt={block.photo.alt}
                  fill
                  sizes="100vw"
                  className="object-cover object-center lg:hidden"
                />
                <Image
                  src={block.photo.src}
                  alt={block.photo.alt}
                  fill
                  sizes="50vw"
                  className="hidden object-cover object-center lg:block"
                />
              </>
            ) : (
              <Image
                src={block.photo.src}
                alt={block.photo.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"
              />
            )}
          </Reveal>

          {/* Content column. */}
          <div className={cn(imageRight ? "lg:order-1" : "lg:order-2")}>
            <Reveal>
              <SectionEyebrow variant="red" className="px-2 py-2">
                {block.eyebrow}
              </SectionEyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-display text-ink mt-6 text-[24px] leading-[34px] uppercase md:text-[32px] md:leading-[44px] lg:mt-8 lg:text-[40px] lg:leading-[54px]">
                {block.h2Lines.map((line, i) => (
                  <span
                    key={`${i}-${line.text}`}
                    className={cn("block", line.weight === "black" ? "font-black" : "font-bold")}
                  >
                    {line.text}
                  </span>
                ))}
              </h2>
            </Reveal>

            {block.lede ? (
              <Reveal delay={0.2}>
                <p className="font-body text-ink mt-6 max-w-[517px] text-[14px] leading-[24px] md:text-[15px] md:leading-[28px] lg:mt-8 lg:text-[16px] lg:leading-[30px]">
                  {block.lede}
                </p>
              </Reveal>
            ) : null}

            {block.bullets ? (
              <Reveal delay={0.3} className="mt-6 lg:mt-8">
                <ul className="text-ink marker:text-ink list-disc space-y-2 ps-6 lg:space-y-1">
                  {block.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="font-body text-[13px] leading-[24px] md:text-[14px] md:leading-[28px] lg:text-[15px] lg:leading-[39px]"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            {block.paragraphs ? (
              <Reveal delay={0.2} className="mt-6 max-w-[506px] space-y-4 lg:mt-10 lg:space-y-6">
                {block.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="font-body text-ink text-[14px] leading-[24px] md:text-[15px] md:leading-[28px] lg:text-[16px] lg:leading-[30px]"
                  >
                    {p}
                  </p>
                ))}
              </Reveal>
            ) : null}

            <Reveal delay={0.4} className="mt-8 lg:mt-10">
              {/* Figma `505:7547` (mobile) / `344:6205` (desktop) — label is
                  PT Sans Regular, NOT Bold like other red CTAs on the site. */}
              <Link
                href={block.ctaHref}
                className="bg-brand-red text-surface font-body focus-visible:ring-brand-red hover:bg-brand-red-dark inline-flex items-center justify-center rounded-full px-[20px] py-[14px] text-[14px] tracking-[0.06em] capitalize transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:px-[30px] lg:py-[20px]"
              >
                {block.ctaLabel}
              </Link>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
