import { LegalPage } from "@/components/sections/legal/LegalPage";
import { TERMS_HTML } from "@/lib/legal-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Standard Trading Terms and Conditions",
  description:
    "Heli Skycargo Standard Trading Terms and Conditions — the legal framework governing freight forwarding services between Heli Skycargo and its customers.",
  path: "/terms",
});

/**
 * Verbatim Standard Trading Terms & Conditions pulled from
 * heliskycargo.com/standard-trading-terms-and-conditions/. Effective
 * 17 February 2023. Update by re-extracting from the live site or by editing
 * the sanitized constant in `src/lib/legal-content.ts`.
 */
export default function TermsPage() {
  return (
    <LegalPage
      title="Heli Skycargo's Standard Trading Terms and Conditions"
      subtitle="Effective 17 February 2023"
    >
      <div className="legal-prose" dangerouslySetInnerHTML={{ __html: TERMS_HTML }} />
    </LegalPage>
  );
}
