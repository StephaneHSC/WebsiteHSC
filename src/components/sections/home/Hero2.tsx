export function Hero2() {
  return (
    <section className="relative isolate w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover object-center"
      >
        <source src="/home/final-welcome-update.mp4#t=5.5" type="video/mp4" />
      </video>
    </section>
  );
}
