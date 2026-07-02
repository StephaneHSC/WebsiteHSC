/**
 * M8 — Branded HTML email for quote submissions.
 *
 * Server-only (imported from /api/quote). Single function returning a
 * mail-client-safe HTML string: `<table>` layout (Outlook still doesn't
 * support flexbox), inline styles only (no external CSS), system-font
 * fallback (Inter Tight isn't reliable across mail clients).
 *
 * Kept under 100KB so Gmail doesn't clip.
 */

import type { QuoteFormRoute } from "@/types/quoteForm";

const RED = "#E40C28";
const INK = "#101820";
const INK_SOFT = "#3D3D3D";
const BORDER = "#E5E7EB";
const SURFACE_ALT = "#F9F9F9";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nl2br(input: string): string {
  return escapeHtml(input).replace(/\r?\n/g, "<br>");
}

function sectionHeading(label: string): string {
  return `
    <tr>
      <td style="padding: 24px 0 8px 0; border-top: 1px solid ${BORDER};">
        <span style="font-family: Arial, sans-serif; font-weight: 700; font-size: 12px; letter-spacing: 0.08em; color: ${INK}; text-transform: uppercase;">
          ${escapeHtml(label)}
        </span>
      </td>
    </tr>`;
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 4px 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 22px; color: ${INK_SOFT};">
        <span style="display: inline-block; min-width: 140px; color: #6B7280;">${escapeHtml(label)}:</span>
        <span style="color: ${INK};">${nl2br(value)}</span>
      </td>
    </tr>`;
}

export interface QuoteEmailInput {
  modes: string[];
  routes: QuoteFormRoute[];
  shippingPeriod: string;
  helicopterBrands: string[];
  helicopterModels: string[];
  helicopterQuantity: string;
  transactionType: string;
  additionalInformation: string;
  companyName: string;
  companyWebsite: string;
  fullName: string;
  email: string;
  receivedAt: Date;
}

export function buildQuoteEmailHtml(input: QuoteEmailInput): string {
  const routesRows = input.routes
    .map(
      (r, i) =>
        `<tr><td style="padding: 4px 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 22px; color: ${INK};">
          <span style="display: inline-block; min-width: 80px; color: #6B7280;">Route ${i + 1}:</span>
          <span>${escapeHtml(r.origin)} &rarr; ${escapeHtml(r.destination)}</span>
        </td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>New Quote Request</title>
</head>
<body style="margin: 0; padding: 0; background: ${SURFACE_ALT}; font-family: Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${SURFACE_ALT}; padding: 24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background: #FFFFFF; border: 1px solid ${BORDER};">
          <tr>
            <td style="background: ${RED}; height: 6px; line-height: 6px; font-size: 0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <h1 style="margin: 0; font-family: Arial, sans-serif; font-size: 22px; line-height: 28px; color: ${INK}; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700;">
                New Quote Request
              </h1>
              <p style="margin: 8px 0 0 0; font-family: Arial, sans-serif; font-size: 13px; color: #6B7280;">
                Received ${escapeHtml(input.receivedAt.toUTCString())}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${sectionHeading("Mode of Transport")}
                <tr><td style="padding: 4px 0; font-family: Arial, sans-serif; font-size: 16px; font-weight: 700; color: ${INK};">${escapeHtml(input.modes.join(", "))}</td></tr>

                ${sectionHeading("Routes")}
                ${routesRows}

                ${sectionHeading("Shipment Details")}
                ${row("Shipping period", input.shippingPeriod)}
                ${row("Helicopter", `${input.helicopterBrands.length > 0 ? input.helicopterBrands.join(", ") : "—"} ${input.helicopterModels.length > 0 ? input.helicopterModels.join(", ") : "—"} × ${input.helicopterQuantity}`)}

                ${sectionHeading("Transaction")}
                ${row("Type", input.transactionType || "—")}
                ${row("Notes", input.additionalInformation)}

                ${sectionHeading("Contact")}
                ${row("Name", input.fullName)}
                ${row("Email", input.email)}
                ${row("Company", input.companyName)}
                ${row("Website", input.companyWebsite)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background: ${SURFACE_ALT}; padding: 16px 32px; border-top: 1px solid ${BORDER};">
              <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; color: #6B7280; line-height: 18px;">
                Reply directly to this email to respond to the customer. Sent by the Heli SkyCargo quote form.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
