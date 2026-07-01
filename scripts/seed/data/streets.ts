/**
 * scripts/seed/data/streets.ts
 *
 * Seed data for the `streets` collection.
 * 3 streets per ward × 24 wards = 72 streets total.
 *
 * Street naming follows the pattern used in Bengaluru:
 *   "<Nth> Cross, <Area Name>"
 *   "<Main Road / Layout name>"
 *   "<Temple/Landmark Road>"
 */

import { CON_VIJAYANAGAR, CON_GOVINDARAJNAGAR } from "./constituencies";
import {
  AREA_VJN_1ST_STAGE, AREA_VJN_2ND_STAGE, AREA_NAGARBHAVI, AREA_BASAVESHWARA_NGR,
  AREA_GRN_MAIN, AREA_CHORD_ROAD, AREA_RAJAJINAGAR_IND, AREA_KAMAKSHIPALYA,
} from "./areas";
import {
  WARD_VJN1_A, WARD_VJN1_B, WARD_VJN1_C,
  WARD_VJN2_A, WARD_VJN2_B, WARD_VJN2_C,
  WARD_NAG_A,  WARD_NAG_B,  WARD_NAG_C,
  WARD_BAS_A,  WARD_BAS_B,  WARD_BAS_C,
  WARD_GRN_A,  WARD_GRN_B,  WARD_GRN_C,
  WARD_CHR_A,  WARD_CHR_B,  WARD_CHR_C,
  WARD_RAJ_A,  WARD_RAJ_B,  WARD_RAJ_C,
  WARD_KAM_A,  WARD_KAM_B,  WARD_KAM_C,
} from "./wards";

// ─── Helper ───────────────────────────────────────────────────────────────────

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function street(
  id: string,
  wardId: string,
  areaId: string,
  constituencyId: string,
  name: string,
) {
  return { id, wardId, areaId, constituencyId, name, slug: slug(name), isActive: true };
}

// ─── Streets ──────────────────────────────────────────────────────────────────

