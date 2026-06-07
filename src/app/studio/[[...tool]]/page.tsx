"use client";

/**
 * Sanity Studio mount at /studio.
 *
 * Sanity Studio's bundle touches `window` at module-load time, which would
 * crash if Next.js tried to server-render it. We mark this page as a Client
 * Component AND use `next/dynamic({ ssr: false })` so the studio module is
 * never imported on the server — only on the client after hydration.
 *
 * The double-bracket catch-all (`[[...tool]]`) lets Studio handle all of its
 * own internal routes under /studio.
 */
import dynamic from "next/dynamic";
import config from "../../../../sanity.config";

const NextStudio = dynamic(() => import("next-sanity/studio").then((m) => m.NextStudio), {
  ssr: false,
});

export default function StudioPage() {
  return <NextStudio config={config} />;
}
