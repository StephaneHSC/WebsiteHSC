import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SectionEyebrow, type SectionEyebrowProps } from "./SectionEyebrow";
import { Reveal } from "./Reveal";

export type SectionHeadingProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
  eyebrow?: ReactNode;
  eyebrowVariant?: SectionEyebrowProps["variant"];
  title: ReactNode;
  subtitle?: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  /** Heading level. Each home section is an h2 below the page h1; nested cards use h3. */
  as?: "h2" | "h3";
  /** All-caps title — matches Figma's home-page h2 style (`OUR SOLUTIONS`, `SMART TRACKING…`). */
  uppercase?: boolean;
  /** Stagger eyebrow → title → lede via scroll-reveal. Default true. */
  animated?: boolean;
};

/**
 * Eyebrow + heading + lede composite — the standard top of every section.
 * Centers content by default to match the Figma home frames. With `animated`
 * (default), each part fades + rises into view with a 100ms stagger.
 */
export function SectionHeading({
  eyebrow,
  eyebrowVariant = "filled",
  title,
  subtitle,
  lede,
  align = "center",
  as: Heading = "h2",
  uppercase = false,
  animated = true,
  className,
  ...props
}: SectionHeadingProps) {
  const eyebrowEl = eyebrow ? (
    <SectionEyebrow variant={eyebrowVariant}>{eyebrow}</SectionEyebrow>
  ) : null;

  const titleEl = (
    <Heading
      className={cn(
        "font-display text-3xl leading-tight tracking-tight md:text-4xl lg:text-5xl",
        uppercase && "uppercase",
      )}
    >
      <span className="font-extrabold">{title}</span>
      {subtitle ? <span className="font-semibold"> {subtitle}</span> : null}
    </Heading>
  );

  const ledeEl = lede ? (
    <div
      className={cn(
        "font-body text-ink-soft max-w-2xl text-base md:text-lg",
        align === "center" && "mx-auto",
      )}
    >
      {lede}
    </div>
  ) : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        align === "left" && "items-start text-left",
        className,
      )}
      {...props}
    >
      {animated ? (
        <>
          {eyebrowEl ? <Reveal>{eyebrowEl}</Reveal> : null}
          <Reveal direction="up" delay={0.1}>
            {titleEl}
          </Reveal>
          {ledeEl ? (
            <Reveal direction="up" delay={0.2}>
              {ledeEl}
            </Reveal>
          ) : null}
        </>
      ) : (
        <>
          {eyebrowEl}
          {titleEl}
          {ledeEl}
        </>
      )}
    </div>
  );
}
