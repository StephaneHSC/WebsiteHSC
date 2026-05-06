import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { SERVICES } from "@/lib/constants";

type RouteParams = Promise<{ slug: string }>;

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: service.name,
    description: service.description,
  };
}

/**
 * M3 stub for service detail pages — keeps the explore-more links from the
 * services grid resolving instead of 404. M4 replaces this with the full
 * detail template (hero + spec sheet + related services).
 */
export default async function ServiceDetailPage({ params }: { params: RouteParams }) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <main className="bg-surface-alt flex flex-1 flex-col">
      <Container className="flex flex-1 flex-col items-start gap-6 py-32 md:py-40">
        <SectionEyebrow variant="gray">Service Detail</SectionEyebrow>
        <h1 className="font-display text-ink text-4xl leading-tight font-black tracking-tight uppercase md:text-5xl lg:text-6xl">
          {service.name}
        </h1>
        <p className="font-body text-ink-soft max-w-2xl text-base md:text-lg">
          {service.description}
        </p>
        <p className="font-body text-ink-muted max-w-2xl text-sm md:text-base">
          The full {service.name} detail page is shipping in Module 4. For now, this stub keeps
          links from the services listing resolving correctly.
        </p>
        <Link
          href="/services"
          className="font-cta border-ink text-ink hover:bg-ink hover:text-surface mt-2 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-colors"
        >
          Back to all services
        </Link>
      </Container>
    </main>
  );
}
