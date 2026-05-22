/**
 * One-shot Sanity seed script — populates the home page CMS with the
 * placeholder data we currently fall back to in dev. After running this,
 * the inline PLACEHOLDER_* arrays in the section components should never
 * fire (Sanity is no longer empty).
 *
 * Seeds three schemas:
 *   - milestone (4 entries with images uploaded to Sanity assets)
 *   - testimonial (3 featured entries with company logos)
 *   - teamMember (4 entries; uses a single shared placeholder photo because
 *     the schema requires `photo` — editor swaps with real headshots later)
 *
 * Usage:
 *   1. Generate a write token at:
 *      https://www.sanity.io/manage/personal/project/u1hilj5b/api
 *      (Editor or Deploy Studio role — anything with write permission)
 *   2. Add to .env.local on its own line:
 *      SANITY_AUTH_TOKEN=<paste-token-here>
 *   3. From project root:
 *      npm run seed:sanity
 *
 * Re-running the script will create DUPLICATES (each call adds new
 * documents). To wipe and re-seed, delete the existing docs in /studio
 * first or pass `--purge` (see flag below).
 */

import { createClient } from "next-sanity";
import { createReadStream } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_AUTH_TOKEN;

if (!projectId) {
  console.error("[seed] NEXT_PUBLIC_SANITY_PROJECT_ID missing in .env.local");
  process.exit(1);
}
if (!token) {
  console.error("[seed] SANITY_AUTH_TOKEN missing in .env.local");
  console.error(
    `       Generate at https://www.sanity.io/manage/personal/project/${projectId}/api`,
  );
  process.exit(1);
}

