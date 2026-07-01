/**
 * scripts/seed/data/wards.ts
 *
 * Seed data for the `wards` collection.
 * 3 wards per area × 8 areas = 24 wards total.
 *
 * Ward numbers are based on BBMP ward numbering for the Bengaluru West area.
 * IDs are exported so street seeds can reference them.
 */

import {
  CON_VIJAYANAGAR,
  CON_GOVINDARAJNAGAR,
} from "./constituencies";
import {
  AREA_VJN_1ST_STAGE,
  AREA_VJN_2ND_STAGE,
  AREA_NAGARBHAVI,
  AREA_BASAVESHWARA_NGR,
  AREA_GRN_MAIN,
  AREA_CHORD_ROAD,
  AREA_RAJAJINAGAR_IND,
  AREA_KAMAKSHIPALYA,
} from "./areas";

// ─── Vijayanagar 1st Stage wards ─────────────────────────────────────────────
export const WARD_VJN1_A = "ward_vjn1_a";
export const WARD_VJN1_B = "ward_vjn1_b";
export const WARD_VJN1_C = "ward_vjn1_c";

// ─── Vijayanagar 2nd Stage wards ─────────────────────────────────────────────
export const WARD_VJN2_A = "ward_vjn2_a";
export const WARD_VJN2_B = "ward_vjn2_b";
export const WARD_VJN2_C = "ward_vjn2_c";

// ─── Nagarbhavi wards ─────────────────────────────────────────────────────────
export const WARD_NAG_A  = "ward_nag_a";
export const WARD_NAG_B  = "ward_nag_b";
export const WARD_NAG_C  = "ward_nag_c";

// ─── Basaveshwara Nagar wards ─────────────────────────────────────────────────
export const WARD_BAS_A  = "ward_bas_a";
export const WARD_BAS_B  = "ward_bas_b";
export const WARD_BAS_C  = "ward_bas_c";

// ─── Govindarajnagar Main wards ───────────────────────────────────────────────
export const WARD_GRN_A  = "ward_grn_a";
export const WARD_GRN_B  = "ward_grn_b";
export const WARD_GRN_C  = "ward_grn_c";

// ─── Chord Road wards ─────────────────────────────────────────────────────────
export const WARD_CHR_A  = "ward_chr_a";
export const WARD_CHR_B  = "ward_chr_b";
export const WARD_CHR_C  = "ward_chr_c";

// ─── Rajajinagar Industrial Area wards ───────────────────────────────────────
export const WARD_RAJ_A  = "ward_raj_a";
export const WARD_RAJ_B  = "ward_raj_b";
export const WARD_RAJ_C  = "ward_raj_c";

// ─── Kamakshipalya wards ─────────────────────────────────────────────────────
export const WARD_KAM_A  = "ward_kam_a";
export const WARD_KAM_B  = "ward_kam_b";
export const WARD_KAM_C  = "ward_kam_c";

