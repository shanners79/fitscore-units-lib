"use strict";
/**
 * Pure TypeScript utilities for formatting values with units
 * Backend-compatible version without React dependencies
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBaseValue = formatBaseValue;
exports.formatBaseValues = formatBaseValues;
exports.formatAssessmentResults = formatAssessmentResults;
exports.getDisplayUnitForMetric = getDisplayUnitForMetric;
exports.formatTestResultsForAPI = formatTestResultsForAPI;
const units_1 = require("./units");
/**
 * Format a single base value for display
 */
function formatBaseValue(baseValue, metricKey, preferences = units_1.DEFAULT_PREFERENCES, precision) {
    if (baseValue === null || baseValue === undefined || isNaN(baseValue)) {
        const metricType = (0, units_1.getMetricType)(metricKey);
        const unit = (0, units_1.getDisplayUnit)(metricType, preferences);
        return {
            displayValue: null,
            formattedValue: '—',
            unit
        };
    }
    const metricType = (0, units_1.getMetricType)(metricKey);
    const unit = (0, units_1.getDisplayUnit)(metricType, preferences);
    const displayValue = (0, units_1.fromBase)(baseValue, unit);
    const formattedValue = (0, units_1.formatValue)(baseValue, unit, precision);
    return {
        displayValue,
        formattedValue,
        unit
    };
}
/**
 * Format multiple base values at once
 */
function formatBaseValues(values, preferences = units_1.DEFAULT_PREFERENCES, precision) {
    const formatted = {};
    for (const [metricKey, baseValue] of Object.entries(values)) {
        formatted[metricKey] = formatBaseValue(baseValue, metricKey, preferences, precision);
    }
    return formatted;
}
/**
 * Format assessment results for display
 */
function formatAssessmentResults(results, preferences = units_1.DEFAULT_PREFERENCES) {
    return results.map(result => ({
        ...result,
        ...formatBaseValue(result.value_base, result.metric_key, preferences)
    }));
}
/**
 * Get display unit for a specific metric key
 */
function getDisplayUnitForMetric(metricKey, preferences = units_1.DEFAULT_PREFERENCES) {
    const metricType = (0, units_1.getMetricType)(metricKey);
    return (0, units_1.getDisplayUnit)(metricType, preferences);
}
/**
 * Utility for API responses - format test results with units
 */
function formatTestResultsForAPI(results, preferences = units_1.DEFAULT_PREFERENCES) {
    return results.map(result => {
        const formatted = formatBaseValue(result.value_base, result.test_key, preferences);
        return {
            ...result,
            display_value: formatted.displayValue,
            formatted_value: formatted.formattedValue,
            display_unit: formatted.unit
        };
    });
}
