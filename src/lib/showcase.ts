import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { allShowcaseGalleriesQuery, allShowcaseItemsQuery } from "@/lib/sanity/queries";
import { SHOWCASE_TILES, type ShowcaseMedia, type ShowcaseTile } from "@/lib/constants";
import type { ShowcaseGalleryImage, ShowcaseItemDoc, ShowcaseItemGallery } from "@/types/sanity";

export type ShowcaseData = {
  tiles: readonly ShowcaseTile[];
  galleries: Record<string, ShowcaseGalleryImage[]>;
  /** True when tiles came from Sanity; false = hardcoded fallback. */
  fromCms: boolean;
};

/**
 * Showcase tiles, CMS-first (2026-07): when any `showcaseItem` documents
 * exist in Sanity they fully drive the mosaic (ordered by `order`); when
 * none exist we fall back to the hardcoded `SHOWCASE_TILES` plus the legacy
 * per-slug gallery lookup so the site works pre-seed.
 */
export async function getShowcaseData(): Promise<ShowcaseData> {
  const docs = await client.fetch<ShowcaseItemDoc[]>(
    allShowcaseItemsQuery,
    {},
    { next: { revalidate: 60 } },
  );

  if (docs && docs.length > 0) {
    const galleries = Object.fromEntries(
      docs
        .filter((d) => d.gallery_images && d.gallery_images.length > 0)
        .map((d) => [d.slug, d.gallery_images!]),
    );
    return { tiles: docs.map(mapDocToTile), galleries, fromCms: true };
  }

  const galleryDocs = await client.fetch<ShowcaseItemGallery[]>(
    allShowcaseGalleriesQuery,
    {},
    { next: { revalidate: 60 } },
  );
  return {
    tiles: SHOWCASE_TILES,
    galleries: Object.fromEntries(galleryDocs.map((d) => [d.slug, d.gallery_images])),
    fromCms: false,
  };
}

function mapDocToTile(doc: ShowcaseItemDoc): ShowcaseTile {
  const tileSrc = urlFor(doc.image).width(900).format("webp").quality(80).url();

  // Modal carousel: tile photo is always slide 1, then the editor-ordered
  // mixed media array (photos + videos). Legacy `media_photos` / `video_url`
  // fields still render (after the mixed array) for docs created before the
  // modal_media migration.
  const tileVideo = doc.tile_video_file ?? doc.tile_video_url;
  const media: ShowcaseMedia[] = [
    // Tile video (when set) opens the modal on a playable video — the tile
    // photo doubles as its poster. Otherwise slide 1 is the tile photo.
    tileVideo
      ? { type: "video", src: tileVideo, poster: tileSrc }
      : { type: "photo", src: tileSrc },
    ...(doc.modal_media ?? []).flatMap((item): ShowcaseMedia[] => {
      if (item._type === "videoSlide") {
        const src = item.fileUrl ?? item.url;
        if (!src) return [];
        return [
          {
            type: "video",
            src,
            poster: item.poster
              ? urlFor(item.poster).width(1200).format("webp").quality(80).url()
              : tileSrc,
          },
        ];
      }
      return [
        {
          type: "photo",
          src: urlFor(item).width(1200).format("webp").quality(80).url(),
        },
      ];
    }),
    ...(doc.media_photos ?? []).map(
      (img): ShowcaseMedia => ({
        type: "photo",
        src: urlFor(img).width(1200).format("webp").quality(80).url(),
      }),
    ),
    ...(doc.video_url
      ? [{ type: "video", src: doc.video_url, poster: tileSrc } as ShowcaseMedia]
      : []),
  ];

  // De-duplicate by source URL — editors sometimes register the same video
  // both as the Tile Video and as a slideshow slide (or leave it in the
  // legacy video_url field), which would otherwise render identical slides.
  const seen = new Set<string>();
  const dedupedMedia = media.filter((m) => {
    if (seen.has(m.src)) return false;
    seen.add(m.src);
    return true;
  });

  return {
    id: doc.slug,
    src: tileSrc,
    media: dedupedMedia.length > 1 || tileVideo ? dedupedMedia : undefined,
    alt: doc.alt,
    label: doc.label && doc.label.length > 0 ? doc.label : undefined,
    hasPlayIcon: doc.has_play_icon || undefined,
    shape: doc.shape,
    desktopColumn: Math.min(3, Math.max(0, doc.desktop_column)) as 0 | 1 | 2 | 3,
    mobileColumn: Math.min(1, Math.max(0, doc.mobile_column)) as 0 | 1,
    relatedServices:
      doc.related_services && doc.related_services.length > 0 ? doc.related_services : undefined,
    modal: {
      title: doc.modal_title,
      subtitle: doc.modal_subtitle,
      aircraft: doc.aircraft,
      description: doc.modal_description,
      transportMode: doc.transport_mode,
    },
  };
}
