import {AuthService} from '../auth';
import {StorageService} from '../storage';

// Mock the storage service
jest.mock('../storage');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
    };

    it('should successfully register a new user', async () => {
      (StorageService.getCredentials as jest.MockedFunction<typeof StorageService.getCredentials>).mockResolvedValue(null);
      (StorageService.storeCredentials as jest.MockedFunction<typeof StorageService.storeCredentials>).mockResolvedValue(true);
      (StorageService.storeUserData as jest.MockedFunction<typeof StorageService.storeUserData>).mockResolvedValue(true);
      (StorageService.clearPartialRegistration as jest.MockedFunction<typeof StorageService.clearPartialRegistration>).mockResolvedValue(true);

      const result = await AuthService.register(validRegistrationData);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(validRegistrationData.email);
      expect(StorageService.storeCredentials).toHaveBeenCalledWith(
        validRegistrationData.email,
        validRegistrationData.password,
      );
      expect(StorageService.storeUserData).toHaveBeenCalled();
    });

    it('should fail if user already exists', async () => {
      (StorageService.getCredentials as jest.MockedFunction<typeof StorageService.getCredentials>).mockResolvedValue({
        email: 'test@example.com',
        password: 'Password123',
      });

      const result = await AuthService.register(validRegistrationData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should fail if credential storage fails', async () => {
      (StorageService.getCredentials as jest.MockedFunction<typeof StorageService.getCredentials>).mockResolvedValue(null);
      (StorageService.storeCredentials as jest.MockedFunction<typeof StorageService.storeCredentials>).mockResolvedValue(false);

      const result = await AuthService.register(validRegistrationData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to store credentials');
    });
  });

  describe('login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'Password123',
    };

    const mockUser = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
    };

    it('should successfully login with valid credentials', async () => {
      (StorageService.isLockedOut as jest.MockedFunction<typeof StorageService.isLockedOut>).mockResolvedValue(false);
      (StorageService.getCredentials as jest.MockedFunction<typeof StorageService.getCredentials>).mockResolvedValue({
        email: 'test@example.com',
        password: 'Password123',
      });
      (StorageService.getUserData as jest.MockedFunction<typeof StorageService.getUserData>).mockResolvedValue(mockUser);
      (StorageService.resetFailedAttempts as jest.MockedFunction<typeof StorageService.resetFailedAttempts>).mockResolvedValue(true);

      const result = await AuthService.login(validLoginData);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(StorageService.resetFailedAttempts).toHaveBeenCalled();
    });

    it('should fail if account is locked out', async () => {
      (StorageService.isLockedOut as jest.MockedFunction<typeof StorageService.isLockedOut>).mockResolvedValue(true);
      (StorageService.getRemainingLockoutTime as jest.MockedFunction<typeof StorageService.getRemainingLockoutTime>).mockResolvedValue(900);

      const result = await AuthService.login(validLoginData);

      expect(result.success).toBe(false);
      expect(result.lockedOut).toBe(true);
      expect(result.remainingTime).toBe(900);
    });

    it('should fail with invalid credentials', async () => {
      (StorageService.isLockedOut as jest.MockedFunction<typeof StorageService.isLockedOut>).mockResolvedValue(false);
      (StorageService.getCredentials as jest.MockedFunction<typeof StorageService.getCredentials>).mockResolvedValue({
        email: 'test@example.com',
        password: 'WrongPassword',
      });
      (StorageService.incrementFailedAttempts as jest.MockedFunction<typeof StorageService.incrementFailedAttempts>).mockResolvedValue(1);
      (StorageService.isLockedOut as jest.MockedFunction<typeof StorageService.isLockedOut>).mockResolvedValueOnce(false).mockResolvedValueOnce(false);

      const result = await AuthService.login(validLoginData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email or password');
      expect(StorageService.incrementFailedAttempts).toHaveBeenCalled();
    });

    it('should lock account after max failed attempts', async () => {
      (StorageService.isLockedOut as jest.MockedFunction<typeof StorageService.isLockedOut>).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
      (StorageService.getCredentials as jest.MockedFunction<typeof StorageService.getCredentials>).mockResolvedValue({
        email: 'test@example.com',
        password: 'WrongPassword',
      });
      (StorageService.incrementFailedAttempts as jest.MockedFunction<typeof StorageService.incrementFailedAttempts>).mockResolvedValue(5);
      (StorageService.getRemainingLockoutTime as jest.MockedFunction<typeof StorageService.getRemainingLockoutTime>).mockResolvedValue(900);

      const result = await AuthService.login(validLoginData);

      expect(result.success).toBe(false);
      expect(result.lockedOut).toBe(true);
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      (StorageService.clearAll as jest.MockedFunction<typeof StorageService.clearAll>).mockResolvedValue(true);

      const result = await AuthService.logout();

      expect(result).toBe(true);
      expect(StorageService.clearAll).toHaveBeenCalled();
    });
  });

  describe('checkAuth', () => {
    it('should return authenticated state when session exists', async () => {
      const mockUser = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      (StorageService.hasSession as jest.MockedFunction<typeof StorageService.hasSession>).mockResolvedValue(true);
      (StorageService.getUserData as jest.MockedFunction<typeof StorageService.getUserData>).mockResolvedValue(mockUser);

      const result = await AuthService.checkAuth();

      expect(result.isAuthenticated).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should return unauthenticated state when no session exists', async () => {
      (StorageService.hasSession as jest.MockedFunction<typeof StorageService.hasSession>).mockResolvedValue(false);

      const result = await AuthService.checkAuth();

      expect(result.isAuthenticated).toBe(false);
    });
  });
});

