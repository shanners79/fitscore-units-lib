import { ReactNode } from 'react';
import { UnitPreferences, DisplayUnit } from './units';
/**
 * Organization units context that includes version for cache invalidation
 */
export interface UnitsContextValue {
    preferences: UnitPreferences;
    unitsVersion: number;
    updatePreferences: (newPrefs: Partial<UnitPreferences>) => void;
}
/**
 * Provider for units context
 */
export interface UnitsProviderProps {
    children: ReactNode;
    initialPreferences?: UnitPreferences;
    onPreferencesChange?: (preferences: UnitPreferences) => void;
}
export declare function UnitsProvider({ children, initialPreferences, onPreferencesChange }: UnitsProviderProps): import("react/jsx-runtime").JSX.Element;
/**
 * Hook to access units context
 */
export declare function useUnitsContext(): UnitsContextValue;
/**
 * Hook for formatting base values to display values
 */
export declare function useFormattedValue(baseValue: number | null | undefined, metricKey: string, precision?: number): {
    displayValue: number | null;
    formattedValue: string;
    unit: DisplayUnit;
    unitsVersion: number;
};
/**
 * Hook for formatting multiple values at once
 */
export declare function useFormattedValues(values: Record<string, number | null | undefined>, precision?: number): Record<string, {
    displayValue: number | null;
    formattedValue: string;
    unit: DisplayUnit;
}> & {
    unitsVersion: number;
};
/**
 * Hook for reactive unit preference changes
 * Forces re-render when unitsVersion changes
 */
export declare function useUnitsReactive<T>(computeFn: (preferences: UnitPreferences) => T): {
    result: T;
    unitsVersion: number;
};
/**
 * Hook specifically for assessment results formatting
 */
export declare function useFormattedAssessmentResults(results: Array<{
    metric_key: string;
    value_base: number | null;
}>): Array<{
    metric_key: string;
    value_base: number | null;
    displayValue: number | null;
    formattedValue: string;
    unit: DisplayUnit;
}> & {
    unitsVersion: number;
};
/**
 * Hook for unit preference change detection
 */
export declare function useUnitsChangeDetection(callback: (newVersion: number) => void): void;
/**
 * Utility hook for getting current unit for a metric
 */
export declare function useUnitForMetric(metricKey: string): DisplayUnit;
