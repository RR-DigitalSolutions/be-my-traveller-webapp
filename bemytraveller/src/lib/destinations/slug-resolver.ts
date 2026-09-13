// ============================================================
// Destination Slug & SEO Canonical URL Resolver
// Supports MakeMyTrip/Veena World hierarchical travel URLs:
// - Country: /destination/india-tour-packages
// - State:   /destination/india/himachal-tour-packages
// - Place:   /destination/india/himachal/manali-tour-packages
// ============================================================

export interface ParsedDestinationSlug {
  rawSegments: string[];
  countrySlug: string;
  stateSlug?: string;
  placeSlug: string;
  level: "COUNTRY" | "STATE" | "CITY" | "ISLAND";
  canonicalUrl: string;
  cleanTargetSlug: string;
}

/**
 * Strips common package suffixes like "-tour-packages", "-packages", "-tours", "-holidays"
 */
export function stripPackageSuffix(slug: string): string {
  if (!slug) return "";
  return slug
    .toLowerCase()
    .trim()
    .replace(/-tour-packages$/, "")
    .replace(/-tour-package$/, "")
    .replace(/-packages$/, "")
    .replace(/-package$/, "")
    .replace(/-tours$/, "")
    .replace(/-tour$/, "")
    .replace(/-holidays$/, "")
    .replace(/-holiday$/, "");
}

/**
 * Normalizes state or place slug to SEO friendly package slug
 */
export function formatPackageSlug(slug: string): string {
  const clean = stripPackageSuffix(slug);
  return `${clean}-tour-packages`;
}

/**
 * Builds canonical SEO URL for any level of the destination hierarchy
 */
export function buildDestinationUrl(options: {
  country?: string;
  state?: string;
  place?: string;
}): string {
  const country = (options.country || "india").toLowerCase().replace(/[^a-z0-9-]/g, "-");

  // Level 3: Place under State
  if (options.place && options.state) {
    const stateClean = stripPackageSuffix(options.state);
    const placeClean = stripPackageSuffix(options.place);
    return `/destination/${country}/${stateClean}/${placeClean}-tour-packages`;
  }

  // Level 2: State under Country
  if (options.state) {
    const stateClean = stripPackageSuffix(options.state);
    return `/destination/${country}/${stateClean}-tour-packages`;
  }

  // Level 1: Country
  const cleanCountry = stripPackageSuffix(country);
  return `/destination/${cleanCountry}-tour-packages`;
}

/**
 * Known Indian States and their canonical state slug
 */
export const STATE_SLUG_MAP: Record<string, string> = {
  "himachal-pradesh": "himachal",
  "himachal": "himachal",
  "kashmir": "kashmir",
  "jammu-and-kashmir": "kashmir",
  "jammu-kashmir": "kashmir",
  "kerala": "kerala",
  "rajasthan": "rajasthan",
  "goa": "goa",
  "uttarakhand": "uttarakhand",
  "andaman": "andaman",
  "andaman-nicobar": "andaman",
  "andaman-and-nicobar": "andaman",
  "ladakh": "ladakh",
  "sikkim": "sikkim",
  "tamil-nadu": "tamil-nadu",
  "karnataka": "karnataka",
  "maharashtra": "maharashtra",
  "gujarat": "gujarat",
  "madhya-pradesh": "madhya-pradesh",
  "meghalaya": "meghalaya",
  "assam": "assam",
  "arunachal-pradesh": "arunachal",
  "arunachal": "arunachal",
  "west-bengal": "west-bengal",
  "odisha": "odisha",
  "lakshadweep": "lakshadweep",
  "puducherry": "puducherry",
};

/**
 * Mapping of famous places to their parent state
 */
