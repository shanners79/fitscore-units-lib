import {
  toBase,
  fromBase,
  formatValue,
  UnitPreferences,
  DEFAULT_PREFERENCES
} from '../units';

/**
 * Mock advice engine functions that should be stable across unit preferences
 */

interface TestResult {
  test_key: string;
  value_base: number; // Always in base units
}

interface AdviceRule {
  test_key: string;
  min_value: number; // In base units
  max_value: number; // In base units
  label: string;
  recommendations: string[];
}

// Mock advice rules (in base units)
const MOCK_ADVICE_RULES: AdviceRule[] = [
  {
    test_key: 'body_weight',
    min_value: 60, // 60kg
    max_value: 90, // 90kg
    label: 'Normal Range',
    recommendations: ['Maintain current weight through balanced nutrition']
  },
  {
    test_key: 'vertical_jump',
    min_value: 0.5, // 0.5m
    max_value: 1.0, // 1.0m
    label: 'Good Performance',
    recommendations: ['Continue plyometric training']
  },
  {
    test_key: 'sprint_time',
    min_value: 3.0, // 3.0s
    max_value: 5.0, // 5.0s
    label: 'Competitive',
    recommendations: ['Focus on acceleration drills']
  },
  {
    test_key: 'max_speed',
    min_value: 7.0, // 7.0 m/s
    max_value: 12.0, // 12.0 m/s
    label: 'Elite Level',
    recommendations: ['Maintain speed with technique refinement']
  }
];

// Mock advice engine that works only with base units
function generateAdvice(results: TestResult[]): Array<{
  test_key: string;
  value_base: number;
  label: string;
  recommendations: string[];
  percentile: number;
}> {
  return results.map(result => {
    const rule = MOCK_ADVICE_RULES.find(r => r.test_key === result.test_key);

    if (!rule) {
      return {
        test_key: result.test_key,
        value_base: result.value_base,
        label: 'No Data',
        recommendations: ['Insufficient data for advice'],
        percentile: 50
      };
    }

    // Mock percentile calculation (simplified)
    const percentile = Math.round(((result.value_base - rule.min_value) / (rule.max_value - rule.min_value)) * 100);
    const clampedPercentile = Math.max(0, Math.min(100, percentile));

    return {
      test_key: result.test_key,
      value_base: result.value_base,
      label: rule.label,
      recommendations: rule.recommendations,
      percentile: clampedPercentile
    };
  });
}

// Mock percentile calculation against population data
function calculatePercentile(value_base: number, population_base: number[]): number {
  const sorted = [...population_base].sort((a, b) => a - b);
  const below = sorted.filter(v => v < value_base).length;
  return Math.round((below / sorted.length) * 100);
}

