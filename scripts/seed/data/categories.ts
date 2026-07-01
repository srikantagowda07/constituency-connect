/**
 * scripts/seed/data/categories.ts
 *
 * Seed data for the `categories` collection.
 * 8 complaint categories — global, not per-constituency.
 *
 * Categories:
 *   1. Road
 *   2. Garbage
 *   3. Water
 *   4. Electricity
 *   5. Health
 *   6. Education
 *   7. Crime
 *   8. Other
 *
 * IDs are exported so departments can reference them in categoryIds[].
 */

export const CAT_ROAD        = "cat_road";
export const CAT_GARBAGE     = "cat_garbage";
export const CAT_WATER       = "cat_water";
export const CAT_ELECTRICITY = "cat_electricity";
export const CAT_HEALTH      = "cat_health";
export const CAT_EDUCATION   = "cat_education";
export const CAT_CRIME       = "cat_crime";
export const CAT_OTHER       = "cat_other";

export const categories = [
  {
    id: CAT_ROAD,
    name: "Road",
    slug: "road",
    code: "ROAD",
    icon: "construction",
    color: "amber",
    defaultSlaHours: 72,
    displayOrder: 1,
    isActive: true,
  },
  {
    id: CAT_GARBAGE,
    name: "Garbage",
    slug: "garbage",
    code: "GARB",
    icon: "trash-2",
    color: "green",
    defaultSlaHours: 24,
    displayOrder: 2,
    isActive: true,
  },
  {
    id: CAT_WATER,
    name: "Water",
    slug: "water",
    code: "WATR",
    icon: "droplets",
    color: "blue",
    defaultSlaHours: 48,
    displayOrder: 3,
    isActive: true,
  },
  {
    id: CAT_ELECTRICITY,
    name: "Electricity",
    slug: "electricity",
    code: "ELEC",
    icon: "zap",
    color: "yellow",
    defaultSlaHours: 24,
    displayOrder: 4,
    isActive: true,
  },
  {
    id: CAT_HEALTH,
    name: "Health",
    slug: "health",
    code: "HLTH",
    icon: "heart-pulse",
    color: "red",
    defaultSlaHours: 12,
    displayOrder: 5,
    isActive: true,
  },
  {
    id: CAT_EDUCATION,
    name: "Education",
    slug: "education",
    code: "EDUC",
    icon: "graduation-cap",
    color: "purple",
    defaultSlaHours: 120,
    displayOrder: 6,
    isActive: true,
  },
  {
    id: CAT_CRIME,
    name: "Crime",
    slug: "crime",
    code: "CRIM",
    icon: "shield-alert",
    color: "rose",
    defaultSlaHours: 6,
    displayOrder: 7,
    isActive: true,
  },
  {
    id: CAT_OTHER,
    name: "Other",
    slug: "other",
    code: "OTHR",
    icon: "circle-help",
    color: "zinc",
    defaultSlaHours: 96,
    displayOrder: 8,
    isActive: true,
  },
];
