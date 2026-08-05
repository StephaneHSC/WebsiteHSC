import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { officeLocationsQuery } from "@/lib/sanity/queries";
import { OFFICES, type Office } from "@/lib/constants";
import type { OfficeLocationsDoc } from "@/types/sanity";
import { OfficesGlobalClient } from "./OfficesGlobalClient";

export type OfficesGlobalProps = {
  /**
   * Office id to render as the active office on first load. Matched against
   * whichever `officeId`s exist in Sanity (or the hardcoded `hk`/`philippines`/
   * `usa`/`my` while it's empty). Defaults to the first office.
   */
  defaultActive?: string;
};

/**
 * Server-fetch wrapper for the global offices section (used by home,
 * services, services/[slug], /why-choose-us, /team, /showcase, /quote).
 * Sanity-managed (singleton `officeLocations`, editors can add/reorder
 * offices) with the hardcoded `OFFICES` constant as fallback while Sanity is
 * empty — same pattern as `StatsBand` / `SmartTracking`. The actual
 * interactive UI lives in `OfficesGlobalClient`.
 */
export async function OfficesGlobal({ defaultActive }: OfficesGlobalProps = {}) {
  const doc = await client.fetch<OfficeLocationsDoc | null>(
    officeLocationsQuery,
    {},
    { next: { revalidate: 60 } },
  );
  // Only offices with every required text field + an uploaded cityscape
  // count — an editor can add an array entry in Studio before finishing it.
  const validOffices =
    doc?.offices?.filter(
      (o) =>
        Boolean(o.officeId && o.label && o.country && o.address && o.phone && o.email) &&
        Boolean(o.cityscape?.asset?.url),
    ) ?? [];

  const offices: readonly Office[] =
    validOffices.length > 0
      ? validOffices.map((o) => ({
          id: o.officeId,
          label: o.label,
          country: o.country,
          address: o.address,
          phone: o.phone,
          email: o.email,
          cityscape: {
            src: urlFor(o.cityscape).width(1600).format("webp").quality(80).url(),
            alt: "",
          },
        }))
      : OFFICES;

  return <OfficesGlobalClient offices={offices} defaultActive={defaultActive ?? "uae"} />;
}
