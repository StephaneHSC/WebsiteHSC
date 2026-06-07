"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { VALUE_ADDED_SERVICES, type ValueAddedService } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Value-Added Services accordion. 8 rows, single-open behaviour. Expanded row
 * grows the thumbnail (100→400 desktop / 80→200 mobile) and reveals a short
 * description beside the thumbnail. The first row auto-opens once when the
 * section scrolls into view as a single-shot teaser; user taps thereafter
 * behave as a normal accordion (tap to toggle, tapping another row collapses
 * the previous).
 *
 * The horizontal layout (thumbnail-left, label-right) only kicks in at xl
 * (≥1280px). Below that, the row stacks vertically (thumbnail full-width on
 * top, label below) so the arrow button doesn't get cut off when the label
 * wraps.
 */
export function ValueAddedAccordion() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (hasAutoOpened.current || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasAutoOpened.current) {
            hasAutoOpened.current = true;
            const first = VALUE_ADDED_SERVICES[0];
            if (first) setOpenSlug(first.slug);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-surface w-full overflow-hidden">
      <Container className="max-w-[1600px] py-20 md:py-24 xl:px-[75px] xl:py-[108px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Reveal>
            <SectionEyebrow variant="gray">Value-Added Services</SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-ink text-[24px] leading-[34px] tracking-tight uppercase lg:text-[54px] lg:leading-[66px]">
              <span className="block font-black">Beyond Standard Logistic.</span>
              <span className="block font-bold">Extra Support, Every Step.</span>
            </h2>
          </Reveal>
        </div>

        <ul className="mt-12 flex flex-col gap-[10px] xl:mt-[120px]">
          {VALUE_ADDED_SERVICES.map((service, i) => (
            <li key={service.slug}>
              <Reveal delay={0.04 * i}>
                <ValueAddedRow
                  service={service}
                  number={i + 1}
                  isOpen={openSlug === service.slug}
                  onToggle={() =>
                    setOpenSlug((prev) => (prev === service.slug ? null : service.slug))
                  }
                />
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

type RowProps = {
  service: ValueAddedService;
  number: number;
  isOpen: boolean;
  onToggle: () => void;
};

function ValueAddedRow({ service, number, isOpen, onToggle }: RowProps) {
  const numberLabel = number.toString().padStart(2, "0");
  const hasDescription = Boolean(service.description);

  return (
    <div className="group/row relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`value-added-panel-${service.slug}`}
        className={cn(
          "focus-visible:ring-brand-red flex w-full flex-col items-stretch gap-0 text-left transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none",
          "xl:flex-row xl:items-stretch xl:gap-[24px]",
        )}
      >
        {/* Thumbnail strip — full-width on smaller screens, fixed-width column at xl. */}
        <span
          aria-hidden="true"
          className={cn(
            "relative block w-full shrink-0 overflow-hidden transition-[height] duration-300 ease-out",
            "xl:w-[708px]",
            isOpen ? "h-[200px] xl:h-[400px]" : "h-[80px] xl:h-[100px]",
          )}
        >
          <Image
            src={service.thumb}
            alt=""
            fill
            sizes="(min-width: 1280px) 708px, 100vw"
            className="object-cover object-center"
          />
        </span>

        {/* Right-hand block: label row on top, description below (when open). */}
        <span className="flex w-full flex-1 flex-col py-4 xl:py-6">
          <span className="flex w-full items-center justify-between gap-3">
            <span className="flex items-baseline gap-3 xl:gap-[14px]">
              <span className="font-display text-ink-faint text-[20px] leading-[1.1] font-semibold uppercase xl:text-[36px] xl:leading-[50px]">
                {numberLabel}
              </span>
              <span className="font-display text-ink text-[20px] leading-[1.1] font-semibold uppercase xl:text-[36px] xl:leading-[50px]">
                {service.label}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "relative inline-flex size-[42px] shrink-0 items-center justify-center rounded-full border transition-all duration-300 xl:size-[52px]",
                isOpen
                  ? "bg-brand-red border-brand-red text-surface"
                  : "border-ink text-ink bg-transparent",
              )}
            >
              {isOpen ? (
                <ArrowUpRight className="size-5 xl:size-6" />
              ) : (
                <ArrowRight className="size-5 xl:size-6" />
              )}
            </span>
          </span>

          {/* Inline description, only shown when open and only when a description exists.
              `aria-hidden` keeps screen readers from announcing the collapsed copy as
              part of the parent button's accessible name. */}
          {hasDescription ? (
            <span
              id={`value-added-panel-${service.slug}`}
              aria-hidden={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <span className="overflow-hidden">
                <span className="text-ink mt-3 block max-w-[517px] xl:mt-6">
                  <span className="font-body block text-[14px] leading-[22px] xl:text-[17px] xl:leading-[25px]">
                    {service.description}
                  </span>
                  {/* {service.detail ? (
                    <span className="font-body mt-3 block text-[14px] leading-[22px] xl:mt-4 xl:text-[17px] xl:leading-[25px]">
                      <span className="font-bold">{service.detail.leadBold}</span>
                      {service.detail.leadRest}
                      <span className="font-bold">{service.detail.midBold}</span>
                      {service.detail.tail}
                    </span>
                  ) : null} */}
                </span>
              </span>
            </span>
          ) : null}
        </span>
      </button>
    </div>
  );
}

/**
 * Two arrow variants used by the value-added accordion:
 *   - `ArrowRight`  (idle rows)   — thin horizontal arrow, Figma node 345:7050.
 *   - `ArrowUpRight` (open row)   — thin diagonal arrow,  Figma node 345:7071.
 * Strokes are deliberately thin (`1.4`) to match the slim Figma asset.
 */
function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}
