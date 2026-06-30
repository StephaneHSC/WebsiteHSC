"use client";

import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { ScrollSnapRow } from "@/components/sections/_shared/ScrollSnapRow";
import {
  TEAM_INTRO,
  TEAM_SPOTLIGHT_OVERLAY,
  TEAM_SPOTLIGHT_PLACEHOLDER_PHOTO,
  type TeamMemberPlaceholder,
} from "@/lib/constants";
import type { TeamMember } from "@/types/sanity";
import { urlFor } from "@/lib/sanity/image";
import { cn } from "@/lib/utils";

type AnyMember = TeamMember | TeamMemberPlaceholder;

export type TeamSpotlightSectionProps = {
  members: readonly AnyMember[];
};

/**
 * Heading + Spotlight composite + 9-card slider, all driven by a single
 * `activeId` state so clicking a card swaps the spotlight content. Single
 * client island per M6_PLAN §3.2.
 */
export function TeamSpotlightSection({ members }: TeamSpotlightSectionProps) {
  const initialId = useMemo(() => {
    const featured = members.find((m) => m.is_featured);
    return featured?._id ?? members[0]?._id ?? null;
  }, [members]);

  const [activeId, setActiveId] = useState<string | null>(initialId);
  const active = useMemo(
    () => members.find((m) => m._id === activeId) ?? members[0] ?? null,
    [members, activeId],
  );

  if (!active) return null;

  return (
    <section className="bg-surface relative w-full overflow-hidden pt-10 pb-12 md:pt-14 md:pb-16 lg:pt-20 lg:pb-24">
      {/* §3.2.1 — Heading */}
      <Container>
        <div className="mx-auto flex max-w-[1167px] flex-col items-center text-center">
          <Reveal>
            <SectionEyebrow variant="gray" className="px-2 py-2">
              {TEAM_INTRO.eyebrow}
            </SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <SpotlightHeadline />
          </Reveal>
        </div>
      </Container>

      {/* §3.2.2 — Spotlight composite (full-bleed photo + content) with the
          card slider absolutely positioned at the bottom of the photo per
          Figma `344:5593`. Cards stay fully INSIDE the photo's bottom edge
          (no spill onto the white area below).

          `bg-ink` lives on this outer wrapper so the dark backdrop extends
          past the photo to cover the spotlight content stack AND the slider
          on mobile (Figma `505:7078` — image 64 is 818px tall vs image 60's
          500px, dark gradient continues behind the cards). On desktop the
          photo is `lg:absolute lg:inset-0` and covers this bg entirely. */}
      <div className="bg-ink relative mt-10 w-full md:mt-14 lg:mt-[51px]">
        <SpotlightComposite member={active} />

        {/* Slider overlay — absolute on lg+, in-flow at smaller widths.
            `bottom-8` keeps the cards inset from the photo's bottom edge so
            the entire card row sits on top of the photo, never below it.
            Below lg the cards live inside the dark band, with bottom padding
            so they aren't flush with the section edge. */}
        <div className="pt-2 pb-10 md:pt-4 md:pb-14 lg:absolute lg:right-0 lg:bottom-8 lg:left-0 lg:pt-0 lg:pb-0">
          <Reveal delay={0.4}>
            <TeamSlider members={members} activeId={active._id} onSelect={setActiveId} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * 3-line uppercase H2 with mixed Inter Tight Black + Bold weights. Mobile
 * re-wraps to 4 lines per Figma `505:7073` (we let the browser pick the wrap
 * point inside the constrained heading width so the visual matches).
 */
function SpotlightHeadline() {
  return (
    <h2
      className={cn(
        // Mobile spacing matches Figma `505:7076` (eyebrow→H2 gap ≈ 24px).
        "font-display text-ink mt-6 uppercase",
        // Mobile font is 22/30 (Figma spec is 24/34, but 24 wraps "OUR TEAM
        // IS FUELED BY PASSION" at iPhone-SE widths — 22 keeps it on one
        // line so the headline reads as 4 clean lines).
        "text-[22px] leading-[30px]",
        "md:mt-8 md:text-[36px] md:leading-[48px]",
        "lg:text-[54px] lg:leading-[66px]",
      )}
    >
      <span className="block font-black">{TEAM_INTRO.h2Lines[0]}</span>
      <span className="block font-bold">{TEAM_INTRO.h2Lines[1]}</span>
      {/* Line 3 + 4: each its own line on mobile (Figma `505:7076`); on
          desktop lines 3 and 4 collapse to a single line. `{" "}` makes the
          inter-line space load-bearing so Prettier / a refactor can't eat it. */}
      <span className="block font-bold">
        {TEAM_INTRO.h2Lines[2]}
        <span className="hidden lg:inline"> {TEAM_INTRO.h2Lines[3]}</span>
      </span>
      <span className="block font-bold lg:hidden">{TEAM_INTRO.h2Lines[3]}</span>
    </h2>
  );
}

// ── Spotlight composite ─────────────────────────────────────────────────────

type SpotlightCompositeProps = {
  member: AnyMember;
};

function SpotlightComposite({ member }: SpotlightCompositeProps) {
  const photo = resolveSpotlightPhoto(member);
  const role = "role" in member ? member.role : "";
  const bioParagraphs = resolveBioParagraphs(member);
  const linkedinHref = member.social_links?.linkedin;
  const emailHref = member.social_links?.email ? `mailto:${member.social_links.email}` : undefined;
  // Wide candid (Stephane CEO) covers the frame. Cutout portraits (everyone
  // else) need `contain` so the full body shows on the dark backdrop without
  // a weird upscale crop.
  const usesWidePhoto = isPlaceholder(member)
    ? Boolean(member.spotlightPhoto)
    : Boolean(member.is_featured);

  return (
    <div className="relative w-full">
      {/*
        Mobile (<lg): photo at top (430×500 per Figma `505:7077`); content
        (name + bio) overlaps the bottom ~43% of the photo via a -mt offset
        and extends below onto the dark `bg-ink` band where the slider lives.
        Desktop (lg+): single 1600×900 photo with content absolute-positioned
        over the upper-right per Figma `344:5593`.
      */}
      <div className="relative w-full lg:aspect-[1600/900]">
        {/* Photo wrapper — Figma mobile aspect (430/500), absolute fill on lg+. */}
        <div className="relative aspect-[430/500] w-full lg:absolute lg:inset-0 lg:aspect-auto lg:h-full">
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="100vw"
            priority
            className={cn(
              "transition-opacity duration-300 ease-out",
              usesWidePhoto
                ? "object-cover object-left lg:object-center"
                : "object-contain object-left-bottom",
            )}
          />
          {/* Desktop-only right-vignette overlay (Figma `344:5593`). */}
          <Image
            src={TEAM_SPOTLIGHT_OVERLAY.src}
            alt=""
            fill
            sizes="100vw"
            aria-hidden="true"
            className="pointer-events-none hidden object-cover lg:block"
          />
          {/* Mobile-only bottom darkener — Figma `505:7078` (image 64 is the
              818-tall dark gradient that sits over the photo bottom + extends
              below). Here we just darken the bottom ~60% of the photo so the
              overlaid name+bio reads cleanly against any photo. */}
          <span
            aria-hidden="true"
            className="from-ink/0 via-ink/70 to-ink pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-b lg:hidden"
          />
        </div>

        {/* Content layer — mobile uses -mt to overlap the photo's bottom
            ~43% (matches Figma `505:7079/7080` where the name sits at 57%
            into the photo). Content extends below the photo into the
            parent's bg-ink band. Desktop keeps the absolute upper-right
            placement.
            margin-top with a % is relative to container width, so -50% of
            ~430 = -215 px lifts content's top onto the photo's lower half. */}
        <Container className="pointer-events-none relative z-10 -mt-[50%] lg:absolute lg:inset-0 lg:mt-0">
          <div className="relative h-full w-full">
            <div
              className={cn(
                "pointer-events-auto pb-10",
                // Desktop: anchor the content block to the right side of the
                // photo per Figma `344:5593` (left:929 ≈ 58% from left at the
                // 1600px design width). The 540px max-width keeps bio lines
                // tight; the right-[40px] inset hugs the viewport edge.
                "lg:absolute lg:top-[19.7%] lg:right-[40px] lg:max-w-[540px] lg:pb-0 xl:right-[60px]",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Reveal delay={0.2}>
                    <h3 className="font-display text-surface text-[24px] leading-[32px] font-semibold capitalize uppercase lg:text-[40px] lg:leading-[56px]">
                      {member.full_name}
                    </h3>
                  </Reveal>
                  {role ? (
                    <Reveal delay={0.25}>
                      <p className="font-body text-surface mt-1 text-[14px] leading-[24px] capitalize lg:mt-2 lg:text-[17px] lg:leading-[30px]">
                        {role}
                      </p>
                    </Reveal>
                  ) : null}

                  <Reveal delay={0.3}>
                    <div className="mt-4 space-y-4 lg:mt-6 lg:space-y-5">
                      {bioParagraphs.map((p, i) => (
                        <p
                          key={i}
                          className={cn(
                            "font-body text-surface text-justify text-[14px] leading-[20px] lg:text-left lg:text-[17px] lg:leading-[28px]",
                            "max-w-none lg:max-w-[462px]",
                          )}
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </Reveal>
                </div>

                <Reveal delay={0.35} className="shrink-0">
                  <SocialIconRow linkedinHref={linkedinHref} emailHref={emailHref} />
                </Reveal>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

type SocialIconRowProps = {
  linkedinHref?: string;
  emailHref?: string;
};

function SocialIconRow({ linkedinHref, emailHref }: SocialIconRowProps) {
  return (
    <div className="flex items-center gap-2 lg:gap-[13px]">
      <SocialIconSquare
        href={linkedinHref}
        label="LinkedIn profile"
        iconSrc="/team/icon-linkedin.svg"
      />
      <SocialIconSquare href={emailHref} label="Send email" iconSrc="/team/icon-email.svg" />
    </div>
  );
}

type SocialIconSquareProps = {
  href?: string;
  label: string;
  iconSrc: string;
};

function SocialIconSquare({ href, label, iconSrc }: SocialIconSquareProps) {
  const inner = (
    <span className="bg-brand-red flex size-8 items-center justify-center transition-opacity duration-200 hover:opacity-90 lg:size-12">
      <Image
        src={iconSrc}
        alt=""
        width={20}
        height={20}
        aria-hidden="true"
        className="size-3.5 lg:size-5"
      />
    </span>
  );

  if (!href) {
    return (
      <span aria-hidden="true" className="block">
        {inner}
      </span>
    );
  }

  return (
    <a
      href={href}
      aria-label={label}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="focus-visible:ring-surface block rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {inner}
    </a>
  );
}

// ── Team slider ─────────────────────────────────────────────────────────────

type TeamSliderProps = {
  members: readonly AnyMember[];
  activeId: string;
  onSelect: (id: string) => void;
};

function TeamSlider({ members, activeId, onSelect }: TeamSliderProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const onCardKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        const next = (index + 1) % members.length;
        buttonRefs.current[next]?.focus();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        const prev = (index - 1 + members.length) % members.length;
        buttonRefs.current[prev]?.focus();
      }
    },
    [members.length],
  );

  // 9 cards × 146 + 8 gaps × 15 = 1434px. Cap the slider container at this
  // width on lg+ so all 9 cards fit on a 1440px viewport without overflow,
  // matching the Figma desktop frame. Below lg, the cards extend past the
  // viewport and `ScrollSnapRow` handles the horizontal scroll.
  return (
    <div className="mx-auto w-full max-w-[1434px] px-4 sm:px-6 lg:px-0">
      <ScrollSnapRow
        ariaLabel="Heli Skycargo team members"
        className="snap-start gap-[15px] px-1 pt-3 pb-4 lg:justify-center lg:overflow-visible"
      >
        {members.map((member, i) => (
          <li key={member._id} className="shrink-0 snap-start">
            <TeamCard
              ref={(el) => {
                buttonRefs.current[i] = el;
              }}
              member={member}
              active={member._id === activeId}
              onSelect={() => onSelect(member._id)}
              onKeyDown={(e) => onCardKeyDown(e, i)}
            />
          </li>
        ))}
      </ScrollSnapRow>
    </div>
  );
}

// ── Team card ──────────────────────────────────────────────────────────────

type TeamCardProps = {
  member: AnyMember;
  active: boolean;
  onSelect: () => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
};

const TeamCard = forwardRef<HTMLButtonElement, TeamCardProps>(function TeamCard(
  { member, active, onSelect, onKeyDown },
  ref,
) {
  const photoSrc = resolveCardPhoto(member);
  const role = "role" in member ? member.role : "";

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      onKeyDown={onKeyDown}
      aria-pressed={active}
      aria-label={`Show details for ${member.full_name}`}
      className={cn(
        "group flex w-[146px] flex-col items-center px-3 pt-3 pb-4 transition-colors duration-300",
        "focus-visible:ring-brand-red focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        active
          ? "bg-brand-red text-surface border-brand-red border"
          : "bg-surface text-ink md:hover:bg-brand-red md:hover:text-surface border border-[#e8e8e8] md:hover:border-transparent",
      )}
    >
      {/* Photo area — same gray bg as home page cards */}
      <div className="relative aspect-[244/280] w-full bg-[#F2F2F2]">
        {photoSrc ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[108%] overflow-hidden">
            <Image
              src={photoSrc}
              alt=""
              fill
              sizes="146px"
              className="object-cover object-top transition-transform duration-500 md:group-hover:scale-[1.03]"
            />
          </div>
        ) : null}
      </div>

      {/* Name + role below the photo */}
      <div className="mt-auto pt-3 text-center">
        <span className="font-display block text-[11px] leading-[14px] font-bold uppercase">
          {member.full_name}
        </span>
        {role ? (
          <span
            className={cn(
              "font-body mt-1 block text-[10px] leading-[13px]",
              active ? "text-surface/85" : "text-ink-soft md:group-hover:text-surface/85",
            )}
          >
            {role}
          </span>
        ) : null}
      </div>
    </button>
  );
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function isPlaceholder(m: AnyMember): m is TeamMemberPlaceholder {
  return "placeholderPhoto" in m;
}

function resolveCardPhoto(member: AnyMember): string | null {
  if (isPlaceholder(member)) return member.placeholderPhoto;
  // Cards render the full source portrait at its natural aspect — head
  // pokes above the plate, body sits inside it, per Figma frames
  // `344:4926`–`674:493`. Sanity emits the source aspect when only width
  // is constrained; the wrapper's `object-contain object-bottom` then
  // anchors the result. Forcing `.height(440)` would crop a tall portrait
  // into a near-square and (even with a hotspot) center on the body's
  // mid-section, lopping off the head.
  return member.photo
    ? urlFor(member.photo).width(400).fit("max").format("webp").quality(82).url()
    : null;
}

function resolveSpotlightPhoto(member: AnyMember): { src: string; alt: string } {
  // The active member's spotlight imagery must visibly swap per click. The
  // CEO has a Figma-supplied wide candid (`TEAM_SPOTLIGHT_PLACEHOLDER_PHOTO`);
  // every other member falls back to their own card portrait so the photo
  // still changes with the selection. The portrait sits on the dark section
  // bg + gradient overlay, which softens the seam from the transparent PNG.
  if (isPlaceholder(member)) {
    if (member.spotlightPhoto) return member.spotlightPhoto;
    return { src: member.placeholderPhoto, alt: `${member.full_name} portrait` };
  }
  if (member.is_featured) return TEAM_SPOTLIGHT_PLACEHOLDER_PHOTO;
  if (member.photo) {
    // Cutout portraits render at their natural tall aspect — the spotlight's
    // `object-contain object-left-bottom` anchors them to the dark band's
    // bottom-left so the full body reads. Forcing 1600×900 (even with a
    // hotspot) crops the portrait into a wide letterbox centered on the
    // hotspot, losing head and feet.
    return {
      src: urlFor(member.photo).height(1200).fit("max").format("webp").quality(82).url(),
      alt: `${member.full_name} portrait`,
    };
  }
  return TEAM_SPOTLIGHT_PLACEHOLDER_PHOTO;
}

function resolveBioParagraphs(member: AnyMember): readonly string[] {
  if (isPlaceholder(member)) return member.bioParagraphs ?? [];
  if (!member.long_bio || member.long_bio.length === 0) return [];
  // Plain text from Portable Text blocks — see M6_PLAN §5.4. Each block's
  // children-text values are concatenated; non-string spans are ignored.
  // Avoids pulling in @portabletext/react for what is currently a 2-paragraph
  // bio.
  return member.long_bio
    .map((block) => {
      const children = (block as { children?: Array<{ text?: string }> }).children ?? [];
      return children
        .map((c) => c.text ?? "")
        .join("")
        .trim();
    })
    .filter((p) => p.length > 0);
}
