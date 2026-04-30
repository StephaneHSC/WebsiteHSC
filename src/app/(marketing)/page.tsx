export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="max-w-2xl space-y-6 text-center">
        <p className="text-brand-red font-display text-sm font-semibold tracking-widest uppercase">
          Module 1 · Foundation
        </p>
        <h1 className="text-ink font-display text-4xl leading-tight font-bold tracking-tight md:text-6xl">
          Setup Complete.
        </h1>
        <p className="text-ink-soft mx-auto max-w-md text-base md:text-lg">
          Brand tokens, typography, and base layout are wired. Header, footer, UI primitives, and
          Sanity scaffold are next.
        </p>
      </div>
    </main>
  );
}
