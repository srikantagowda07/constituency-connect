/**
 * types/db/master.ts
 *
 * TypeScript interfaces for the seven master (configuration) collections.
 * These collections are the source of truth for all ID-based references
 * used across admin, citizen, and complaint collections.
 *
 * ─── Collection hierarchy ────────────────────────────────────────────────────
 *
 *  organizations          (top level — e.g. "State Legislature of Karnataka")
 *    └─ constituencies    (belongs to one organization — e.g. "Rajarajeshwari Nagar")
 *         └─ areas        (belongs to one constituency — e.g. "Kengeri")
 *              └─ wards   (belongs to one constituency — e.g. "Ward 142")
 *                   └─ streets  (belongs to one ward — e.g. "15th Cross")
 *
 *  categories             (complaint category master — e.g. "Road & Infrastructure")
 *  departments            (government department master — e.g. "BBMP Roads Division")
 *
 * ─── Firestore optimization notes ───────────────────────────────────────────
 *  - All location documents carry a `slug` field (URL-safe lowercase) for
 *    human-readable identifiers without query dependency on `name`.
 *  - `isActive` flag allows soft-disabling entries without breaking existing
 *    foreign-key references (complaints already filed keep their IDs valid).
 *  - `displayOrder` on categories and departments drives dashboard sort order.
 *  - No nested subcollections are used here; flat collections with foreign keys
 *    are simpler to query and easier to paginate in Firestore.
 */

import type { Timestamp } from "firebase/firestore";

// ─── Shared base ─────────────────────────────────────────────────────────────

/**
 * Every document in a master collection extends DbDocument.
 * `id` is the Firestore document ID (set explicitly, not auto-generated,
 *  so it can be a meaningful short code like "org_ka_001").
 */
