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
  const src = urlFor(doc.image).width(900).format("webp").quality(80).url();

  // Modal carousel: tile photo is always slide 1, then extra photos, then
  // the optional video (poster = tile photo).
  const media: ShowcaseMedia[] = [
    { type: "photo", src },
    ...(doc.media_photos ?? []).map(
      (img): ShowcaseMedia => ({
        type: "photo",
        src: urlFor(img).width(1200).format("webp").quality(80).url(),
      }),
    ),
    ...(doc.video_url ? [{ type: "video", src: doc.video_url, poster: src } as ShowcaseMedia] : []),
  ];

  return {
    id: doc.slug,
    src,
    media: media.length > 1 ? media : undefined,
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
