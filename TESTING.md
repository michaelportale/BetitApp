# Testing & Monitoring Setup

This document outlines the testing and monitoring infrastructure for BetitApp.

## Testing (Phase 13)

### Unit Testing with Jest
- **Framework**: Jest with ts-jest preset
- **Location**: `src/lib/__tests__/`
- **Run**: `yarn test`
- **Coverage**: `yarn test:coverage`

### Component Testing
- **Framework**: @testing-library/react-native
- **Location**: `src/components/**/__tests__/`
- **Setup**: Basic configuration in place, may need refinement for Expo compatibility

### E2E Testing with Detox
- **Framework**: Detox v20.40.2
- **Configuration**: `.detoxrc.js`
- **Test Files**: `e2e/`
- **Run iOS**: `yarn test:e2e:ios`
- **Run Android**: `yarn test:e2e:android`

#### E2E Test Coverage
- Authentication flow (demo login)
- Dashboard navigation
- Create bet workflow
- Bet interaction (accept, vote)
- Group management
- Profile and balance viewing

## CI/CD Pipeline (Phase 14)

### GitHub Actions Workflows

#### `.github/workflows/ci.yml`
- Runs on push/PR to main/develop
- ESLint and Prettier checks
- TypeScript compilation
- Unit test execution
- Coverage reporting

#### `.github/workflows/eas-build.yml`
- Automated EAS builds for iOS/Android
- TestFlight submission (on main branch)
- Play Store Internal Track submission
- Triggered on main branch push or manual dispatch

### EAS Configuration
- **File**: `eas.json`
- **Profiles**: development, preview, production
- **Auto-increment**: Version codes for releases

## Monitoring (Phase 15)

### Crash Reporting - Sentry
- **Package**: @sentry/react-native
- **Config**: `src/lib/sentry.ts`
- **Features**:
  - Crash reporting
  - Performance monitoring
  - User context tracking
  - Breadcrumb logging

### Analytics - PostHog
- **Package**: posthog-react-native
- **Config**: `src/lib/analytics.ts`
- **Events Tracked**:
  - Bet creation/acceptance/resolution
  - Group creation/joining
  - User authentication
  - Screen navigation
  - Performance metrics

### Performance Monitoring
- **Config**: `src/lib/performance.ts`
- **Features**:
  - Frame drop detection
  - Bridge performance monitoring
  - Memory usage tracking
  - Slow query identification
  - Component render time tracking

## Environment Variables

Add these to your environment:

```
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
EXPO_PUBLIC_POSTHOG_API_KEY=your_posthog_api_key_here
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## GitHub Secrets

Configure these secrets for CI/CD:

```
EXPO_TOKEN=your_expo_token
ASC_API_KEY_ID=your_app_store_connect_key_id
ASC_API_KEY_ISSUER_ID=your_app_store_connect_issuer_id
ASC_API_KEY=your_app_store_connect_private_key
GOOGLE_SERVICE_ACCOUNT_KEY=your_play_store_service_account_key
```

## Usage Examples

### Running Tests Locally
```bash
# Unit tests
yarn test

# E2E tests (requires simulator/emulator)
yarn build:e2e:ios
yarn test:e2e:ios

# Linting and formatting
yarn lint
yarn format:check
```

### Manual Tracking in Code
```typescript
import { track, trackBetEvent } from '@/lib/analytics';
import { captureException } from '@/lib/sentry';

// Track custom events
track('Custom Event', { property: 'value' });

// Track bet-specific events
trackBetEvent.created(betId, { title: 'My Bet', stake: 50 });

// Report errors to Sentry
try {
  // risky operation
} catch (error) {
  captureException(error, { context: 'additional info' });
}
```

### Performance Monitoring
```typescript
import { PerformanceMonitor, usePerformanceMonitoring } from '@/lib/performance';

// In a component
const MyComponent = () => {
  usePerformanceMonitoring('MyComponent');
  return <View>...</View>;
};

// For async operations
const result = await PerformanceMonitor.monitorAsyncOperation(
  'fetch-bets',
  () => fetchBets()
);
```

## Next Steps

1. Set up actual Sentry and PostHog projects
2. Configure App Store Connect and Google Play Console API access
3. Create EAS project: `eas project:init`
4. Add environment variables to EAS: `eas secret:create`
5. Test the full CI/CD pipeline with a test build