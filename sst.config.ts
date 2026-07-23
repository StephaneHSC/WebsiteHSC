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
 * Remove:  npx sst remove  --stage production   (blocked on production, see `protect`)
 */
export default $config({
  app(input) {
    return {
      name: "hsc-website",
      // Never auto-delete resources on a production removal.
      removal: input?.stage === "production" ? "retain" : "remove",
      // Guard production against an accidental `sst remove`.
      protect: input?.stage === "production",
      home: "aws",
      providers: {
        aws: { region: "eu-central-1" },
      },
    };
  },

  async run() {
    new sst.aws.Nextjs("HscWeb", {
      // Custom domain — uncomment once heliskycargo.com is managed in Route 53
      // (or configure `dns` for an external provider). Until then the app is
      // served on the generated CloudFront URL that `sst deploy` prints.
      //
      // domain: {
      //   name: "heliskycargo.com",
      //   redirects: ["www.heliskycargo.com"],
      // },

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
