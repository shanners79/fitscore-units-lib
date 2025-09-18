/**
 * Unit conversion system for FitScore Pro
 *
 * Base units:
 * - Mass: kg
 * - Distance: m
 * - Time: s
 * - Speed: m/s
 *
 * All database values stored in base units.
 * Display values converted on-demand from base + org preferences.
 */

export type BaseUnit = 'kg' | 'm' | 's' | 'm/s';
export type DisplayUnit = 'kg' | 'lb' | 'm' | 'cm' | 'in' | 'ft' | 's' | 'min' | 'm/s' | 'km/h' | 'mph';

export interface UnitPreferences {
  mass: 'kg' | 'lb';
  distance: 'm' | 'cm' | 'in' | 'ft';
  time: 's' | 'min';
  speed: 'm/s' | 'km/h' | 'mph';
}

export const DEFAULT_PREFERENCES: UnitPreferences = {
  mass: 'kg',
  distance: 'm',
  time: 's',
  speed: 'm/s'
};

/**
 * Conversion factors to base units
 */
const TO_BASE_FACTORS: Record<DisplayUnit, { factor: number; base: BaseUnit }> = {
  // Mass (base: kg)
  kg: { factor: 1, base: 'kg' },
  lb: { factor: 0.45359237, base: 'kg' },

  // Distance (base: m)
  m: { factor: 1, base: 'm' },
  cm: { factor: 0.01, base: 'm' },
  in: { factor: 0.0254, base: 'm' },
  ft: { factor: 0.3048, base: 'm' },

  // Time (base: s)
  s: { factor: 1, base: 's' },
  min: { factor: 60, base: 's' },

  // Speed (base: m/s)
  'm/s': { factor: 1, base: 'm/s' },
  'km/h': { factor: 1/3.6, base: 'm/s' }, // Exact: 1 km/h = 1/3.6 m/s
  mph: { factor: 0.44704, base: 'm/s' }
};

/**
 * Convert display value to base unit value
 */
export function toBase(value: number, displayUnit: DisplayUnit): number {
  const conversion = TO_BASE_FACTORS[displayUnit];
  if (!conversion) {
    throw new Error(`Unknown display unit: ${displayUnit}`);
  }
  return value * conversion.factor;
}

/**
 * Convert base unit value to display unit value
 */
export function fromBase(baseValue: number, displayUnit: DisplayUnit): number {
  const conversion = TO_BASE_FACTORS[displayUnit];
  if (!conversion) {
    throw new Error(`Unknown display unit: ${displayUnit}`);
  }
  return baseValue / conversion.factor;
}

/**
 * Get the base unit for a display unit
 */
export function getBaseUnit(displayUnit: DisplayUnit): BaseUnit {
  const conversion = TO_BASE_FACTORS[displayUnit];
  if (!conversion) {
    throw new Error(`Unknown display unit: ${displayUnit}`);
  }
  return conversion.base;
}

/**
 * Get display unit for a metric based on preferences
 */
export function getDisplayUnit(metricType: keyof UnitPreferences, preferences: UnitPreferences): DisplayUnit {
  return preferences[metricType];
}

/**
 * Format a base value for display with appropriate precision
 */
export function formatValue(baseValue: number, displayUnit: DisplayUnit, precision = 2): string {
  const displayValue = fromBase(baseValue, displayUnit);
  return `${displayValue.toFixed(precision)} ${displayUnit}`;
}

/**
 * Round-trip validation: convert to base and back to display
 * Should return original value (within floating point precision)
 */
export function validateRoundTrip(value: number, unit: DisplayUnit, tolerance = 1e-10): boolean {
  const baseValue = toBase(value, unit);
  const backToDisplay = fromBase(baseValue, unit);
  return Math.abs(value - backToDisplay) < tolerance;
}

/**
 * Convert between any two units of the same base type
 */
export function convertUnit(value: number, fromUnit: DisplayUnit, toUnit: DisplayUnit): number {
  const fromConversion = TO_BASE_FACTORS[fromUnit];
  const toConversion = TO_BASE_FACTORS[toUnit];

  if (!fromConversion || !toConversion) {
    throw new Error(`Invalid units: ${fromUnit} -> ${toUnit}`);
  }

  if (fromConversion.base !== toConversion.base) {
    throw new Error(`Cannot convert between different base units: ${fromConversion.base} -> ${toConversion.base}`);
  }

  // Convert to base, then to target unit
  const baseValue = toBase(value, fromUnit);
  return fromBase(baseValue, toUnit);
}

/**
 * Metric type detection from metric keys
 */
export function getMetricType(metricKey: string): keyof UnitPreferences {
  // Common patterns in FitScore Pro metric keys
  if (metricKey.includes('weight') || metricKey.includes('mass')) return 'mass';
  if (metricKey.includes('height') || metricKey.includes('distance') || metricKey.includes('jump')) return 'distance';
  if (metricKey.includes('time') || metricKey.includes('duration')) return 'time';
  if (metricKey.includes('speed') || metricKey.includes('velocity')) return 'speed';

  // Default mappings for common test types
  const massMetrics = ['body_weight', 'max_weight', 'load'];
  const distanceMetrics = ['vertical_jump', 'broad_jump', 'reach', 'height'];
  const timeMetrics = ['sprint_time', 'reaction_time', 'hold_time'];
  const speedMetrics = ['max_speed', 'average_speed'];

  if (massMetrics.some(m => metricKey.includes(m))) return 'mass';
  if (distanceMetrics.some(m => metricKey.includes(m))) return 'distance';
  if (timeMetrics.some(m => metricKey.includes(m))) return 'time';
  if (speedMetrics.some(m => metricKey.includes(m))) return 'speed';

  // Default fallback
  return 'distance';
}

/**
 * Safe conversion with error handling
 */
export function safeConvertToBase(
  value: number | null | undefined,
  displayUnit: DisplayUnit
): number | null {
  if (value === null || value === undefined || isNaN(value)) {
    return null;
  }

  try {
    return toBase(value, displayUnit);
  } catch (error) {
    console.error(`Failed to convert ${value} ${displayUnit} to base:`, error);
    return null;
  }
}

/**
 * Safe conversion from base with error handling
 */
export function safeConvertFromBase(
  baseValue: number | null | undefined,
  displayUnit: DisplayUnit
): number | null {
  if (baseValue === null || baseValue === undefined || isNaN(baseValue)) {
    return null;
  }

  try {
    return fromBase(baseValue, displayUnit);
  } catch (error) {
    console.error(`Failed to convert ${baseValue} from base to ${displayUnit}:`, error);
    return null;
  }
}