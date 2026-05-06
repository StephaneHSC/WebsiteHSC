import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/sections/_shared/Container";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { SHARED_WHEN_TO_CHOOSE, type Service, type WhenToChooseCard } from "@/lib/constants";

export type WhenToChooseProps = {
  service: Service;
};

/**
 * Service-detail When-to-Choose section (Figma frame `345:8763` desktop /
 * `529:8633` mobile). Photo LEFT, content + 4-card grid RIGHT.
 *
 * Mobile stacks photo on top, eyebrow → H2 → intro → 4 cards stacked
 * vertically → CTA.
 */
export function WhenToChoose({ service }: WhenToChooseProps) {
  const wtc = service.detailWhenToChoose;
  const titleLines = wtc.title ?? SHARED_WHEN_TO_CHOOSE.title;

  return (
    <section className="bg-surface relative w-full">
      <Container className="py-10 md:py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-0">
          {/* Mobile-first: photo on top, also LEFT on desktop (grid order 1). */}
          <div className="relative aspect-[382/338] w-full lg:aspect-auto lg:min-h-[740px]">
            <Image
              src={wtc.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>

          <div className="lg:flex lg:items-center">
            <div className="mx-auto flex w-full max-w-[640px] flex-col items-center text-center lg:px-10">
              <Reveal>
                <SectionEyebrow variant="gray" className="px-3 py-2">
                  Our Values
                </SectionEyebrow>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="font-display text-ink mt-6 text-[24px] leading-[34px] tracking-tight uppercase md:text-[36px] md:leading-[44px] lg:mt-8 lg:text-[54px] lg:leading-[60px]">
                  {titleLines.map((line, i) => (
                    <span
                      key={`${i}-${line}`}
                      className={i === 0 ? "block font-black" : "block font-bold"}
                    >
                      {line}
                    </span>
                  ))}
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="font-body text-ink mt-6 max-w-[600px] text-[14px] leading-[22px] md:text-[15px] md:leading-[28px] lg:mt-8 lg:leading-[30px]">
                  {wtc.intro}
                </p>
              </Reveal>

              <div className="mt-8 grid w-full max-w-[640px] grid-cols-1 gap-2.5 lg:mt-10 lg:grid-cols-2 lg:gap-x-2 lg:gap-y-2.5">
                {wtc.cards.map((card, i) => (
                  <Reveal key={card.title} delay={0.25 + i * 0.05}>
                    <ValueCard card={card} />
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.5} className="mt-8 lg:mt-10">
                <Link
                  href="#request-quote"
                  className="font-body bg-ink text-surface focus-visible:ring-brand-red inline-flex items-center justify-center rounded-full px-[20px] py-[14px] text-[14px] font-bold tracking-[0.06em] capitalize transition-colors duration-200 hover:bg-[#2a2f38] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:px-[30px] lg:py-[20px]"
                >
                  Request Quote
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ValueCard({ card }: { card: WhenToChooseCard }) {
  return (
    <div className="bg-surface flex h-full items-center gap-3 border border-[#f5f5f5] px-4 py-4 text-left lg:gap-4 lg:px-5 lg:py-5">
      <Image
        src="/services/detail/verify-red.svg"
        alt=""
        width={22}
        height={22}
        className="size-5 shrink-0 lg:size-[22px]"
      />
      <div className="font-body text-ink text-[14px] leading-tight lg:text-[16px]">
        <span className="block font-bold">{card.title}</span>
        <span className="block">{card.subtitle}</span>
      </div>
    </div>
  );
}
