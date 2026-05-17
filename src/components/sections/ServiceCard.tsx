import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/Button";
import type { Service } from "@/lib/constants";

export type ServiceCardProps = {
  service: Service;
  /** 1-based index for the "01"–"06" badge. */
  number: number;
  /**
   * When true, the description + CTA are always shown. When false (default),
   * they're hidden until the parent group is hovered/focused on md+ — the home
   * teaser uses this to collapse cards down to a thin number+name strip.
   */
  alwaysExpanded?: boolean;
  className?: string;
  /** `sizes` for the Next.js Image. Defaults to a sensible value for the home teaser. */
  imageSizes?: string;
};

/**
 * One service card — image background with corner number, title, description,
 * and Explore More CTA. Used by the home services teaser, the M3 services
 * listing, and the M4 related-projects strip. Layout (collapsed-on-hover vs
 * always-expanded) is controlled by the parent via `alwaysExpanded` and CSS
 * group state on the wrapping `li`.
 */
export function ServiceCard({
  service,
  number,
  alwaysExpanded = false,
  className,
  imageSizes = "(min-width: 1280px) 25vw, (min-width: 768px) 20vw, 320px",
}: ServiceCardProps) {
  const numberLabel = number.toString().padStart(2, "0");

  return (
    <article className={cn("relative h-full w-full overflow-hidden", className)}>
      <Image
        src={service.image}
        alt=""
        fill
        sizes={imageSizes}
        className="object-cover object-center"
      />

      {/* Top-to-bottom dim — keeps the corner number readable on bright photos
          and the bottom title block legible regardless of image content. */}
      <span
        aria-hidden="true"
        className="from-ink/25 via-ink/15 to-ink/85 absolute inset-0 bg-gradient-to-b"
      />

      <span className="font-display text-surface absolute top-4 left-4 text-2xl font-bold md:top-6 md:left-6 md:text-3xl">
        {numberLabel}
      </span>

      <div className="text-surface absolute inset-x-4 bottom-4 md:inset-x-6 md:bottom-6">
        <h3 className="font-display text-lg leading-tight font-extrabold tracking-tight uppercase md:text-xl lg:text-2xl">
          {service.name}
        </h3>

        <div
          className={cn(
            "transition-all duration-500",
            alwaysExpanded
              ? "mt-3 max-h-48 opacity-100"
              : // Mobile + touch tablets (no hover): always expanded.
                // Desktop with a hover-capable pointer: collapse, expand on
                // hover or focus-within. Gating with @media(hover:hover)
                // prevents iPad users from seeing permanently collapsed cards.
                "mt-3 max-h-48 opacity-100 [@media(hover:hover)]:md:mt-0 [@media(hover:hover)]:md:max-h-0 [@media(hover:hover)]:md:overflow-hidden [@media(hover:hover)]:md:opacity-0" +
                  " [@media(hover:hover)]:md:group-focus-within:mt-3 [@media(hover:hover)]:md:group-focus-within:max-h-48 [@media(hover:hover)]:md:group-focus-within:opacity-100" +
                  " [@media(hover:hover)]:md:group-hover:mt-3 [@media(hover:hover)]:md:group-hover:max-h-48 [@media(hover:hover)]:md:group-hover:opacity-100" +
                  " [@media(hover:hover)]:md:[li[data-active=true]_&]:mt-3 [@media(hover:hover)]:md:[li[data-active=true]_&]:max-h-48 [@media(hover:hover)]:md:[li[data-active=true]_&]:opacity-100",
          )}
        >
          <p className="font-body text-surface/85 text-sm md:text-base">{service.description}</p>
          <Link
            href={`/services/${service.slug}`}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "mt-4 hover:scale-[1.02]",
            )}
          >
            Explore More
          </Link>
        </div>
      </div>
    </article>
  );
}
