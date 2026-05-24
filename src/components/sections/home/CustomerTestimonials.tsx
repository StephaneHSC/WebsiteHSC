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
                Customers <br className="sm:hidden" />
                <span className="text-brand-red font-black">L</span>
                <Image
                  src="/testimonials/heart-3d.webp"
                  alt=""
                  width={64}
                  height={56}
                  className="mx-1 -mt-2 inline-block h-[0.85em] w-auto align-middle md:mx-2"
                />
                <span className="text-brand-red font-black">ve</span> Heli Skycargo
              </span>
            </h2>
          </Reveal>
          {/* Hearts row sits ON the divider — render hearts over the line with
              a white bg interrupt to mask the line behind them. */}
          <Reveal delay={0.2} className="relative mt-6 w-full max-w-5xl">
            <hr className="border-brand-red border-t-2 border-solid" />
            <div
              aria-hidden="true"
              className="bg-surface text-brand-red absolute top-1/2 left-9 flex -translate-y-1/2 items-center gap-2 px-4"
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
    <svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.1034 17C9.85492 16.7972 9.60924 16.6022 9.37055 16.4014C6.877 14.3048 4.79093 11.9542 3.03727 9.3984C2.09313 8.02226 1.27636 6.59699 0.674718 5.09126C0.375193 4.34161 0.138316 3.57887 0.0414943 2.79168C-0.0307336 2.20574 -0.0294392 1.62087 0.216239 1.05595C0.512659 0.374102 1.14148 0.00764608 2.01547 0.00013674C2.71911 -0.00587073 3.36061 0.186798 3.98089 0.434177C5.00141 0.841398 5.90878 1.39044 6.77319 1.99097C7.95291 2.81078 9.02235 3.72241 10.0304 4.68468C10.0473 4.70077 10.0636 4.71729 10.0877 4.74089C10.192 4.64477 10.2888 4.5553 10.3861 4.46605C11.5809 3.36668 12.8515 2.33468 14.3033 1.46639C15.0807 1.00145 15.8944 0.588011 16.8116 0.334624C17.2312 0.218766 17.6599 0.147964 18.1055 0.168775C18.9121 0.206322 19.4579 0.5451 19.7613 1.15915C19.9609 1.56315 20.0041 1.98818 19.9997 2.41965C19.9917 3.22658 19.7851 4.00605 19.5127 4.77436C18.9815 6.27258 18.2051 7.68563 17.3091 9.05512C16.0114 11.0391 14.4876 12.8969 12.7502 14.6346C11.9513 15.4336 11.1071 16.1978 10.2067 16.9191C10.1788 16.9414 10.1503 16.9631 10.1037 16.9998L10.1034 17Z"
        fill="#E40C28"
      />
    </svg>
  );
}
