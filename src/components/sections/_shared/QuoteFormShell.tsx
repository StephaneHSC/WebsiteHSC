import Image from "next/image";
import { SectionEyebrow } from "@/components/sections/_shared/SectionEyebrow";
import { Reveal } from "@/components/sections/_shared/Reveal";
import { cn } from "@/lib/utils";

export type QuoteFormShellProps = {
  photo: { src: string; alt: string };
  /** Three-line H2 — defaults to "Start Your / Global Transport / Request". */
  headline?: { line1: string; line2: string; line3: string };
  /** Optional eyebrow override (defaults to "Request a Quote"). */
  eyebrow?: string;
  /**
   * When true, renders the photo with `mix-blend-multiply` against the brand
   * red so light areas of the image bleed red — matches Figma node 344:3275
   * (home variant). Service pages don't set this so the photo renders flat
   * with just the dark overlay.
   */
  tinted?: boolean;
};

const DEFAULT_HEADLINE = {
  line1: "Start Your",
  line2: "Global Transport",
  line3: "Request",
};

const TRANSPORT_MODES = [
  "Air Charter",
  "Air Commercial",
  "Ocean RORO",
  "Ocean Container",
  "Land",
  "Ocean Breakbulk",
] as const;

/**
 * Visual-only quote form shell — used on home and services pages, identical
 * apart from the photo prop. M8 will wire Formspree, validation, and step
 * accordion logic into this same component without redesigning the markup.
 *
 * Submit button is intentionally disabled in M3.
 */
