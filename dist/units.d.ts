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
export declare const DEFAULT_PREFERENCES: UnitPreferences;
/**
 * Convert display value to base unit value
 */
export declare function toBase(value: number, displayUnit: DisplayUnit): number;
/**
 * Convert base unit value to display unit value
 */
export declare function fromBase(baseValue: number, displayUnit: DisplayUnit): number;
/**
 * Get the base unit for a display unit
 */
export declare function getBaseUnit(displayUnit: DisplayUnit): BaseUnit;
/**
 * Get display unit for a metric based on preferences
 */
export declare function getDisplayUnit(metricType: keyof UnitPreferences, preferences: UnitPreferences): DisplayUnit;
/**
 * Format a base value for display with appropriate precision
 */
export declare function formatValue(baseValue: number, displayUnit: DisplayUnit, precision?: number): string;
/**
 * Round-trip validation: convert to base and back to display
 * Should return original value (within floating point precision)
 */
export declare function validateRoundTrip(value: number, unit: DisplayUnit, tolerance?: number): boolean;
/**
 * Convert between any two units of the same base type
 */
export declare function convertUnit(value: number, fromUnit: DisplayUnit, toUnit: DisplayUnit): number;
/**
 * Metric type detection from metric keys
 */
export declare function getMetricType(metricKey: string): keyof UnitPreferences;
/**
 * Safe conversion with error handling
 */
export declare function safeConvertToBase(value: number | null | undefined, displayUnit: DisplayUnit): number | null;
/**
 * Safe conversion from base with error handling
 */
export declare function safeConvertFromBase(baseValue: number | null | undefined, displayUnit: DisplayUnit): number | null;
