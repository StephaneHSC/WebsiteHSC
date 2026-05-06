"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/constants";

export type ServiceCardProps = {
  service: Service;
  /** 1-based index for the "01"–"06" badge. */
  number: number;
  /** True when this card is the currently expanded/active card. */
  isActive: boolean;
  /** Toggle handler — used by mobile tap-to-expand. */
  onToggle: () => void;
};

/**
 * Services-listing card. Idle = white card with red number, ink title, faint
 * decorative world-map graphic on the right edge, and a small outline arrow.
 * Active (desktop hover OR mobile tapped) = full-bleed photo + 40% overlay,
 * white title, description fades in, and the arrow morphs to a red pill that
 * links to the detail page.
 */
export function ServiceCard({ service, number, isActive, onToggle }: ServiceCardProps) {
  const numberLabel = number.toString().padStart(2, "0");

  return (
    <article
      data-active={isActive ? "true" : undefined}
      className={cn(
        "group/card relative isolate flex h-[290px] w-full overflow-hidden bg-white",
        "lg:h-[580px]",
      )}
    >
      {/* z-0: decorative world-map graphic — visible when idle, fades out when
          active. Hidden on touch when active because the photo covers it. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-0 w-[140px] opacity-100 transition-opacity duration-300 lg:w-[270px]",
          "group-data-[active=true]/card:opacity-0 lg:group-focus-within/card:opacity-0 [@media(hover:hover)]:lg:group-hover/card:opacity-0",
        )}
      >
        <Image
          src="/services/card-decoration.svg"
          alt=""
          fill
          sizes="(min-width: 1024px) 270px, 140px"
          className="object-contain object-right"
        />
      </div>

      {/* z-10: active-state photo + 40% overlay — fades in on hover/active. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300",
          "group-data-[active=true]/card:opacity-100 lg:group-focus-within/card:opacity-100 [@media(hover:hover)]:lg:group-hover/card:opacity-100",
        )}
      >
        <Image
          src={service.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover object-center"
        />
        <span className="bg-ink/40 absolute inset-0" />
      </div>

      {/* z-20: full-card tap target. On hover-capable desktops we hide it so
          the active-state link is the natural click target. On touch / no-hover
          devices it stays visible to drive the single-open accordion. */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isActive}
        aria-label={`${service.name} — ${isActive ? "collapse" : "expand"}`}
        className="absolute inset-0 z-20 cursor-pointer focus-visible:outline-none [@media(hover:hover)]:lg:hidden"
      />

      {/* z-30: card text content — pointer-events-none so clicks pass through
          to the tap target below, except for the Explore More link which
          re-enables pointer events when visible. */}
      <div className="pointer-events-none relative z-30 flex h-full w-full flex-col justify-between p-8 lg:p-[40px]">
        <div className="space-y-1 lg:space-y-2">
          <p
            className={cn(
              "font-display text-brand-red text-[24px] leading-[1.1] font-black uppercase",
              "lg:text-[40px] lg:leading-[80px]",
            )}
          >
            {numberLabel}
          </p>
          <h3
            className={cn(
              "font-display text-ink text-[20px] leading-[1.2] uppercase transition-colors duration-300",
              "font-bold lg:text-[40px] lg:leading-[1.1]",
              "group-data-[active=true]/card:text-surface [@media(hover:hover)]:lg:group-hover/card:text-surface lg:group-focus-within/card:text-surface",
            )}
          >
            {service.name}
          </h3>
          <p
            className={cn(
              "font-body text-surface max-w-[393px] text-[14px] leading-[22px] opacity-0 transition-opacity duration-300",
              "lg:mt-[28px] lg:text-[16px] lg:leading-[25px]",
              "group-data-[active=true]/card:opacity-100 lg:group-focus-within/card:opacity-100 [@media(hover:hover)]:lg:group-hover/card:opacity-100",
            )}
          >
            {service.description}
          </p>
        </div>

        {/* CTA. Both states render at the same position; the visible one
            re-enables pointer events. */}
        <div className="relative h-[42px] lg:h-[58px]">
          {/* Idle: outline circle arrow (decorative) */}
          <span
            aria-hidden="true"
            className={cn(
              "border-ink text-ink absolute top-0 left-0 inline-flex size-[42px] items-center justify-center rounded-full border bg-transparent transition-opacity duration-300",
              "lg:size-[52px]",
              "group-data-[active=true]/card:opacity-0 lg:group-focus-within/card:opacity-0 [@media(hover:hover)]:lg:group-hover/card:opacity-0",
            )}
          >
            <ArrowUpRight className="size-4 lg:size-5" />
          </span>
          {/* Active: red pill linking to detail. Sits above the tap-target
              button on touch (because of source order + same z-index). */}
          <Link
            href={`/services/${service.slug}`}
            className={cn(
              "font-cta bg-brand-red text-surface focus-visible:ring-surface hover:bg-brand-red-dark pointer-events-none absolute top-0 left-0 inline-flex items-center justify-center rounded-full px-[24px] py-[14px] text-[13px] leading-none font-semibold tracking-[0.06em] capitalize opacity-0 transition-opacity duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              "lg:px-[30px] lg:py-[20px] lg:text-[14px] lg:tracking-[0.84px]",
              "group-data-[active=true]/card:pointer-events-auto group-data-[active=true]/card:opacity-100",
              "[@media(hover:hover)]:lg:group-hover/card:pointer-events-auto [@media(hover:hover)]:lg:group-hover/card:opacity-100",
              "lg:group-focus-within/card:pointer-events-auto lg:group-focus-within/card:opacity-100",
            )}
          >
            Explore More
          </Link>
        </div>
      </div>
    </article>
  );
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
