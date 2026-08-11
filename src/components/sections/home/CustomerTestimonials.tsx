import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Section } from "@/components/sections/_shared/Section";
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
    placeholderLogo: "/testimonials/lufttrasport2.png",
  },
  {
    _id: "p2",
    customer_name: "Mr. Ryosei I.",
    company: "Mitsui Bussan Aerospace",
    quote:
      "Thanks to appropriate and flexible proposals of HSC team depending on the situation for worldwide logistics, import destination and Japan, we could meet the customers' expectations and delivery the Helicopter as scheduled. We are also able to grasp the transportation status in timely through HSC App which is extremely useful for us and our customers.",
    rating: 5,
    placeholderLogo: "/testimonials/mitsui2.png",
  },
  {
    _id: "p3",
    customer_name: "Mr. Rodney L.",
    company: "Sazma Aviation",
    quote:
      "Both our AW139 helicopter shipment was handled professionally by your team and safely arrived at Subang, Malaysia. Great to have Heli Skycargo as our transporter for our helicopter transshipment globally.",
    rating: 5,
    placeholderLogo: "/testimonials/sazma2.png",
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
          {/* Static header graphic (eyebrow + "Customers Love Heli Skycargo"
              heading + heart divider) — replaces the previous JSX-built
              version because the heart-in-"LOVE" alignment couldn't be made
              to look right at every breakpoint with CSS alone. */}
          <Reveal className="w-full max-w-5xl">
            <Image
              src="/home/customerTestimonialsHeaderMobile.svg"
              alt="Customers love Heli Skycargo"
              width={258}
              height={90}
              className="mx-auto h-auto w-full max-w-[320px] md:hidden"
              priority
            />
            <Image
              src="/home/customerTestimonialsHeader.svg"
              alt="Customers love Heli Skycargo"
              width={920}
              height={144}
              className="mx-auto hidden h-auto w-full max-w-[920px] md:block"
              priority
            />
          </Reveal>
        </div>
      </Container>

      <TestimonialsList testimonials={display as readonly DisplayTestimonial[]} />
    </Section>
  );
}
