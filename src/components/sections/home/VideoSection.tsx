import Image from "next/image";
import { Logo } from "@/components/layout/Logo";

/**
 * Home page · full-bleed image tile with corner logo.
 *
 * Was a play-on-click video (poster + red play button + /home/hero.mp4);
 * replaced with a static image per client request 2026-07. The video assets
 * remain in /public/home in case the client wants the video back.
 *
 * Mobile (<md): dedicated portrait asset; the container takes the image's
 * own 622/866 aspect ratio so the photo renders complete — no cropping.
 * md+: landscape asset at the tall 170dvh band.
 */
export function VideoSection() {
  return (
    <section className="bg-ink relative isolate w-full overflow-hidden">
      <div className="relative aspect-[622/866] w-full md:aspect-auto md:h-[170dvh]">
        <Image
          src="/home/mobile-home3.png"
          alt="Heli Skycargo branded helicopter being crane-lifted onto a cargo vessel at port"
          fill
          sizes="100vw"
          className="object-cover md:hidden"
        />
        <Image
          src="/home/new-home-image-2.png"
          alt="Heli Skycargo branded helicopter being crane-lifted onto a cargo vessel at port"
          fill
          sizes="100vw"
          className="hidden object-cover object-center md:block"
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
