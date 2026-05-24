"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { ScrollSnapRow } from "@/components/sections/_shared/ScrollSnapRow";
import type { Testimonial } from "@/types/sanity";
import { urlFor } from "@/lib/sanity/image";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type PlaceholderTestimonial = {
  _id: string;
  customer_name: string;
  company: string;
  quote: string;
  rating: number;
  placeholderLogo: string;
};

export type DisplayTestimonial = Testimonial | PlaceholderTestimonial;

function isPlaceholder(t: DisplayTestimonial): t is PlaceholderTestimonial {
  return "placeholderLogo" in t;
}

const INITIAL_VISIBLE = 3;

export type TestimonialsListProps = {
  testimonials: readonly DisplayTestimonial[];
};

/**
 * Renders the testimonial cards (desktop grid + mobile carousel) and the
 * "View All Reviews" expander. Initially shows the first 3 entries; on click,
 * reveals the rest and hides the button. If there are 3 or fewer entries
 * total, the button never renders.
 */
export function TestimonialsList({ testimonials }: TestimonialsListProps) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = testimonials.length > INITIAL_VISIBLE;
  const visible = expanded ? testimonials : testimonials.slice(0, INITIAL_VISIBLE);
  const showButton = hasMore && !expanded;

  // Mobile carousel: default the initial scroll position to the 2nd review
  // (if it exists) so users land in the middle of the snap row, with the 1st
  // card peeking on the left as a "more here" affordance. Desktop is hidden
  // via `md:hidden`, so setting scrollLeft there is a no-op.
  const mobileRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (visible.length < 2) return;
    const ul = mobileRef.current?.querySelector("ul");
    if (!ul) return;
    const items = ul.querySelectorAll<HTMLLIElement>(":scope > li");
    const second = items[1];
    if (!second) return;
    // Center the 2nd item in the scroller (matches the `snap-center` alignment
    // on each <li>, so the browser doesn't immediately snap us off this point).
    ul.scrollLeft = second.offsetLeft + second.offsetWidth / 2 - ul.clientWidth / 2;
  }, [visible.length]);

  return (
    <>
      {/* Desktop / tablet: 3-col grid. Extra rows wrap naturally; if the last
          row has 1 or 2 cards they sit left-aligned at the same column width. */}
      <Container className="mt-16 hidden md:block lg:mt-20">
        <ul className="grid grid-cols-3 items-stretch gap-6 lg:gap-8">
          {visible.map((t, i) => (
            <li key={t._id} className="h-full">
              <Reveal delay={0.3 + (i % 3) * 0.1} className="h-full">
                <TestimonialCard testimonial={t} />
              </Reveal>
            </li>
          ))}
        </ul>

        {showButton ? (
          <Reveal delay={0.7} className="mt-20 flex justify-center lg:mt-24">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className={cn(
                buttonVariants({ variant: "secondary", size: "md" }),
                "border-ink border font-bold hover:scale-[1.02]",
              )}
            >
              View All Reviews
            </button>
          </Reveal>
        ) : null}
      </Container>

      {/* Mobile: scroll-snap carousel. Initial 3 cards; after expand, the full
          list is rendered in the same carousel (still horizontal scroll). */}

      <div ref={mobileRef} className="mt-12 md:hidden">
        <ScrollSnapRow
          ariaLabel="Customer testimonials"
          className="items-stretch gap-4 px-6 pb-4" // ← items-stretch here
        >
          {visible.map((t, i) => (
            <li key={t._id} className="flex w-[85%] shrink-0 snap-center">
              {" "}
              {/* ← flex, no h-full */}
              <Reveal delay={0.2 + (i % 3) * 0.05} className="flex w-full flex-col">
                {" "}
                {/* ← flex flex-col w-full */}
                <TestimonialCard testimonial={t} />
              </Reveal>
            </li>
          ))}
        </ScrollSnapRow>

        {showButton ? (
          <Reveal delay={0.6} className="mt-16 flex justify-center px-6">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className={cn(
                buttonVariants({ variant: "secondary", size: "md" }),
                "border-ink border font-bold hover:scale-[1.02]",
              )}
            >
              View All Reviews
            </button>
          </Reveal>
        ) : null}
      </div>
    </>
  );
}

type TestimonialCardProps = {
  testimonial: DisplayTestimonial;
};

function TestimonialCard({ testimonial: t }: TestimonialCardProps) {
  const sanityLogo = !isPlaceholder(t) ? (t.logo ?? null) : null;
  const placeholderLogoSrc = isPlaceholder(t) ? t.placeholderLogo : null;

  return (
    <article className="border-brand-red relative mt-[44px] flex h-full flex-col border">
      {/* Logo circle overlaps the top edge — Figma: 89×89 with 2px red border. */}
      <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="bg-surface border-brand-red flex h-[89px] w-[89px] items-center justify-center overflow-hidden rounded-full border-2 shadow-md">
          {sanityLogo ? (
            <Image
              src={urlFor(sanityLogo).width(140).height(140).url()}
              alt={t.company}
              width={70}
              height={70}
              className="object-contain p-3"
            />
          ) : placeholderLogoSrc ? (
            <Image
              src={placeholderLogoSrc}
              alt={t.company}
              width={70}
              height={70}
              className="h-auto max-h-12 w-auto max-w-[60px] object-contain"
            />
          ) : (
            <LogoFallback company={t.company} />
          )}
        </div>
      </div>

      {/* Quote body — Figma bg #d6dee1 cool gray; quote 18px PT_Sans Bold Italic. */}
      <div className="flex flex-1 flex-col items-center bg-[#d6dee1] px-6 pt-14 pb-8 text-center">
        <Rating value={t.rating} />
        <p className="font-body text-ink mt-6 text-base leading-[28px] font-bold italic md:text-[18px] md:leading-[32px]">
          &ldquo;{t.quote}&rdquo;
        </p>
      </div>

      {/* Name strip — red bg, customer name 24px Inter Tight Bold capitalize. */}
      <div className="bg-brand-red text-surface flex flex-col items-center justify-center gap-1 px-6 py-6 text-center">
        <p className="font-display text-xl font-bold capitalize md:text-[24px] md:leading-[24px]">
          {t.customer_name}
        </p>
        <p className="font-body text-[13px] uppercase opacity-90">{t.company}</p>
      </div>
    </article>
  );
}

type RatingProps = { value: number };

function Rating({ value }: RatingProps) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="text-brand-red flex gap-1" role="img" aria-label={`${filled} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("h-[22px] w-[22px]", i >= filled && "text-brand-red/25")} />
      ))}
    </div>
  );
}

type LogoFallbackProps = { company: string };

function LogoFallback({ company }: LogoFallbackProps) {
  const initials = company
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="font-display text-brand-red text-xl font-extrabold tracking-tight">
      {initials}
    </span>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
