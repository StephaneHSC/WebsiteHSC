import { Fragment } from "react";
import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import type { OverviewParagraph, Service } from "@/lib/constants";

export type ServiceOverviewProps = {
  service: Service;
};

/**
 * Service-detail Overview section (Figma frame `345:8753` desktop / `529:8622`
 * mobile). Photo on the right, centered content on the left.
 *
 * Mobile stacks photo on top, content below; everything center-aligned.
 */
export function ServiceOverview({ service }: ServiceOverviewProps) {
  const { detailOverview: o } = service;

  return (
    <section className="bg-surface relative w-full">
      <Container className="py-10 md:py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-0">
          {/* Mobile-first: photo on top. Desktop reorders to the right column. */}
          <div className="relative aspect-[382/338] w-full lg:order-2 lg:aspect-auto lg:min-h-[740px]">
            <Image
              src={o.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"
            />
            {o.hasVideoBadge ? (
              <Image
                src="/services/detail/play-badge.svg"
                alt=""
                width={113}
                height={113}
                className="absolute top-1/2 left-1/2 hidden size-[80px] -translate-x-1/2 -translate-y-1/2 lg:block lg:size-[113px]"
              />
            ) : null}
          </div>

          {/* Content column. */}
          <div className="lg:order-1 lg:flex lg:items-center">
            <div className="mx-auto flex w-full max-w-[680px] flex-col items-center text-center lg:px-10">
              <Reveal>
                <SectionEyebrow variant="gray" className="px-3 py-2">
                  {o.label}
                </SectionEyebrow>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="font-display text-ink mt-3 text-[24px] leading-[34px] tracking-tight uppercase md:text-[36px] md:leading-[44px] lg:mt-3 lg:text-[45px] lg:leading-[56px]">
                  {o.title.map((line, i) => (
                    <span
                      key={`${i}-${line}`}
                      className={i === 0 ? "block font-black" : "block font-bold"}
                    >
                      {line}
                    </span>
                  ))}
                </h2>
              </Reveal>

              <Reveal
                delay={0.2}
                className="mt-8 flex w-full flex-col gap-6 lg:mt-10 lg:max-w-[520px]"
              >
                {o.paragraphs.map((p, i) => (
                  <Paragraph key={i} paragraph={p} />
                ))}
              </Reveal>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Paragraph({ paragraph }: { paragraph: OverviewParagraph }) {
  return (
    <p className="font-body text-ink text-[14px] leading-[24px] md:text-[15px] md:leading-[28px] lg:leading-[30px]">
      {paragraph.parts.map((part, i) => (
        <Fragment key={i}>
          {part.kind === "bold" ? <strong className="font-bold">{part.text}</strong> : part.text}
        </Fragment>
      ))}
    </p>
  );
}
