import {User, RegistrationFormData, LoginFormData} from '../types';
import {StorageService} from './storage';

/**
 * Authentication service
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegistrationFormData): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      // Check if user already exists
      const existingCredentials = await StorageService.getCredentials();
      if (existingCredentials?.email === data.email) {
        return {
          success: false,
          error: 'An account with this email already exists',
        };
      }

      // Create user object
      const user: User = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      };

      // Store credentials securely
      const credentialsStored = await StorageService.storeCredentials(
        data.email,
        data.password,
      );
      if (!credentialsStored) {
        return {
          success: false,
          error: 'Failed to store credentials',
        };
      }

      // Store user data
      const userDataStored = await StorageService.storeUserData(user);
      if (!userDataStored) {
        // Rollback credentials if user data storage fails
        await StorageService.clearCredentials();
        return {
          success: false,
          error: 'Failed to store user data',
        };
      }

      // Set session as active
      await StorageService.setSessionActive(true);

      // Clear partial registration data
      await StorageService.clearPartialRegistration();

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during registration',
      };
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginFormData): Promise<{
    success: boolean;
    user?: User;
    error?: string;
    lockedOut?: boolean;
    remainingTime?: number;
  }> {
    try {
      // Check if account is locked out
      const isLockedOut = await StorageService.isLockedOut();
      if (isLockedOut) {
        const remainingTime = await StorageService.getRemainingLockoutTime();
        return {
          success: false,
          lockedOut: true,
          remainingTime,
          error: `Account locked. Please try again in ${Math.ceil(
            remainingTime / 60,
          )} minutes.`,
        };
      }

      // Get stored credentials
      const credentials = await StorageService.getCredentials();
      if (!credentials) {
        const attempts = await StorageService.incrementFailedAttempts();
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Verify credentials
      if (
        credentials.email !== data.email ||
        credentials.password !== data.password
      ) {
        const attempts = await StorageService.incrementFailedAttempts();
        const isNowLockedOut = await StorageService.isLockedOut();
        if (isNowLockedOut) {
          const remainingTime = await StorageService.getRemainingLockoutTime();
          return {
            success: false,
            lockedOut: true,
            remainingTime,
            error: `Too many failed attempts. Account locked for ${Math.ceil(
              remainingTime / 60,
            )} minutes.`,
          };
        }
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Credentials match, reset failed attempts
      await StorageService.resetFailedAttempts();

      // Set session as active
      await StorageService.setSessionActive(true);

      // Get user data
      const user = await StorageService.getUserData();
      if (!user) {
        return {
          success: false,
          error: 'User data not found',
        };
      }

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during login',
      };
    }
  }

  /**
   * Logout user (keeps registered user data for future login)
   */
  static async logout(): Promise<boolean> {
    try {
      // Only clear session, not credentials or user data
      // This allows the user to log back in later
      return await StorageService.clearSession();
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async checkAuth(): Promise<{
    isAuthenticated: boolean;
    user?: User;
  }> {
    try {
      const hasSession = await StorageService.hasSession();
      if (!hasSession) {
        return {
          isAuthenticated: false,
        };
      }

      const user = await StorageService.getUserData();
      return {
        isAuthenticated: true,
        user: user || undefined,
      };
    } catch (error) {
      console.error('Auth check error:', error);
      return {
        isAuthenticated: false,
      };
    }
  }
}

