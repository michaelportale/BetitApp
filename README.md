# BetIt

BetIt is a React Native mobile application for creating and tracking social bets within groups. The app includes authentication, group participation, bet creation and resolution workflows, ledger views, notifications, and payment-oriented screens.

## Stack

- Expo and React Native
- TypeScript and Expo Router
- Supabase client integration
- Stripe React Native components
- Jest, ESLint, and Detox configuration

## Local development

Install dependencies with the package manager represented by the checked-in lockfile, then start Expo:

```bash
npm install
npx expo start
```

Useful commands:

```bash
npm run lint
npm test
npm run ios
npm run android
npm run web
```

## Environment

Create a local `.env` file for the public Supabase application configuration required by the client. Environment files and Expo local state are intentionally excluded from version control.

## Repository layout

```text
app/        Expo Router screens and navigation
src/        Services, state, components, and integrations
e2e/        End-to-end test configuration
assets/     Application assets
```

## Notes

This repository contains product and engineering work for the BetIt mobile client. Any production payment, identity, or regulatory requirements must be reviewed separately before launch.
