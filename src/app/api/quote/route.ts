import { Resend } from "resend";
import { client as sanityClient } from "@/lib/sanity/client";
import { quoteFormConfigQuery } from "@/lib/sanity/queries";
import { validateServerSide } from "@/lib/forms/quoteForm";
import { buildQuoteEmailHtml, type QuoteEmailAttachment } from "@/lib/forms/quoteEmailTemplate";
import type { QuoteFormConfig } from "@/types/sanity";
import { QUOTE_FILE_LIMITS } from "@/lib/constants";

export const runtime = "nodejs";
export const maxDuration = 15;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
  action?: string;
  cdata?: string;
}

async function verifyTurnstile(token: string, remoteIp?: string): Promise<TurnstileResponse> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) {
    return { success: false, "error-codes": ["missing-secret"] };
  }
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) return { success: false, "error-codes": [`verify-http-${res.status}`] };
  return (await res.json()) as TurnstileResponse;
}

export async function POST(req: Request) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return Response.json({ ok: false, error: "Invalid submission payload." }, { status: 400 });
  }

  // 1. Spam-protection token
  const token = String(fd.get("cf-turnstile-response") ?? "");
  if (!token) {
    return Response.json({ ok: false, error: "Missing spam-protection token." }, { status: 400 });
  }
  const remoteIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const verify = await verifyTurnstile(token, remoteIp);
  if (!verify.success) {
    console.warn("[/api/quote] Turnstile rejected", verify["error-codes"]);
    return Response.json(
      {
        ok: false,
        error:
          "We couldn't verify your browser. Please refresh the page and submit again — if the issue persists, email info@heliskycargo.com directly.",
      },
      { status: 400 },
    );
  }

  // 2. Server-side validation (defense in depth)
  const validation = validateServerSide(fd);
  if (validation) {
    return Response.json(
      { ok: false, error: validation.message, field: validation.field },
      { status: 400 },
    );
  }

  // 3. Resolve recipient from CMS (or env fallback)
  let recipient = process.env.OPS_INBOX_FALLBACK ?? "";
  try {
    const config = await sanityClient.fetch<QuoteFormConfig | null>(quoteFormConfigQuery);
    const cmsEmail = config?.recipient_email?.trim();
    if (cmsEmail && EMAIL_RE.test(cmsEmail)) recipient = cmsEmail;
  } catch (err) {
    console.warn("[/api/quote] CMS recipient lookup failed; using OPS_INBOX_FALLBACK", err);
  }
  if (!recipient || !EMAIL_RE.test(recipient)) {
    console.error("[/api/quote] No valid recipient configured.");
    return Response.json(
      {
        ok: false,
        error: "Recipient configuration error. Please email info@heliskycargo.com directly.",
      },
      { status: 500 },
    );
  }

  // 4. Resend SDK availability
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromAddress) {
    console.error("[/api/quote] RESEND_API_KEY or RESEND_FROM_EMAIL missing.");
    return Response.json(
      {
        ok: false,
        error: "Mail service unavailable. Please email info@heliskycargo.com directly.",
      },
      { status: 502 },
    );
  }
  const resend = new Resend(apiKey);

  // 5. Build email body + attachments
  const routes = JSON.parse(String(fd.get("routes") ?? "[]")) as {
    origin: string;
    destination: string;
  }[];
  const attachmentList: { filename: string; content: Buffer }[] = [];
  const attachmentMeta: QuoteEmailAttachment[] = [];
  for (let i = 1; i <= QUOTE_FILE_LIMITS.maxFiles; i += 1) {
    const file = fd.get(`attachment_${i}`);
    if (file instanceof File && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      attachmentList.push({ filename: file.name, content: buffer });
      attachmentMeta.push({ filename: file.name, size: file.size });
    }
  }

  const companyName = String(fd.get("company_name") ?? "");
  const mode = String(fd.get("mode") ?? "");
  const submitterEmail = String(fd.get("email") ?? "");

  const html = buildQuoteEmailHtml({
    mode,
    routes,
    shippingPeriod: String(fd.get("shipping_period") ?? ""),
    helicopterBrand: String(fd.get("helicopter_brand") ?? ""),
    helicopterModel: String(fd.get("helicopter_model") ?? ""),
    helicopterQuantity: String(fd.get("helicopter_quantity") ?? ""),
    transactionType: String(fd.get("transaction_type") ?? ""),
    additionalInformation: String(fd.get("additional_information") ?? ""),
    companyName,
    companyWebsite: String(fd.get("company_website") ?? ""),
    fullName: String(fd.get("full_name") ?? ""),
    email: submitterEmail,
    attachments: attachmentMeta,
    receivedAt: new Date(),
  });

  // 6. Deliver via Resend
  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [recipient],
      replyTo: submitterEmail,
      subject: `Quote: ${companyName} — ${mode}`,
      html,
      attachments: attachmentList,
    });
    if (error) {
      console.error("[/api/quote] Resend error", error);
      return Response.json(
        {
          ok: false,
          error: "Mail service unavailable. Please email info@heliskycargo.com directly.",
        },
        { status: 502 },
      );
    }
    return Response.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("[/api/quote] unexpected", err);
    return Response.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
