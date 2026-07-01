/**
 * scripts/seed/index.ts
 *
 * Main seed orchestrator.
 *
 * Runs all seed collections in strict dependency order:
 *
 *   1. organizations      (no dependencies)
 *   2. categories         (no dependencies — global master)
 *   3. constituencies     (depends on: organizations)
 *   4. departments        (depends on: organizations, categories)
 *   5. areas              (depends on: constituencies)
 *   6. wards              (depends on: constituencies, areas)
 *   7. streets            (depends on: constituencies, areas, wards)
 *
 * Usage:
 *   npm run seed              — run all seeds
 *   npm run seed:dry          — print counts without writing to Firestore
 *
 * Prerequisites:
 *   Fill in .env.local with FIREBASE_ADMIN_* credentials, OR
 *   place a service-account.json in the project root.
 */

import { seedCollection, logSection } from "./runner";
import { organizations } from "./data/organization";
import { constituencies } from "./data/constituencies";
import { areas } from "./data/areas";
import { wards } from "./data/wards";
import { streets } from "./data/streets";
import { categories } from "./data/categories";
import { departments } from "./data/departments";

// ─── Dry-run mode ─────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry");

function printDryRun(): void {
  logSection("DRY RUN — no data will be written");
  const collections = [
    { name: "organizations",  docs: organizations },
    { name: "categories",     docs: categories },
    { name: "constituencies", docs: constituencies },
    { name: "departments",    docs: departments },
    { name: "areas",          docs: areas },
    { name: "wards",          docs: wards },
    { name: "streets",        docs: streets },
  ];
  let total = 0;
  for (const c of collections) {
    console.log(`  ${c.name.padEnd(20)} ${c.docs.length} document(s)`);
    total += c.docs.length;
  }
  console.log(`${"─".repeat(56)}`);
  console.log(`  ${"TOTAL".padEnd(20)} ${total} document(s)`);
  console.log();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║       Constituency Connect — Firestore Seed          ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  if (DRY_RUN) {
    printDryRun();
    return;
  }

  const startTime = Date.now();

  // ── Step 1: Global masters (no foreign-key dependencies) ────────────────
  logSection("Step 1 / 7 — Organizations");
  await seedCollection("organizations", organizations);

  logSection("Step 2 / 7 — Categories");
  await seedCollection("categories", categories);

  // ── Step 2: Org-scoped masters ────────────────────────────────────────────
  logSection("Step 3 / 7 — Constituencies");
  await seedCollection("constituencies", constituencies);

  logSection("Step 4 / 7 — Departments");
  await seedCollection("departments", departments);

  // ── Step 3: Location hierarchy ────────────────────────────────────────────
  logSection("Step 5 / 7 — Areas");
  await seedCollection("areas", areas);

  logSection("Step 6 / 7 — Wards");
  await seedCollection("wards", wards);

  logSection("Step 7 / 7 — Streets");
  await seedCollection("streets", streets);

  // ── Summary ───────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalDocs =
    organizations.length +
    categories.length +
    constituencies.length +
    departments.length +
    areas.length +
    wards.length +
    streets.length;

  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log(`║  ✓ Seed complete — ${String(totalDocs).padEnd(3)} documents in ${elapsed}s`.padEnd(54) + "║");
  console.log("╚══════════════════════════════════════════════════════╝\n");

  process.exit(0);
}

main().catch((err: unknown) => {
  console.error("\n✗ Seed failed:", err);
  process.exit(1);
});
