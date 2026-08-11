import { Container } from "@/components/sections/_shared/Container";
import { AutoplayVideo } from "@/components/ui/AutoplayVideo";

export type ServiceVideoSectionProps = {
  src: string;
};

/**
 * Optional autoplay video band for a service-detail page, rendered between
 * the hero and the Overview section (see `Service.detailVideo`) — a
 * standalone section, not a replacement for the Overview photo. Inset inside
 * the page's normal content padding (not full-bleed) per the client-provided
 * reference layout.
 */
export function ServiceVideoSection({ src }: ServiceVideoSectionProps) {
  return (
    <section className="bg-surface w-full py-10 md:py-14 lg:py-20">
      <Container>
        <div className="relative aspect-video w-full overflow-hidden">
          <AutoplayVideo
            src={src}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
      </Container>
    </section>
  );
}
