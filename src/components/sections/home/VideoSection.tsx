import Image from "next/image";
import { Logo } from "@/components/layout/Logo";

/**
 * Home page · full-bleed image tile with corner logo.
 *
 * Was a play-on-click video (poster + red play button + /home/hero.mp4);
 * replaced with a static image per client request 2026-07. The video assets
 * remain in /public/home in case the client wants the video back.
 */
export function VideoSection() {
  return (
    <section className="bg-ink relative isolate w-full overflow-hidden">
      <div className="relative aspect-[430/603] w-full md:aspect-video">
        <Image
          src="/home/new-home-image-2.png"
          alt="Heli Skycargo team in front of an AW139 helicopter at an aviation expo"
          fill
          sizes="100vw"
          className="object-cover object-[15%_center] md:object-center"
        />

        {/* Logo overlay */}
        <div className="pointer-events-none absolute top-4 left-4 z-10 sm:top-6 sm:left-6 md:top-8 md:left-8">
          <span className="pointer-events-auto inline-block">
            <Logo imageClassName="h-8 sm:h-10 md:h-12" />
          </span>
        </div>
      </div>
    </section>
  );
}
