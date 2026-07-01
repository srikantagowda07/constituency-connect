/**
 * scripts/seed/data/constituencies.ts
 *
 * Seed data for the `constituencies` collection.
 *
 * Constituencies:
 *   1. Vijayanagar   (AC-155)
 *   2. Govindarajnagar (AC-156)
 *
 * Both are Bangalore City segments under the Karnataka Legislative Assembly.
 * IDs are exported so area/ward/street seeds can reference them without
 * hard-coding strings.
 */

import { ORG_ID } from "./organization";

export const CON_VIJAYANAGAR     = "con_vijayanagar";
export const CON_GOVINDARAJNAGAR = "con_govindarajnagar";

export const constituencies = [
  {
    id: CON_VIJAYANAGAR,
    organizationId: ORG_ID,
    name: "Vijayanagar",
    slug: "vijayanagar",
    code: "AC-155",
    representativeName: "Priya Krishna",
    representativePhone: "+918022001155",
    geoCenter: { latitude: 12.9716, longitude: 77.5350 },
    isActive: true,
  },
  {
    id: CON_GOVINDARAJNAGAR,
    organizationId: ORG_ID,
    name: "Govindarajnagar",
    slug: "govindarajnagar",
    code: "AC-156",
    representativeName: "Priya Krishna",
    representativePhone: "+918022001156",
    geoCenter: { latitude: 12.9650, longitude: 77.5200 },
    isActive: true,
  },
];
