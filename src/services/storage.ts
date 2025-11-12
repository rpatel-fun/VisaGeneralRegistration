import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import {User, RegistrationFormData} from '../types';

const STORAGE_KEYS = {
  PARTIAL_REGISTRATION: '@partial_registration',
  FAILED_LOGIN_ATTEMPTS: '@failed_login_attempts',
  LOCKOUT_TIMESTAMP: '@lockout_timestamp',
  USER_DATA: '@user_data',
};

const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_FAILED_ATTEMPTS = 5;

/**
 * Secure storage service for credentials and session management
 */
export class StorageService {
  /**
   * Store user credentials securely in Keychain
   */
  static async storeCredentials(
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      await Keychain.setGenericPassword(email, password, {
        service: 'VisaGeneralRegistration',
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });
      return true;
    } catch (error) {
      console.error('Error storing credentials:', error);
      return false;
    }
  }

  /**
   * Retrieve user credentials from Keychain
   */
  static async getCredentials(): Promise<{
    email: string;
    password: string;
  } | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: 'VisaGeneralRegistration',
      });
      if (credentials) {
        return {
          email: credentials.username,
          password: credentials.password,
        };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  }

  /**
   * Clear stored credentials
   */
  static async clearCredentials(): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({
        service: 'VisaGeneralRegistration',
      });
      return true;
    } catch (error) {
      console.error('Error clearing credentials:', error);
      return false;
    }
  }

  /**
   * Store user data
   */
  static async storeUserData(user: User): Promise<boolean> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(user),
      );
      return true;
    } catch (error) {
      console.error('Error storing user data:', error);
      return false;
    }
  }

  /**
   * Get user data
   */
  static async getUserData(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (data) {
        return JSON.parse(data) as User;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  /**
   * Clear user data
   */
  static async clearUserData(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }

  /**
   * Store partial registration form data
   */
  static async storePartialRegistration(
    data: Partial<RegistrationFormData>,
  ): Promise<boolean> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PARTIAL_REGISTRATION,
        JSON.stringify(data),
      );
      return true;
    } catch (error) {
      console.error('Error storing partial registration:', error);
      return false;
    }
  }

  /**
   * Get partial registration form data
   */
  static async getPartialRegistration(): Promise<Partial<RegistrationFormData> | null> {
    try {
      const data = await AsyncStorage.getItem(
        STORAGE_KEYS.PARTIAL_REGISTRATION,
      );
      if (data) {
        return JSON.parse(data) as Partial<RegistrationFormData>;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving partial registration:', error);
      return null;
    }
  }

  /**
   * Clear partial registration form data
   */
  static async clearPartialRegistration(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PARTIAL_REGISTRATION);
      return true;
    } catch (error) {
      console.error('Error clearing partial registration:', error);
      return false;
    }
  }

  /**
   * Increment failed login attempts
   */
  static async incrementFailedAttempts(): Promise<number> {
    try {
      const attempts = await this.getFailedAttempts();
      const newAttempts = attempts + 1;
      await AsyncStorage.setItem(
        STORAGE_KEYS.FAILED_LOGIN_ATTEMPTS,
        newAttempts.toString(),
      );

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.LOCKOUT_TIMESTAMP,
          Date.now().toString(),
        );
      }

      return newAttempts;
    } catch (error) {
      console.error('Error incrementing failed attempts:', error);
      return 0;
    }
  }

  /**
   * Get failed login attempts count
   */
  static async getFailedAttempts(): Promise<number> {
    try {
      const attempts = await AsyncStorage.getItem(
        STORAGE_KEYS.FAILED_LOGIN_ATTEMPTS,
      );
      return attempts ? parseInt(attempts, 10) : 0;
    } catch (error) {
      console.error('Error getting failed attempts:', error);
      return 0;
    }
  }

  /**
   * Reset failed login attempts
   */
  static async resetFailedAttempts(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.FAILED_LOGIN_ATTEMPTS);
      await AsyncStorage.removeItem(STORAGE_KEYS.LOCKOUT_TIMESTAMP);
      return true;
    } catch (error) {
      console.error('Error resetting failed attempts:', error);
      return false;
    }
  }

  /**
   * Check if account is locked out
   */
  static async isLockedOut(): Promise<boolean> {
    try {
      const lockoutTimestamp = await AsyncStorage.getItem(
        STORAGE_KEYS.LOCKOUT_TIMESTAMP,
      );
      if (!lockoutTimestamp) {
        return false;
      }

      const lockoutTime = parseInt(lockoutTimestamp, 10);
      const now = Date.now();
      const timeSinceLockout = now - lockoutTime;

      if (timeSinceLockout >= LOCKOUT_DURATION) {
        // Lockout period expired, reset
        await this.resetFailedAttempts();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking lockout status:', error);
      return false;
    }
  }

  /**
   * Get remaining lockout time in seconds
   */
  static async getRemainingLockoutTime(): Promise<number> {
    try {
      const lockoutTimestamp = await AsyncStorage.getItem(
        STORAGE_KEYS.LOCKOUT_TIMESTAMP,
      );
      if (!lockoutTimestamp) {
        return 0;
      }

      const lockoutTime = parseInt(lockoutTimestamp, 10);
      const now = Date.now();
      const timeSinceLockout = now - lockoutTime;
      const remaining = LOCKOUT_DURATION - timeSinceLockout;

      return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
    } catch (error) {
      console.error('Error getting remaining lockout time:', error);
      return 0;
    }
  }

  /**
   * Check if session exists (user is logged in)
   */
  static async hasSession(): Promise<boolean> {
    const credentials = await this.getCredentials();
    const userData = await this.getUserData();
    return credentials !== null && userData !== null;
  }

  /**
   * Clear all stored data (logout)
   */
  static async clearAll(): Promise<boolean> {
    try {
      await this.clearCredentials();
      await this.clearUserData();
      await this.clearPartialRegistration();
      await this.resetFailedAttempts();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }
}

