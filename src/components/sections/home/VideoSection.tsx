"use client";

import { useState } from "react";
import Image from "next/image";
import { Logo } from "@/components/layout/Logo";

/**
 * Home page · play-on-click video tile.
 *
 * Full-bleed dark band: poster image + centered red play button + corner logo.
 * Clicking swaps the poster for a native <video> element (autoplays on the
 * user's gesture). Self-hosted MP4 lives in /public/home/hero.mp4 (5.4MB,
 * compressed from the 93MB client source — see docs/DECISIONS.md).
 */
export function VideoSection() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="bg-ink relative isolate w-full overflow-hidden">
      <div className="relative aspect-[4/3] w-full md:aspect-video">
        {!playing ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label="Play video"
            className="group relative block h-full w-full cursor-pointer"
          >
            <Image
              src="/home/video-poster.webp"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-center"
            />
            {/* Subtle dim so the play button reads cleanly against any photo */}
            <span
              aria-hidden="true"
              className="bg-ink/15 group-hover:bg-ink/25 absolute inset-0 transition-colors duration-300"
            />
            {/* Play button */}
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <span className="bg-brand-red shadow-brand-red/40 flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20 md:h-24 md:w-24">
                <PlayIcon className="text-surface ml-1 h-7 w-7 sm:h-9 sm:w-9 md:ml-1.5 md:h-11 md:w-11" />
              </span>
            </span>
          </button>
        ) : (
          <video
            src="/home/hero.mp4"
            autoPlay
            controls
            playsInline
            className="h-full w-full bg-black object-contain"
          />
        )}

        {/* Logo overlay — sibling of the button so its Link click doesn't fire
            the play button. Pointer-events kept enabled for the Link itself. */}
        <div className="pointer-events-none absolute top-4 left-4 z-10 sm:top-6 sm:left-6 md:top-8 md:left-8">
          <span className="pointer-events-auto inline-block">
            <Logo imageClassName="h-8 sm:h-10 md:h-12" />
          </span>
        </div>
      </div>
    </section>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
