"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HELICOPTER_BRANDS } from "@/lib/constants";

/**
 * Mobile-only partners marquee. Renders the brand list twice end-to-end and
 * translates the track -50% so the loop is seamless. Animation is paused
 * until the strip enters the viewport (IntersectionObserver) and pauses
 * again when it leaves, so we don't burn CPU off-screen. Speed (30s loop,
 * ~27 px/sec for the current 5-logo list) is tuned to stay ambient without
 * dropping into "crawling" territory.
 *
 * Desktop continues to use the static 5-col grid in PartnersStrip; this
 * client island is only mounted at `<md`.
 */
export function PartnersMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setActive(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const items = [...HELICOPTER_BRANDS, ...HELICOPTER_BRANDS];

  return (
    <div
      ref={ref}
      className="relative overflow-hidden"
      role="region"
      aria-label="Helicopter brands we ship"
    >
      <ul
        className="hsc-marquee flex w-max items-center gap-10"
        style={{ animationPlayState: active ? "running" : "paused" }}
      >
        {items.map((brand, i) => {
          const isClone = i >= HELICOPTER_BRANDS.length;
          return (
            <li key={`${brand.name}-${i}`} className="shrink-0" aria-hidden={isClone}>
              <Image
                src={brand.logo}
                alt={isClone ? "" : brand.name}
                width={brand.width}
                height={brand.height}
                className="h-7 w-auto object-contain"
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