const purge = process.argv.includes("--purge");
const formModeArg = process.argv.find((a) => a.startsWith("--form-mode="));
const formMode = formModeArg ? formModeArg.split("=")[1] : "custom";
if (!["custom", "embed"].includes(formMode)) {
  console.error(`[seed] --form-mode must be 'custom' or 'embed' (got: ${formMode})`);
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// ── Asset upload helper ─────────────────────────────────────────────────────

const uploadCache = new Map();

async function uploadImage(publicPath) {
  if (uploadCache.has(publicPath)) return uploadCache.get(publicPath);
  const fullPath = resolve(projectRoot, "public", publicPath.replace(/^\//, ""));
  const stream = createReadStream(fullPath);
  const filename = basename(fullPath);
  process.stdout.write(`  ↑ uploading ${filename}... `);
  const asset = await client.assets.upload("image", stream, { filename });
  console.log(`ok (${asset._id})`);
  uploadCache.set(publicPath, asset);
  return asset;
}

function imageRef(asset) {
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

// ── Seed data ───────────────────────────────────────────────────────────────

// 9-entry team seed — mirrors `PLACEHOLDER_TEAM_MEMBERS` in src/lib/constants.ts.
// `_id` derives from a slug of `full_name` so re-runs createOrReplace cleanly.
// `long_bio` is Portable Text (one block per paragraph) since the schema typed
// it as `array of block`. Non-CEO bios are lorem-ipsum until client supplies.
const LOREM_BIO_1 =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
const LOREM_BIO_2 =
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.";

const STEPHANE_BIO_1 =
  "With 25+ years in global freight forwarding across Europe, USA, Asia and Middle East. Stephane brings deep industry expertise and a strong customer-focused approach.";
const STEPHANE_BIO_2 =
  "Having accompanied helicopter shipments onboard aircraft such as the AN-124 and IL-76, he has built a trusted worldwide network and remains closely involved in supporting clients across the globe.";

const TEAM_MEMBERS = [
  {
    _id: "team-stephane-marot",
    full_name: "Stephane Marot",
    role: "Founder & CEO",
    department: "Leadership",
    short_bio: "Captains the HSC mission across global ops.",
    bioParagraphs: [STEPHANE_BIO_1, STEPHANE_BIO_2],
    social_links: {
      linkedin: "https://linkedin.com/in/stephanemarot",
      email: "stephane@heliskycargo.com",
    },
    order: 1,
    is_featured: true,
    status: "published",
    photoPath: "/team/stephane-marot.webp",
  },
  {
    _id: "team-daniel-cosico",
    full_name: "Daniel Cosico",
    role: "Deployment & Lead Coordinator",
    department: "Operations",
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
    order: 2,
    is_featured: false,
    status: "published",
    photoPath: "/team/daniel-cosico.webp",
  },
  {
    _id: "team-adriana-athirah",
    full_name: "Adriana Athirah",
    role: "Sales & Marketing Executive",
    department: "Commercial",
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
    order: 3,
    is_featured: false,
    status: "published",
    photoPath: "/team/adriana-athirah.png",
  },
  {
    _id: "team-rica-mae-cortez",
    full_name: "Rica Mae Cortez",
    role: "Logistic Specialist",
    department: "Operations",
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
    order: 4,
    is_featured: false,
    status: "published",
    photoPath: "/team/rica-mae-cortez.webp",
  },
  {
    _id: "team-alfredo-dinglasan",
    full_name: "Alfredo Dinglasan",
    role: "Logistic Specialist",
    department: "Operations",
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
    order: 5,
    is_featured: false,
    status: "published",
    photoPath: "/team/alfredo-dinglasan.webp",
  },
  {
    _id: "team-nikhitha-manuel",
    full_name: "Nikhitha Manuel",
    role: "RFQ",
    department: "Commercial",
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
    order: 6,
    is_featured: false,
    status: "published",
    photoPath: "/team/nikhitha-manuel.webp",
  },
  {
    _id: "team-remi-hachisuka",
    full_name: "Remi Hachisuka",
    role: "Japan Desk Manager",
    department: "Commercial",
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
    order: 7,
    is_featured: false,
    status: "published",
    photoPath: "/team/remi-hachisuka.webp",
  },
  {
    _id: "team-anjelimo-mulati",
    full_name: "Anjelimo Mulati",
    role: "Accounting",
    department: "Operations",
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
    order: 8,
    is_featured: false,
    status: "published",
    photoPath: "/team/anjelimo-mulati.webp",
  },
  {
    _id: "team-mia-juliet-marot",
    full_name: "Mia Juliet Marot",
    role: "Junior Sales & Marketing",
    department: "Commercial",
    bioParagraphs: [LOREM_BIO_1, LOREM_BIO_2],
    order: 9,
    is_featured: false,
    status: "published",
    photoPath: "/team/mia-juliet-marot.webp",
  },
];

let blockKeyCounter = 0;
function nextKey(prefix) {
  blockKeyCounter += 1;
  return `${prefix}-${blockKeyCounter.toString(36)}`;
}

function paragraphsToPortableText(paragraphs) {
  return paragraphs.map((text) => ({
    _key: nextKey("blk"),
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: nextKey("span"), _type: "span", marks: [], text }],
  }));
}

const MILESTONES = [
  {
    year: 2026,
    headline: "Customer Satisfaction",
    description:
      "Global customer satisfaction survey is launched to receive our customers' feedback in the aim to exceed our customer's expectation.",
    imagePath: "/milestones/2026-customer-satisfaction.webp",
    order: 4,
  },
  {
    year: 2024,
    headline: "Global Headquarter Relocates",
    description: "Heli Skycargo Corporate office and Global Customer Support Center to Dubai, UAE.",
    imagePath: "/milestones/2024-hq-relocates.webp",
    order: 3,
  },
  {
    year: 2023,
    headline: "Customer Support Expansion for Japan",
    description: "Our Japan desk is opened to cater to our Japanese customers.",
    imagePath: "/milestones/2023-japan-desk.webp",
    order: 2,
  },
  {
    year: 2021,
    headline: "On the Road",
    description:
      "Heli Skycargo starts exhibiting at HAI Atlanta, European Rotors in Madrid, Spain and Verticon Anaheim.",
    imagePath: "/milestones/2021-on-the-road.webp",
    order: 1,
  },
];

// Site stats singleton — pinned to `_id: "siteStats"` to match
// `src/sanity/structure.ts`. createOrReplace is idempotent, so re-running the
// seed script overwrites without creating duplicates.
//
// Each array entry needs a unique `_key` — Sanity Studio refuses to render the
// list editor without one, since `_key` is the React-style identity used to
// track reorders/edits.
const SITE_STATS = {
  _id: "siteStats",
  _type: "siteStats",
  stats: [
    { _key: "stat-shipments", value: "1000+", label: "Shipments Completed", order: 1 },
    { _key: "stat-support", value: "24/7", label: "Available Support", order: 2 },
    { _key: "stat-clients", value: "50+", label: "Clients Worldwide", order: 3 },
    { _key: "stat-since", value: "2014", label: "Trusted Since", order: 4 },
  ],
};

const TESTIMONIALS = [
  {
    customer_name: "Mr. Morten H.",
    company: "Lufttransport",
    quote:
      "I would also use this oppurtunity to thank you and your team for helping us with the transportation of our AW139. Your service was high level and we will most certainly keep your name in case of future projects.",
    rating: 5,
    service_tag: "Air Charter",
    order: 1,
    is_featured: true,
    status: "published",
    logoPath: "/testimonials/lufttransport.png",
  },
  {
    customer_name: "Mr. Ryosei I.",
    company: "Mitsui Bussan Aerospace",
    quote:
      "Thanks to appropriate and flexible proposals of HSC team depending on the situation for worldwide logistics, import destination and Japan, we could meet the customers' expectations and delivery the Helicopter as scheduled. We are also able to grasp the transportation status in timely through HSC App which is extremely useful for us and our customers.",
    rating: 5,
    service_tag: "Air Commercial",
    order: 2,
    is_featured: true,
    status: "published",
    logoPath: "/testimonials/mitsui-bussan.png",
  },
  {
    customer_name: "Mr. Rodney L.",
    company: "Sazma Aviation",
    quote:
      "Both our AW139 helicopter shipment was handled professionally by your team and safely arrived at Subang, Malaysia. Great to have Heli Skycargo as our transporter for our helicopter transshipment globally.",
    rating: 5,
    service_tag: "Ocean RO/RO",
    order: 3,
    is_featured: true,
    status: "published",
    logoPath: "/testimonials/sazma-aviation.png",
  },
];

// ── Mutations ───────────────────────────────────────────────────────────────

async function purgeAll() {
  for (const type of ["teamMember", "milestone", "testimonial", "siteStats", "quoteFormConfig"]) {
    const ids = await client.fetch(`*[_type == "${type}"]._id`);
    if (ids.length === 0) continue;
    console.log(`[seed] purging ${ids.length} ${type} doc(s)...`);
    await client.delete({ query: `*[_type == "${type}"]` });
  }
}

async function seedTeam() {
  console.log("\n[seed] team members");
  for (const m of TEAM_MEMBERS) {
    const photoAsset = await uploadImage(m.photoPath);
    const { photoPath: _photoPath, bioParagraphs: _bioParagraphs, ...rest } = m;
    void _photoPath;
    const doc = {
      _type: "teamMember",
      ...rest,
      photo: imageRef(photoAsset),
      long_bio: paragraphsToPortableText(m.bioParagraphs),
    };
    // createOrReplace keys on `_id` so re-running the seed updates rather
    // than creating duplicates. Matches the singleton siteStats pattern.
    const created = await client.createOrReplace(doc);
    console.log(`  ✓ ${m.full_name} → ${created._id}`);
  }
}

async function seedMilestones() {
  console.log("\n[seed] milestones");
  for (const m of MILESTONES) {
    const asset = await uploadImage(m.imagePath);
    const { imagePath: _imagePath, ...rest } = m;
    void _imagePath;
    const created = await client.create({
      _type: "milestone",
      ...rest,
      image: imageRef(asset),
    });
    console.log(`  ✓ ${m.year} ${m.headline} → ${created._id}`);
  }
}

async function seedSiteStats() {
  console.log("\n[seed] site stats");
  const created = await client.createOrReplace(SITE_STATS);
  console.log(`  ✓ ${SITE_STATS.stats.length} stats → ${created._id}`);
}

/**
 * Seeds the quoteFormConfig singleton with PDF §4.2's 6 spec fields +
 * `form_mode` toggle. `--form-mode=custom|embed` CLI flag picks the path
 * (defaults to `custom`).
 *
 * The 4 dead fields (transport_modes, helicopter_models, transaction_types,
 * step_titles) were removed 2026-05-13 — the frontend uses hardcoded
 * constants so CMS arrays for those changed nothing.
 */
async function seedQuoteFormConfig() {
  console.log(`\n[seed] quote form config (mode=${formMode})`);
  const sampleEmbed = `<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdHMhZhqcVJUyFIV08A47labV9BC3FKCaZ0Ve28QUP6aH5v5Q/viewform?embedded=true" width="100%" height="1975" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>`;
  // Upload the canonical Figma-matching Antonov photo so the `hero_image`
  // CMS field is populated out of the box (instead of relying on the
  // hardcoded `QUOTE_HERO.photo.src` fallback). One image — overridable
  // by the editor in Studio; appears on /quote AND every embedded shell.
  const heroAsset = await uploadImage("/quote/quote-hero.webp");
  const doc = {
    _id: "quoteFormConfig",
    _type: "quoteFormConfig",
    form_mode: formMode,
    // Pre-fill with the Figma-canonical 2-line headline so editors see what
    // the field controls. Newlines render as line breaks in the H1/H2 stack
    // (split + per-line block-span — see QuoteHero / QuoteFormShell).
    hero_headline: "Share Your Shipment Details\nWe'll Handle The Rest.",
    hero_image: imageRef(heroAsset),
    recipient_email: "",
    success_message: "Thank you for your enquiry. Our ops team will reply within 24 hours.",
    form_enabled: true,
    form_embed_code: formMode === "embed" ? sampleEmbed : "",
  };
  const created = await client.createOrReplace(doc);
  console.log(`  ✓ quoteFormConfig (${formMode}) → ${created._id}`);
}

async function seedTestimonials() {
  console.log("\n[seed] testimonials");
  for (const t of TESTIMONIALS) {
    const logoAsset = await uploadImage(t.logoPath);
    const { logoPath: _logoPath, ...rest } = t;
    void _logoPath;
    const created = await client.create({
      _type: "testimonial",
      ...rest,
      logo: imageRef(logoAsset),
    });
    console.log(`  ✓ ${t.customer_name} (${t.company}) → ${created._id}`);
  }
}

// ── Run ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`[seed] target: project=${projectId} dataset=${dataset}`);
  if (purge) await purgeAll();
  await seedTeam();
  await seedMilestones();
  await seedTestimonials();
  await seedSiteStats();
  await seedQuoteFormConfig();
  console.log(
    "\n[seed] done. Hard refresh http://localhost:3000/ to see the live data replace placeholders.",
  );
}

main().catch((err) => {
  console.error("\n[seed] error:", err.message ?? err);
  process.exit(1);
});
