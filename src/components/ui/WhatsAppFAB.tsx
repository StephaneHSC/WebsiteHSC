"use client";

import { useState } from "react";

const WA_NUMBER = "201207961333";
const WA_MESSAGE = encodeURIComponent(
  "Hi, I'd like to enquire about helicopter shipping services.",
);
const WA_URL = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;

export function WhatsAppFAB() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 bottom-6 z-50 flex flex-col items-end gap-3 lg:hidden">
      {open && (
        <div className="w-[300px] overflow-hidden rounded-2xl shadow-2xl">
          {/* Header — dark teal */}
          <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#075e54" }}>
            {/* Avatar */}
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ background: "#25D366" }}
            >
              H
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white">Heli Skycargo</p>
              <p className="text-xs" style={{ color: "#a8d5a2" }}>
                Typically replies within a day
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-white/70 transition-colors hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat body — WhatsApp beige bg with subtle pattern */}
          <div
            className="px-4 py-5"
            style={{
              backgroundImage: "url('/whatsapp.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Message bubble */}
            <div className="relative max-w-[85%] rounded-lg rounded-tl-none bg-white px-3 pt-1 pb-4 shadow-sm">
              {/* bubble tail */}
              <span
                className="absolute top-0 -left-2 h-0 w-0"
                style={{
                  borderTop: "8px solid white",
                  borderLeft: "8px solid transparent",
                }}
              />
              <p className="mb-1 text-xs font-semibold" style={{ color: "#075e54" }}>
                Heli Skycargo
              </p>
              <p className="text-sm leading-snug text-gray-800">
                👋 Hi there!
                <br />
                How can we help you with your helicopter shipping needs?
              </p>
              <span className="absolute right-2 bottom-1 text-[10px] text-gray-400">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {/* Start Chat button */}
          <div className="bg-white px-4 py-3">
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#25D366" }}
            >
              <WhatsAppIcon className="h-4 w-4" />
              Start Chat
            </a>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat with us on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ background: "#25D366" }}
      >
        <WhatsAppIcon className="h-7 w-7 text-white" />
      </button>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
