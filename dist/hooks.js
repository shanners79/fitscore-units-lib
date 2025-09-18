"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitsProvider = UnitsProvider;
exports.useUnitsContext = useUnitsContext;
exports.useFormattedValue = useFormattedValue;
exports.useFormattedValues = useFormattedValues;
exports.useUnitsReactive = useUnitsReactive;
exports.useFormattedAssessmentResults = useFormattedAssessmentResults;
exports.useUnitsChangeDetection = useUnitsChangeDetection;
exports.useUnitForMetric = useUnitForMetric;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const units_1 = require("./units");
const UnitsContext = (0, react_1.createContext)({
    preferences: units_1.DEFAULT_PREFERENCES,
    unitsVersion: 1,
    updatePreferences: () => { }
});
function UnitsProvider({ children, initialPreferences = units_1.DEFAULT_PREFERENCES, onPreferencesChange }) {
    const [preferences, setPreferences] = (0, react_1.useState)(initialPreferences);
    const [unitsVersion, setUnitsVersion] = (0, react_1.useState)(1);
    const updatePreferences = (newPrefs) => {
        const updatedPrefs = { ...preferences, ...newPrefs };
        setPreferences(updatedPrefs);
        setUnitsVersion((prev) => prev + 1); // Increment version to invalidate caches
        onPreferencesChange?.(updatedPrefs);
    };
    return ((0, jsx_runtime_1.jsx)(UnitsContext.Provider, { value: {
            preferences,
            unitsVersion,
            updatePreferences
        }, children: children }));
}
/**
 * Hook to access units context
 */
function useUnitsContext() {
    return (0, react_1.useContext)(UnitsContext);
}
/**
 * Hook for formatting base values to display values
 */
function useFormattedValue(baseValue, metricKey, precision) {
    const { preferences, unitsVersion } = useUnitsContext();
    if (baseValue === null || baseValue === undefined || isNaN(baseValue)) {
        const metricType = (0, units_1.getMetricType)(metricKey);
        const unit = (0, units_1.getDisplayUnit)(metricType, preferences);
        return {
            displayValue: null,
            formattedValue: '—',
            unit,
            unitsVersion
        };
    }
    const metricType = (0, units_1.getMetricType)(metricKey);
    const unit = (0, units_1.getDisplayUnit)(metricType, preferences);
    const displayValue = (0, units_1.fromBase)(baseValue, unit);
    const formattedValue = (0, units_1.formatValue)(baseValue, unit, precision);
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
function useFormattedValues(values, precision) {
    const { preferences, unitsVersion } = useUnitsContext();
    const formatted = Object.entries(values).reduce((acc, [metricKey, baseValue]) => {
        if (baseValue === null || baseValue === undefined || isNaN(baseValue)) {
            const metricType = (0, units_1.getMetricType)(metricKey);
            const unit = (0, units_1.getDisplayUnit)(metricType, preferences);
            acc[metricKey] = {
                displayValue: null,
                formattedValue: '—',
                unit
            };
        }
        else {
            const metricType = (0, units_1.getMetricType)(metricKey);
            const unit = (0, units_1.getDisplayUnit)(metricType, preferences);
            const displayValue = (0, units_1.fromBase)(baseValue, unit);
            const formattedValue = (0, units_1.formatValue)(baseValue, unit, precision);
            acc[metricKey] = {
                displayValue,
                formattedValue,
                unit
            };
        }
        return acc;
    }, {});
    return Object.assign(formatted, { unitsVersion });
}
/**
 * Hook for reactive unit preference changes
 * Forces re-render when unitsVersion changes
 */
function useUnitsReactive(computeFn) {
    const { preferences, unitsVersion } = useUnitsContext();
    const [result, setResult] = (0, react_1.useState)(() => computeFn(preferences));
    (0, react_1.useEffect)(() => {
        setResult(computeFn(preferences));
    }, [preferences, unitsVersion, computeFn]);
    return { result, unitsVersion };
}
/**
 * Hook specifically for assessment results formatting
 */
function useFormattedAssessmentResults(results) {
    const { preferences, unitsVersion } = useUnitsContext();
    const formattedResults = results.map(result => {
        if (result.value_base === null || result.value_base === undefined || isNaN(result.value_base)) {
            const metricType = (0, units_1.getMetricType)(result.metric_key);
            const unit = (0, units_1.getDisplayUnit)(metricType, preferences);
            return {
                ...result,
                displayValue: null,
                formattedValue: '—',
                unit
            };
        }
        const metricType = (0, units_1.getMetricType)(result.metric_key);
        const unit = (0, units_1.getDisplayUnit)(metricType, preferences);
        const displayValue = (0, units_1.fromBase)(result.value_base, unit);
        const formattedValue = (0, units_1.formatValue)(result.value_base, unit);
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
function useUnitsChangeDetection(callback) {
    const { unitsVersion } = useUnitsContext();
    (0, react_1.useEffect)(() => {
        callback(unitsVersion);
    }, [unitsVersion, callback]);
}
/**
 * Utility hook for getting current unit for a metric
 */
function useUnitForMetric(metricKey) {
    const { preferences } = useUnitsContext();
    const metricType = (0, units_1.getMetricType)(metricKey);
    return (0, units_1.getDisplayUnit)(metricType, preferences);
}
