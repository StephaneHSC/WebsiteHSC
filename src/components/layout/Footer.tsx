import Link from "next/link";
import { Logo } from "./Logo";
import { MobileFooter } from "./MobileFooter";
import {
  AppStoreButton,
  Copyright,
  GooglePlayButton,
  SocialIcons,
  VaiBadge,
} from "./_footer-parts";
import { FOOTER } from "@/lib/constants";

/**
 * Site footer. Two distinct layouts in Figma:
 *   - Desktop: 4 columns (Logo+VAI / Company / Legal / Our Bespoke App), then a
 *     bottom row with copyright on the left and social icons on the right.
 *   - Mobile: stacked + centered (rendered by <MobileFooter />).
 *
 * Background uses slight transparency (`bg-ink/95`) so the office-locations
 * cityscape image (added in M2) bleeds through subtly when layered behind.
 */
export function Footer() {
  return (
    <footer className="bg-ink/95 text-surface relative mt-24 backdrop-blur-sm">
      {/* Mobile layout (<md) */}
      <div className="md:hidden">
        <MobileFooter />
      </div>

      {/* Desktop layout (≥md) */}
      <div className="mx-auto hidden max-w-7xl px-6 py-16 md:block lg:px-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Col 1: Logo + tagline (in Logo) + VAI partner */}
          <div className="col-span-3 flex flex-col items-start gap-12">
            <Logo inverted />
            <VaiBadge />
          </div>

          {/* Col 2: COMPANY */}
          <DesktopColumn title="Company" links={FOOTER.company} />

          {/* Col 3: LEGAL */}
          <DesktopColumn title="Legal" links={FOOTER.legal} />

          {/* Col 4: OUR BESPOKE APP. — buttons stacked vertically */}
          <div className="col-span-3 flex flex-col items-end">
            <h3 className="font-display text-sm font-bold tracking-wider uppercase">
              Our Bespoke App.
            </h3>
            <div className="mt-4 flex flex-col gap-3">
              <AppStoreButton />
              <GooglePlayButton />
            </div>
          </div>
        </div>

        {/* Bottom row: copyright on left, social on right */}
        <div className="mt-16 flex items-center justify-between">
          <Copyright />
          <SocialIcons size="sm" />
        </div>
      </div>
    </footer>
  );
}

function DesktopColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div className="col-span-3">
      <h3 className="font-display text-sm font-bold tracking-wider uppercase">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-surface/80 hover:text-surface text-sm transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
