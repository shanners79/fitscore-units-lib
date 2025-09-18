"use strict";
/**
 * Migration utilities for converting existing test results to base units
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateTestResult = migrateTestResult;
exports.migrateTestResults = migrateTestResults;
exports.validateMigration = validateMigration;
exports.generateMigrationReport = generateMigrationReport;
exports.generateMigrationSQL = generateMigrationSQL;
const units_1 = require("./units");
/**
 * Convert a test result to base units
 */
function migrateTestResult(result) {
    const { result_id, test_key, value, units } = result;
    // Store original values for audit
    const value_raw = value;
    const unit_raw = units;
    // If no units specified, assume base unit for the metric type
    if (!units || units.trim() === '') {
        return {
            result_id,
            value_base: value,
            value_raw,
            unit_raw
        };
    }
    // Normalize the unit string
    const normalizedUnit = normalizeUnitString(units);
    try {
        const value_base = (0, units_1.toBase)(value, normalizedUnit);
        return {
            result_id,
            value_base,
            value_raw,
            unit_raw
        };
    }
    catch (error) {
        // If conversion fails, log warning and use original value
        console.warn(`Failed to convert ${value} ${units} for ${test_key}: ${error}. Using original value.`);
        return {
            result_id,
            value_base: value,
            value_raw,
            unit_raw
        };
    }
}
/**
 * Normalize various unit string formats to canonical DisplayUnit
 */
function normalizeUnitString(unit) {
    const normalized = unit.toLowerCase().trim();
    // Mass units
    if (normalized === 'kg' || normalized === 'kilogram' || normalized === 'kilograms')
        return 'kg';
    if (normalized === 'lb' || normalized === 'lbs' || normalized === 'pound' || normalized === 'pounds')
        return 'lb';
    // Distance units
    if (normalized === 'm' || normalized === 'meter' || normalized === 'meters' || normalized === 'metre' || normalized === 'metres')
        return 'm';
    if (normalized === 'cm' || normalized === 'centimeter' || normalized === 'centimeters' || normalized === 'centimetre' || normalized === 'centimetres')
        return 'cm';
    if (normalized === 'in' || normalized === 'inch' || normalized === 'inches' || normalized === '"')
        return 'in';
    if (normalized === 'ft' || normalized === 'foot' || normalized === 'feet' || normalized === "'")
        return 'ft';
    // Time units
    if (normalized === 's' || normalized === 'sec' || normalized === 'second' || normalized === 'seconds')
        return 's';
    if (normalized === 'min' || normalized === 'minute' || normalized === 'minutes')
        return 'min';
    // Speed units
    if (normalized === 'm/s' || normalized === 'mps' || normalized === 'meters/second' || normalized === 'metres/second')
        return 'm/s';
    if (normalized === 'km/h' || normalized === 'kmh' || normalized === 'kph' || normalized === 'kilometers/hour')
        return 'km/h';
    if (normalized === 'mph' || normalized === 'miles/hour' || normalized === 'miles per hour')
        return 'mph';
    // Return original if no match found (will be handled by error case)
    return unit;
}
/**
 * Batch migrate test results
 */
function migrateTestResults(results) {
    return results.map(result => migrateTestResult(result));
}
/**
 * Validate migration results
 */
function validateMigration(original, migrated) {
    const errors = [];
    const warnings = [];
    let converted = 0;
    let unchanged = 0;
    let failed = 0;
    if (original.length !== migrated.length) {
        errors.push(`Length mismatch: original ${original.length}, migrated ${migrated.length}`);
        return {
            success: false,
            errors,
            warnings,
            stats: { total: original.length, converted: 0, unchanged: 0, failed: original.length }
        };
    }
    for (let i = 0; i < original.length; i++) {
        const orig = original[i];
        const mig = migrated[i];
        if (orig.result_id !== mig.result_id) {
            errors.push(`ID mismatch at index ${i}: ${orig.result_id} vs ${mig.result_id}`);
            failed++;
            continue;
        }
        // Check if conversion was applied
        if (Math.abs(orig.value - mig.value_base) < 1e-10) {
            unchanged++;
        }
        else {
            converted++;
            // Validate reasonable conversion factors
            const ratio = mig.value_base / orig.value;
            if (ratio < 0.001 || ratio > 1000) {
                warnings.push(`Suspicious conversion for ${orig.result_id}: ${orig.value} ${orig.units} -> ${mig.value_base} (ratio: ${ratio})`);
            }
        }
        // Validate audit trail
        if (mig.value_raw !== orig.value) {
            errors.push(`Audit trail mismatch for ${orig.result_id}: value_raw ${mig.value_raw} should equal original value ${orig.value}`);
            failed++;
        }
        if (mig.unit_raw !== orig.units) {
            errors.push(`Audit trail mismatch for ${orig.result_id}: unit_raw ${mig.unit_raw} should equal original units ${orig.units}`);
            failed++;
        }
    }
    return {
        success: errors.length === 0,
        errors,
        warnings,
        stats: {
            total: original.length,
            converted,
            unchanged,
            failed
        }
    };
}
/**
 * Generate migration report
 */
function generateMigrationReport(validation) {
    const { success, errors, warnings, stats } = validation;
    let report = `# Test Results Migration Report\n\n`;
    report += `**Status:** ${success ? '✅ SUCCESS' : '❌ FAILED'}\n\n`;
    report += `## Statistics\n`;
    report += `- **Total records:** ${stats.total}\n`;
    report += `- **Converted:** ${stats.converted}\n`;
    report += `- **Unchanged:** ${stats.unchanged}\n`;
    report += `- **Failed:** ${stats.failed}\n\n`;
    if (warnings.length > 0) {
        report += `## ⚠️ Warnings (${warnings.length})\n`;
        warnings.forEach(warning => report += `- ${warning}\n`);
        report += '\n';
    }
    if (errors.length > 0) {
        report += `## ❌ Errors (${errors.length})\n`;
        errors.forEach(error => report += `- ${error}\n`);
        report += '\n';
    }
    if (success) {
        report += `## ✅ Migration completed successfully!\n`;
        report += `Ready to run: \`ALTER TABLE "TestResult" ALTER COLUMN "value_base" SET NOT NULL;\`\n`;
    }
    else {
        report += `## ❌ Migration failed\n`;
        report += `Please review and fix the errors before proceeding.\n`;
    }
    return report;
}
/**
 * Create SQL statements for the migration
 */
function generateMigrationSQL(migrated) {
    const statements = [];
    for (const result of migrated) {
        statements.push(`UPDATE "TestResult" SET ` +
            `"value_base" = ${result.value_base}, ` +
            `"value_raw" = ${result.value_raw}, ` +
            `"unit_raw" = ${result.unit_raw ? `'${result.unit_raw.replace(/'/g, "''")}'` : 'NULL'} ` +
            `WHERE "result_id" = '${result.result_id}';`);
    }
    return statements;
}
