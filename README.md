# Visa General Registration App

A React Native mobile application that replicates the "Account setup" experience from the Visa General registration page. This is a local-only exercise that does not send any data to external servers.

## Features

- **Registration Screen**: Complete account setup form with validation
- **Login Screen**: Secure authentication with lockout protection
- **Home/Profile Screen**: User profile display with logout functionality
- **Form Validation**: Comprehensive inline validation with error messages
- **Secure Storage**: Credentials stored securely using Keychain/Keystore
- **Session Persistence**: Maintains login state across app restarts
- **Partial Form Persistence**: Registration form data survives app restarts
- **Failed Login Protection**: Account lockout after 5 failed attempts (15-minute lockout)
- **Accessibility**: Full screen reader support and proper accessibility labels

## Tech Stack

- **React Native** 0.82.1
- **TypeScript** 5.8.3
- **React Navigation** 6.x (Native Stack)
- **React Hook Form** 7.x (Form management)
- **react-native-keychain** (Secure credential storage)
- **AsyncStorage** (Partial form state persistence)
- **Jest** (Testing framework)

## Screenshots

<img width="1280" height="2856" alt="registration" src="https://github.com/user-attachments/assets/409fc5ec-d48f-44c2-a9fd-eba58016ec91" />
<img width="1280" height="2856" alt="login" src="https://github.com/user-attachments/assets/cc9814a0-a745-436d-b8b1-fcf3ada33093" />
<img width="1280" height="2856" alt="home" src="https://github.com/user-attachments/assets/8d61f13b-0495-4193-978f-4420ba6843fb" />



## Prerequisites

- Node.js >= 24
- React Native development environment set up
  - For iOS: Xcode and CocoaPods
  - For Android: Android Studio and Android SDK
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd VisaGeneralRegistration
```

2. Install dependencies:
```bash
npm install
```

3. For iOS, install CocoaPods dependencies:
```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

## Running the App

### Start Metro Bundler
```bash
npm start
```

### Run on Android
```bash
npm run android
```

### Run on iOS
```bash
npm run ios
```

## Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run install` - Install dependencies and iOS pods

## Project Structure

```
VisaGeneralRegistration/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Container.tsx
│   │   └── FormInput.tsx
│   ├── context/             # React Context providers
│   │   └── AuthContext.tsx
│   ├── navigation/          # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/             # App screens
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── RegistrationScreen.tsx
│   ├── services/            # Business logic services
│   │   ├── auth.ts
│   │   └── storage.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   └── utils/               # Utility functions
│       └── validation.ts
├── __tests__/               # Test files
├── android/                 # Android native code
├── ios/                     # iOS native code
└── App.tsx                  # App entry point
```

## Architecture

### State Management
- **React Context API**: Used for authentication state management
- **React Hook Form**: Handles form state and validation
- **AsyncStorage**: Persists partial registration form data
- **Keychain/Keystore**: Securely stores user credentials

### Navigation
- **React Navigation (Native Stack)**: Handles screen navigation
- Navigation is conditionally rendered based on authentication state
- Automatic redirect to Home screen after successful login/registration

### Security

#### Credential Storage
- Credentials are stored using `react-native-keychain`
- Uses platform-native secure storage:
  - iOS: Keychain Services
  - Android: Keystore
- Credentials are encrypted and only accessible when device is unlocked

#### Session Management
- Session is checked on app startup
- User remains logged in across app restarts
- Logout clears all stored data including credentials

#### Failed Login Protection
- Tracks failed login attempts
- Locks account after 5 failed attempts
- 15-minute lockout period
- Automatic unlock after lockout period expires

### Form Validation

#### Registration Form
- **Email**: Valid email format required
- **Password**: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **Confirm Password**: Must match password
- **First Name**: Required, non-empty
- **Last Name**: Required, non-empty
- **Phone Number**: Valid 10-digit US phone number format

#### Login Form
- **Email**: Valid email format required
- **Password**: Required

#### Validation Features
- Real-time validation with inline error messages
- Submit button disabled until all fields are valid
- Accessible error messages for screen readers
- Form state persists across app restarts (except passwords)

## Testing

### Unit Tests
Tests are located in `src/**/__tests__/` directories:
- `src/utils/__tests__/validation.test.ts` - Validation logic tests
- `src/services/__tests__/auth.test.ts` - Authentication service tests

Run tests:
```bash
npm test
```

### Test Coverage
- Validation utilities: Email, password, phone number, required fields
- Authentication service: Registration, login, logout, session check
- Form validation: Complete form validation logic

## Accessibility

The app follows accessibility best practices:
- Proper accessibility labels for all interactive elements
- Screen reader support with descriptive labels
- Proper focus order and keyboard navigation
- Sufficient color contrast for text
- Error messages announced to screen readers
- Accessible form inputs with hints

## Security Approach

1. **No Plaintext Storage**: Credentials are never stored in plaintext
2. **Secure Keychain**: Uses platform-native secure storage
3. **Session Management**: Secure session persistence
4. **Lockout Protection**: Prevents brute force attacks
5. **No Network Calls**: All data is stored locally
6. **Data Isolation**: User data is isolated per installation

## Trade-offs and Design Decisions

### Why React Hook Form?
- Provides excellent form state management
- Built-in validation support
- Good performance with minimal re-renders
- TypeScript support

### Why Context API over Redux?
- Simpler state management for this use case
- Less boilerplate code
- Sufficient for authentication state
- Easier to understand and maintain

### Why AsyncStorage for Partial Form Data?
- Simple key-value storage
- Sufficient for non-sensitive form data
- Fast and reliable
- Passwords are not persisted (security)

### Why Keychain for Credentials?
- Industry standard for secure credential storage
- Platform-native implementation
- Encrypted at rest
- Protected by device security

## Known Limitations

1. **No Biometric Authentication**: Biometric unlock is not implemented (stretch goal)
2. **No Dark Mode**: Dark mode theming is not implemented (stretch goal)
3. **No E2E Tests**: End-to-end tests with Detox are not included (stretch goal)
4. **Single User**: Only one user account can be stored at a time
5. **No Password Reset**: Password reset functionality is not implemented

## Next Steps (Stretch Goals)

1. **Biometric Authentication**: Implement Face ID/Touch ID support
2. **Dark Mode**: Add dark mode with centralized theme management
3. **E2E Testing**: Add Detox tests for critical user flows
4. **Password Reset**: Implement password reset flow
5. **Multi-language Support**: Add internationalization
6. **Offline Support**: Enhanced offline capabilities

## Troubleshooting

### iOS Build Issues
- Run `cd ios && bundle exec pod install && cd ..`
- Clean build folder in Xcode: Product > Clean Build Folder

### Android Build Issues
- Clean gradle: `cd android && ./gradlew clean && cd ..`
- Invalidate caches in Android Studio

### Metro Bundler Issues
- Clear cache: `npm start -- --reset-cache`
- Clear watchman: `watchman watch-del-all`

## License

This project is a test exercise and is not affiliated with Visa General.

## Contact

For questions or issues, please refer to the repository issues page.
