import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { buttonVariants } from "@/components/ui/Button";

/**
 * Sticky site header. Renders the logo, an inline Request Quote pill on
 * desktop, and a hamburger that triggers the MobileNav drawer on every
 * breakpoint. Background uses backdrop-blur so the hero photo behind shows
 * through subtly until the user scrolls.
 */
export function Header() {
  return (
    <header className="bg-surface/85 border-border/50 sticky top-0 z-40 border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
        <Logo />
        <div className="flex items-center gap-3">
          <Link
            href="/quote"
            className={cn(
              buttonVariants({ variant: "primary", size: "sm" }),
              "hidden md:inline-flex",
            )}
          >
            Request Quote
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
