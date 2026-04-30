import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type LogoProps = {
  className?: string;
  /** Use the white-on-transparent variant for dark backgrounds (footer). */
  inverted?: boolean;
  /** Optional click handler — used by MobileNav to close the drawer when the
   *  Logo (which is also a Link to /) is tapped from inside the drawer. */
  onClick?: () => void;
};

/**
 * HSC brand mark — two real SVG variants so the brand red stays intact on
 * both backgrounds (no CSS filter, which would mangle the red).
 *
 *   /public/logo.svg        — dark text + red, for light backgrounds (Header, MobileNav drawer)
 *   /public/logo-light.svg  — white text + red, for dark backgrounds (Footer)
 */
export function Logo({ className, inverted = false, onClick }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Heli SkyCargo home"
      onClick={onClick}
      className={cn("inline-block", className)}
    >
      <Image
        src={inverted ? "/logo-light.svg" : "/logo.svg"}
        alt="Heli SkyCargo"
        width={232}
        height={79}
        priority
        className="h-12 w-auto"
      />
    </Link>
  );
}
