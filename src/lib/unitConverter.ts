// ============================================================
// Unit Converter — pure functions, no side effects
// ============================================================

type Unit = string;

interface ConversionResult {
  value: number;
  unit: Unit;
}

// Conversion factors to a common base (grams for mass, ml for volume)
const MASS_TO_GRAMS: Record<string, number> = {
  g: 1,
  kg: 1000,
  mg: 0.001,
  lb: 453.592,
  oz: 28.3495,
};

const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  L: 1000,
  cl: 10,
  dl: 100,
  tsp: 4.92892,
  tbsp: 14.7868,
  'fl oz': 29.5735,
  cup: 236.588,
  pt: 473.176,
  qt: 946.353,
  gal: 3785.41,
};

function isMassUnit(unit: Unit): boolean {
  return unit in MASS_TO_GRAMS;
}

function isVolumeUnit(unit: Unit): boolean {
  return unit in VOLUME_TO_ML;
}

/**
 * Convert a quantity from one unit to another.
 * Returns null if units are incompatible (e.g., mass to volume).
 */
export function convert(value: number, from: Unit, to: Unit): number | null {
  if (from === to) return value;

  // Mass conversion
  if (isMassUnit(from) && isMassUnit(to)) {
    const inGrams = value * MASS_TO_GRAMS[from];
    return inGrams / MASS_TO_GRAMS[to];
  }

  // Volume conversion
  if (isVolumeUnit(from) && isVolumeUnit(to)) {
    const inMl = value * VOLUME_TO_ML[from];
    return inMl / VOLUME_TO_ML[to];
  }

  // Incompatible units
  return null;
}

/**
 * Normalize a quantity to a standard display unit.
 * Mass: converts to kg if >= 1000g, stays in g otherwise.
 * Volume: converts to L if >= 1000ml, stays in ml otherwise.
 */
export function normalize(value: number, unit: Unit): ConversionResult {
  if (isMassUnit(unit)) {
    const grams = value * MASS_TO_GRAMS[unit];
    if (grams >= 1000) {
      return { value: parseFloat((grams / 1000).toFixed(4)), unit: 'kg' };
    }
    return { value: parseFloat(grams.toFixed(4)), unit: 'g' };
  }

  if (isVolumeUnit(unit)) {
    const ml = value * VOLUME_TO_ML[unit];
    if (ml >= 1000) {
      return { value: parseFloat((ml / 1000).toFixed(4)), unit: 'L' };
    }
    return { value: parseFloat(ml.toFixed(4)), unit: 'ml' };
  }

  // Non-convertible units (units, pieces, etc.) - return as-is
  return { value, unit };
}

/** Format a unit quantity for display */
export function formatQuantity(value: number, unit: Unit): string {
  const { value: v, unit: u } = normalize(value, unit);
  const formatted = v % 1 === 0 ? v.toString() : v.toFixed(2);
  return `${formatted} ${u}`;
}

export const KNOWN_UNITS = [
  // Mass
  'g', 'kg', 'mg', 'lb', 'oz',
  // Volume
  'ml', 'L', 'cl', 'dl', 'tsp', 'tbsp', 'fl oz', 'cup', 'pt', 'qt', 'gal',
  // Count
  'units', 'pieces', 'portions', 'slices', 'bunches',
] as const;
