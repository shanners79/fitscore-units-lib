/**
 * Pure TypeScript utilities for formatting values with units
 * Backend-compatible version without React dependencies
 */
import { UnitPreferences, DisplayUnit } from './units';
export interface FormattedValue {
    displayValue: number | null;
    formattedValue: string;
    unit: DisplayUnit;
}
/**
 * Format a single base value for display
 */
export declare function formatBaseValue(baseValue: number | null | undefined, metricKey: string, preferences?: UnitPreferences, precision?: number): FormattedValue;
/**
 * Format multiple base values at once
 */
export declare function formatBaseValues(values: Record<string, number | null | undefined>, preferences?: UnitPreferences, precision?: number): Record<string, FormattedValue>;
/**
 * Format assessment results for display
 */
export declare function formatAssessmentResults<T extends {
    metric_key: string;
    value_base: number | null;
}>(results: T[], preferences?: UnitPreferences): Array<T & FormattedValue>;
/**
 * Get display unit for a specific metric key
 */
export declare function getDisplayUnitForMetric(metricKey: string, preferences?: UnitPreferences): DisplayUnit;
/**
 * Utility for API responses - format test results with units
 */
export declare function formatTestResultsForAPI<T extends {
    test_key: string;
    value_base: number | null;
}>(results: T[], preferences?: UnitPreferences): Array<T & {
    display_value: number | null;
    formatted_value: string;
    display_unit: DisplayUnit;
}>;
