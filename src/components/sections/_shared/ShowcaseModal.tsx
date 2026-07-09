"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import type { ShowcaseMedia, ShowcaseTile } from "@/lib/constants";
import type { ShowcaseGalleryImage } from "@/types/sanity";
import { urlFor } from "@/lib/sanity/image";

export type ShowcaseModalProps = {
  /** Tile to display. `null` keeps the modal closed. */
  tile: ShowcaseTile | null;
  onClose: () => void;
  /** CMS-managed gallery thumbnails for the active tile. */
  galleryImages?: ShowcaseGalleryImage[];
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
/**
 * Renders `**bold**` runs inside a plain-text line as <strong>. Keeps the
 * CMS field a simple text array (no rich-text editor) while letting editors
 * bold key terms per the client copy doc.
 */
function renderBoldRuns(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-ink font-bold">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

/**
 * Horizontally scrollable thumbnail strip with chevron nav buttons that
 * appear only when the strip overflows (e.g. many slides now that the CMS
 * media array is uncapped). Used by both the media and gallery strips.
 */
function ThumbStrip({ ariaLabel, children }: { ariaLabel: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function update() {
      if (!el) return;
      const max = el.scrollWidth - el.clientWidth;
      setCanLeft(el.scrollLeft > 1);
      setCanRight(el.scrollLeft < max - 1);
    }
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  const arrowClass =
    "absolute top-1/2 z-10 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-ink shadow transition hover:bg-surface focus-visible:ring-brand-red focus-visible:ring-2 focus-visible:outline-none";

  return (
    <div className="bg-ink relative shrink-0">
      {canLeft ? (
        <button
          type="button"
          aria-label="Scroll thumbnails left"
          onClick={() => scrollBy(-1)}
          className={cn(arrowClass, "left-1.5")}
        >
          <ChevronGlyph dir="left" />
        </button>
      ) : null}
      <div
        ref={ref}
        role="list"
        aria-label={ariaLabel}
        className="flex gap-1.5 overflow-x-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {canRight ? (
        <button
          type="button"
          aria-label="Scroll thumbnails right"
          onClick={() => scrollBy(1)}
          className={cn(arrowClass, "right-1.5")}
        >
          <ChevronGlyph dir="right" />
        </button>
      ) : null}
    </div>
  );
}

function ChevronGlyph({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const DESCRIPTION_TEXT_CLASS =
  "font-body text-ink-soft text-[14px] leading-[24px] lg:text-[15px] lg:leading-[28px]";

/**
 * Mini-markdown renderer for a modal description entry. Supports:
 * - `**bold**` runs anywhere
 * - lines starting with `- ` → bullet list
 * - lines starting with `1. ` / `2. ` … → numbered list
 * Consecutive list lines group into one <ul>/<ol>; everything else renders
 * as paragraph lines.
 */
function DescriptionBlock({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim());
  type Block =
    | { kind: "p"; lines: string[] }
    | { kind: "ul"; items: string[] }
    | { kind: "ol"; items: string[] };
  const blocks: Block[] = [];

  for (const line of lines) {
    if (line.length === 0) continue;
    const bullet = line.match(/^-\s+(.*)$/);
    const numbered = line.match(/^\d+[.)]\s+(.*)$/);
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.kind === "ul") last.items.push(bullet[1]!);
      else blocks.push({ kind: "ul", items: [bullet[1]!] });
    } else if (numbered) {
      if (last?.kind === "ol") last.items.push(numbered[1]!);
      else blocks.push({ kind: "ol", items: [numbered[1]!] });
    } else {
      if (last?.kind === "p") last.lines.push(line);
      else blocks.push({ kind: "p", lines: [line] });
    }
  }

  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === "ul") {
          return (
            <ul key={i} className={cn(DESCRIPTION_TEXT_CLASS, "list-disc space-y-1 pl-5")}>
              {block.items.map((item, j) => (
                <li key={j}>{renderBoldRuns(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.kind === "ol") {
          return (
            <ol key={i} className={cn(DESCRIPTION_TEXT_CLASS, "list-decimal space-y-1 pl-5")}>
              {block.items.map((item, j) => (
                <li key={j}>{renderBoldRuns(item)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className={DESCRIPTION_TEXT_CLASS}>
            {renderBoldRuns(block.lines.join(" "))}
          </p>
        );
      })}
    </>
  );
}

export function ShowcaseModal({ tile, onClose, galleryImages }: ShowcaseModalProps) {
  const router = useRouter();
  const [mediaIdx, setMediaIdx] = useState(0);
  // `playingMediaIdx` tracks which media item is actively playing (videos
  // start in an idle "poster + play overlay" state and become a true
  // `<video controls>` only after the user clicks play). Navigating the
  // carousel or closing the modal resets it to `null`.
  const [playingMediaIdx, setPlayingMediaIdx] = useState<number | null>(null);
  const [lastTileId, setLastTileId] = useState<string | null>(tile?.id ?? null);
  const [lastMediaIdx, setLastMediaIdx] = useState(mediaIdx);
  // Gallery thumbnail selected index — -1 means the main tile media is active.
  const [galleryIdx, setGalleryIdx] = useState<number>(-1);

  // Reset carousel when the active tile changes — React 19 in-render reset
  // pattern (https://react.dev/reference/react/useState#storing-information-from-previous-renders).
  if ((tile?.id ?? null) !== lastTileId) {
    setLastTileId(tile?.id ?? null);
    setMediaIdx(0);
    setPlayingMediaIdx(null);
    setGalleryIdx(-1);
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

  // When a gallery thumbnail is selected, override what's shown in the main viewer.
  const activeGalleryImage =
    galleryIdx >= 0 && galleryImages && galleryImages[galleryIdx]
      ? galleryImages[galleryIdx]
      : null;

  const mediaCount = media.length;
  const isPlayingCurrent = playingMediaIdx === mediaIdx;
  // Hide arrows + dots while a video is playing or a gallery image is active.
  const showArrows = mediaCount > 1 && !isPlayingCurrent && galleryIdx < 0;

  const next = useCallback(() => {
    setGalleryIdx(-1);
    setMediaIdx((i) => (i + 1) % mediaCount);
  }, [mediaCount]);
  const prev = useCallback(() => {
    setGalleryIdx(-1);
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
    // Build a prefill payload from the tile's modal metadata when present.
    // Routes are parsed from `modal.route` of the form "Origin → Destination".
    // The showcase tile's `transportMode` uses descriptive labels (e.g.
    // "Ocean Freight (RoRo)", "Air Charter (AN-124)") that don't match the
    // form's canonical 6-mode dropdown values verbatim — map them here.
    const SHOWCASE_MODE_MAP: Record<string, string> = {
      "Air Commercial": "Air Commercial",
      "Air Charter (AN-124)": "Air Charter",
      "Ocean Freight (RoRo)": "Ocean RoRo",
      "Ocean Freight (LoLo)": "Ocean Breakbulk (Lo/Lo)",
      "Ocean Freight (FCL)": "Ocean Container",
      "Road Freight": "Land",
      Ground: "Land",
      // Ambiguous labels ("Multi-modal", "Ocean Freight", "Ground/Air",
      // "Local Coordination") intentionally unmapped — better to leave the
      // mode untouched than guess wrong.
    };
    const rawMode = tile?.modal?.transportMode;
    const mode = rawMode ? SHOWCASE_MODE_MAP[rawMode] : undefined;
    // Route prefill dropped with the 2026-07 modal simplification — the modal
    // no longer carries a structured route field.
    const origin: string | undefined = undefined;
    const destination: string | undefined = undefined;

    const target = document.getElementById("request-quote");
    if (target) {
      // Dispatch the prefill event so QuoteFormCore merges values into state.
      // Mode is validated by the listener so unknown labels are silently dropped.
      window.dispatchEvent(
        new CustomEvent("hsc:quote-prefill", {
          detail: {
            mode,
            routes:
              origin || destination
                ? [{ origin: origin ?? "", destination: destination ?? "" }]
                : undefined,
          },
        }),
      );
      // Small delay so the dialog's close animation completes before the scroll.
      window.setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    } else {
      // No on-page form — fall back to /quote with query-string prefill.
      const params = new URLSearchParams();
      if (mode) params.set("mode", mode);
      if (origin) params.set("origin", origin);
      if (destination) params.set("destination", destination);
      const qs = params.toString();
      router.push(qs ? `/quote?${qs}` : "/quote");
    }
  }, [onClose, router, tile]);

  const modal = tile?.modal;
  const ariaLabel = modal?.title ?? tile?.alt ?? "Project detail";

  return (
    <Modal open={tile !== null} onClose={onClose} size="xl" bare ariaLabel={ariaLabel}>
      {tile ? (
        <div className="relative flex max-h-[92vh] flex-col overflow-hidden lg:max-h-[90vh] lg:flex-row lg:items-stretch">
          {/* Mobile-only title bar — client direction (2026-07): the title
              must be the FIRST thing visible when a tile opens, above the
              photo. Desktop keeps the title in the right content column. */}
          {/* {modal ? (
            <div className="bg-surface shrink-0 px-[30px] pt-[24px] pr-14 pb-[12px] lg:hidden">
              <p className="font-display text-ink text-[20px] leading-[26px] font-bold uppercase">
                {modal.title}
              </p>
              {modal.subtitle ? (
                <p className="font-display text-ink mt-0.5 text-[14px] leading-[20px] font-bold uppercase">
                  {modal.subtitle}
                </p>
              ) : null}
            </div>
          ) : null} */}

          {/* Media area — top on mobile, left half on desktop. The carousel
              iterates over `media` and renders photo / video items in place;
              arrows + dots paginate across both types. On desktop the parent
              uses `lg:flex-row lg:items-stretch` so this column self-stretches
              to the content column's natural height (no fixed aspect needed). */}
          {/* shrink-0: without it the mobile flex-col (capped at 92vh) lets a
              long description column crush the photo viewer to zero height. */}
          <div className="bg-ink relative flex w-full shrink-0 flex-col overflow-hidden lg:w-1/2">
            {/* Main viewer */}
            <div className="relative aspect-[382/345] w-full shrink-0 overflow-hidden lg:aspect-auto lg:flex-1">
              {/* Gallery image override — shown instead of carousel when a thumbnail is active */}
              {activeGalleryImage ? (
                <div className="absolute inset-0 z-10">
                  <Image
                    src={urlFor(activeGalleryImage.image)
                      .width(900)
                      .format("webp")
                      .quality(80)
                      .url()}
                    alt={activeGalleryImage.caption ?? "Gallery image"}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                  {/* Back to carousel button */}
                  <button
                    type="button"
                    onClick={() => setGalleryIdx(-1)}
                    aria-label="Back to main photo"
                    className="bg-surface/90 text-ink hover:bg-surface border-ink/15 absolute top-3 left-3 z-20 grid h-9 w-9 place-items-center rounded-full border shadow transition hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:top-4 lg:left-4 lg:h-10 lg:w-10"
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
                </div>
              ) : (
                media.map((item, idx) => {
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
                })
              )}

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

            {/* Media thumbnail strip — shown when the tile has 2+ media items. */}
            {media.length > 1 ? (
              <ThumbStrip ariaLabel="Media thumbnails">
                {media.map((item, idx) => {
                  const thumbSrc =
                    item.type === "video" && "poster" in item
                      ? (item.poster ?? item.src)
                      : item.src;
                  const isActive = mediaIdx === idx;
                  return (
                    <button
                      key={idx}
                      role="listitem"
                      type="button"
                      aria-label={`${item.type === "video" ? "Video" : "Photo"} ${idx + 1}`}
                      aria-pressed={isActive}
                      onClick={() => {
                        setMediaIdx(idx);
                        setPlayingMediaIdx(null);
                      }}
                      className={cn(
                        "relative h-[70px] w-[100px] shrink-0 overflow-hidden rounded transition",
                        "focus-visible:ring-brand-red focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
                        isActive
                          ? "ring-brand-red ring-2 ring-offset-1"
                          : "opacity-60 hover:opacity-100",
                      )}
                    >
                      <Image src={thumbSrc} alt="" fill sizes="100px" className="object-cover" />
                      {item.type === "video" ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <svg
                            viewBox="0 0 16 16"
                            width="18"
                            height="18"
                            fill="white"
                            aria-hidden="true"
                          >
                            <path d="M5 3.5l8 4.5-8 4.5V3.5z" />
                          </svg>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </ThumbStrip>
            ) : null}

            {/* CMS gallery thumbnail strip — shown when at least 1 gallery image exists. */}
            {galleryImages && galleryImages.length > 0 ? (
              <ThumbStrip ariaLabel="Gallery thumbnails">
                {galleryImages.map((img, idx) => {
                  const thumbUrl = urlFor(img.image)
                    .width(200)
                    .height(140)
                    .fit("crop")
                    .format("webp")
                    .quality(75)
                    .url();
                  const isActive = galleryIdx === idx;
                  return (
                    <button
                      key={idx}
                      role="listitem"
                      type="button"
                      aria-label={img.caption ?? `Gallery image ${idx + 1}`}
                      aria-pressed={isActive}
                      onClick={() => setGalleryIdx(isActive ? -1 : idx)}
                      className={cn(
                        "relative h-[70px] w-[100px] shrink-0 overflow-hidden rounded transition",
                        "focus-visible:ring-brand-red focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none",
                        isActive
                          ? "ring-brand-red ring-2 ring-offset-1"
                          : "opacity-80 hover:opacity-100",
                      )}
                    >
                      <Image
                        src={thumbUrl}
                        alt={img.caption ?? ""}
                        fill
                        sizes="100px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </ThumbStrip>
            ) : null}
          </div>

          {/* Content — right half on desktop, stacked below on mobile.
              Mobile padding per Figma `505:6764`: 30/30 sides + 30 top + 30
              bottom. Desktop padding per Figma `345:9782`: 68/40 sides + 65 top. */}
          <div className="flex w-full flex-1 flex-col overflow-y-auto px-[30px] pt-[30px] pb-[30px] lg:w-1/2 lg:overflow-y-auto lg:px-[68px] lg:pt-[56px] lg:pr-[40px] lg:pb-[40px]">
            {/* Header — client direction (2026-07): title + description only,
                no aircraft / route / transport mode / timeline / challenge /
                solution / result structure. */}
            {modal ? (
              <>
                <div className="bg-surface shrink-0 pr-14 pb-[12px]">
                  <p className="font-display text-ink text-[20px] leading-[26px] font-bold break-words whitespace-normal uppercase lg:text-[32px] lg:leading-[40px] lg:font-bold">
                    {modal.title}
                  </p>
                  {modal.subtitle ? (
                    <p className="font-display text-ink mt-0.5 text-[14px] leading-[20px] font-bold uppercase lg:block lg:text-[22px] lg:leading-[30px]">
                      {modal.subtitle}
                    </p>
                  ) : null}
                </div>

                {modal.aircraft ? (
                  /* Legacy "Aircraft: …" line (Figma 345:9782) — larger than
                     the title, label in ink + model in brand red. */
                  <p className="font-display text-ink mt-1 text-[24px] leading-[32px] font-bold uppercase lg:text-[40px] lg:leading-[40px]">
                    Aircraft: <span className="text-brand-red">{modal.aircraft}</span>
                  </p>
                ) : null}

                <div className="mt-6 space-y-4 lg:mt-8">
                  {modal.description.map((paragraph, i) => (
                    <DescriptionBlock key={i} text={paragraph} />
                  ))}
                </div>

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
