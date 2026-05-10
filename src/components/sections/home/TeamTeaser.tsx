import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionHeading } from "@/components/sections/_shared/SectionHeading";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { ScrollSnapRow } from "@/components/sections/_shared/ScrollSnapRow";
import { fetchWithCmsFallback } from "@/components/sections/_shared/cmsFallback";
import { teamMembersQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/image";
import type { TeamMember } from "@/types/sanity";
import { cn } from "@/lib/utils";

// TODO(seed): drop once Sanity is populated.
type PlaceholderMember = {
  _id: string;
  full_name: string;
  role: string;
  /** Static portrait PNG used while Sanity is empty. */
  placeholderPhoto: string;
};

const PLACEHOLDER_MEMBERS: readonly PlaceholderMember[] = [
  {
    _id: "p1",
    full_name: "Stephane Marot",
    role: "Founder & CEO",
    placeholderPhoto: "/team/stephane-marot.png",
  },
  {
    _id: "p2",
    full_name: "Daniel Cosico",
    role: "Deployment & Coordination Executive",
    placeholderPhoto: "/team/daniel-cosico.png",
  },
  {
    _id: "p3",
    full_name: "Adriana Athirah",
    role: "Sales & Marketing Executive",
    placeholderPhoto: "/team/adriana-athirah.png",
  },
  {
    _id: "p4",
    full_name: "Daniel Cosico",
    role: "Customer Logistic Specialist",
    placeholderPhoto: "/team/daniel-cosico.png",
  },
];

function isPlaceholder(m: TeamMember | PlaceholderMember): m is PlaceholderMember {
  return "placeholderPhoto" in m;
}

export async function TeamTeaser() {
  const display = await fetchWithCmsFallback<TeamMember, PlaceholderMember>(
    teamMembersQuery,
    PLACEHOLDER_MEMBERS,
    4,
  );

  return (
    <Section tone="light" spacing="loose" className="overflow-hidden">
      <Container>
        <SectionHeading
          eyebrow="Our Team"
          eyebrowVariant="outline"
          title={
            <>
              Meet The Team <span className="font-bold md:block">Behind Every Mission</span>
            </>
          }
          align="center"
          uppercase
        />
      </Container>

      <Container className="mt-4 lg:mt-6">
        <Reveal delay={0.3}>
          <ScrollSnapRow
            ariaLabel="Heli Skycargo team members"
            className="gap-4 pt-12 pb-4 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:pb-0 lg:gap-6"
          >
            <li className="w-72 shrink-0 snap-center sm:w-80 md:w-auto md:shrink">
              <LogoCard />
            </li>
            {display.map((member, i) => (
              <li
                key={member._id}
                className="w-72 shrink-0 snap-center sm:w-80 md:w-auto md:shrink"
              >
                <TeamCard member={member} active={i === 0} />
              </li>
            ))}
          </ScrollSnapRow>
        </Reveal>
      </Container>
    </Section>
  );
}

function LogoCard() {
  return (
    <div className="bg-surface border-ink/10 flex h-full items-center justify-center border p-6">
      <Image
        src="/team/hsc-roundel.png"
        alt="Heli Skycargo"
        width={400}
        height={400}
        className="h-auto w-3/5 max-w-[180px]"
        priority
      />
    </div>
  );
}

type TeamCardProps = {
  member: TeamMember | PlaceholderMember;
  active?: boolean;
};

function TeamCard({ member, active = false }: TeamCardProps) {
  const sanityPhoto = !isPlaceholder(member) ? (member.photo ?? null) : null;
  const placeholderPhotoSrc = isPlaceholder(member) ? member.placeholderPhoto : null;
  const photoSrc = sanityPhoto
    ? urlFor(sanityPhoto).width(500).height(720).format("webp").quality(82).url()
    : placeholderPhotoSrc;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col items-center px-3 pt-3 pb-6 transition-colors duration-300",
        active
          ? "bg-brand-red text-surface"
          : "bg-surface text-ink border-ink/10 md:hover:bg-brand-red md:hover:text-surface border md:hover:border-transparent",
      )}
    >
      <div
        className={cn(
          "relative aspect-[244/280] w-full",
          active ? "bg-[#F5D5D2]" : "bg-[#F2F2F2] md:group-hover:bg-[#F5D5D2]",
        )}
      >
        {photoSrc ? (
          // Photo wrapper is bottom-anchored and ~8% taller than the plate so
          // the head crown peeks above the plate edge.
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[108%] overflow-hidden">
            <Image
              src={photoSrc}
              alt={member.full_name}
              fill
              sizes="(min-width: 1024px) 220px, (min-width: 640px) 240px, 220px"
              className="object-cover object-top transition-transform duration-500 md:group-hover:scale-[1.03]"
            />
          </div>
        ) : (
          <PlaceholderAvatar name={member.full_name} />
        )}
      </div>

      <div className="mt-auto pt-4 text-center">
        <h3 className="font-display text-base leading-tight font-bold tracking-tight">
          {member.full_name}
        </h3>
        <p
          className={cn(
            "font-body mt-1.5 text-xs",
            active ? "text-surface/85" : "text-ink-soft md:group-hover:text-surface/85",
          )}
        >
          {member.role}
        </p>
      </div>
    </article>
  );
}

type PlaceholderAvatarProps = { name: string };

function PlaceholderAvatar({ name }: PlaceholderAvatarProps) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="bg-ink/5 flex h-full w-full items-center justify-center">
      <span className="font-display text-ink/30 text-5xl font-extrabold tracking-tight">
        {initials}
      </span>
    </div>
  );
}
