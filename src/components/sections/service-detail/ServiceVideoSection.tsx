import { Container } from "@/components/sections/_shared/Container";
import { AutoplayVideo } from "@/components/ui/AutoplayVideo";

export type ServiceVideoSectionProps = {
  src: string;
};

/**
 * Optional autoplay video band for a service-detail page, rendered between
 * the hero and the Overview section (see `Service.detailVideo`) — a
 * standalone section, not a replacement for the Overview photo. Centered
 * and capped at `max-w-4xl` so it reads as an inset player rather than a
 * full-bleed / container-width band.
 */
export function ServiceVideoSection({ src }: ServiceVideoSectionProps) {
  return (
    <section className="bg-surface w-full py-10 md:py-14 lg:py-20">
      <Container>
        <div className="relative mx-auto aspect-video w-full max-w-3xl overflow-hidden">
          <AutoplayVideo
            src={src}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      </Container>
    </section>
  );
}
