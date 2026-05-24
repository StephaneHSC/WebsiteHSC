import { LegalPage } from "@/components/sections/legal/LegalPage";
import { PRIVACY_HTML } from "@/lib/legal-content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy Statement",
  description:
    "Heli Skycargo Privacy and Personal Data Protection Policy Statement — how we collect, use, store, and protect your personal information.",
  path: "/privacy",
});

/**
 * Verbatim privacy policy pulled from heliskycargo.com/privacy-policy/.
 * Section 11 (Website Browsing and Cookies) still describes Google Analytics
 * + DoubleClick — kept as-is per the source. Update the source HTML or the
 * sanitized constant in `src/lib/legal-content.ts` if the wording changes.
 */
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy and Personal Data Protection Policy Statement"
      subtitle="Heli Skycargo"
    >
      <div className="legal-prose" dangerouslySetInnerHTML={{ __html: PRIVACY_HTML }} />
    </LegalPage>
  );
}
