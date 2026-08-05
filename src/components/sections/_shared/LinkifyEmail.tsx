import { Fragment } from "react";

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/g;

/**
 * Renders plain text with any email addresses turned into clickable
 * `mailto:` links. For copy blocks stored as plain strings in
 * `src/lib/constants.ts` that happen to mention an address (e.g. Value-Added
 * Services descriptions) — cheaper than converting them to rich text just
 * for this.
 */
export function LinkifyEmail({ text }: { text: string }) {
  const parts = text.split(EMAIL_PATTERN);
  const emails = text.match(EMAIL_PATTERN) ?? [];

  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {emails[i] ? (
            <a
              href={`mailto:${emails[i]}`}
              className="underline hover:opacity-80"
              // Callers often render this inside a larger clickable row
              // (e.g. the Value-Added accordion's toggle button) — stop the
              // click bubbling up so it doesn't also collapse/toggle that
              // ancestor instead of opening the mail client.
              onClick={(e) => e.stopPropagation()}
            >
              {emails[i]}
            </a>
          ) : null}
        </Fragment>
      ))}
    </>
  );
}
