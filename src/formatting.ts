/**
 * Pure TypeScript utilities for formatting values with units
 * Backend-compatible version without React dependencies
 */

import {
  fromBase,
  formatValue,
  getDisplayUnit,
  getMetricType,
  UnitPreferences,
  DEFAULT_PREFERENCES,
  DisplayUnit
} from './units';

export interface FormattedValue {
  displayValue: number | null;
  formattedValue: string;
  unit: DisplayUnit;
}

/**
 * Format a single base value for display
 */
export function formatBaseValue(
  baseValue: number | null | undefined,
  metricKey: string,
  preferences: UnitPreferences = DEFAULT_PREFERENCES,
  precision?: number
): FormattedValue {
  if (baseValue === null || baseValue === undefined || isNaN(baseValue)) {
    const metricType = getMetricType(metricKey);
    const unit = getDisplayUnit(metricType, preferences);
    return {
      displayValue: null,
      formattedValue: '—',
      unit
    };
  }

  const metricType = getMetricType(metricKey);
  const unit = getDisplayUnit(metricType, preferences);
  const displayValue = fromBase(baseValue, unit);
  const formattedValue = formatValue(baseValue, unit, precision);

  return {
    displayValue,
    formattedValue,
    unit
  };
}

/**
 * Format multiple base values at once
 */
export function formatBaseValues(
  values: Record<string, number | null | undefined>,
  preferences: UnitPreferences = DEFAULT_PREFERENCES,
  precision?: number
): Record<string, FormattedValue> {
  const formatted: Record<string, FormattedValue> = {};

  for (const [metricKey, baseValue] of Object.entries(values)) {
    formatted[metricKey] = formatBaseValue(baseValue, metricKey, preferences, precision);
  }

  return formatted;
}

/**
 * Format assessment results for display
 */
export function formatAssessmentResults<T extends {
  metric_key: string;
  value_base: number | null;
}>(
  results: T[],
  preferences: UnitPreferences = DEFAULT_PREFERENCES
): Array<T & FormattedValue> {
  return results.map(result => ({
    ...result,
    ...formatBaseValue(result.value_base, result.metric_key, preferences)
  }));
}

/**
 * Get display unit for a specific metric key
 */
export function getDisplayUnitForMetric(
  metricKey: string,
  preferences: UnitPreferences = DEFAULT_PREFERENCES
): DisplayUnit {
  const metricType = getMetricType(metricKey);
  return getDisplayUnit(metricType, preferences);
}

/**
 * Utility for API responses - format test results with units
 */
export function formatTestResultsForAPI<T extends {
  test_key: string;
  value_base: number | null;
}>(
  results: T[],
  preferences: UnitPreferences = DEFAULT_PREFERENCES
): Array<T & {
  display_value: number | null;
  formatted_value: string;
  display_unit: DisplayUnit;
}> {
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