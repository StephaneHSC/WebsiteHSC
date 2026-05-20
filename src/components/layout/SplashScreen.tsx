"use client";

import { useState, useEffect, useRef } from "react";

export function SplashScreen({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"visible" | "animating" | "done">("visible");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function dismiss() {
    if (state !== "visible") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    sessionStorage.setItem("hsc-splash-seen", "1");
    setState("animating");
    setTimeout(() => setState("done"), 700);
  }

  useEffect(() => {
    if (sessionStorage.getItem("hsc-splash-seen")) {
      // Post-mount sync from browser-only state (sessionStorage) — the
      // pre-hydration script in app/layout.tsx already prevents a visual
      // blink; this just aligns React state with what CSS has already hidden.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("done");
      return;
    }
    timerRef.current = setTimeout(() => dismiss(), 3000000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = state === "done" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [state]);

  return (
    <>
      {state !== "done" && <div data-splash className="fixed inset-0 z-[9996] bg-black" />}

      {state !== "done" && (
        <div
          data-splash
          onClick={dismiss}
          onWheel={dismiss}
          onTouchStart={dismiss}
          className="fixed inset-0 z-[9998] bg-black"
          style={{
            transform: state === "animating" ? "translateX(-100%)" : "translateX(0)",
            transition: state === "animating" ? "transform 700ms ease-in-out" : "none",
          }}
        >
          <video
            autoPlay
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover opacity-60"
            src="/home/hero-video.mp4"
          />
          <div
            className="relative z-10 flex h-full items-center justify-center"
            style={{
              transform:
                state === "animating"
                  ? "translateX(-40%) translateY(60%)"
                  : "translateX(0) translateY(0)",
              opacity: state === "animating" ? 0 : 1,
              transition:
                state === "animating"
                  ? "transform 600ms ease-in-out, opacity 400ms ease-in-out"
                  : "none",
            }}
          >
            <h1 className="font-display px-8 pb-[15rem] text-center text-2xl font-black tracking-tight text-white uppercase md:text-4xl lg:text-6xl">
              Welcome to Heli Skycargo
            </h1>
          </div>
        </div>
      )}

      {/* Page */}
      <div
        data-splash-page
        style={{
          position: state === "done" ? "static" : "fixed",
          inset: state === "done" ? "auto" : 0,
          overflowY: state === "done" ? "visible" : "hidden",
          zIndex: 9997,
          transform:
            state === "done"
              ? "none"
              : state === "animating"
                ? "translateX(0)"
                : "translateX(-100%)",
          transition:
            state === "animating"
              ? "transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 200ms"
              : "none",
          willChange: state === "animating" ? "transform" : "auto",
        }}
      >
        {children}
      </div>
    </>
  );
}
