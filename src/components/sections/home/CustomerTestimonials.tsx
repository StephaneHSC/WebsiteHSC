import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { ScrollSnapRow } from "@/components/sections/_shared/ScrollSnapRow";
import { fetchWithCmsFallback } from "@/components/sections/_shared/cmsFallback";
import { featuredTestimonialsQuery } from "@/lib/sanity/queries";
import type { Testimonial } from "@/types/sanity";
import { urlFor } from "@/lib/sanity/image";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// TODO(seed): drop once Sanity is populated.
type PlaceholderTestimonial = {
  _id: string;
  customer_name: string;
  company: string;
  quote: string;
  rating: number;
  /** Static logo path used while Sanity is empty. */
  placeholderLogo: string;
};

const PLACEHOLDER_TESTIMONIALS: readonly PlaceholderTestimonial[] = [
  {
    _id: "p1",
    customer_name: "Mr. Morten H.",
    company: "Lufttransport",
    quote:
      "I would also use this oppurtunity to thank you and your team for helping us with the transportation of our AW139. Your service was high level and we will most certainly keep your name in case of future projects.",
    rating: 5,
    placeholderLogo: "/testimonials/lufttransport.png",
  },
  {
    _id: "p2",
    customer_name: "Mr. Ryosei I.",
    company: "Mitsui Bussan Aerospace",
    quote:
      "Thanks to appropriate and flexible proposals of HSC team depending on the situation for worldwide logistics, import destination and Japan, we could meet the customers' expectations and delivery the Helicopter as scheduled. We are also able to grasp the transportation status in timely through HSC App which is extremely useful for us and our customers.",
    rating: 5,
    placeholderLogo: "/testimonials/mitsui-bussan.png",
  },
  {
    _id: "p3",
    customer_name: "Mr. Rodney L.",
    company: "Sazma Aviation",
    quote:
      "Both our AW139 helicopter shipment was handled professionally by your team and safely arrived at Subang, Malaysia. Great to have Heli Skycargo as our transporter for our helicopter transshipment globally.",
    rating: 5,
    placeholderLogo: "/testimonials/sazma-aviation.png",
  },
];

function isPlaceholder(t: Testimonial | PlaceholderTestimonial): t is PlaceholderTestimonial {
  return "placeholderLogo" in t;
}

