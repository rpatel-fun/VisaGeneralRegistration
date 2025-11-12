# Quick Setup Guide

## Important: Install Dependencies First

Before running the app, you must install all dependencies:

```bash
npm install
```

For iOS, also install CocoaPods dependencies:

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

## TypeScript Errors

After installing dependencies, TypeScript errors related to missing modules will be resolved. The following packages need to be installed:

- `@react-navigation/native`
- `@react-navigation/native-stack`
- `react-native-screens`
- `react-native-gesture-handler`
- `react-hook-form`
- `react-native-keychain`
- `@react-native-async-storage/async-storage`
- `react-native-biometrics`

All of these are listed in `package.json` and will be installed with `npm install`.

## Running the App

1. Start Metro bundler:
```bash
npm start
```

2. In a separate terminal, run on your platform:
```bash
# Android
npm run android

# iOS
npm run ios
```

## Testing

Run tests:
```bash
npm test
```

## Type Checking

Check TypeScript types:
```bash
npm run type-check
```

Note: This will show errors until dependencies are installed.