export const wards = [
  // ── Vijayanagar 1st Stage ────────────────────────────────────────────────
  {
    id: WARD_VJN1_A,
    constituencyId: CON_VIJAYANAGAR,
    areaId: AREA_VJN_1ST_STAGE,
    name: "Vijayanagar 1st Stage – Sector A",
    slug: "vijayanagar-1st-stage-sector-a",
    wardNumber: 127,
    councillorName: "Smt. Lakshmi Devi",
    isActive: true,
  },
  {
    id: WARD_VJN1_B,
    constituencyId: CON_VIJAYANAGAR,
    areaId: AREA_VJN_1ST_STAGE,
    name: "Vijayanagar 1st Stage – Sector B",
    slug: "vijayanagar-1st-stage-sector-b",
    wardNumber: 128,
    councillorName: "Sri. Ramesh Kumar",
    isActive: true,
  },
  {
    id: WARD_VJN1_C,
    constituencyId: CON_VIJAYANAGAR,
    areaId: AREA_VJN_1ST_STAGE,
    name: "Vijayanagar 1st Stage – Sector C",
    slug: "vijayanagar-1st-stage-sector-c",
    wardNumber: 129,
    councillorName: "Sri. Venkatesh B",
    isActive: true,
  },

  // ── Vijayanagar 2nd Stage ────────────────────────────────────────────────
  {
    id: WARD_VJN2_A,
    constituencyId: CON_VIJAYANAGAR,
    areaId: AREA_VJN_2ND_STAGE,
    name: "Vijayanagar 2nd Stage – Sector A",
    slug: "vijayanagar-2nd-stage-sector-a",
    wardNumber: 130,
    councillorName: "Smt. Savitha Rao",
    isActive: true,
  },
  {
    id: WARD_VJN2_B,
    constituencyId: CON_VIJAYANAGAR,
    areaId: AREA_VJN_2ND_STAGE,
    name: "Vijayanagar 2nd Stage – Sector B",
    slug: "vijayanagar-2nd-stage-sector-b",
    wardNumber: 131,
    councillorName: "Sri. Manjunath P",
    isActive: true,
  },
  {
    id: WARD_VJN2_C,
    constituencyId: CON_VIJAYANAGAR,
    areaId: AREA_VJN_2ND_STAGE,
    name: "Vijayanagar 2nd Stage – Sector C",
    slug: "vijayanagar-2nd-stage-sector-c",
    wardNumber: 132,
    councillorName: "Smt. Anitha S",
    isActive: true,
  },

  // ── Nagarbhavi ────────────────────────────────────────────────────────────
  {
    id: WARD_NAG_A,
    constituencyId: CON_VIJAYANAGAR,
    areaId: AREA_NAGARBHAVI,
    name: "Nagarbhavi – Sector A",
    slug: "nagarbhavi-sector-a",
    wardNumber: 133,
    councillorName: "Sri. Suresh Gowda",
    isActive: true,
  },
  {
    id: WARD_NAG_B,
    constituencyId: CON_VIJAYANAGAR,
    areaId: AREA_NAGARBHAVI,
    name: "Nagarbhavi – Sector B",
    slug: "nagarbhavi-sector-b",
    wardNumber: 134,
    councillorName: "Smt. Kavitha N",
    isActive: true,
  },
  {
    id: WARD_NAG_C,
    constituencyId: CON_VIJAYANAGAR,
    areaId: AREA_NAGARBHAVI,
    name: "Nagarbhavi – Sector C",
    slug: "nagarbhavi-sector-c",
    wardNumber: 135,
    councillorName: "Sri. Prakash M",
    isActive: true,
  },

  // ── Basaveshwara Nagar ────────────────────────────────────────────────────
  {
    id: WARD_BAS_A,
    constituencyId: CON_VIJAYANAGAR,
    areaId: AREA_BASAVESHWARA_NGR,
    name: "Basaveshwara Nagar – Sector A",
    slug: "basaveshwara-nagar-sector-a",
    wardNumber: 136,
    councillorName: "Sri. Nagaraj T",
    isActive: true,
  },
  {
    id: WARD_BAS_B,
    constituencyId: CON_VIJAYANAGAR,
    areaId: AREA_BASAVESHWARA_NGR,
    name: "Basaveshwara Nagar – Sector B",
    slug: "basaveshwara-nagar-sector-b",
    wardNumber: 137,
    councillorName: "Smt. Roopa K",
    isActive: true,
  },
  {
    id: WARD_BAS_C,
    constituencyId: CON_VIJAYANAGAR,
    areaId: AREA_BASAVESHWARA_NGR,
    name: "Basaveshwara Nagar – Sector C",
    slug: "basaveshwara-nagar-sector-c",
    wardNumber: 138,
    councillorName: "Sri. Dinesh V",
    isActive: true,
  },

  // ── Govindarajnagar Main ──────────────────────────────────────────────────
  {
    id: WARD_GRN_A,
    constituencyId: CON_GOVINDARAJNAGAR,
    areaId: AREA_GRN_MAIN,
    name: "Govindarajnagar – Sector A",
    slug: "govindarajnagar-sector-a",
    wardNumber: 139,
    councillorName: "Smt. Shobha R",
    isActive: true,
  },
  {
    id: WARD_GRN_B,
    constituencyId: CON_GOVINDARAJNAGAR,
    areaId: AREA_GRN_MAIN,
    name: "Govindarajnagar – Sector B",
    slug: "govindarajnagar-sector-b",
    wardNumber: 140,
    councillorName: "Sri. Ravi Kumar H",
    isActive: true,
  },
  {
    id: WARD_GRN_C,
    constituencyId: CON_GOVINDARAJNAGAR,
    areaId: AREA_GRN_MAIN,
    name: "Govindarajnagar – Sector C",
    slug: "govindarajnagar-sector-c",
    wardNumber: 141,
    councillorName: "Smt. Meenakshi A",
    isActive: true,
  },

  // ── Chord Road ────────────────────────────────────────────────────────────
  {
    id: WARD_CHR_A,
    constituencyId: CON_GOVINDARAJNAGAR,
    areaId: AREA_CHORD_ROAD,
    name: "Chord Road – Sector A",
    slug: "chord-road-sector-a",
    wardNumber: 142,
    councillorName: "Sri. Harish B",
    isActive: true,
  },
  {
    id: WARD_CHR_B,
    constituencyId: CON_GOVINDARAJNAGAR,
    areaId: AREA_CHORD_ROAD,
    name: "Chord Road – Sector B",
    slug: "chord-road-sector-b",
    wardNumber: 143,
    councillorName: "Smt. Usha M",
    isActive: true,
  },
  {
    id: WARD_CHR_C,
    constituencyId: CON_GOVINDARAJNAGAR,
    areaId: AREA_CHORD_ROAD,
    name: "Chord Road – Sector C",
    slug: "chord-road-sector-c",
    wardNumber: 144,
    councillorName: "Sri. Suresh P",
    isActive: true,
  },

  // ── Rajajinagar Industrial Area ───────────────────────────────────────────
  {
    id: WARD_RAJ_A,
    constituencyId: CON_GOVINDARAJNAGAR,
    areaId: AREA_RAJAJINAGAR_IND,
    name: "Rajajinagar Industrial – Sector A",
    slug: "rajajinagar-industrial-sector-a",
    wardNumber: 145,
    councillorName: "Sri. Girish N",
    isActive: true,
  },
  {
    id: WARD_RAJ_B,
    constituencyId: CON_GOVINDARAJNAGAR,
    areaId: AREA_RAJAJINAGAR_IND,
    name: "Rajajinagar Industrial – Sector B",
    slug: "rajajinagar-industrial-sector-b",
    wardNumber: 146,
    councillorName: "Smt. Padmavathi C",
    isActive: true,
  },
  {
    id: WARD_RAJ_C,
    constituencyId: CON_GOVINDARAJNAGAR,
    areaId: AREA_RAJAJINAGAR_IND,
    name: "Rajajinagar Industrial – Sector C",
    slug: "rajajinagar-industrial-sector-c",
    wardNumber: 147,
    councillorName: "Sri. Basavaraj T",
    isActive: true,
  },

  // ── Kamakshipalya ─────────────────────────────────────────────────────────
  {
    id: WARD_KAM_A,
    constituencyId: CON_GOVINDARAJNAGAR,
    areaId: AREA_KAMAKSHIPALYA,
    name: "Kamakshipalya – Sector A",
    slug: "kamakshipalya-sector-a",
    wardNumber: 148,
    councillorName: "Smt. Geetha L",
    isActive: true,
  },
  {
    id: WARD_KAM_B,
    constituencyId: CON_GOVINDARAJNAGAR,
    areaId: AREA_KAMAKSHIPALYA,
    name: "Kamakshipalya – Sector B",
    slug: "kamakshipalya-sector-b",
    wardNumber: 149,
    councillorName: "Sri. Manjappa K",
    isActive: true,
  },
  {
    id: WARD_KAM_C,
    constituencyId: CON_GOVINDARAJNAGAR,
    areaId: AREA_KAMAKSHIPALYA,
    name: "Kamakshipalya – Sector C",
    slug: "kamakshipalya-sector-c",
    wardNumber: 150,
    councillorName: "Smt. Nirmala B",
    isActive: true,
  },
];
