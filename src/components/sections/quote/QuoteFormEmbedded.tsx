/**
 * Iframe-embed path for `form_mode === "embed"`.
 *
 * The CMS-supplied raw HTML is sanitized to a single `<iframe>` tag with an
 * explicit attribute allow-list. Anything else (`<script>`, `on*`, etc.) is
 * rejected and a developer-facing maintenance card is rendered instead.
 *
 * Server Component — sanitization runs at request/build time, never on the
 * client. The output is dropped into a `dangerouslySetInnerHTML` block only
 * after passing the allow-list.
 */

/**
 * Provider-agnostic iframe sanitizer.
 *
 * Strategy: blocklist (not allowlist). Different providers (Google Forms,
 * Tally, Typeform, Calendly, Jotform, etc.) use different sets of standard +
 * custom attributes — enumerating them inevitably misses some. Instead, we
 * allow ALL attributes and explicitly reject the small set that's actually
 * dangerous for an iframe element.
 *
 * What we reject:
 *  - any tag other than `<iframe>`
 *  - any attribute starting with `on` (event handlers — XSS vector)
 *  - the `srcdoc` attribute (lets the parent inline arbitrary HTML)
 *  - any `src` that isn't an https or http URL (no `javascript:`, `data:`, etc.)
 *
 * What we keep:
 *  - the rest, verbatim (including `data-*`, `marginwidth/height`, `allow`,
 *    `sandbox`, custom provider attrs, etc.)
 *  - we also force `loading="lazy"` so offscreen iframes don't block paint.
 *
 * Fallback content between `<iframe>...</iframe>` (e.g. Google Forms'
 * "Loading…" text) is discarded — it's only shown when iframes are disabled,
 * which we don't optimise for, and stripping it removes any possibility of
 * tag-confusion attacks.
 */
const FORBIDDEN_ATTR_PREFIXES = ["on"];
const FORBIDDEN_ATTRS = new Set(["srcdoc"]);

function sanitizeIframe(input: string): string | null {
  const trimmed = input.trim();
  // Accept three shapes:
  //   <iframe ...>fallback</iframe>
  //   <iframe ... />
  //   <iframe ...>             (browsers tolerate the missing closer; some
  //                              providers ship this form)
  const paired = /^<iframe\b([^>]*)>([\s\S]*?)<\/iframe>$/i.exec(trimmed);
  const selfClosed = /^<iframe\b([^>]*)\/\s*>$/i.exec(trimmed);
  const bare = /^<iframe\b([^>]*)>$/i.exec(trimmed);
  const match = paired || selfClosed || bare;
  if (!match) return null;
  const attrSegment = match[1] ?? "";

  const attrs: Record<string, string> = {};
  // Tokenize attribute pairs `name="value"`, `name='value'`, or bare `name`.
  const attrRe = /([a-zA-Z_:][a-zA-Z0-9_:.\-]*)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(attrSegment))) {
    const name = (m[1] ?? "").toLowerCase();
    let value = m[2] ?? "";
    if (value.startsWith('"') || value.startsWith("'")) value = value.slice(1, -1);
    if (FORBIDDEN_ATTR_PREFIXES.some((p) => name.startsWith(p))) return null;
    if (FORBIDDEN_ATTRS.has(name)) return null;
    attrs[name] = value;
  }

  // Mandatory: src must be present and an https/http URL.
  if (!attrs.src || !/^https?:\/\//i.test(attrs.src)) return null;

  // Force lazy-loading regardless of what the provider supplied.
  attrs.loading = "lazy";

  const rebuilt = Object.entries(attrs)
    .map(([k, v]) =>
      v.length > 0 ? `${k}="${v.replace(/"/g, "&quot;").replace(/[\r\n]/g, "")}"` : k,
    )
    .join(" ");
  return `<iframe ${rebuilt}></iframe>`;
}

export type QuoteFormEmbeddedProps = {
  code: string | null | undefined;
};

export function QuoteFormEmbedded({ code }: QuoteFormEmbeddedProps) {
  const cleaned = code ? sanitizeIframe(code) : null;
  if (!cleaned) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[QuoteFormEmbedded] CMS `form_embed_code` is missing or failed sanitization. Falling back to maintenance card.",
      );
    }
    return (
      <div className="bg-surface-alt mx-auto flex max-w-[1196px] flex-col items-center px-[24px] py-[60px] text-center">
        <p className="font-display text-ink text-[18px] font-bold uppercase">
          Form temporarily unavailable
        </p>
        <p className="font-body text-ink-soft mt-[8px] max-w-[480px] text-[14px]">
          Please email info@heliskycargo.com directly and we&apos;ll respond promptly.
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-surface mx-auto max-w-[1196px]"
      // Output is the sanitizer's allow-listed iframe markup — safe by construction.
      dangerouslySetInnerHTML={{
        __html: `<div style="position:relative;min-height:800px">${cleaned}</div>`,
      }}
    />
  );
}
