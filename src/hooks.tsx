import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import {
  fromBase,
  formatValue,
  getDisplayUnit,
  getMetricType,
  UnitPreferences,
  DEFAULT_PREFERENCES,
  DisplayUnit
} from './units';

/**
 * Organization units context that includes version for cache invalidation
 */
export interface UnitsContextValue {
  preferences: UnitPreferences;
  unitsVersion: number; // Increment when preferences change to invalidate caches
  updatePreferences: (newPrefs: Partial<UnitPreferences>) => void;
}

const UnitsContext = createContext<UnitsContextValue>({
  preferences: DEFAULT_PREFERENCES,
  unitsVersion: 1,
  updatePreferences: () => {}
});

/**
 * Provider for units context
 */
export interface UnitsProviderProps {
  children: ReactNode;
  initialPreferences?: UnitPreferences;
  onPreferencesChange?: (preferences: UnitPreferences) => void;
}

export function UnitsProvider({
  children,
  initialPreferences = DEFAULT_PREFERENCES,
  onPreferencesChange
}: UnitsProviderProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [unitsVersion, setUnitsVersion] = useState(1);

  const updatePreferences = (newPrefs: Partial<UnitPreferences>) => {
    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);
    setUnitsVersion((prev: number) => prev + 1); // Increment version to invalidate caches
    onPreferencesChange?.(updatedPrefs);
  };

  return (
    <UnitsContext.Provider value={{
      preferences,
      unitsVersion,
      updatePreferences
    }}>
      {children}
    </UnitsContext.Provider>
  );
}

/**
 * Hook to access units context
 */
export function useUnitsContext(): UnitsContextValue {
  return useContext(UnitsContext);
}

/**
 * Hook for formatting base values to display values
 */
export function useFormattedValue(
  baseValue: number | null | undefined,
  metricKey: string,
  precision?: number
): {
  displayValue: number | null;
  formattedValue: string;
  unit: DisplayUnit;
  unitsVersion: number;
} {
  const { preferences, unitsVersion } = useUnitsContext();

  if (baseValue === null || baseValue === undefined || isNaN(baseValue)) {
    const metricType = getMetricType(metricKey);
    const unit = getDisplayUnit(metricType, preferences);
    return {
      displayValue: null,
      formattedValue: '—',
      unit,
      unitsVersion
    };
  }

  const metricType = getMetricType(metricKey);
  const unit = getDisplayUnit(metricType, preferences);
  const displayValue = fromBase(baseValue, unit);
  const formattedValue = formatValue(baseValue, unit, precision);

  return {
    displayValue,
    formattedValue,
    unit,
    unitsVersion
  };
}

/**
 * Hook for formatting multiple values at once
 */
export function useFormattedValues(
  values: Record<string, number | null | undefined>,
  precision?: number
): Record<string, {
  displayValue: number | null;
  formattedValue: string;
  unit: DisplayUnit;
}> & { unitsVersion: number } {
  const { preferences, unitsVersion } = useUnitsContext();

  const formatted = Object.entries(values).reduce((acc, [metricKey, baseValue]) => {
    if (baseValue === null || baseValue === undefined || isNaN(baseValue)) {
      const metricType = getMetricType(metricKey);
      const unit = getDisplayUnit(metricType, preferences);
      acc[metricKey] = {
        displayValue: null,
        formattedValue: '—',
        unit
      };
    } else {
      const metricType = getMetricType(metricKey);
      const unit = getDisplayUnit(metricType, preferences);
      const displayValue = fromBase(baseValue, unit);
      const formattedValue = formatValue(baseValue, unit, precision);

      acc[metricKey] = {
        displayValue,
        formattedValue,
        unit
      };
    }
    return acc;
  }, {} as Record<string, { displayValue: number | null; formattedValue: string; unit: DisplayUnit }>);

  return Object.assign(formatted, { unitsVersion });
}

/**
 * Hook for reactive unit preference changes
 * Forces re-render when unitsVersion changes
 */
export function useUnitsReactive<T>(
  computeFn: (preferences: UnitPreferences) => T
): { result: T; unitsVersion: number } {
  const { preferences, unitsVersion } = useUnitsContext();
  const [result, setResult] = useState(() => computeFn(preferences));

  useEffect(() => {
    setResult(computeFn(preferences));
  }, [preferences, unitsVersion, computeFn]);

  return { result, unitsVersion };
}

/**
 * Hook specifically for assessment results formatting
 */
export function useFormattedAssessmentResults(
  results: Array<{
    metric_key: string;
    value_base: number | null;
  }>
): Array<{
  metric_key: string;
  value_base: number | null;
  displayValue: number | null;
  formattedValue: string;
  unit: DisplayUnit;
}> & { unitsVersion: number } {
  const { preferences, unitsVersion } = useUnitsContext();

  const formattedResults = results.map(result => {
    if (result.value_base === null || result.value_base === undefined || isNaN(result.value_base)) {
      const metricType = getMetricType(result.metric_key);
      const unit = getDisplayUnit(metricType, preferences);
      return {
        ...result,
        displayValue: null,
        formattedValue: '—',
        unit
      };
    }

    const metricType = getMetricType(result.metric_key);
    const unit = getDisplayUnit(metricType, preferences);
    const displayValue = fromBase(result.value_base, unit);
    const formattedValue = formatValue(result.value_base, unit);

    return {
      ...result,
      displayValue,
      formattedValue,
      unit
    };
  });

  return Object.assign(formattedResults, { unitsVersion });
}

/**
 * Hook for unit preference change detection
 */
export function useUnitsChangeDetection(callback: (newVersion: number) => void) {
  const { unitsVersion } = useUnitsContext();

  useEffect(() => {
    callback(unitsVersion);
  }, [unitsVersion, callback]);
}

/**
 * Utility hook for getting current unit for a metric
 */
export function useUnitForMetric(metricKey: string): DisplayUnit {
  const { preferences } = useUnitsContext();
  const metricType = getMetricType(metricKey);
  return getDisplayUnit(metricType, preferences);
}