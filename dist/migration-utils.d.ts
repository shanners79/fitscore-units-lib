/**
 * Migration utilities for converting existing test results to base units
 */
export interface TestResultMigrationData {
    result_id: string;
    test_key: string;
    value: number;
    units: string | null;
}
export interface MigratedTestResult {
    result_id: string;
    value_base: number;
    value_raw: number;
    unit_raw: string | null;
}
/**
 * Convert a test result to base units
 */
export declare function migrateTestResult(result: TestResultMigrationData): MigratedTestResult;
/**
 * Batch migrate test results
 */
export declare function migrateTestResults(results: TestResultMigrationData[]): MigratedTestResult[];
/**
 * Validate migration results
 */
export declare function validateMigration(original: TestResultMigrationData[], migrated: MigratedTestResult[]): {
    success: boolean;
    errors: string[];
    warnings: string[];
    stats: {
        total: number;
        converted: number;
        unchanged: number;
        failed: number;
    };
};
/**
 * Generate migration report
 */
export declare function generateMigrationReport(validation: ReturnType<typeof validateMigration>): string;
/**
 * Create SQL statements for the migration
 */
export declare function generateMigrationSQL(migrated: MigratedTestResult[]): string[];
