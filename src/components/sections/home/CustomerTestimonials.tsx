import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { fetchWithCmsFallback } from "@/components/sections/_shared/cmsFallback";
import { allTestimonialsQuery } from "@/lib/sanity/queries";
import type { Testimonial } from "@/types/sanity";
import { TestimonialsList, type DisplayTestimonial } from "./TestimonialsList";

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

/**
 * Home "Customers Love Heli Skycargo" section.
 *
 * Renders the eyebrow + heading + heart divider on the server, then hands off
 * the testimonial list to a small client subcomponent that owns the "View All
 * Reviews" expand state. The hamburger menu's Reviews link points at
 * `#testimonials` so it scrolls here instead of routing to a dedicated page.
 */
export async function CustomerTestimonials() {
  // No `limit` arg → fetch the full list. The slice-to-3 happens client-side.
  const display = await fetchWithCmsFallback<Testimonial, PlaceholderTestimonial>(
    allTestimonialsQuery,
    PLACEHOLDER_TESTIMONIALS,
  );

  return (
    <Section id="testimonials" tone="light" spacing="loose" className="scroll-mt-20">
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

      <TestimonialsList testimonials={display as readonly DisplayTestimonial[]} />
    </Section>
  );
}

type GlyphProps = { className?: string };

function HeartGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 21s-7-4.35-7-10.5C5 7.5 7.5 5 10.5 5c1.74 0 3.41.81 4.5 2.09C16.09 5.81 17.76 5 19.5 5 22.5 5 24 7.5 24 10.5 24 16.65 19 21 12 21z" />
    </svg>
  );
}
