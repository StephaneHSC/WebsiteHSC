// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

/**
 * SST config — deploys the Next.js app to AWS via OpenNext.
 *
 * The `Nextjs` component runs OpenNext under the hood and provisions:
 *   - S3 bucket (static assets)
 *   - CloudFront distribution (CDN + routing)
 *   - Lambda (server: SSR, App Router, /api/quote route handler)
 *   - Lambda (image optimization for next/image)
 *   - DynamoDB + SQS (ISR revalidation queue — powers `revalidate = 60`)
 *
 * State is stored automatically in an SST-managed S3 bucket in this AWS
 * account (created on first deploy), so CI only needs AWS credentials.
 *
 * Deploy:  npx sst deploy --stage production
 * Remove:  npx sst remove  --stage production
 *          Blocked on production unless SST_ALLOW_REMOVE=true (see `protect`
 *          below); the sst-remove workflow sets it for a deliberate teardown.
 *          Note a teardown mints a new CloudFront distribution, which means
 *          re-pointing the `www` DNS record afterwards.
 */
export default $config({
  app(input) {
    // Escape hatch for a deliberate teardown+recreate: the sst-remove workflow
    // sets SST_ALLOW_REMOVE=true so `sst remove` can actually delete production.
    // Normal deploys leave it unset, so production stays retained + protected.
    const allowRemove = process.env.SST_ALLOW_REMOVE === "true";
    const isProd = input?.stage === "production";
    return {
      name: "hsc-website",
      // Never auto-delete resources on a production removal (unless tearing down).
      removal: isProd && !allowRemove ? "retain" : "remove",
      // Guard production against an accidental `sst remove`.
      protect: isProd && !allowRemove,
      home: "aws",
      providers: {
        aws: { region: "eu-central-1" },
      },
    };
  },

  async run() {
    // Custom domain - heliskycargo.com
    // Note: authoritative DNS for this domain is Bluehost, not SiteGround.
    // SiteGround only hosts the old site's files
    const certArn = process.env.HSC_DOMAIN_CERT_ARN;

    new sst.aws.Nextjs("HscWeb", {
      openNextVersion: "4.1.0",

      ...(certArn && {
        domain: {
          name: "www.heliskycargo.com",
          // SST can't write to Bluehost, so `dns: false` + our own ACM cert (us-east-1)
          dns: false,
          cert: certArn,
        },
      }),

      // Env vars flow from GitHub Actions secrets → the build (for NEXT_PUBLIC_*)
      // and the server Lambda (for the server-only secrets used by /api/quote).
      environment: {
        NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
        NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET!,
        NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION!,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL!,
        NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,

        SANITY_AUTH_TOKEN: process.env.SANITY_AUTH_TOKEN!,
        TURNSTILE_SECRET: process.env.TURNSTILE_SECRET!,
        RESEND_API_KEY: process.env.RESEND_API_KEY!,
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL!,
        OPS_INBOX_FALLBACK: process.env.OPS_INBOX_FALLBACK ?? "",
      },
    });
  },
});