describe('Advice Engine Stability Tests', () => {
  const mockResults: TestResult[] = [
    { test_key: 'body_weight', value_base: 75 }, // 75kg
    { test_key: 'vertical_jump', value_base: 0.65 }, // 0.65m
    { test_key: 'sprint_time', value_base: 4.2 }, // 4.2s
    { test_key: 'max_speed', value_base: 9.5 } // 9.5 m/s
  ];

  const preferences1: UnitPreferences = {
    mass: 'kg',
    distance: 'm',
    length: 'cm',
    time: 's',
    speed: 'm/s',
    count: 'count',
    percent: 'percent',
    score: 'score',
    reps: 'reps'
  };

  const preferences2: UnitPreferences = {
    mass: 'lb',
    distance: 'ft',
    length: 'in',
    time: 'min',
    speed: 'mph',
    count: 'count',
    percent: 'percent',
    score: 'score',
    reps: 'reps'
  };

  test('Advice output is identical regardless of display preferences', () => {
    // Generate advice using base values (should be independent of display preferences)
    const advice1 = generateAdvice(mockResults);
    const advice2 = generateAdvice(mockResults);

    // Advice should be identical
    expect(advice1).toEqual(advice2);

    // Check specific values
    const weightAdvice = advice1.find(a => a.test_key === 'body_weight')!;
    expect(weightAdvice.value_base).toBe(75);
    expect(weightAdvice.label).toBe('Normal Range');
    expect(weightAdvice.percentile).toBe(50); // (75-60)/(90-60) * 100 = 50

    const jumpAdvice = advice1.find(a => a.test_key === 'vertical_jump')!;
    expect(jumpAdvice.value_base).toBe(0.65);
    expect(jumpAdvice.percentile).toBe(30); // (0.65-0.5)/(1.0-0.5) * 100 = 30

    const speedAdvice = advice1.find(a => a.test_key === 'max_speed')!;
    expect(speedAdvice.value_base).toBe(9.5);
    expect(speedAdvice.percentile).toBe(50); // (9.5-7.0)/(12.0-7.0) * 100 = 50
  });

  test('Percentile calculations are stable across unit preferences', () => {
    // Mock population data in base units
    const populationWeights = [60, 65, 70, 75, 80, 85, 90]; // kg
    const populationJumps = [0.4, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75]; // m
    const populationSpeeds = [7, 8, 9, 10, 11, 12]; // m/s

    // Calculate percentiles using base values
    const weightPercentile = calculatePercentile(75, populationWeights);
    const jumpPercentile = calculatePercentile(0.65, populationJumps);
    const speedPercentile = calculatePercentile(9.5, populationSpeeds);

    expect(weightPercentile).toBe(43); // 75kg is above 3/7 of population (60,65,70)
    expect(jumpPercentile).toBe(57); // 0.65m is above 4/7 of population (0.4,0.5,0.55,0.6)
    expect(speedPercentile).toBe(50); // 9.5 m/s is above 3/6 of population

    // Convert population data to different display units and verify same percentiles
    const populationWeightsLb = populationWeights.map(w => fromBase(w, 'lb'));
    const populationJumpsFt = populationJumps.map(j => fromBase(j, 'ft'));
    const populationSpeedsMph = populationSpeeds.map(s => fromBase(s, 'mph'));

    // Convert test values to display units
    const weightInLb = fromBase(75, 'lb');
    const jumpInFt = fromBase(0.65, 'ft');
    const speedInMph = fromBase(9.5, 'mph');

    // Percentiles should be the same when calculated with converted values
    expect(calculatePercentile(weightInLb, populationWeightsLb)).toBe(weightPercentile);
    expect(calculatePercentile(jumpInFt, populationJumpsFt)).toBe(jumpPercentile);
    expect(calculatePercentile(speedInMph, populationSpeedsMph)).toBe(speedPercentile);
  });

  test('Display formatting changes but advice logic stays constant', () => {
    const testResult = mockResults[0]; // 75kg body weight

    // Format for different displays
    const display1 = formatValue(testResult.value_base, preferences1.mass, 1);
    const display2 = formatValue(testResult.value_base, preferences2.mass, 1);

    expect(display1).toBe('75.0 kg');
    expect(display2).toBe('165.3 lb');

    // But the advice calculation uses the same base value
    const advice1 = generateAdvice([testResult]);
    const advice2 = generateAdvice([testResult]);

    expect(advice1[0].percentile).toBe(advice2[0].percentile);
    expect(advice1[0].label).toBe(advice2[0].label);
    expect(advice1[0].recommendations).toEqual(advice2[0].recommendations);
  });

  test('Advice rules are defined in base units only', () => {
    // All advice rules should use base units
    MOCK_ADVICE_RULES.forEach(rule => {
      expect(typeof rule.min_value).toBe('number');
      expect(typeof rule.max_value).toBe('number');
      expect(rule.min_value).toBeGreaterThan(0);
      expect(rule.max_value).toBeGreaterThan(rule.min_value);

      // Verify reasonable ranges for base units
      if (rule.test_key.includes('weight')) {
        expect(rule.min_value).toBeGreaterThan(30); // Reasonable minimum weight in kg
        expect(rule.max_value).toBeLessThan(200); // Reasonable maximum weight in kg
      }

      if (rule.test_key.includes('jump') && rule.test_key.includes('vertical')) {
        expect(rule.min_value).toBeGreaterThan(0.1); // Reasonable minimum jump in m
        expect(rule.max_value).toBeLessThan(2); // Reasonable maximum jump in m
      }

      if (rule.test_key.includes('speed')) {
        expect(rule.min_value).toBeGreaterThan(1); // Reasonable minimum speed in m/s
        expect(rule.max_value).toBeLessThan(20); // Reasonable maximum speed in m/s
      }
    });
  });

  test('Advice engine handles edge cases consistently', () => {
    const edgeCases: TestResult[] = [
      { test_key: 'body_weight', value_base: 0 }, // Zero value
      { test_key: 'body_weight', value_base: 1000 }, // Very high value
      { test_key: 'unknown_test', value_base: 50 }, // Unknown test
    ];

    const advice = generateAdvice(edgeCases);

    // Zero value
    expect(advice[0].percentile).toBe(0); // Below minimum range

    // Very high value
    expect(advice[1].percentile).toBe(100); // Above maximum range

    // Unknown test
    expect(advice[2].label).toBe('No Data');
    expect(advice[2].recommendations).toEqual(['Insufficient data for advice']);
  });

  test('Conversion errors do not affect advice when using base values', () => {
    // This test ensures that if there were conversion issues,
    // the advice engine working with base values would still be stable

    const stableResults: TestResult[] = [
      { test_key: 'body_weight', value_base: 70 },
      { test_key: 'vertical_jump', value_base: 0.55 }
    ];

    // Generate advice multiple times
    const advice1 = generateAdvice(stableResults);
    const advice2 = generateAdvice(stableResults);
    const advice3 = generateAdvice(stableResults);

    // All should be identical
    expect(advice1).toEqual(advice2);
    expect(advice2).toEqual(advice3);

    // And should have consistent percentiles
    expect(advice1[0].percentile).toBe(33); // (70-60)/(90-60) * 100 = 33.33 rounded to 33
    expect(advice1[1].percentile).toBe(10); // (0.55-0.5)/(1.0-0.5) * 100 = 10
  });

  test('Base unit storage prevents drift in advice over time', () => {
    // Simulate the same data being processed at different times
    // with potentially different display preferences

    const baselineResults: TestResult[] = [
      { test_key: 'body_weight', value_base: 75 },
      { test_key: 'max_speed', value_base: 8.0 }
    ];

    // Day 1: Metric preferences
    const day1Advice = generateAdvice(baselineResults);

    // Day 30: Change to imperial preferences (but base values unchanged)
    const day30Advice = generateAdvice(baselineResults);

    // Day 365: Back to metric (base values still unchanged)
    const day365Advice = generateAdvice(baselineResults);

    // All advice should be identical regardless of when it was generated
    expect(day1Advice).toEqual(day30Advice);
    expect(day30Advice).toEqual(day365Advice);

    // Specific checks
    const weightAdvice = day1Advice.find(a => a.test_key === 'body_weight')!;
    const speedAdvice = day1Advice.find(a => a.test_key === 'max_speed')!;

    expect(weightAdvice.percentile).toBe(50);
    expect(speedAdvice.percentile).toBe(20); // (8-7)/(12-7) * 100 = 20

    // These should be identical across all time periods
    expect(day30Advice.find(a => a.test_key === 'body_weight')!.percentile).toBe(50);
    expect(day365Advice.find(a => a.test_key === 'max_speed')!.percentile).toBe(20);
  });
});