export const streets = [

  // ── WARD_VJN1_A ──────────────────────────────────────────────────────────
  street("str_vjn1a_1", WARD_VJN1_A, AREA_VJN_1ST_STAGE, CON_VIJAYANAGAR, "1st Main Road, Vijayanagar 1st Stage"),
  street("str_vjn1a_2", WARD_VJN1_A, AREA_VJN_1ST_STAGE, CON_VIJAYANAGAR, "2nd Cross, Vijayanagar 1st Stage"),
  street("str_vjn1a_3", WARD_VJN1_A, AREA_VJN_1ST_STAGE, CON_VIJAYANAGAR, "Ganesh Temple Road, Vijayanagar"),

  // ── WARD_VJN1_B ──────────────────────────────────────────────────────────
  street("str_vjn1b_1", WARD_VJN1_B, AREA_VJN_1ST_STAGE, CON_VIJAYANAGAR, "3rd Main Road, Vijayanagar 1st Stage"),
  street("str_vjn1b_2", WARD_VJN1_B, AREA_VJN_1ST_STAGE, CON_VIJAYANAGAR, "4th Cross, Vijayanagar 1st Stage"),
  street("str_vjn1b_3", WARD_VJN1_B, AREA_VJN_1ST_STAGE, CON_VIJAYANAGAR, "SBI Colony Main Road, Vijayanagar"),

  // ── WARD_VJN1_C ──────────────────────────────────────────────────────────
  street("str_vjn1c_1", WARD_VJN1_C, AREA_VJN_1ST_STAGE, CON_VIJAYANAGAR, "5th Main Road, Vijayanagar 1st Stage"),
  street("str_vjn1c_2", WARD_VJN1_C, AREA_VJN_1ST_STAGE, CON_VIJAYANAGAR, "6th Cross, Vijayanagar 1st Stage"),
  street("str_vjn1c_3", WARD_VJN1_C, AREA_VJN_1ST_STAGE, CON_VIJAYANAGAR, "Old Poor House Road, Vijayanagar"),

  // ── WARD_VJN2_A ──────────────────────────────────────────────────────────
  street("str_vjn2a_1", WARD_VJN2_A, AREA_VJN_2ND_STAGE, CON_VIJAYANAGAR, "1st Main Road, Vijayanagar 2nd Stage"),
  street("str_vjn2a_2", WARD_VJN2_A, AREA_VJN_2ND_STAGE, CON_VIJAYANAGAR, "2nd Cross, Vijayanagar 2nd Stage"),
  street("str_vjn2a_3", WARD_VJN2_A, AREA_VJN_2ND_STAGE, CON_VIJAYANAGAR, "Anjali Theatre Road, Vijayanagar"),

  // ── WARD_VJN2_B ──────────────────────────────────────────────────────────
  street("str_vjn2b_1", WARD_VJN2_B, AREA_VJN_2ND_STAGE, CON_VIJAYANAGAR, "3rd Main Road, Vijayanagar 2nd Stage"),
  street("str_vjn2b_2", WARD_VJN2_B, AREA_VJN_2ND_STAGE, CON_VIJAYANAGAR, "4th Cross, Vijayanagar 2nd Stage"),
  street("str_vjn2b_3", WARD_VJN2_B, AREA_VJN_2ND_STAGE, CON_VIJAYANAGAR, "Cauvery Theatre Road, Vijayanagar"),

  // ── WARD_VJN2_C ──────────────────────────────────────────────────────────
  street("str_vjn2c_1", WARD_VJN2_C, AREA_VJN_2ND_STAGE, CON_VIJAYANAGAR, "5th Main Road, Vijayanagar 2nd Stage"),
  street("str_vjn2c_2", WARD_VJN2_C, AREA_VJN_2ND_STAGE, CON_VIJAYANAGAR, "6th Cross, Vijayanagar 2nd Stage"),
  street("str_vjn2c_3", WARD_VJN2_C, AREA_VJN_2ND_STAGE, CON_VIJAYANAGAR, "Subramanyanagar Main Road"),

  // ── WARD_NAG_A ───────────────────────────────────────────────────────────
  street("str_naga_1", WARD_NAG_A, AREA_NAGARBHAVI, CON_VIJAYANAGAR, "Nagarbhavi Main Road"),
  street("str_naga_2", WARD_NAG_A, AREA_NAGARBHAVI, CON_VIJAYANAGAR, "1st Cross, Nagarbhavi"),
  street("str_naga_3", WARD_NAG_A, AREA_NAGARBHAVI, CON_VIJAYANAGAR, "BDA Layout 1st Block, Nagarbhavi"),

  // ── WARD_NAG_B ───────────────────────────────────────────────────────────
  street("str_nagb_1", WARD_NAG_B, AREA_NAGARBHAVI, CON_VIJAYANAGAR, "2nd Cross, Nagarbhavi"),
  street("str_nagb_2", WARD_NAG_B, AREA_NAGARBHAVI, CON_VIJAYANAGAR, "Nagarbhavi Circle Road"),
  street("str_nagb_3", WARD_NAG_B, AREA_NAGARBHAVI, CON_VIJAYANAGAR, "BDA Layout 2nd Block, Nagarbhavi"),

  // ── WARD_NAG_C ───────────────────────────────────────────────────────────
  street("str_nagc_1", WARD_NAG_C, AREA_NAGARBHAVI, CON_VIJAYANAGAR, "3rd Cross, Nagarbhavi"),
  street("str_nagc_2", WARD_NAG_C, AREA_NAGARBHAVI, CON_VIJAYANAGAR, "Nagarbhavi Extension Road"),
  street("str_nagc_3", WARD_NAG_C, AREA_NAGARBHAVI, CON_VIJAYANAGAR, "Ideal Homes Layout, Nagarbhavi"),

  // ── WARD_BAS_A ───────────────────────────────────────────────────────────
  street("str_basa_1", WARD_BAS_A, AREA_BASAVESHWARA_NGR, CON_VIJAYANAGAR, "1st Main Road, Basaveshwara Nagar"),
  street("str_basa_2", WARD_BAS_A, AREA_BASAVESHWARA_NGR, CON_VIJAYANAGAR, "Basaveshwara Circle Road"),
  street("str_basa_3", WARD_BAS_A, AREA_BASAVESHWARA_NGR, CON_VIJAYANAGAR, "2nd Cross, Basaveshwara Nagar"),

  // ── WARD_BAS_B ───────────────────────────────────────────────────────────
  street("str_basb_1", WARD_BAS_B, AREA_BASAVESHWARA_NGR, CON_VIJAYANAGAR, "3rd Main Road, Basaveshwara Nagar"),
  street("str_basb_2", WARD_BAS_B, AREA_BASAVESHWARA_NGR, CON_VIJAYANAGAR, "4th Cross, Basaveshwara Nagar"),
  street("str_basb_3", WARD_BAS_B, AREA_BASAVESHWARA_NGR, CON_VIJAYANAGAR, "PES College Road, Basaveshwara Nagar"),

  // ── WARD_BAS_C ───────────────────────────────────────────────────────────
  street("str_basc_1", WARD_BAS_C, AREA_BASAVESHWARA_NGR, CON_VIJAYANAGAR, "5th Main Road, Basaveshwara Nagar"),
  street("str_basc_2", WARD_BAS_C, AREA_BASAVESHWARA_NGR, CON_VIJAYANAGAR, "6th Cross, Basaveshwara Nagar"),
  street("str_basc_3", WARD_BAS_C, AREA_BASAVESHWARA_NGR, CON_VIJAYANAGAR, "ITI Layout Main Road, Basaveshwara Nagar"),

  // ── WARD_GRN_A ───────────────────────────────────────────────────────────
  street("str_grna_1", WARD_GRN_A, AREA_GRN_MAIN, CON_GOVINDARAJNAGAR, "Govindarajnagar Main Road"),
  street("str_grna_2", WARD_GRN_A, AREA_GRN_MAIN, CON_GOVINDARAJNAGAR, "1st Cross, Govindarajnagar"),
  street("str_grna_3", WARD_GRN_A, AREA_GRN_MAIN, CON_GOVINDARAJNAGAR, "Market Road, Govindarajnagar"),

  // ── WARD_GRN_B ───────────────────────────────────────────────────────────
  street("str_grnb_1", WARD_GRN_B, AREA_GRN_MAIN, CON_GOVINDARAJNAGAR, "2nd Main Road, Govindarajnagar"),
  street("str_grnb_2", WARD_GRN_B, AREA_GRN_MAIN, CON_GOVINDARAJNAGAR, "3rd Cross, Govindarajnagar"),
  street("str_grnb_3", WARD_GRN_B, AREA_GRN_MAIN, CON_GOVINDARAJNAGAR, "BTS Bus Depot Road, Govindarajnagar"),

  // ── WARD_GRN_C ───────────────────────────────────────────────────────────
  street("str_grnc_1", WARD_GRN_C, AREA_GRN_MAIN, CON_GOVINDARAJNAGAR, "4th Main Road, Govindarajnagar"),
  street("str_grnc_2", WARD_GRN_C, AREA_GRN_MAIN, CON_GOVINDARAJNAGAR, "5th Cross, Govindarajnagar"),
  street("str_grnc_3", WARD_GRN_C, AREA_GRN_MAIN, CON_GOVINDARAJNAGAR, "Temple Street, Govindarajnagar"),

  // ── WARD_CHR_A ───────────────────────────────────────────────────────────
  street("str_chra_1", WARD_CHR_A, AREA_CHORD_ROAD, CON_GOVINDARAJNAGAR, "Chord Road 1st Stage"),
  street("str_chra_2", WARD_CHR_A, AREA_CHORD_ROAD, CON_GOVINDARAJNAGAR, "1st Cross, Chord Road"),
  street("str_chra_3", WARD_CHR_A, AREA_CHORD_ROAD, CON_GOVINDARAJNAGAR, "Railway Parallel Road, Chord Road"),

  // ── WARD_CHR_B ───────────────────────────────────────────────────────────
  street("str_chrb_1", WARD_CHR_B, AREA_CHORD_ROAD, CON_GOVINDARAJNAGAR, "Chord Road 2nd Stage"),
  street("str_chrb_2", WARD_CHR_B, AREA_CHORD_ROAD, CON_GOVINDARAJNAGAR, "2nd Cross, Chord Road"),
  street("str_chrb_3", WARD_CHR_B, AREA_CHORD_ROAD, CON_GOVINDARAJNAGAR, "Mahalakshmi Layout Cross, Chord Road"),

  // ── WARD_CHR_C ───────────────────────────────────────────────────────────
  street("str_chrc_1", WARD_CHR_C, AREA_CHORD_ROAD, CON_GOVINDARAJNAGAR, "Chord Road 3rd Stage"),
  street("str_chrc_2", WARD_CHR_C, AREA_CHORD_ROAD, CON_GOVINDARAJNAGAR, "3rd Cross, Chord Road"),
  street("str_chrc_3", WARD_CHR_C, AREA_CHORD_ROAD, CON_GOVINDARAJNAGAR, "Peenya Industrial Road Connector"),

  // ── WARD_RAJ_A ───────────────────────────────────────────────────────────
  street("str_raja_1", WARD_RAJ_A, AREA_RAJAJINAGAR_IND, CON_GOVINDARAJNAGAR, "1st Block Industrial Area Road"),
  street("str_raja_2", WARD_RAJ_A, AREA_RAJAJINAGAR_IND, CON_GOVINDARAJNAGAR, "KIADB Industrial Layout 1st Cross"),
  street("str_raja_3", WARD_RAJ_A, AREA_RAJAJINAGAR_IND, CON_GOVINDARAJNAGAR, "Rajajinagar Pipeline Road"),

  // ── WARD_RAJ_B ───────────────────────────────────────────────────────────
  street("str_rajb_1", WARD_RAJ_B, AREA_RAJAJINAGAR_IND, CON_GOVINDARAJNAGAR, "2nd Block Industrial Area Road"),
  street("str_rajb_2", WARD_RAJ_B, AREA_RAJAJINAGAR_IND, CON_GOVINDARAJNAGAR, "KIADB Industrial Layout 2nd Cross"),
  street("str_rajb_3", WARD_RAJ_B, AREA_RAJAJINAGAR_IND, CON_GOVINDARAJNAGAR, "Rajajinagar 4th Block Main Road"),

  // ── WARD_RAJ_C ───────────────────────────────────────────────────────────
  street("str_rajc_1", WARD_RAJ_C, AREA_RAJAJINAGAR_IND, CON_GOVINDARAJNAGAR, "3rd Block Industrial Area Road"),
  street("str_rajc_2", WARD_RAJ_C, AREA_RAJAJINAGAR_IND, CON_GOVINDARAJNAGAR, "KIADB Industrial Layout 3rd Cross"),
  street("str_rajc_3", WARD_RAJ_C, AREA_RAJAJINAGAR_IND, CON_GOVINDARAJNAGAR, "Rajajinagar 5th Block Main Road"),

  // ── WARD_KAM_A ───────────────────────────────────────────────────────────
  street("str_kama_1", WARD_KAM_A, AREA_KAMAKSHIPALYA, CON_GOVINDARAJNAGAR, "Kamakshipalya Main Road"),
  street("str_kama_2", WARD_KAM_A, AREA_KAMAKSHIPALYA, CON_GOVINDARAJNAGAR, "1st Cross, Kamakshipalya"),
  street("str_kama_3", WARD_KAM_A, AREA_KAMAKSHIPALYA, CON_GOVINDARAJNAGAR, "Kamakshipalya Circle Road"),

  // ── WARD_KAM_B ───────────────────────────────────────────────────────────
  street("str_kamb_1", WARD_KAM_B, AREA_KAMAKSHIPALYA, CON_GOVINDARAJNAGAR, "2nd Main Road, Kamakshipalya"),
  street("str_kamb_2", WARD_KAM_B, AREA_KAMAKSHIPALYA, CON_GOVINDARAJNAGAR, "2nd Cross, Kamakshipalya"),
  street("str_kamb_3", WARD_KAM_B, AREA_KAMAKSHIPALYA, CON_GOVINDARAJNAGAR, "Kamakshipalya Market Road"),

  // ── WARD_KAM_C ───────────────────────────────────────────────────────────
  street("str_kamc_1", WARD_KAM_C, AREA_KAMAKSHIPALYA, CON_GOVINDARAJNAGAR, "3rd Main Road, Kamakshipalya"),
  street("str_kamc_2", WARD_KAM_C, AREA_KAMAKSHIPALYA, CON_GOVINDARAJNAGAR, "3rd Cross, Kamakshipalya"),
  street("str_kamc_3", WARD_KAM_C, AREA_KAMAKSHIPALYA, CON_GOVINDARAJNAGAR, "Kamakshipalya Temple Street"),
];
