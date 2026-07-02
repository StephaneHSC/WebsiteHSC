"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useHorizontalTouchScroll } from "@/lib/useHorizontalTouchScroll";

export type TeamCarouselItem = {
  id: string;
  name: string;
  role: string;
  photoSrc: string | null;
};

type Props = {
  items: TeamCarouselItem[];
};

/**
 * Mobile snap-center carousel + desktop 5-col grid. On mobile the row snaps
 * one card at a time (no fling-skipping); the in-view card scales up and the
 * member's card gets the red brand background. Desktop hover behaviour is
 * preserved via CSS classes on TeamCard.
 *
 * Row order: LogoCard at index 0, then one member per item. On mount, the
 * carousel centers the first member (row index 1) so it lands "active".
 */
export function TeamCarousel({ items }: Props) {
  const [inViewIdx, setInViewIdx] = useState(-1);
  const rowRef = useRef<HTMLUListElement>(null);
  useHorizontalTouchScroll(rowRef);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const row = rowRef.current;
    if (!row) return;

    const itemEls = Array.from(row.querySelectorAll<HTMLLIElement>("[data-row-idx]"));

    // Center the first member on mount.
    const first = itemEls.find((el) => el.dataset.rowIdx === "1");
    if (first) {
      const left = first.offsetLeft + first.offsetWidth / 2 - row.clientWidth / 2;
      row.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }

    // rAF-throttled scroll handler. Picks whichever card's midpoint is
    // closest to the row's viewport center and only triggers a re-render
    // when that index actually changes — so within-card scrolling is free.
    let raf = 0;
    const update = () => {
      raf = 0;
      const center = row.scrollLeft + row.clientWidth / 2;
      let bestIdx = 0;
      let bestDist = Infinity;
      for (const el of itemEls) {
        const mid = el.offsetLeft + el.offsetWidth / 2;
        const d = Math.abs(mid - center);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = Number(el.dataset.rowIdx);
        }
      }
      setInViewIdx((prev) => (prev === bestIdx ? prev : bestIdx));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    row.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      row.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const slotClass = cn(
    "w-72 shrink-0 snap-center snap-always sm:w-80 md:w-auto md:shrink",
    "scale-[0.9] transition-transform duration-300 ease-out data-[in-view=true]:scale-100 md:!scale-100",
  );

  return (
    <ul
      ref={rowRef}
      role="region"
      aria-label="Heli Skycargo team members"
      tabIndex={0}
      className={cn(
        "flex snap-x snap-mandatory gap-4 overflow-x-auto pt-12 pb-4",
        // Mobile: symmetric edge padding so first/last can snap to center.
        "px-[calc(50vw_-_9rem)] sm:px-[calc(50vw_-_10rem)]",
        // Desktop: flip to a flush 5-col grid.
        "md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:gap-6",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "focus-visible:ring-brand-red focus-visible:ring-2 focus-visible:outline-none",
      )}
    >
      <li
        data-row-idx={0}
        data-in-view={inViewIdx === 0 ? "true" : undefined}
        className={slotClass}
      >
        <LogoCard />
      </li>
      {items.map((m, i) => {
        const rowIdx = i + 1;
        return (
          <li
            key={m.id}
            data-row-idx={rowIdx}
            data-in-view={inViewIdx === rowIdx ? "true" : undefined}
            className={slotClass}
          >
            <TeamCard item={m} active={inViewIdx === rowIdx} />
          </li>
        );
      })}
    </ul>
  );
}

function LogoCard() {
  return (
    <div className="bg-surface border-ink/10 flex h-full items-center justify-center border p-6">
      <Image
        src="/team/hsc-roundel.png"
        alt="Heli Skycargo"
        width={400}
        height={400}
        className="h-auto w-3/5 max-w-[180px]"
        priority
      />
    </div>
  );
}

function TeamCard({ item, active }: { item: TeamCarouselItem; active: boolean }) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col items-center px-3 pt-3 pb-6 transition-colors duration-300",
        active
          ? "bg-brand-red text-surface"
          : "bg-surface text-ink border-ink/10 md:hover:bg-brand-red md:hover:text-surface border md:hover:border-transparent",
      )}
    >
      <div
        className={cn(
          "relative aspect-[244/280] w-full transition-colors duration-300",
          "bg-[#F2F2F2]",
        )}
      >
        {item.photoSrc ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[108%] overflow-hidden">
            <Image
              src={item.photoSrc}
              alt={item.name}
              fill
              sizes="(min-width: 1024px) 220px, (min-width: 640px) 240px, 220px"
              className="object-cover object-top transition-transform duration-500 md:group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <PlaceholderAvatar name={item.name} />
        )}
      </div>

      <div className="mt-auto pt-4 text-center">
        <h3 className="font-display text-base leading-tight font-bold tracking-tight">
          {item.name}
        </h3>
        <p
          className={cn(
            "font-body mt-1.5 text-xs",
            active ? "text-surface/85" : "text-ink-soft md:group-hover:text-surface/85",
          )}
        >
          {item.role}
        </p>
      </div>
    </article>
  );
}

function PlaceholderAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="bg-ink/5 flex h-full w-full items-center justify-center">
      <span className="font-display text-ink/30 text-5xl font-extrabold tracking-tight">
        {initials}
      </span>
    </div>
  );
}
