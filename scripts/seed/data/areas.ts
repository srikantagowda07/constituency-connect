/**
 * scripts/seed/data/areas.ts
 *
 * Seed data for the `areas` collection.
 * 4 areas per constituency = 8 total.
 *
 * Vijayanagar areas:
 *   1. Vijayanagar 1st Stage
 *   2. Vijayanagar 2nd Stage
 *   3. Nagarbhavi
 *   4. Basaveshwara Nagar
 *
 * Govindarajnagar areas:
 *   1. Govindarajnagar Main
 *   2. Chord Road
 *   3. Rajajinagar Industrial Area
 *   4. Kamakshipalya
 *
 * IDs are exported so ward seeds can reference them.
 */

import { CON_VIJAYANAGAR, CON_GOVINDARAJNAGAR } from "./constituencies";

// ─── Vijayanagar area IDs ────────────────────────────────────────────────────
export const AREA_VJN_1ST_STAGE     = "area_vjn_1st_stage";
export const AREA_VJN_2ND_STAGE     = "area_vjn_2nd_stage";
export const AREA_NAGARBHAVI        = "area_nagarbhavi";
export const AREA_BASAVESHWARA_NGR  = "area_basaveshwara_ngr";

// ─── Govindarajnagar area IDs ─────────────────────────────────────────────────
export const AREA_GRN_MAIN          = "area_grn_main";
export const AREA_CHORD_ROAD        = "area_chord_road";
export const AREA_RAJAJINAGAR_IND   = "area_rajajinagar_ind";
export const AREA_KAMAKSHIPALYA     = "area_kamakshipalya";

export const areas = [
  // ── Vijayanagar ──────────────────────────────────────────────────────────
  {
    id: AREA_VJN_1ST_STAGE,
    constituencyId: CON_VIJAYANAGAR,
    name: "Vijayanagar 1st Stage",
    slug: "vijayanagar-1st-stage",
    pinCodes: ["560040"],
    isActive: true,
  },
  {
    id: AREA_VJN_2ND_STAGE,
    constituencyId: CON_VIJAYANAGAR,
    name: "Vijayanagar 2nd Stage",
    slug: "vijayanagar-2nd-stage",
    pinCodes: ["560040"],
    isActive: true,
  },
  {
    id: AREA_NAGARBHAVI,
    constituencyId: CON_VIJAYANAGAR,
    name: "Nagarbhavi",
    slug: "nagarbhavi",
    pinCodes: ["560072"],
    isActive: true,
  },
  {
    id: AREA_BASAVESHWARA_NGR,
    constituencyId: CON_VIJAYANAGAR,
    name: "Basaveshwara Nagar",
    slug: "basaveshwara-nagar",
    pinCodes: ["560079"],
    isActive: true,
  },

  // ── Govindarajnagar ───────────────────────────────────────────────────────
  {
    id: AREA_GRN_MAIN,
    constituencyId: CON_GOVINDARAJNAGAR,
    name: "Govindarajnagar Main",
    slug: "govindarajnagar-main",
    pinCodes: ["560040"],
    isActive: true,
  },
  {
    id: AREA_CHORD_ROAD,
    constituencyId: CON_GOVINDARAJNAGAR,
    name: "Chord Road",
    slug: "chord-road",
    pinCodes: ["560010"],
    isActive: true,
  },
  {
    id: AREA_RAJAJINAGAR_IND,
    constituencyId: CON_GOVINDARAJNAGAR,
    name: "Rajajinagar Industrial Area",
    slug: "rajajinagar-industrial-area",
    pinCodes: ["560044"],
    isActive: true,
  },
  {
    id: AREA_KAMAKSHIPALYA,
    constituencyId: CON_GOVINDARAJNAGAR,
    name: "Kamakshipalya",
    slug: "kamakshipalya",
    pinCodes: ["560079"],
    isActive: true,
  },
];
