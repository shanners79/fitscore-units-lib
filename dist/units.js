"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PREFERENCES = void 0;
exports.toBase = toBase;
exports.fromBase = fromBase;
exports.getBaseUnit = getBaseUnit;
exports.getDisplayUnit = getDisplayUnit;
exports.formatValue = formatValue;
exports.validateRoundTrip = validateRoundTrip;
exports.convertUnit = convertUnit;
exports.getMetricType = getMetricType;
exports.safeConvertToBase = safeConvertToBase;
exports.safeConvertFromBase = safeConvertFromBase;
exports.DEFAULT_PREFERENCES = {
    mass: 'kg',
    distance: 'm',
    time: 's',
    speed: 'm/s'
};
/**
 * Conversion factors to base units
 */
const TO_BASE_FACTORS = {
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
    'km/h': { factor: 1 / 3.6, base: 'm/s' }, // Exact: 1 km/h = 1/3.6 m/s
    mph: { factor: 0.44704, base: 'm/s' }
};
/**
 * Convert display value to base unit value
 */
function toBase(value, displayUnit) {
    const conversion = TO_BASE_FACTORS[displayUnit];
    if (!conversion) {
        throw new Error(`Unknown display unit: ${displayUnit}`);
    }
    return value * conversion.factor;
}
/**
 * Convert base unit value to display unit value
 */
function fromBase(baseValue, displayUnit) {
    const conversion = TO_BASE_FACTORS[displayUnit];
    if (!conversion) {
        throw new Error(`Unknown display unit: ${displayUnit}`);
    }
    return baseValue / conversion.factor;
}
/**
 * Get the base unit for a display unit
 */
function getBaseUnit(displayUnit) {
    const conversion = TO_BASE_FACTORS[displayUnit];
    if (!conversion) {
        throw new Error(`Unknown display unit: ${displayUnit}`);
    }
    return conversion.base;
}
/**
 * Get display unit for a metric based on preferences
 */
function getDisplayUnit(metricType, preferences) {
    return preferences[metricType];
}
/**
 * Format a base value for display with appropriate precision
 */
function formatValue(baseValue, displayUnit, precision = 2) {
    const displayValue = fromBase(baseValue, displayUnit);
    return `${displayValue.toFixed(precision)} ${displayUnit}`;
}
/**
 * Round-trip validation: convert to base and back to display
 * Should return original value (within floating point precision)
 */
function validateRoundTrip(value, unit, tolerance = 1e-10) {
    const baseValue = toBase(value, unit);
    const backToDisplay = fromBase(baseValue, unit);
    return Math.abs(value - backToDisplay) < tolerance;
}
/**
 * Convert between any two units of the same base type
 */
function convertUnit(value, fromUnit, toUnit) {
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
function getMetricType(metricKey) {
    // Common patterns in FitScore Pro metric keys
    if (metricKey.includes('weight') || metricKey.includes('mass'))
        return 'mass';
    if (metricKey.includes('height') || metricKey.includes('distance') || metricKey.includes('jump'))
        return 'distance';
    if (metricKey.includes('time') || metricKey.includes('duration'))
        return 'time';
    if (metricKey.includes('speed') || metricKey.includes('velocity'))
        return 'speed';
    // Default mappings for common test types
    const massMetrics = ['body_weight', 'max_weight', 'load'];
    const distanceMetrics = ['vertical_jump', 'broad_jump', 'reach', 'height'];
    const timeMetrics = ['sprint_time', 'reaction_time', 'hold_time'];
    const speedMetrics = ['max_speed', 'average_speed'];
    if (massMetrics.some(m => metricKey.includes(m)))
        return 'mass';
    if (distanceMetrics.some(m => metricKey.includes(m)))
        return 'distance';
    if (timeMetrics.some(m => metricKey.includes(m)))
        return 'time';
    if (speedMetrics.some(m => metricKey.includes(m)))
        return 'speed';
    // Default fallback
    return 'distance';
}
/**
 * Safe conversion with error handling
 */
function safeConvertToBase(value, displayUnit) {
    if (value === null || value === undefined || isNaN(value)) {
        return null;
    }
    try {
        return toBase(value, displayUnit);
    }
    catch (error) {
        console.error(`Failed to convert ${value} ${displayUnit} to base:`, error);
        return null;
    }
}
/**
 * Safe conversion from base with error handling
 */
function safeConvertFromBase(baseValue, displayUnit) {
    if (baseValue === null || baseValue === undefined || isNaN(baseValue)) {
        return null;
    }
    try {
        return fromBase(baseValue, displayUnit);
    }
    catch (error) {
        console.error(`Failed to convert ${baseValue} from base to ${displayUnit}:`, error);
        return null;
    }
}