export const PLACE_TO_STATE_MAP: Record<string, { stateSlug: string; stateName: string }> = {
  // Himachal Pradesh
  manali: { stateSlug: "himachal", stateName: "Himachal Pradesh" },
  shimla: { stateSlug: "himachal", stateName: "Himachal Pradesh" },
  dharamshala: { stateSlug: "himachal", stateName: "Himachal Pradesh" },
  spiti: { stateSlug: "himachal", stateName: "Himachal Pradesh" },
  "spiti-valley": { stateSlug: "himachal", stateName: "Himachal Pradesh" },
  kasol: { stateSlug: "himachal", stateName: "Himachal Pradesh" },
  dalhousie: { stateSlug: "himachal", stateName: "Himachal Pradesh" },
  kullu: { stateSlug: "himachal", stateName: "Himachal Pradesh" },
  bir: { stateSlug: "himachal", stateName: "Himachal Pradesh" },
  "bir-billing": { stateSlug: "himachal", stateName: "Himachal Pradesh" },
  jibhi: { stateSlug: "himachal", stateName: "Himachal Pradesh" },

  // Kashmir
  srinagar: { stateSlug: "kashmir", stateName: "Jammu & Kashmir" },
  gulmarg: { stateSlug: "kashmir", stateName: "Jammu & Kashmir" },
  pahalgam: { stateSlug: "kashmir", stateName: "Jammu & Kashmir" },
  sonamarg: { stateSlug: "kashmir", stateName: "Jammu & Kashmir" },

  // Kerala
  munnar: { stateSlug: "kerala", stateName: "Kerala" },
  alleppey: { stateSlug: "kerala", stateName: "Kerala" },
  alappuzha: { stateSlug: "kerala", stateName: "Kerala" },
  thekkady: { stateSlug: "kerala", stateName: "Kerala" },
  kovalam: { stateSlug: "kerala", stateName: "Kerala" },
  wayanad: { stateSlug: "kerala", stateName: "Kerala" },
  varkala: { stateSlug: "kerala", stateName: "Kerala" },
  kochi: { stateSlug: "kerala", stateName: "Kerala" },
  kumarakom: { stateSlug: "kerala", stateName: "Kerala" },

  // Rajasthan
  jaipur: { stateSlug: "rajasthan", stateName: "Rajasthan" },
  udaipur: { stateSlug: "rajasthan", stateName: "Rajasthan" },
  jaisalmer: { stateSlug: "rajasthan", stateName: "Rajasthan" },
  jodhpur: { stateSlug: "rajasthan", stateName: "Rajasthan" },
  pushkar: { stateSlug: "rajasthan", stateName: "Rajasthan" },
  ranthambore: { stateSlug: "rajasthan", stateName: "Rajasthan" },
  bikaner: { stateSlug: "rajasthan", stateName: "Rajasthan" },
  "mount-abu": { stateSlug: "rajasthan", stateName: "Rajasthan" },

  // Uttarakhand
  rishikesh: { stateSlug: "uttarakhand", stateName: "Uttarakhand" },
  nainital: { stateSlug: "uttarakhand", stateName: "Uttarakhand" },
  mussoorie: { stateSlug: "uttarakhand", stateName: "Uttarakhand" },
  haridwar: { stateSlug: "uttarakhand", stateName: "Uttarakhand" },
  jimcorbett: { stateSlug: "uttarakhand", stateName: "Uttarakhand" },
  "jim-corbett": { stateSlug: "uttarakhand", stateName: "Uttarakhand" },
  kedarnath: { stateSlug: "uttarakhand", stateName: "Uttarakhand" },
  badrinath: { stateSlug: "uttarakhand", stateName: "Uttarakhand" },
  auli: { stateSlug: "uttarakhand", stateName: "Uttarakhand" },

  // Goa
  "north-goa": { stateSlug: "goa", stateName: "Goa" },
  "south-goa": { stateSlug: "goa", stateName: "Goa" },
  calangute: { stateSlug: "goa", stateName: "Goa" },
  baga: { stateSlug: "goa", stateName: "Goa" },
  panaji: { stateSlug: "goa", stateName: "Goa" },

  // Andaman
  havelock: { stateSlug: "andaman", stateName: "Andaman & Nicobar" },
  "neil-island": { stateSlug: "andaman", stateName: "Andaman & Nicobar" },
  neil: { stateSlug: "andaman", stateName: "Andaman & Nicobar" },
  "port-blair": { stateSlug: "andaman", stateName: "Andaman & Nicobar" },

  // Ladakh
  leh: { stateSlug: "ladakh", stateName: "Ladakh" },
  nubra: { stateSlug: "ladakh", stateName: "Ladakh" },
  "nubra-valley": { stateSlug: "ladakh", stateName: "Ladakh" },
  pangong: { stateSlug: "ladakh", stateName: "Ladakh" },

  // Tamil Nadu
  ooty: { stateSlug: "tamil-nadu", stateName: "Tamil Nadu" },
  kodaikanal: { stateSlug: "tamil-nadu", stateName: "Tamil Nadu" },
  rameshwaram: { stateSlug: "tamil-nadu", stateName: "Tamil Nadu" },
  madurai: { stateSlug: "tamil-nadu", stateName: "Tamil Nadu" },

  // Karnataka
  coorg: { stateSlug: "karnataka", stateName: "Karnataka" },
  mysore: { stateSlug: "karnataka", stateName: "Karnataka" },
  hampi: { stateSlug: "karnataka", stateName: "Karnataka" },
  chikmagalur: { stateSlug: "karnataka", stateName: "Karnataka" },
  gokarna: { stateSlug: "karnataka", stateName: "Karnataka" },

  // Maharashtra
  lonavala: { stateSlug: "maharashtra", stateName: "Maharashtra" },
  mahabaleshwar: { stateSlug: "maharashtra", stateName: "Maharashtra" },
  alibaug: { stateSlug: "maharashtra", stateName: "Maharashtra" },
  shirdi: { stateSlug: "maharashtra", stateName: "Maharashtra" },

  // Sikkim & North East
  gangtok: { stateSlug: "sikkim", stateName: "Sikkim" },
  darjeeling: { stateSlug: "west-bengal", stateName: "West Bengal" },
  pelling: { stateSlug: "sikkim", stateName: "Sikkim" },
  lachung: { stateSlug: "sikkim", stateName: "Sikkim" },
  shillong: { stateSlug: "meghalaya", stateName: "Meghalaya" },
  cherrapunji: { stateSlug: "meghalaya", stateName: "Meghalaya" },
  kaziranga: { stateSlug: "assam", stateName: "Assam" },
  tawang: { stateSlug: "arunachal", stateName: "Arunachal Pradesh" },
  puri: { stateSlug: "odisha", stateName: "Odisha" },
};

