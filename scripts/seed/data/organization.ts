/**
 * scripts/seed/data/organization.ts
 *
 * Seed data for the `organizations` collection.
 * Single tenant: Priya Krishna Office.
 *
 * Document ID: "org_pk_001"
 * This ID is referenced by every constituency, department, admin, and
 * volunteer document — change it here and update all downstream seeds.
 */

export const ORG_ID = "org_pk_001";

export const organizations = [
  {
    id: ORG_ID,
    name: "Priya Krishna Office",
    slug: "priya-krishna-office",
    code: "PKO",
    state: "Karnataka",
    country: "IN",
    contactEmail: "contact@priyakrishna.in",
    logoUrl: null,
    isActive: true,
  },
];
