import Image from "next/image";
import { Container } from "@/components/sections/_shared/Container";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { OFFICES, type Office } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function OfficesGlobal() {
  return (
    <section className="text-surface relative isolate w-full overflow-hidden">
      <Image
        src="/offices/cityscape.webp"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <span aria-hidden="true" className="bg-ink/40 absolute inset-0 -z-10" />

      <Container className="pt-20 pb-8 md:pt-28 md:pb-12 lg:pt-32 lg:pb-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <Reveal>
            <SectionEyebrow variant="outline" className="border-surface/70 text-surface">
              Our Offices
            </SectionEyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-display text-3xl leading-[1.1] tracking-tight uppercase md:text-4xl lg:text-[54px] lg:leading-[66px]">
              <span className="font-extrabold">Across All Regions</span>{" "}
              <span className="font-bold">Worldwide</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="font-body text-surface text-base leading-[28px] md:text-base md:leading-[36px]">
              Delivering reliable helicopter logistics services across all regions worldwide.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.4} className="mt-16 lg:mt-24">
          <div className="bg-ink/80 border-surface/20 relative overflow-hidden rounded-2xl border backdrop-blur-md">
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {OFFICES.map((office) => (
                <li
                  key={office.id}
                  className={cn(
                    "border-surface/15 relative",
                    // Mobile: horizontal divider between stacked offices
                    "not-last:border-b md:border-b-0",
                    // Desktop: vertical divider between adjacent cards
                    "md:not-last:border-r",
                  )}
                >
                  <OfficeCard office={office} />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

type OfficeCardProps = { office: Office };

function OfficeCard({ office }: OfficeCardProps) {
  return (
    <article className={cn("relative h-full p-6 lg:p-8", office.highlighted && "bg-brand-red/85")}>
      <p className="font-display text-surface text-[14px] leading-[20px] font-semibold uppercase">
        {office.label}
      </p>
      <h3 className="font-display text-surface mt-3 text-4xl leading-tight font-semibold tracking-tight uppercase md:text-[48px] md:leading-[48px]">
        {office.country}
      </h3>

      <ul className="mt-6 space-y-3">
        <ContactRow icon={<LocationIcon />} label={office.address} />
        <ContactRow
          icon={<PhoneIcon />}
          href={`tel:${office.phone.replace(/\s/g, "")}`}
          label={office.phone}
        />
        <ContactRow icon={<EmailIcon />} href={`mailto:${office.email}`} label={office.email} />
      </ul>
    </article>
  );
}

type ContactRowProps = {
  icon: React.ReactNode;
  label: string;
  href?: string;
};

function ContactRow({ icon, label, href }: ContactRowProps) {
  const inner = (
    <>
      <span className="text-surface/80 mt-1 inline-flex h-4 w-4 shrink-0">{icon}</span>
      <span className="font-body text-surface text-[13px] leading-[20px]">{label}</span>
    </>
  );
  return (
    <li className="flex items-start gap-3">
      {href ? (
        <a
          href={href}
          className="text-surface focus-visible:ring-surface focus-visible:ring-offset-ink flex items-start gap-3 rounded-sm transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {inner}
        </a>
      ) : (
        inner
      )}
    </li>
  );
}

// ── Icons (inline SVG, inherit currentColor) ────────────────────────────────

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M12 21s7-5.5 7-12a7 7 0 0 0-14 0c0 6.5 7 12 7 12z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-full w-full"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
