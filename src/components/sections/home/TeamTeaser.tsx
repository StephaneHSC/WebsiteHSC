import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionHeading } from "@/components/sections/_shared/SectionHeading";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { fetchWithCmsFallback } from "@/components/sections/_shared/cmsFallback";
import { teamMembersQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { TeamMember } from "@/types/sanity";
import { PLACEHOLDER_TEAM_MEMBERS, type TeamMemberPlaceholder } from "@/lib/constants";
import { TeamCarousel, type TeamCarouselItem } from "./TeamCarousel";

function isPlaceholder(m: TeamMember | TeamMemberPlaceholder): m is TeamMemberPlaceholder {
  return "placeholderPhoto" in m;
}

export async function TeamTeaser() {
  const display = await fetchWithCmsFallback<TeamMember, TeamMemberPlaceholder>(
    teamMembersQuery,
    PLACEHOLDER_TEAM_MEMBERS,
    4,
  );

  // Resolve photo URLs server-side so the client component receives plain
  // serializable props (no Sanity image builders crossing the boundary).
  const items: TeamCarouselItem[] = display.map((m) => {
    let photoSrc: string | null = null;
    if (isPlaceholder(m)) {
      photoSrc = m.placeholderPhoto ?? null;
    } else if (m.photo) {
      photoSrc = urlFor(m.photo).width(500).fit("max").format("webp").quality(82).url();
    }
    return {
      id: m._id,
      name: m.full_name,
      role: m.role,
      photoSrc,
    };
  });

  return (
    <Section tone="light" spacing="loose" className="overflow-hidden">
      <Container>
        <SectionHeading
          eyebrow="Our Team"
          eyebrowVariant="outline"
          title={
            <>
              Meet The Team <span className="block font-semibold">Behind Every Mission</span>
            </>
          }
          align="center"
          uppercase
        />
      </Container>

      <Container className="mt-4 lg:mt-6">
        <Reveal delay={0.3}>
          <TeamCarousel items={items} />
        </Reveal>
      </Container>
    </Section>
  );
}
