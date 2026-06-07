import { TeamHero } from "@/components/sections/team/TeamHero";
import { TeamSpotlightSection } from "@/components/sections/team/TeamSpotlightSection";
import { OfficesGlobal } from "@/components/sections/_shared/OfficesGlobal";
import { QuoteFormShell } from "@/components/sections/_shared/QuoteFormShell";
import { fetchWithCmsFallback } from "@/components/sections/_shared/cmsFallback";
import { teamMembersQuery } from "@/lib/sanity/queries";
import { PLACEHOLDER_TEAM_MEMBERS, type TeamMemberPlaceholder } from "@/lib/constants";
import type { TeamMember } from "@/types/sanity";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata = pageMetadata({
  title: "Our Team",
  description:
    "Meet the people behind every Heli Skycargo shipment — a global team of helicopter logistics specialists, coordinators, and Japan-desk experts.",
  path: "/team",
});

/**
 * /team — M6. Hero → Experts You Can Trust spotlight + slider → Quote form
 * → Offices (Malaysia featured).
 */
export default async function TeamPage() {
  const members = await fetchWithCmsFallback<TeamMember, TeamMemberPlaceholder>(
    teamMembersQuery,
    PLACEHOLDER_TEAM_MEMBERS,
  );

  return (
    <main className="flex flex-1 flex-col">
      <TeamHero />
      <TeamSpotlightSection members={members} />
      <div id="request-quote" className="scroll-mt-24">
        <QuoteFormShell
          photo={{
            src: "/quote/services-quote.webp",
            alt: "Antonov 124 freighter loading helicopter cargo at sunset",
          }}
        />
      </div>
      <OfficesGlobal defaultActive="my" />
    </main>
  );
}
