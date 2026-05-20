"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { ShowcaseMedia, ShowcaseTile } from "@/lib/constants";

export type ShowcaseModalProps = {
  /** Tile to display. `null` keeps the modal closed. */
  tile: ShowcaseTile | null;
  onClose: () => void;
};

/**
 * M7 project lightbox. Wraps `ui/Modal` with `size="xl"` + `bare` so the
 * panel renders edge-to-edge with the per-Figma split layout (photo left
 * 50% / content right 50% on `lg+`; photo on top + stacked content on
 * mobile). Carousel arrows + 3-dot indicator paginate `tile.photos` (when
 * length > 1); ArrowLeft/ArrowRight cycle photos when modal has focus.
 *
 * Body scroll-lock is applied while open so wheel events on the backdrop
 * don't scroll the underlying page.
 */
export function ShowcaseModal({ tile, onClose }: ShowcaseModalProps) {
  const router = useRouter();
  const [mediaIdx, setMediaIdx] = useState(0);
  // `playingMediaIdx` tracks which media item is actively playing (videos
  // start in an idle "poster + play overlay" state and become a true
  // `<video controls>` only after the user clicks play). Navigating the
  // carousel or closing the modal resets it to `null`.
  const [playingMediaIdx, setPlayingMediaIdx] = useState<number | null>(null);
  const [lastTileId, setLastTileId] = useState<string | null>(tile?.id ?? null);
  const [lastMediaIdx, setLastMediaIdx] = useState(mediaIdx);

  // Reset carousel when the active tile changes — React 19 in-render reset
  // pattern (https://react.dev/reference/react/useState#storing-information-from-previous-renders).
  if ((tile?.id ?? null) !== lastTileId) {
    setLastTileId(tile?.id ?? null);
    setMediaIdx(0);
    setPlayingMediaIdx(null);
  }
  // Stop the active video whenever the carousel moves to a different item.
  if (mediaIdx !== lastMediaIdx) {
    setLastMediaIdx(mediaIdx);
    setPlayingMediaIdx(null);
  }

  // Resolve the carousel's media list. Prefer `tile.media` (the M7 mixed
  // photo+video format); fall back to the legacy `photos` + `videoUrl`
  // fields; finally fall back to a single-photo carousel built from `src`.
  const media = useMemo<readonly ShowcaseMedia[]>(() => {
    if (!tile) return [];
    if (tile.media && tile.media.length > 0) return tile.media;
    const fromLegacy: ShowcaseMedia[] = [];
    if (tile.photos && tile.photos.length > 0) {
      for (const src of tile.photos) fromLegacy.push({ type: "photo", src });
    }
    if (tile.videoUrl) {
      fromLegacy.push({
        type: "video",
        src: tile.videoUrl,
        poster: tile.photos?.[0] ?? tile.src,
      });
    }
    if (fromLegacy.length > 0) return fromLegacy;
    return [{ type: "photo", src: tile.src }];
  }, [tile]);

  const mediaCount = media.length;
  const isPlayingCurrent = playingMediaIdx === mediaIdx;
  // Hide arrows + dots while a video is playing so they don't sit over the
  // video controls (and so accidental clicks don't change the slide).
  const showArrows = mediaCount > 1 && !isPlayingCurrent;

  const next = useCallback(() => {
    setMediaIdx((i) => (i + 1) % mediaCount);
  }, [mediaCount]);
  const prev = useCallback(() => {
    setMediaIdx((i) => (i - 1 + mediaCount) % mediaCount);
  }, [mediaCount]);

  // Keyboard nav while the dialog is open. The native <dialog> traps focus,
  // so a window-level listener is enough — when closed we early-return. We
  // also short-circuit while a video is playing so Arrow keys go to the
  // native video controls (scrub / seek) instead of changing the slide.
  useEffect(() => {
    if (!tile || !showArrows || isPlayingCurrent) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.tagName === "VIDEO") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tile, showArrows, isPlayingCurrent, next, prev]);

  // Body scroll-lock — `<dialog>` already inert-s the background, but wheel
  // events on the backdrop still scroll behind it on some browsers.
  useEffect(() => {
    if (!tile) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [tile]);

  const handleQuoteClick = useCallback(() => {
    onClose();
    if (typeof window === "undefined") return;
    const target = document.getElementById("request-quote");
    if (target) {
      // Small delay so the dialog's close animation completes before the scroll.
      window.setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } else {
      router.push("/quote");
    }
  }, [onClose, router]);

  const modal = tile?.modal;
  const ariaLabel = modal?.title ?? tile?.alt ?? "Project detail";

  return (
    <Modal open={tile !== null} onClose={onClose} size="xl" bare ariaLabel={ariaLabel}>
      {tile ? (
        <div className="relative flex max-h-[92vh] flex-col overflow-hidden lg:max-h-[90vh] lg:flex-row lg:items-stretch">
          {/* Media area — top on mobile, left half on desktop. The carousel
              iterates over `media` and renders photo / video items in place;
              arrows + dots paginate across both types. On desktop the parent
              uses `lg:flex-row lg:items-stretch` so this column self-stretches
              to the content column's natural height (no fixed aspect needed). */}
          <div className="bg-ink relative aspect-[382/345] w-full overflow-hidden lg:aspect-auto lg:w-1/2">
            {media.map((item, idx) => {
              const isActive = idx === mediaIdx;
              const isVideoPlaying = item.type === "video" && playingMediaIdx === idx;
              const posterSrc = item.type === "video" ? (item.poster ?? tile.src) : item.src;
              return (
                <div
                  key={`${item.type}-${item.src}`}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-300",
                    isActive ? "z-10 opacity-100" : "pointer-events-none opacity-0",
                  )}
                  aria-hidden={!isActive}
                >
                  {item.type === "video" && isVideoPlaying ? (
                    <video
                      key={`play-${item.src}`}
                      src={item.src}
                      poster={item.poster ?? tile.src}
                      controls
                      autoPlay
                      playsInline
                      className="h-full w-full bg-black object-contain"
                    />
                  ) : (
                    <Image
                      src={posterSrc}
                      alt={tile.alt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      priority={idx === 0}
                      className="object-cover"
                    />
                  )}

                  {/* Play overlay — only on idle video items. */}
                  {item.type === "video" && !isVideoPlaying ? (
                    <button
                      type="button"
                      onClick={() => setPlayingMediaIdx(idx)}
                      aria-label="Play video"
                      className="group/play absolute inset-0 z-10 flex cursor-pointer items-center justify-center focus-visible:outline-none"
                    >
                      <span aria-hidden="true" className="bg-ink/15 absolute inset-0" />
                      <Image
                        src="/showcase/icon-play.svg"
                        alt=""
                        width={113}
                        height={113}
                        className="relative h-[80px] w-[80px] transition-transform duration-300 group-hover/play:scale-110 group-focus-visible/play:scale-110 lg:h-[113px] lg:w-[113px]"
                      />
                    </button>
                  ) : null}

                  {/* Stop-video button — only while a video is actively
                      playing. Returns to the idle (poster + play overlay)
                      state and re-shows the carousel arrows. */}
                  {item.type === "video" && isVideoPlaying ? (
                    <button
                      type="button"
                      onClick={() => setPlayingMediaIdx(null)}
                      aria-label="Stop video and return to gallery"
                      className="bg-surface/90 text-ink hover:bg-surface border-ink/15 absolute top-3 left-3 z-30 grid h-9 w-9 place-items-center rounded-full border shadow transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:top-4 lg:left-4 lg:h-10 lg:w-10"
                    >
                      <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
                        <path
                          d="M13 8H3M3 8l4-4M3 8l4 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </button>
                  ) : null}
                </div>
              );
            })}

            {showArrows ? (
              <>
                {/* Arrows per Figma node `674:475` (right) / `674:480` (left,
                    same icon flipped). The SVG `/showcase/icon-arrow.svg` is
                    the exact Figma asset (red filled circle + 1.5px white
                    chevron) — the button is transparent so the SVG visually
                    *is* the button. Hover/focus get a scale + ring; no color
                    change since the fill is baked into the SVG. */}
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous item"
                  className="focus-visible:ring-brand-red absolute top-1/2 left-4 z-20 h-12 w-12 -translate-y-1/2 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:left-6 lg:h-16 lg:w-16"
                >
                  <Image
                    src="/showcase/icon-arrow.svg"
                    alt=""
                    width={80}
                    height={80}
                    className="h-full w-full -scale-x-100 drop-shadow-md"
                  />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next item"
                  className="focus-visible:ring-brand-red absolute top-1/2 right-4 z-20 h-12 w-12 -translate-y-1/2 transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:right-6 lg:h-16 lg:w-16"
                >
                  <Image
                    src="/showcase/icon-arrow.svg"
                    alt=""
                    width={80}
                    height={80}
                    className="h-full w-full drop-shadow-md"
                  />
                </button>
              </>
            ) : null}

            {showArrows ? (
              <div className="absolute right-0 bottom-3 left-0 z-20 flex items-center justify-center gap-3 lg:bottom-5">
                {media.map((item, idx) => (
                  <button
                    key={`${item.type}-${item.src}-dot`}
                    type="button"
                    aria-label={`Show ${item.type} ${idx + 1}`}
                    aria-current={idx === mediaIdx ? "true" : undefined}
                    onClick={() => setMediaIdx(idx)}
                    className={cn(
                      "h-1.5 rounded-full transition",
                      idx === mediaIdx
                        ? "bg-brand-red w-4"
                        : "bg-surface/40 hover:bg-surface/70 w-1.5",
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {/* Content — right half on desktop, stacked below on mobile.
              Mobile padding per Figma `505:6764`: 30/30 sides + 30 top + 30
              bottom. Desktop padding per Figma `345:9782`: 68/40 sides + 65 top. */}
          <div className="flex w-full flex-1 flex-col overflow-y-auto px-[30px] pt-[30px] pb-[30px] lg:w-1/2 lg:overflow-y-auto lg:px-[68px] lg:pt-[56px] lg:pr-[40px] lg:pb-[40px]">
            {/* Header — desktop has 2 lines (route + Aircraft), mobile drops route line. */}
            {modal ? (
              <>
                <p
                  className={cn(
                    "font-display text-ink hidden uppercase lg:block",
                    "text-[32px] leading-[40px] font-bold",
                  )}
                >
                  {modal.title}
                </p>
                <p
                  className={cn(
                    "font-display text-ink uppercase",
                    "text-[24px] leading-[32px] font-bold",
                    "lg:mt-1 lg:text-[40px] lg:leading-[40px]",
                  )}
                >
                  Aircraft: <span className="text-brand-red">{modal.aircraft}</span>
                </p>

                {/* Meta strip — 2-col on mobile, 3-col on desktop. */}
                <div className="mt-[28px] grid grid-cols-2 gap-x-6 gap-y-4 lg:mt-10 lg:flex lg:gap-x-[42px]">
                  <MetaCell label="Route:" value={modal.route} />
                  <MetaCell label="Transport Mode:" value={modal.transportMode} />
                  <MetaCell
                    label="Timeline:"
                    value={modal.timeline}
                    className="col-span-2 lg:col-auto"
                  />
                </div>

                {/* Sections */}
                <Section heading="The Challenge" body={modal.challenge} />
                <Section heading="The Solution" body={modal.solution} />
                <Section heading="The Result" body={modal.result} />

                {/* Request Quote pill */}
                <div className="mt-[32px] lg:mt-auto lg:pt-8">
                  <button
                    type="button"
                    onClick={handleQuoteClick}
                    className={cn(
                      "bg-brand-red text-surface inline-flex items-center justify-center rounded-[30px]",
                      "font-body font-bold capitalize",
                      "px-[20px] py-[14px] text-[12px] tracking-[0.72px]",
                      "lg:px-[30px] lg:py-[20px] lg:text-[14px] lg:tracking-[0.84px]",
                      "hover:bg-brand-red-dark transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                    )}
                  >
                    Request Quote
                  </button>
                </div>
              </>
            ) : (
              <p className="font-display text-ink text-2xl font-bold uppercase">{tile.alt}</p>
            )}
          </div>

          {/* Close X — accessibility addition (not in Figma). Sits at the
              top of the stacking order (`z-40`) so the play-overlay button
              (`z-10`) covering an idle video can't hide it. See DECISIONS.md. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project detail"
            className="bg-surface/90 text-ink hover:bg-surface border-ink/15 absolute top-3 right-3 z-40 grid h-8 w-8 place-items-center rounded-full border transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:top-4 lg:right-4 lg:h-9 lg:w-9"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14">
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ) : null}
    </Modal>
  );
}

function MetaCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-body text-ink text-[11px] leading-tight lg:text-[13px]">{label}</p>
      <p className="font-body text-brand-red mt-1 text-[14px] leading-tight lg:text-[15px]">
        {value}
      </p>
    </div>
  );
}

function Section({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="mt-[28px] lg:mt-[36px]">
      <h3 className="font-display text-ink text-[16px] leading-tight font-bold uppercase lg:text-[20px]">
        {heading}
      </h3>
      <p className="font-body text-ink mt-[12px] max-w-[585px] text-[14px] leading-[20px] lg:mt-[10px] lg:text-[15px] lg:leading-[28px]">
        {body}
      </p>
    </div>
  );
}
