import Image from "next/image";
import Link from "next/link";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";

export function RequestQuoteCta() {
  return (
    <section className="bg-brand-red text-surface relative isolate w-full overflow-hidden">
      <Link
        href="/quote"
        aria-label="Start your global transport request — open quote form"
        className="focus-visible:ring-surface group relative block focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="relative aspect-[16/9] w-full md:aspect-[2/1] lg:aspect-[16/6]">
          <Image
            src="/quote/helicopter.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover [mix-blend-mode:multiply] transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <span
            aria-hidden="true"
            className="from-brand-red/0 via-brand-red/30 to-brand-red absolute inset-0 bg-gradient-to-br"
          />

          <div className="absolute inset-0 flex items-center px-6 sm:px-10 lg:px-20">
            <div className="flex max-w-2xl flex-col items-start gap-4 md:gap-6">
              <Reveal>
                <SectionEyebrow className="bg-surface text-ink">Request a Quote</SectionEyebrow>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="font-display text-3xl uppercase md:text-4xl lg:text-[54px] lg:leading-[74px]">
                  <span className="block font-extrabold">Start Your</span>
                  <span className="block font-bold">Global Transport</span>
                  <span className="block font-bold">Request</span>
                </h2>
              </Reveal>
              <Reveal delay={0.2}>
                <span
                  aria-hidden="true"
                  className="bg-surface/15 ring-surface/30 group-hover:bg-surface group-hover:text-brand-red mt-2 inline-flex h-12 w-12 items-center justify-center rounded-full ring-1 transition-all duration-300 group-hover:scale-110 md:h-14 md:w-14"
                >
                  <ChevronsRight className="h-5 w-5 md:h-6 md:w-6" />
                </span>
              </Reveal>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}

type ChevronsRightProps = { className?: string };

function ChevronsRight({ className }: ChevronsRightProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
      className={className}
    >
      <path d="m6 17 5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m13 17 5-5-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
