# @fitscore/units

Shared units conversion library for FitScore Pro applications.

## Features

- 🎯 **Base Unit Normalization**: Store kg, m, s, m/s - display any unit
- 🔄 **Bidirectional Conversion**: Accurate conversions with round-trip validation
- ⚛️ **React Hooks**: Context-based units with cache invalidation
- 🧪 **Fully Tested**: 49 tests covering all conversion scenarios
- 📦 **Zero Dependencies**: Lightweight with optional React peer dependency
- 🔧 **TypeScript**: Full type safety and IntelliSense

## Installation

```bash
npm install @fitscore/units
```

For React projects:
```bash
npm install @fitscore/units react
```

## Quick Start

### Basic Conversion
```typescript
import { toBase, fromBase, formatValue } from '@fitscore/units';

// Store in base units
const weightInKg = toBase(165.3, 'lb'); // 75.0

// Display in user's preferred units
const displayWeight = fromBase(75.0, 'lb'); // 165.35
const formatted = formatValue(75.0, 'lb', 1); // "165.3 lb"
```

### React Integration
```tsx
import { UnitsProvider, useFormattedValue } from '@fitscore/units';

function App() {
  return (
    <UnitsProvider initialPreferences={{ mass: 'lb', distance: 'ft' }}>
      <WeightDisplay />
    </UnitsProvider>
  );
}

function WeightDisplay({ testResult }) {
  const { formattedValue } = useFormattedValue(
    testResult.value_base, // Always from API in base units
    'body_weight'
  );

  return <span>{formattedValue}</span>; // "165.3 lb" or "75.0 kg"
}
```

### Backend Formatting
```typescript
import { formatBaseValue, formatAssessmentResults } from '@fitscore/units';

// Single value
const formatted = formatBaseValue(75.0, 'body_weight', { mass: 'lb' });
// { displayValue: 165.35, formattedValue: "165.35 lb", unit: "lb" }

// Multiple values
const results = formatAssessmentResults(testResults, preferences);
```

## Supported Units

| Type | Base Unit | Display Units |
|------|-----------|---------------|
| **Mass** | kg | kg, lb |
| **Distance** | m | m, cm, in, ft |
| **Time** | s | s, min |
| **Speed** | m/s | m/s, km/h, mph |

## Architecture

### Data Flow
```
Input → toBase() → Database (base units) → fromBase() → Display
  ↓                      ↓                       ↓
165.3 lb              75.0 kg               165.3 lb / 75.0 kg
```

### Benefits
- **Advice Stability**: Recommendations never change with unit preferences
- **Data Integrity**: All calculations use consistent base units
- **UI Flexibility**: Change display units without data migration
- **Performance**: Calculate once, display many times

## Testing

```bash
npm test
```

All 49 tests cover:
- Round-trip accuracy for all unit pairs
- Edge cases (zero, large numbers, invalid units)
- Property-based testing with random values
- Advice engine stability across unit changes
- React hooks behavior

## License

MIT