/**
 * Parses any incoming slug segments into a rich hierarchical structure
 */
export function parseDestinationSlug(segments: string[]): ParsedDestinationSlug {
  if (!segments || segments.length === 0) {
    return {
      rawSegments: [],
      countrySlug: "india",
      placeSlug: "india",
      level: "COUNTRY",
      canonicalUrl: "/destination/india-tour-packages",
      cleanTargetSlug: "india",
    };
  }

  // Case 1: 1 segment e.g. ["india-tour-packages"] or ["himachal-tour-packages"] or ["manali"]
  if (segments.length === 1) {
    const single = stripPackageSuffix(segments[0]);

    if (single === "india" || single === "all-india" || single === "world" || single === "international") {
      return {
        rawSegments: segments,
        countrySlug: single,
        placeSlug: single,
        level: "COUNTRY",
        canonicalUrl: `/destination/${single}-tour-packages`,
        cleanTargetSlug: single,
      };
    }

    // Check if it's a known state
    if (STATE_SLUG_MAP[single]) {
      const state = STATE_SLUG_MAP[single];
      return {
        rawSegments: segments,
        countrySlug: "india",
        stateSlug: state,
        placeSlug: state,
        level: "STATE",
        canonicalUrl: `/destination/india/${state}-tour-packages`,
        cleanTargetSlug: state,
      };
    }

    // Check if it's a known city/place
    if (PLACE_TO_STATE_MAP[single]) {
      const { stateSlug } = PLACE_TO_STATE_MAP[single];
      return {
        rawSegments: segments,
        countrySlug: "india",
        stateSlug,
        placeSlug: single,
        level: "CITY",
        canonicalUrl: `/destination/india/${stateSlug}/${single}-tour-packages`,
        cleanTargetSlug: single,
      };
    }

    // Default 1-segment international or standalone place
    return {
      rawSegments: segments,
      countrySlug: "india",
      placeSlug: single,
      level: "STATE",
      canonicalUrl: `/destination/india/${single}-tour-packages`,
      cleanTargetSlug: single,
    };
  }

  // Case 2: 2 segments e.g. ["india", "himachal-tour-packages"] or ["india", "manali-tour-packages"]
  if (segments.length === 2) {
    const country = stripPackageSuffix(segments[0]);
    const second = stripPackageSuffix(segments[1]);

    if (STATE_SLUG_MAP[second]) {
      const state = STATE_SLUG_MAP[second];
      return {
        rawSegments: segments,
        countrySlug: country,
        stateSlug: state,
        placeSlug: state,
        level: "STATE",
        canonicalUrl: `/destination/${country}/${state}-tour-packages`,
        cleanTargetSlug: state,
      };
    }

    if (PLACE_TO_STATE_MAP[second]) {
      const { stateSlug } = PLACE_TO_STATE_MAP[second];
      return {
        rawSegments: segments,
        countrySlug: country,
        stateSlug,
        placeSlug: second,
        level: "CITY",
        canonicalUrl: `/destination/${country}/${stateSlug}/${second}-tour-packages`,
        cleanTargetSlug: second,
      };
    }

    return {
      rawSegments: segments,
      countrySlug: country,
      stateSlug: second,
      placeSlug: second,
      level: "STATE",
      canonicalUrl: `/destination/${country}/${second}-tour-packages`,
      cleanTargetSlug: second,
    };
  }

  // Case 3: 3 segments e.g. ["india", "himachal", "manali-tour-packages"]
  const country = stripPackageSuffix(segments[0]);
  const state = stripPackageSuffix(segments[1]);
  const place = stripPackageSuffix(segments[2]);

  return {
    rawSegments: segments,
    countrySlug: country,
    stateSlug: state,
    placeSlug: place,
    level: "CITY",
    canonicalUrl: `/destination/${country}/${state}/${place}-tour-packages`,
    cleanTargetSlug: place,
  };
}
