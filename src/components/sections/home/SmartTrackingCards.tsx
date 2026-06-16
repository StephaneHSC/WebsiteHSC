"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { cn } from "@/lib/utils";
import { SMART_TRACKING_CARDS } from "@/lib/constants";

/**
 * Horizontal scroll-snap card row with prev/next nav buttons.
 *
 * Lives as a client island so the Smart Tracking section above can stay a
 * server component. Mobile users get native swipe; desktop gets buttons that
 * programmatically smooth-scroll one card at a time.
 *
 * Card data is in `SMART_TRACKING_CARDS` so future "Mobile App" pages can
 * reuse it. Cards are full composite assets (title + description + mockup
 * baked into the image); alt text carries accessibility.
 */

export function SmartTrackingCards() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const item = el.querySelector("li");
    if (!item) return;
    const itemWidth = item.getBoundingClientRect().width;
    // Read the actual gap from the <ul> so this stays in sync with the
    // responsive `gap-6 lg:gap-8` utility — no magic numbers.
    const list = item.parentElement;
    const gap = list ? parseFloat(getComputedStyle(list).columnGap || "0") : 0;
    el.scrollBy({ left: dir * (itemWidth + gap), behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    function update() {
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      // Inner content has horizontal padding, so snap-start on the first card
      // rests at scrollLeft = paddingLeft (not 0). Account for that.
      const inner = el.firstElementChild as HTMLElement | null;
      const padLeft = inner ? parseFloat(getComputedStyle(inner).paddingLeft || "0") : 0;
      setCanPrev(el.scrollLeft > padLeft + 1);
      setCanNext(el.scrollLeft < max - 1);
    }
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    // Intercept vertical wheel events and redirect them as horizontal scroll
    // so the user doesn't accidentally scroll past the carousel.
    function onWheel(e: WheelEvent) {
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= max - 1;
      // Only intercept if there's actually horizontal content to scroll and
      // the scroll is primarily vertical (not a two-finger horizontal swipe).
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if ((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0)) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: "auto" });
    }
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("scroll", update);
      el.removeEventListener("wheel", onWheel);
      ro.disconnect();
    };
  }, []);

  return (
    <Reveal delay={0.4} className="relative mt-16 lg:mt-24">
      <div
        ref={scrollerRef}
        role="region"
        aria-label="Smart tracking feature cards"
        tabIndex={0}
        // `snap-x snap-mandatory` MUST live on the scroll container (this
        // element has `overflow`); placing it on the inner <ul> is a no-op.
        className="focus-visible:ring-brand-red snap-x snap-mandatory overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] focus-visible:ring-2 focus-visible:outline-none [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex gap-6 px-4 sm:px-6 lg:gap-8 lg:px-8">
          {SMART_TRACKING_CARDS.map((card) => (
            <li
              key={card.id}
              // `snap-always` forces one-card-per-swipe (no fling-skipping).
              className="w-[300px] shrink-0 snap-start snap-always sm:w-[400px] lg:w-[520px] xl:w-[580px]"
            >
              <Image
                src={card.src}
                alt={card.alt}
                width={1172}
                height={1114}
                className="h-auto w-full"
                sizes="(min-width: 1280px) 580px, (min-width: 1024px) 520px, (min-width: 640px) 400px, 300px"
              />
            </li>
          ))}
        </ul>
      </div>

      <NavButton
        direction="prev"
        onClick={() => scrollByCards(-1)}
        visible={canPrev}
        className="absolute top-1/2 left-4 hidden -translate-y-1/2 md:inline-flex lg:left-6"
      />
      <NavButton
        direction="next"
        onClick={() => scrollByCards(1)}
        visible={canNext}
        className="absolute top-1/2 right-4 hidden -translate-y-1/2 md:inline-flex lg:right-6"
      />
    </Reveal>
  );
}

type NavButtonProps = {
  direction: "prev" | "next";
  onClick: () => void;
  visible: boolean;
  className?: string;
};

function NavButton({ direction, onClick, visible, className }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous cards" : "Next cards"}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "bg-surface text-ink z-20 inline-flex h-12 w-12 items-center justify-center rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200",
        "hover:bg-ink hover:text-surface hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]",
        "focus-visible:ring-brand-red focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        !visible && "pointer-events-none opacity-0",
        className,
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={direction === "prev" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
