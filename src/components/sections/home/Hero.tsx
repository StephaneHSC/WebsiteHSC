import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { AppBadgeRow } from "@/components/ui/AppBadge";

/**
 * Home page Hero
 */
export function Hero() {
  return (
    <section className="bg-surface text-surface relative isolate w-full overflow-hidden p-2">
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          {/* #t=4.8 starts playback at 4.8s — matches the splash auto-dismiss
              so the home hero continues where the splash left off. Loops
              return to the start of the file, not back to 4.8s. */}
          <source src="/home/hero-video.mp4#t=4.8" type="video/mp4" />
          {/* Optional fallback fallback text/image if video fails */}
          Your browser does not support the video tag.
        </video>

        {/* Your existing gradient overlay stays on top of the video */}
        <div className="from-ink/40 via-ink/55 to-ink/80 absolute inset-0 bg-gradient-to-br" />
      </div>
      <Container>
        <div className="flex min-h-[560px] items-center md:min-h-[640px] lg:min-h-[720px]">
          <div className="max-w-3xl space-y-6 py-20 md:space-y-8 md:py-28">
            <Reveal>
              <h1 className="font-display text-3xl leading-[1.1] font-semibold tracking-tight md:text-5xl lg:text-6xl">
                Innovative Global
                <br className="md:hidden" /> Helicopter
                <br className="hidden md:inline" /> Freight
                <br className="md:hidden" /> Forwarder
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="font-body text-surface max-w-2xl text-base leading-relaxed md:text-2xl">
                Full-Service Air and Ocean Freight
                <br className="md:hidden" /> Forwarder. Providing
                <br className="hidden md:inline" /> End-To-End Visibility
                <br className="md:hidden" /> and Control Over Your Helicopter
                <br /> Shipments Through Bespoke Application.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <AppBadgeRow variant="light" size="sm" className="md:hidden" />
              <AppBadgeRow variant="light" className="hidden md:flex" />
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