export function QuoteFormShell({
  photo,
  headline = DEFAULT_HEADLINE,
  eyebrow = "Request a Quote",
  tinted = false,
}: QuoteFormShellProps) {
  return (
    <section
      id="quote-form"
      className="relative w-full scroll-mt-24 md:px-6 md:py-12 lg:px-12 lg:py-16 xl:px-20 xl:py-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left column — photo + brand red overlay + headline */}
        <div className="bg-brand-red text-surface relative overflow-hidden">
          {/*
            Photo layer. When `tinted` (home variant per Figma node 344:3275),
            the image uses mix-blend-multiply so light areas of the photo
            bleed brand-red — needs to share a stacking context with the red
            bg so we keep the parent un-isolated. Service variants apply a
            black overlay on top instead so the photo renders flat.
          */}
          <div aria-hidden="true" className="absolute inset-0">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={cn("object-cover object-center", tinted && "mix-blend-multiply")}
            />
            {!tinted && <span className="bg-ink/30 absolute inset-0" />}
          </div>

          <div className="relative z-10 flex min-h-[450px] flex-col justify-center px-6 py-16 sm:px-10 md:px-16 lg:min-h-[900px] lg:px-[60px] lg:py-[99px]">
            <Reveal>
              <SectionEyebrow variant="outline-white">{eyebrow}</SectionEyebrow>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="mt-6 lg:mt-[46px]">
                <div className="flex items-start gap-4">
                  <h2 className="font-display text-surface text-[32px] leading-[1.18] uppercase lg:text-[54px] lg:leading-[74px]">
                    <span className="block font-black">{headline.line1}</span>
                    <span className="block font-bold">{headline.line2}</span>
                    <span className="block font-bold">{headline.line3}</span>
                  </h2>
                  {/* Desktop: chevron at right of H2, pointing right. */}
                  <ChevronsRight
                    aria-hidden="true"
                    className="text-surface mt-4 hidden size-[38px] shrink-0 lg:block"
                  />
                </div>
                {/* Mobile: chevron below H2, pointing down. */}
                <ChevronsRight
                  aria-hidden="true"
                  className="text-surface mt-6 size-8 rotate-90 lg:hidden"
                />
              </div>
            </Reveal>
          </div>
        </div>

        {/* Right column — white form panel */}
        <div className="bg-surface relative shadow-[0_0_6px_rgba(0,0,0,0.09)]">
          <form
            aria-label="Request a quote"
            className="space-y-7 px-6 py-12 sm:px-10 md:px-16 lg:px-[48px] lg:py-[85px]"
          >
            <FormSection number="01" label="Mode of Transport" complete>
              {/* Mobile: collapsed dropdown showing the selected mode. */}
              <div className="lg:hidden">
                <span className="text-surface font-display relative flex h-[60px] w-full items-center justify-between bg-[linear-gradient(165.5deg,#e40c28_22%,#ae302b_78%)] pr-4 pl-12 text-[13px] font-semibold tracking-[0.02em] uppercase">
                  <span
                    aria-hidden="true"
                    className="absolute top-1/2 left-4 size-[15px] -translate-y-1/2 rounded-full border border-white"
                  >
                    <span className="bg-surface absolute top-1/2 left-1/2 size-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
                  </span>
                  {TRANSPORT_MODES[0]}
                  <ChevronDownSquare aria-hidden="true" className="text-surface size-6" />
                </span>
              </div>
              {/* Desktop: full grid of radios. */}
              <div className="hidden gap-[10px] lg:grid lg:grid-cols-3">
                {TRANSPORT_MODES.map((mode, i) => (
                  <ModeRadio key={mode} label={mode} selected={i === 0} />
                ))}
              </div>
            </FormSection>

            <FormSection number="02" label="Route Information" indicator="refresh">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-[12px]">
                <Field
                  label="Origin — Country / City / ZIP"
                  required
                  placeholder="e.g. United States / Houston / 77001"
                  active
                />
                <Field
                  label="Destination — Country / City / ZIP"
                  required
                  placeholder="e.g. UAE / Dubai / 00000"
                />
              </div>
            </FormSection>

            <CollapsedSection number="03" label="Shipment Details" />
            <CollapsedSection number="04" label="Transaction Classification" />
            <CollapsedSection number="05" label="Contact & Company" />

            <div className="pt-2">
              <button
                type="submit"
                disabled
                aria-disabled="true"
                title="The quote form will be wired up in a later release."
                className="font-body bg-ink text-surface inline-flex w-full max-w-[305px] cursor-not-allowed items-center justify-center px-[30px] py-[20px] text-[14px] font-bold tracking-[0.84px] uppercase opacity-90"
              >
                Submit
              </button>
              <p className="font-body text-ink mt-4 text-[11px] leading-[20px] tracking-[0.04em] uppercase lg:text-[12px]">
                All fields marked * are required &middot; Data transmitted over secure channel
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

type FormSectionProps = {
  number: string;
  label: string;
  complete?: boolean;
  indicator?: "refresh";
  children: React.ReactNode;
};

function FormSection({ number, label, complete, indicator, children }: FormSectionProps) {
  return (
    <div className="border-input-border border-b pb-6 last:border-b-0">
      <div className="flex items-center justify-between">
        <p className="font-display text-ink text-[14px] tracking-[0.06em] uppercase">
          <span className="mr-3 inline-block">{number}</span>
          {label}
        </p>
        {complete ? <CheckCircle aria-hidden="true" className="text-brand-red size-5" /> : null}
        {indicator === "refresh" ? (
          <RefreshIcon aria-hidden="true" className="text-ink/40 size-5" />
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function CollapsedSection({ number, label }: { number: string; label: string }) {
  return (
    <div className="border-input-border border-b py-2">
      <p className="font-display text-ink text-[14px] tracking-[0.06em] uppercase">
        <span className="mr-3 inline-block">{number}</span>
        {label}
      </p>
    </div>
  );
}

type ModeRadioProps = { label: string; selected?: boolean };
function ModeRadio({ label, selected }: ModeRadioProps) {
  return (
    <span
      className={cn(
        "relative flex h-[60px] items-center pr-4 pl-12 text-[13px] font-semibold tracking-[0.02em] uppercase",
        "font-display",
        selected
          ? "text-surface bg-[linear-gradient(165.5deg,#e40c28_22%,#ae302b_78%)]"
          : "border-input-border text-ink border bg-white",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 left-4 size-[15px] -translate-y-1/2 rounded-full",
          selected ? "border border-white bg-transparent" : "border-ink/30 border bg-transparent",
        )}
      >
        {selected ? (
          <span className="bg-surface absolute top-1/2 left-1/2 size-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        ) : null}
      </span>
      {label}
    </span>
  );
}

type FieldProps = {
  label: string;
  required?: boolean;
  placeholder: string;
  active?: boolean;
};
function Field({ label, required, placeholder, active }: FieldProps) {
  return (
    <label className="block">
      <span className="font-body text-text-muted-2 text-[12px] tracking-[0.04em] uppercase">
        {label}
        {required ? <span className="text-brand-red"> *</span> : null}
      </span>
      <span
        className={cn(
          "mt-2 flex h-[60px] w-full items-center px-4 text-[15px]",
          "text-ink border bg-white",
          active ? "border-input-focus" : "border-input-border",
        )}
      >
        <span className="text-input-placeholder">{placeholder}</span>
      </span>
    </label>
  );
}

function ChevronsRight({ className }: { className?: string }) {
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

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownSquare({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="m8 11 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21v-5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