export interface DbDocument {
  /** Firestore document ID — always stored redundantly inside the document. */
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── organizations ────────────────────────────────────────────────────────────
/**
 * Collection: organizations
 *
 * Top-level tenant. In the MVP this will be a single record representing
 * the state legislature or municipal body that owns the deployment.
 * Modelled as a collection (not a single config document) so the schema
 * supports multi-organisation deployments in the future.
 *
 * References: none
 * Referenced by: constituencies.organizationId
 */
export interface Organization extends DbDocument {
  /** Full legal name. e.g. "Karnataka Legislative Assembly" */
  name: string;
  /** URL-safe identifier. e.g. "karnataka-legislative-assembly" */
  slug: string;
  /** Short display code. e.g. "KLA" */
  code: string;
  /** State or region this organisation covers. */
  state: string;
  /** Country ISO-3166 alpha-2. e.g. "IN" */
  country: string;
  /** Primary contact email for the organisation admin. */
  contactEmail: string;
  /** Logo URL (Firebase Storage path or absolute URL). */
  logoUrl: string | null;
  isActive: boolean;
}

// ─── constituencies ───────────────────────────────────────────────────────────
/**
 * Collection: constituencies
 *
 * An electoral constituency managed by one organisation.
 * e.g. "Rajarajeshwari Nagar (AC 157)"
 *
 * References: organizationId → organizations
 * Referenced by: areas, complaints, admins, volunteers, citizens
 */
export interface Constituency extends DbDocument {
  organizationId: string;
  /** Full official name. e.g. "Rajarajeshwari Nagar" */
  name: string;
  slug: string;
  /** Official assembly/council code. e.g. "AC-157" */
  code: string;
  /** MLA / councillor name currently serving this constituency. */
  representativeName: string;
  /** Representative's contact phone (WhatsApp-enabled). */
  representativePhone: string | null;
  /** Geo centroid for map display. */
  geoCenter: GeoPoint | null;
  isActive: boolean;
}

// ─── areas ────────────────────────────────────────────────────────────────────
/**
 * Collection: areas
 *
 * A named locality or neighbourhood within a constituency.
 * e.g. "Kengeri", "Ullalu"
 *
 * References: constituencyId → constituencies
 * Referenced by: wards, complaints
 */
export interface Area extends DbDocument {
  constituencyId: string;
  name: string;
  slug: string;
  /** Postal PIN codes that fall within this area. */
  pinCodes: string[];
  isActive: boolean;
}

// ─── wards ────────────────────────────────────────────────────────────────────
/**
 * Collection: wards
 *
 * A municipal ward inside an area.
 * e.g. "Ward 142 – Ullalu"
 *
 * References: constituencyId → constituencies, areaId → areas
 * Referenced by: streets, complaints, volunteers
 *
 * Note: wardId is stored on complaints for precise assignment routing.
 * Both constituencyId and areaId are stored (denormalized) on the ward to
 * avoid chained lookups when querying "all wards in a constituency".
 */
export interface Ward extends DbDocument {
  constituencyId: string;
  areaId: string;
  name: string;
  slug: string;
  /** Official ward number. e.g. 142 */
  wardNumber: number;
  /** Councillor name for this ward (may differ from constituency MLA). */
  councillorName: string | null;
  isActive: boolean;
}

// ─── streets ─────────────────────────────────────────────────────────────────
/**
 * Collection: streets
 *
 * A named street within a ward.
 * e.g. "15th Cross, Kengeri Satellite Town"
 *
 * References: wardId → wards, areaId → areas (denormalized), constituencyId (denormalized)
 * Referenced by: complaints
 *
 * Denormalization: areaId and constituencyId are stored directly on the street
 * so that a complaint can be filtered by constituency without joining through
 * ward → area → constituency.
 */
export interface Street extends DbDocument {
  wardId: string;
  areaId: string;
  constituencyId: string;
  name: string;
  slug: string;
  isActive: boolean;
}

// ─── categories ───────────────────────────────────────────────────────────────
/**
 * Collection: categories
 *
 * Complaint category master.
 * e.g. "Road & Infrastructure", "Water Supply", "Electricity"
 *
 * References: none (global master)
 * Referenced by: complaints.categoryId, departments.categoryIds
 *
 * Firestore optimization: kept as a flat global collection (not per-constituency)
 * because categories are the same across all constituencies. A single read at
 * app start populates the in-memory lookup map.
 */
export interface Category extends DbDocument {
  /** Human-readable name. e.g. "Road & Infrastructure" */
  name: string;
  slug: string;
  /** Short code used in WhatsApp reply menus. e.g. "ROAD" */
  code: string;
  /** lucide-react icon name or emoji fallback. e.g. "construction" */
  icon: string;
  /** Tailwind color token for badge rendering. e.g. "amber" */
  color: string;
  /** Default SLA in hours for this category. e.g. 72 */
  defaultSlaHours: number;
  displayOrder: number;
  isActive: boolean;
}

// ─── departments ──────────────────────────────────────────────────────────────
/**
 * Collection: departments
 *
 * Government department that handles complaints.
 * e.g. "BBMP Roads Division", "BESCOM"
 *
 * References: organizationId → organizations, categoryIds[] → categories
 * Referenced by: complaints.departmentId
 *
 * categoryIds is an array of category IDs that this department handles.
 * On complaint creation the backend resolves departmentId from
 * categoryId using this array.
 */
export interface Department extends DbDocument {
  organizationId: string;
  /** Full department name. e.g. "Bruhat Bengaluru Mahanagara Palike – Roads" */
  name: string;
  slug: string;
  /** Short code. e.g. "BBMP-ROADS" */
  code: string;
  /** Categories this department is responsible for. */
  categoryIds: string[];
  /** Primary contact for escalations. */
  contactEmail: string | null;
  contactPhone: string | null;
  displayOrder: number;
  isActive: boolean;
}

// ─── Shared geo type ──────────────────────────────────────────────────────────

/**
 * Lightweight GeoPoint for master collection geo-centres.
 * (Distinct from Firestore's native GeoPoint to keep types serialisable
 * for JSON API responses and avoid firebase/firestore import in pure type files.)
 */
export interface GeoPoint {
  latitude: number;
  longitude: number;
}