export async function CustomerTestimonials() {
  const display = await fetchWithCmsFallback<Testimonial, PlaceholderTestimonial>(
    featuredTestimonialsQuery,
    PLACEHOLDER_TESTIMONIALS,
    3,
  );

  return (
    <Section tone="light" spacing="loose">
      <Container>
        <div className="flex flex-col items-center gap-4 text-center">
          <Reveal>
            <SectionEyebrow variant="outline">Customer Testimonials</SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              aria-label="Customers love Heli Skycargo"
              className="font-display text-ink text-3xl leading-[1.1] font-bold tracking-tight uppercase md:text-4xl lg:text-[54px] lg:leading-[74px]"
            >
              <span aria-hidden="true">
                Customers L
                <Image
                  src="/testimonials/heart-3d.webp"
                  alt=""
                  width={64}
                  height={56}
                  className="mx-1 -mt-2 inline-block h-[0.85em] w-auto align-middle md:mx-2"
                />
                ve Heli Skycargo
              </span>
            </h2>
          </Reveal>
          {/* Hearts row sits ON the divider — render hearts over the line with
              a white bg interrupt to mask the line behind them. */}
          <Reveal delay={0.2} className="relative mt-6 w-full max-w-5xl">
            <hr className="border-brand-red/20" />
            <div
              aria-hidden="true"
              className="bg-surface text-brand-red absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 px-4"
            >
              <HeartGlyph className="h-3 w-3" />
              <HeartGlyph className="h-3 w-3" />
              <HeartGlyph className="h-3 w-3" />
            </div>
          </Reveal>
        </div>
      </Container>

      {/* Desktop / tablet: 3-col grid with stretched heights so the bottom
          name strips align across cards regardless of quote length. */}
      <Container className="mt-16 hidden md:block lg:mt-20">
        <ul className="grid grid-cols-3 items-stretch gap-6 lg:gap-8">
          {display.map((t, i) => (
            <li key={t._id} className="h-full">
              <Reveal delay={0.3 + i * 0.1} className="h-full">
                <TestimonialCard testimonial={t} />
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={0.7} className="mt-20 flex justify-center lg:mt-24">
          <Link
            href="/reviews"
            className={cn(
              buttonVariants({ variant: "secondary", size: "md" }),
              "border-ink border font-bold hover:scale-[1.02]",
            )}
          >
            View All <span className="font-extrabold">Reviews</span>
          </Link>
        </Reveal>
      </Container>

      {/* Mobile: scroll-snap carousel with one card centered + adjacent peek. */}
      <div className="mt-12 md:hidden">
        <ScrollSnapRow ariaLabel="Customer testimonials" className="gap-4 px-6 pb-4">
          {display.map((t, i) => (
            <li key={t._id} className="w-[85%] shrink-0 snap-center">
              <Reveal delay={0.2 + i * 0.05}>
                <TestimonialCard testimonial={t} />
              </Reveal>
            </li>
          ))}
        </ScrollSnapRow>

        <Reveal delay={0.6} className="mt-16 flex justify-center px-6">
          <Link
            href="/reviews"
            className={cn(
              buttonVariants({ variant: "secondary", size: "md" }),
              "border-ink border font-bold hover:scale-[1.02]",
            )}
          >
            View All <span className="font-extrabold">Reviews</span>
          </Link>
        </Reveal>
      </div>
    </Section>
  );
}

type TestimonialCardProps = {
  testimonial: Testimonial | PlaceholderTestimonial;
};

function TestimonialCard({ testimonial: t }: TestimonialCardProps) {
  const sanityLogo = !isPlaceholder(t) ? (t.logo ?? null) : null;
  const placeholderLogoSrc = isPlaceholder(t) ? t.placeholderLogo : null;

  return (
    <article className="border-brand-red relative mt-[44px] flex h-full flex-col border">
      {/* Logo circle overlaps the top edge — Figma: 89×89 with 2px red border. */}
      <div className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="bg-surface border-brand-red flex h-[89px] w-[89px] items-center justify-center overflow-hidden rounded-full border-2 shadow-md">
          {sanityLogo ? (
            <Image
              src={urlFor(sanityLogo).width(140).height(140).url()}
              alt={t.company}
              width={70}
              height={70}
              className="object-contain p-3"
            />
          ) : placeholderLogoSrc ? (
            <Image
              src={placeholderLogoSrc}
              alt={t.company}
              width={70}
              height={70}
              className="h-auto max-h-12 w-auto max-w-[60px] object-contain"
            />
          ) : (
            <LogoFallback company={t.company} />
          )}
        </div>
      </div>

      {/* Quote body — Figma bg #d6dee1 cool gray; quote 18px PT_Sans Bold Italic. */}
      <div className="flex flex-1 flex-col items-center bg-[#d6dee1] px-6 pt-14 pb-8 text-center">
        <Rating value={t.rating} />
        <p className="font-body text-ink mt-6 text-base leading-[28px] font-bold italic md:text-[18px] md:leading-[32px]">
          &ldquo;{t.quote}&rdquo;
        </p>
      </div>

      {/* Name strip — red bg, customer name 24px Inter Tight Bold capitalize. */}
      <div className="bg-brand-red text-surface flex flex-col items-center justify-center gap-1 px-6 py-6 text-center">
        <p className="font-display text-xl font-bold capitalize md:text-[24px] md:leading-[24px]">
          {t.customer_name}
        </p>
        <p className="font-body text-[13px] uppercase opacity-90">{t.company}</p>
      </div>
    </article>
  );
}

type RatingProps = { value: number };

function Rating({ value }: RatingProps) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <div className="text-brand-red flex gap-1" role="img" aria-label={`${filled} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("h-[22px] w-[22px]", i >= filled && "text-brand-red/25")} />
      ))}
    </div>
  );
}

type LogoFallbackProps = { company: string };

function LogoFallback({ company }: LogoFallbackProps) {
  const initials = company
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="font-display text-brand-red text-xl font-extrabold tracking-tight">
      {initials}
    </span>
  );
}

type GlyphProps = { className?: string };

function Star({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function HeartGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 21s-7-4.35-7-10.5C5 7.5 7.5 5 10.5 5c1.74 0 3.41.81 4.5 2.09C16.09 5.81 17.76 5 19.5 5 22.5 5 24 7.5 24 10.5 24 16.65 19 21 12 21z" />
    </svg>
  );
}
