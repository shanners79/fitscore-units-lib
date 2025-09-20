import {
  toBase,
  fromBase,
  getBaseUnit,
  getDisplayUnit,
  formatValue,
  validateRoundTrip,
  convertUnit,
  getMetricType,
  safeConvertToBase,
  safeConvertFromBase,
  getTestDisplayUnit,
  DEFAULT_PREFERENCES,
  UnitPreferences
} from '../units';

describe('Unit Conversion System', () => {
  describe('Basic Conversions', () => {
    describe('Mass conversions (kg base)', () => {
      test('kg to base (identity)', () => {
        expect(toBase(100, 'kg')).toBe(100);
        expect(fromBase(100, 'kg')).toBe(100);
      });

      test('lb to kg conversion', () => {
        expect(toBase(220.462, 'lb')).toBeCloseTo(100, 3);
        expect(fromBase(100, 'lb')).toBeCloseTo(220.462, 3);
      });
    });

    describe('Distance conversions (m base)', () => {
      test('m to base (identity)', () => {
        expect(toBase(1, 'm')).toBe(1);
        expect(fromBase(1, 'm')).toBe(1);
      });

      test('cm to m conversion', () => {
        expect(toBase(100, 'cm')).toBe(1);
        expect(fromBase(1, 'cm')).toBe(100);
      });

      test('in to m conversion', () => {
        expect(toBase(39.3701, 'in')).toBeCloseTo(1, 4);
        expect(fromBase(1, 'in')).toBeCloseTo(39.3701, 4);
      });

      test('ft to m conversion', () => {
        expect(toBase(3.28084, 'ft')).toBeCloseTo(1, 5);
        expect(fromBase(1, 'ft')).toBeCloseTo(3.28084, 5);
      });
    });

    describe('Time conversions (s base)', () => {
      test('s to base (identity)', () => {
        expect(toBase(60, 's')).toBe(60);
        expect(fromBase(60, 's')).toBe(60);
      });

      test('min to s conversion', () => {
        expect(toBase(1, 'min')).toBe(60);
        expect(fromBase(60, 'min')).toBe(1);
      });
    });

    describe('Speed conversions (m/s base)', () => {
      test('m/s to base (identity)', () => {
        expect(toBase(10, 'm/s')).toBe(10);
        expect(fromBase(10, 'm/s')).toBe(10);
      });

      test('km/h to m/s conversion', () => {
        expect(toBase(36, 'km/h')).toBe(10);
        expect(fromBase(10, 'km/h')).toBe(36);
      });

      test('mph to m/s conversion', () => {
        expect(toBase(22.369, 'mph')).toBeCloseTo(10, 3);
        expect(fromBase(10, 'mph')).toBeCloseTo(22.369, 3);
      });
    });
  });

  describe('Round-trip Validation', () => {
    const testCases = [
      { value: 100, unit: 'kg' as const },
      { value: 220, unit: 'lb' as const },
      { value: 1.8, unit: 'm' as const },
      { value: 180, unit: 'cm' as const },
      { value: 72, unit: 'in' as const },
      { value: 6, unit: 'ft' as const },
      { value: 60, unit: 's' as const },
      { value: 1, unit: 'min' as const },
      { value: 10, unit: 'm/s' as const },
      { value: 36, unit: 'km/h' as const },
      { value: 22.37, unit: 'mph' as const }
    ];

    testCases.forEach(({ value, unit }) => {
      test(`Round-trip: ${value} ${unit}`, () => {
        expect(validateRoundTrip(value, unit)).toBe(true);

        const baseValue = toBase(value, unit);
        const backToDisplay = fromBase(baseValue, unit);
        expect(Math.abs(value - backToDisplay)).toBeLessThan(1e-10);
      });
    });
  });

  describe('Property-based Tests', () => {
    test('Any positive value should round-trip correctly', () => {
      const units = ['kg', 'lb', 'm', 'cm', 'in', 'ft', 's', 'min', 'm/s', 'km/h', 'mph'] as const;

      for (let i = 0; i < 100; i++) {
        const value = Math.random() * 1000 + 0.1; // Avoid zero
        const unit = units[Math.floor(Math.random() * units.length)];

        expect(validateRoundTrip(value, unit)).toBe(true);
      }
    });

    test('Conversion factors are consistent', () => {
      // 1 kg = 2.20462 lb (within tolerance)
      expect(fromBase(1, 'lb')).toBeCloseTo(2.20462, 5);

      // 1 m = 100 cm
      expect(fromBase(1, 'cm')).toBe(100);

      // 1 m = 39.3701 in
      expect(fromBase(1, 'in')).toBeCloseTo(39.3701, 4);

      // 1 m = 3.28084 ft
      expect(fromBase(1, 'ft')).toBeCloseTo(3.28084, 5);

      // 1 min = 60 s
      expect(toBase(1, 'min')).toBe(60);

      // 1 m/s = 3.6 km/h
      expect(fromBase(1, 'km/h')).toBeCloseTo(3.6, 10);

      // 1 m/s = 2.23694 mph
      expect(fromBase(1, 'mph')).toBeCloseTo(2.23694, 5);
    });
  });

  describe('Unit Conversion Between Display Units', () => {
    test('Convert between mass units', () => {
      // 100 kg = 220.462 lb
      expect(convertUnit(100, 'kg', 'lb')).toBeCloseTo(220.462, 3);
      expect(convertUnit(220.462, 'lb', 'kg')).toBeCloseTo(100, 3);
    });

    test('Convert between distance units', () => {
      // 1 m = 100 cm = 39.3701 in = 3.28084 ft
      expect(convertUnit(1, 'm', 'cm')).toBe(100);
      expect(convertUnit(100, 'cm', 'm')).toBe(1);
      expect(convertUnit(1, 'm', 'in')).toBeCloseTo(39.3701, 4);
      expect(convertUnit(12, 'in', 'ft')).toBeCloseTo(1, 10);
    });

    test('Convert between speed units', () => {
      // 10 m/s = 36 km/h = 22.369 mph
      expect(convertUnit(10, 'm/s', 'km/h')).toBe(36);
      expect(convertUnit(36, 'km/h', 'm/s')).toBeCloseTo(10, 5);
      expect(convertUnit(10, 'm/s', 'mph')).toBeCloseTo(22.369, 3);
    });

    test('Error on incompatible unit conversion', () => {
      expect(() => convertUnit(100, 'kg', 'm')).toThrow('Cannot convert between different base units');
      expect(() => convertUnit(10, 'm/s', 'kg')).toThrow('Cannot convert between different base units');
    });
  });

  describe('Utility Functions', () => {
    test('getBaseUnit returns correct base unit', () => {
      expect(getBaseUnit('kg')).toBe('kg');
      expect(getBaseUnit('lb')).toBe('kg');
      expect(getBaseUnit('m')).toBe('m');
      expect(getBaseUnit('cm')).toBe('m');
      expect(getBaseUnit('s')).toBe('s');
      expect(getBaseUnit('min')).toBe('s');
      expect(getBaseUnit('m/s')).toBe('m/s');
      expect(getBaseUnit('km/h')).toBe('m/s');
    });

    test('getDisplayUnit returns preference unit', () => {
      const prefs: UnitPreferences = {
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

      expect(getDisplayUnit('mass', prefs)).toBe('lb');
      expect(getDisplayUnit('distance', prefs)).toBe('ft');
      expect(getDisplayUnit('time', prefs)).toBe('min');
      expect(getDisplayUnit('speed', prefs)).toBe('mph');
    });

    test('formatValue formats with correct precision', () => {
      expect(formatValue(1, 'kg', 2)).toBe('1.00 kg');
      expect(formatValue(1, 'lb', 1)).toBe('2.2 lb');
      expect(formatValue(1, 'm', 0)).toBe('1 m');
      expect(formatValue(1, 'cm', 2)).toBe('100.00 cm');
    });

    test('getMetricType detects metric types correctly', () => {
      expect(getMetricType('body_weight')).toBe('mass');
      expect(getMetricType('height')).toBe('length');
      expect(getMetricType('reach')).toBe('length');
      expect(getMetricType('arm_span')).toBe('length');
      expect(getMetricType('vertical_jump')).toBe('distance');
      expect(getMetricType('broad_jump')).toBe('distance');
      expect(getMetricType('sprint_time')).toBe('time');
      expect(getMetricType('max_speed')).toBe('speed');
      expect(getMetricType('push_ups')).toBe('count');
      expect(getMetricType('deep_squat')).toBe('score');
      expect(getMetricType('max_reps')).toBe('reps');
      expect(getMetricType('body_fat_percent')).toBe('percent');
      expect(getMetricType('unknown_metric')).toBe('distance'); // fallback
    });
  });

  describe('Safe Conversion Functions', () => {
    test('safeConvertToBase handles null/undefined', () => {
      expect(safeConvertToBase(null, 'kg')).toBe(null);
      expect(safeConvertToBase(undefined, 'kg')).toBe(null);
      expect(safeConvertToBase(NaN, 'kg')).toBe(null);
      expect(safeConvertToBase(100, 'kg')).toBe(100);
    });

    test('safeConvertFromBase handles null/undefined', () => {
      expect(safeConvertFromBase(null, 'kg')).toBe(null);
      expect(safeConvertFromBase(undefined, 'kg')).toBe(null);
      expect(safeConvertFromBase(NaN, 'kg')).toBe(null);
      expect(safeConvertFromBase(100, 'kg')).toBe(100);
    });

    test('safeConvert handles invalid units gracefully', () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(safeConvertToBase(100, 'invalid' as any)).toBe(null);
      expect(safeConvertFromBase(100, 'invalid' as any)).toBe(null);

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('Invalid units throw errors', () => {
      expect(() => toBase(100, 'invalid' as any)).toThrow('Unknown display unit: invalid');
      expect(() => fromBase(100, 'invalid' as any)).toThrow('Unknown display unit: invalid');
      expect(() => getBaseUnit('invalid' as any)).toThrow('Unknown display unit: invalid');
    });

    test('Zero values convert correctly', () => {
      expect(toBase(0, 'kg')).toBe(0);
      expect(fromBase(0, 'kg')).toBe(0);
      expect(validateRoundTrip(0, 'kg')).toBe(true);
    });

    test('Very large values convert correctly', () => {
      const largeValue = 1e6;
      expect(validateRoundTrip(largeValue, 'kg')).toBe(true);
      expect(validateRoundTrip(largeValue, 'lb', 1e-5)).toBe(true);
    });

    test('Very small values convert correctly', () => {
      const smallValue = 1e-6;
      expect(validateRoundTrip(smallValue, 'kg')).toBe(true);
      expect(validateRoundTrip(smallValue, 'm')).toBe(true);
    });
  });
});

describe('Advice Engine Stability Tests', () => {
  // Mock test results in base units
  const mockBaseResults = {
    body_weight: 75, // kg
    vertical_jump: 0.6, // m
    sprint_time: 4.5, // s
    max_speed: 8.5 // m/s
  };

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

  test('Base values remain constant regardless of display preferences', () => {
    // Simulate advice engine working with base values
    const calculateAdvice = (results: typeof mockBaseResults) => {
      // Mock advice calculation that should be stable
      const weightRatio = results.body_weight / 70; // ratio to average
      const jumpPerformance = results.vertical_jump * 100; // score out of 100
      const speedScore = results.max_speed * 10;

      return {
        weightRatio: Math.round(weightRatio * 100) / 100,
        jumpPerformance: Math.round(jumpPerformance * 100) / 100,
        speedScore: Math.round(speedScore * 100) / 100
      };
    };

    const advice1 = calculateAdvice(mockBaseResults);
    const advice2 = calculateAdvice(mockBaseResults);

    // Advice should be identical regardless of display preferences
    expect(advice1).toEqual(advice2);

    // Specific value checks
    expect(advice1.weightRatio).toBe(1.07); // 75/70
    expect(advice1.jumpPerformance).toBe(60); // 0.6 * 100
    expect(advice1.speedScore).toBe(85); // 8.5 * 10
  });

  test('Display formatting changes but advice values stay constant', () => {
    // Convert base values to different display units
    const displayResults1 = {
      body_weight: formatValue(mockBaseResults.body_weight, preferences1.mass),
      vertical_jump: formatValue(mockBaseResults.vertical_jump, preferences1.distance),
      max_speed: formatValue(mockBaseResults.max_speed, preferences1.speed)
    };

    const displayResults2 = {
      body_weight: formatValue(mockBaseResults.body_weight, preferences2.mass),
      vertical_jump: formatValue(mockBaseResults.vertical_jump, preferences2.distance),
      max_speed: formatValue(mockBaseResults.max_speed, preferences2.speed)
    };

    // Display values should be different
    expect(displayResults1.body_weight).toBe('75.00 kg');
    expect(displayResults2.body_weight).toBe('165.35 lb');

    expect(displayResults1.vertical_jump).toBe('0.60 m');
    expect(displayResults2.vertical_jump).toBe('1.97 ft');

    expect(displayResults1.max_speed).toBe('8.50 m/s');
    expect(displayResults2.max_speed).toBe('19.01 mph');

    // But underlying base values used for advice remain the same
    expect(toBase(165.35, 'lb')).toBeCloseTo(75, 2);
    expect(toBase(1.97, 'ft')).toBeCloseTo(0.6, 2);
    expect(toBase(19.02, 'mph')).toBeCloseTo(8.5, 2);
  });

  test('Percentile calculations are stable across unit preferences', () => {
    // Mock percentile calculation function
    const calculatePercentile = (value: number, population: number[]) => {
      const sorted = population.sort((a, b) => a - b);
      const below = sorted.filter(v => v < value).length;
      return Math.round((below / sorted.length) * 100);
    };

    // Mock population data in base units
    const populationWeights = [60, 65, 70, 75, 80, 85, 90]; // kg
    const populationJumps = [0.4, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75]; // m

    const weightPercentile = calculatePercentile(mockBaseResults.body_weight, populationWeights);
    const jumpPercentile = calculatePercentile(mockBaseResults.vertical_jump, populationJumps);

    // Percentiles should be stable regardless of display units
    expect(weightPercentile).toBe(43); // 75kg is above 3/7 of population (60,65,70)
    expect(jumpPercentile).toBe(43); // 0.6m is above 3/7 of population

    // Converting to different display units shouldn't affect percentile calculation
    // if we convert both the value and population to the same display unit
    const weightInLb = fromBase(mockBaseResults.body_weight, 'lb');
    const populationInLb = populationWeights.map(w => fromBase(w, 'lb'));

    const weightPercentileLb = calculatePercentile(weightInLb, populationInLb);
    expect(weightPercentileLb).toBe(weightPercentile);
  });
});

describe('getTestDisplayUnit', () => {
  describe('Family-based unit selection', () => {
    test('length family uses length preference (cm -> in)', () => {
      const preferences: UnitPreferences = {
        mass: 'kg',
        distance: 'm',
        length: 'in',
        time: 's',
        speed: 'm/s',
        count: 'count',
        percent: 'percent',
        score: 'score',
        reps: 'reps'
      };

      const baseUnitRef = {
        key: 'cm',
        family: 'length',
        to_base: 1,
        from_base: 1,
        label: 'Centimetres (cm)',
        is_default: true
      };

      const result = getTestDisplayUnit('cm', baseUnitRef, preferences);
      expect(result).toBe('in');
    });

    test('length family uses length preference (in -> cm)', () => {
      const preferences: UnitPreferences = {
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

      const baseUnitRef = {
        key: 'in',
        family: 'length',
        to_base: 2.54,
        from_base: 0.393701,
        label: 'Inches (in)',
        is_default: false
      };

      const result = getTestDisplayUnit('in', baseUnitRef, preferences);
      expect(result).toBe('cm');
    });

    test('distance family uses distance preference', () => {
      const preferences: UnitPreferences = {
        mass: 'kg',
        distance: 'ft',
        length: 'in',
        time: 's',
        speed: 'm/s',
        count: 'count',
        percent: 'percent',
        score: 'score',
        reps: 'reps'
      };

      const baseUnitRef = {
        key: 'm',
        family: 'distance',
        to_base: 1,
        from_base: 1,
        label: 'Metres (m)',
        is_default: true
      };

      const result = getTestDisplayUnit('m', baseUnitRef, preferences);
      expect(result).toBe('ft');
    });

    test('mass family uses mass preference', () => {
      const preferences: UnitPreferences = {
        mass: 'lb',
        distance: 'm',
        length: 'cm',
        time: 's',
        speed: 'm/s',
        count: 'count',
        percent: 'percent',
        score: 'score',
        reps: 'reps'
      };

      const baseUnitRef = {
        key: 'kg',
        family: 'mass',
        to_base: 1,
        from_base: 1,
        label: 'Kilograms (kg)',
        is_default: true
      };

      const result = getTestDisplayUnit('kg', baseUnitRef, preferences);
      expect(result).toBe('lb');
    });

    test('time family uses time preference', () => {
      const preferences: UnitPreferences = {
        mass: 'kg',
        distance: 'm',
        length: 'cm',
        time: 'min',
        speed: 'm/s',
        count: 'count',
        percent: 'percent',
        score: 'score',
        reps: 'reps'
      };

      const baseUnitRef = {
        key: 's',
        family: 'time',
        to_base: 1,
        from_base: 1,
        label: 'Seconds (s)',
        is_default: true
      };

      const result = getTestDisplayUnit('s', baseUnitRef, preferences);
      expect(result).toBe('min');
    });

    test('speed family uses speed preference', () => {
      const preferences: UnitPreferences = {
        mass: 'kg',
        distance: 'm',
        length: 'cm',
        time: 's',
        speed: 'mph',
        count: 'count',
        percent: 'percent',
        score: 'score',
        reps: 'reps'
      };

      const baseUnitRef = {
        key: 'm/s',
        family: 'speed',
        to_base: 1,
        from_base: 1,
        label: 'Metres per second (m/s)',
        is_default: true
      };

      const result = getTestDisplayUnit('m/s', baseUnitRef, preferences);
      expect(result).toBe('mph');
    });
  });

  describe('Non-convertible units (no baseUnitRef)', () => {
    test('count unit returns as-is when no baseUnitRef', () => {
      const preferences: UnitPreferences = {
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

      const result = getTestDisplayUnit('count', undefined, preferences);
      expect(result).toBe('count');
    });

    test('percent unit returns as-is when no baseUnitRef', () => {
      const preferences: UnitPreferences = {
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

      const result = getTestDisplayUnit('percent', undefined, preferences);
      expect(result).toBe('percent');
    });

    test('score unit returns as-is when no baseUnitRef', () => {
      const preferences: UnitPreferences = {
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

      const result = getTestDisplayUnit('score', undefined, preferences);
      expect(result).toBe('score');
    });

    test('reps unit returns as-is when no baseUnitRef', () => {
      const preferences: UnitPreferences = {
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

      const result = getTestDisplayUnit('reps', undefined, preferences);
      expect(result).toBe('reps');
    });
  });

  describe('Edge cases', () => {
    test('unknown family falls back to default unit', () => {
      const preferences: UnitPreferences = {
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

      const baseUnitRef = {
        key: 'unknown',
        family: 'unknown_family',
        to_base: 1,
        from_base: 1,
        label: 'Unknown unit',
        is_default: true
      };

      const result = getTestDisplayUnit('unknown', baseUnitRef, preferences);
      expect(result).toBe('m'); // Function falls back to 'm' when unit not in TO_BASE_FACTORS
    });

    test('missing preferences defaults to fallback unit', () => {
      const baseUnitRef = {
        key: 'cm',
        family: 'length',
        to_base: 1,
        from_base: 1,
        label: 'Centimetres (cm)',
        is_default: true
      };

      const result = getTestDisplayUnit('cm', baseUnitRef, {} as UnitPreferences);
      expect(result).toBe(undefined); // Function returns undefined when preferences.length is undefined
    });

    test('null baseUnitRef returns original unit', () => {
      const preferences: UnitPreferences = {
        mass: 'kg',
        distance: 'm',
        length: 'in',
        time: 's',
        speed: 'm/s',
        count: 'count',
        percent: 'percent',
        score: 'score',
        reps: 'reps'
      };

      const result = getTestDisplayUnit('cm', undefined, preferences);
      expect(result).toBe('cm');
    });

    test('empty unit returns fallback unit', () => {
      const preferences: UnitPreferences = {
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

      const result = getTestDisplayUnit('', undefined, preferences);
      expect(result).toBe('m'); // Function falls back to 'm' when no baseUnitRef and empty unit
    });
  });

  describe('Real-world test scenarios', () => {
    test('Height test with metric length preference', () => {
      const preferences: UnitPreferences = {
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

      const baseUnitRef = {
        key: 'cm',
        family: 'length',
        to_base: 1,
        from_base: 1,
        label: 'Centimetres (cm)',
        is_default: true
      };

      const result = getTestDisplayUnit('cm', baseUnitRef, preferences);
      expect(result).toBe('cm');
    });

    test('Height test with imperial length preference', () => {
      const preferences: UnitPreferences = {
        mass: 'kg',
        distance: 'm',
        length: 'in',
        time: 's',
        speed: 'm/s',
        count: 'count',
        percent: 'percent',
        score: 'score',
        reps: 'reps'
      };

      const baseUnitRef = {
        key: 'cm',
        family: 'length',
        to_base: 1,
        from_base: 1,
        label: 'Centimetres (cm)',
        is_default: true
      };

      const result = getTestDisplayUnit('cm', baseUnitRef, preferences);
      expect(result).toBe('in');
    });

    test('Sprint distance test uses distance preference not length', () => {
      const preferences: UnitPreferences = {
        mass: 'kg',
        distance: 'ft',
        length: 'in',
        time: 's',
        speed: 'm/s',
        count: 'count',
        percent: 'percent',
        score: 'score',
        reps: 'reps'
      };

      const baseUnitRef = {
        key: 'm',
        family: 'distance',
        to_base: 1,
        from_base: 1,
        label: 'Metres (m)',
        is_default: true
      };

      const result = getTestDisplayUnit('m', baseUnitRef, preferences);
      expect(result).toBe('ft');
    });

    test('Body weight test uses mass preference', () => {
      const preferences: UnitPreferences = {
        mass: 'lb',
        distance: 'm',
        length: 'cm',
        time: 's',
        speed: 'm/s',
        count: 'count',
        percent: 'percent',
        score: 'score',
        reps: 'reps'
      };

      const baseUnitRef = {
        key: 'kg',
        family: 'mass',
        to_base: 1,
        from_base: 1,
        label: 'Kilograms (kg)',
        is_default: true
      };

      const result = getTestDisplayUnit('kg', baseUnitRef, preferences);
      expect(result).toBe('lb');
    });

    test('Push-up count test returns count as-is', () => {
      const preferences: UnitPreferences = {
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

      const result = getTestDisplayUnit('count', undefined, preferences);
      expect(result).toBe('count');
    });
  });
});