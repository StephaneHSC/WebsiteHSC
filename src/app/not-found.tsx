import Link from "next/link";

/**
 * Root-level 404 — catches URLs that don't match ANY route segment, so it
 * renders without the marketing Header/Footer chrome. The marketing 404 at
 * src/app/(marketing)/not-found.tsx handles unmatched routes inside that
 * segment and includes the full site chrome.
 */
export default function RootNotFound() {
  return (
    <main className="bg-ink text-surface flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-brand-red text-[120px] leading-none font-black md:text-[180px]">
        404
      </p>
      <h1 className="font-display mt-2 text-2xl leading-tight font-bold uppercase md:text-3xl">
        Page Not Found
      </h1>
      <p className="font-body text-surface/70 mx-auto mt-4 max-w-md text-base md:text-lg">
        The page you&rsquo;re looking for doesn&rsquo;t exist.
      </p>
      <Link
        href="/"
        className="font-display bg-brand-red text-surface hover:bg-brand-red-dark focus-visible:ring-surface mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Back to Heli Skycargo
      </Link>
    </main>
  );
}
