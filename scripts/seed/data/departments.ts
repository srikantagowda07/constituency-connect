/**
 * scripts/seed/data/departments.ts
 *
 * Seed data for the `departments` collection.
 * 6 departments, each mapped to one or more complaint categories.
 *
 * Departments:
 *   1. BBMP           → Road, Garbage, Other
 *   2. BESCOM         → Electricity
 *   3. BWSSB          → Water
 *   4. Police         → Crime
 *   5. Health Dept    → Health
 *   6. Education Dept → Education
 *
 * Department–Category mapping drives automatic department resolution
 * when a citizen files a complaint with a given category.
 */

import { ORG_ID } from "./organization";
import {
  CAT_ROAD,
  CAT_GARBAGE,
  CAT_WATER,
  CAT_ELECTRICITY,
  CAT_HEALTH,
  CAT_EDUCATION,
  CAT_CRIME,
  CAT_OTHER,
} from "./categories";

export const DEPT_BBMP       = "dept_bbmp";
export const DEPT_BESCOM     = "dept_bescom";
export const DEPT_BWSSB      = "dept_bwssb";
export const DEPT_POLICE     = "dept_police";
export const DEPT_HEALTH     = "dept_health";
export const DEPT_EDUCATION  = "dept_education";

export const departments = [
  {
    id: DEPT_BBMP,
    organizationId: ORG_ID,
    name: "Bruhat Bengaluru Mahanagara Palike (BBMP)",
    slug: "bbmp",
    code: "BBMP",
    categoryIds: [CAT_ROAD, CAT_GARBAGE, CAT_OTHER],
    contactEmail: "commissioner@bbmp.gov.in",
    contactPhone: "+918022660000",
    displayOrder: 1,
    isActive: true,
  },
  {
    id: DEPT_BESCOM,
    organizationId: ORG_ID,
    name: "Bangalore Electricity Supply Company (BESCOM)",
    slug: "bescom",
    code: "BESCOM",
    categoryIds: [CAT_ELECTRICITY],
    contactEmail: "cgm@bescom.co.in",
    contactPhone: "+918022221111",
    displayOrder: 2,
    isActive: true,
  },
  {
    id: DEPT_BWSSB,
    organizationId: ORG_ID,
    name: "Bangalore Water Supply and Sewerage Board (BWSSB)",
    slug: "bwssb",
    code: "BWSSB",
    categoryIds: [CAT_WATER],
    contactEmail: "chairman@bwssb.gov.in",
    contactPhone: "+918066647799",
    displayOrder: 3,
    isActive: true,
  },
  {
    id: DEPT_POLICE,
    organizationId: ORG_ID,
    name: "Bengaluru City Police",
    slug: "bengaluru-city-police",
    code: "BCP",
    categoryIds: [CAT_CRIME],
    contactEmail: "cp.bengaluru@ksp.gov.in",
    contactPhone: "100",
    displayOrder: 4,
    isActive: true,
  },
  {
    id: DEPT_HEALTH,
    organizationId: ORG_ID,
    name: "Karnataka Health Department",
    slug: "karnataka-health-department",
    code: "KHD",
    categoryIds: [CAT_HEALTH],
    contactEmail: "hfw@karnataka.gov.in",
    contactPhone: "104",
    displayOrder: 5,
    isActive: true,
  },
  {
    id: DEPT_EDUCATION,
    organizationId: ORG_ID,
    name: "Karnataka Education Department",
    slug: "karnataka-education-department",
    code: "KED",
    categoryIds: [CAT_EDUCATION],
    contactEmail: "pue@karnataka.gov.in",
    contactPhone: "+918022253944",
    displayOrder: 6,
    isActive: true,
  },
];
