export function Hero2() {
  return (
    <section className="relative isolate aspect-video w-full overflow-hidden">
      {/* SEO/a11y: the video-only hero has no visible text, so the page H1
          is rendered screen-reader-only. Visually nothing changes. */}
      <h1 className="sr-only">Heli Skycargo — Bespoke Helicopter Shipping Worldwide</h1>
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-label="Heli Skycargo helicopter shipping operations showreel"
        className="absolute inset-0 h-full w-full object-cover object-center"
      >
        <source src="/home/final-welcome-update.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
