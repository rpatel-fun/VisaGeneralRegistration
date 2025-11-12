import {
  validateEmail,
  validatePasswordStrength,
  validatePhoneNumber,
  validateRequired,
  validateRegistrationForm,
  validateLoginForm,
  hasFormErrors,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should return true for strong passwords', () => {
      expect(validatePasswordStrength('Password123')).toBe(true);
      expect(validatePasswordStrength('MyP@ssw0rd')).toBe(true);
      expect(validatePasswordStrength('Test1234')).toBe(true);
    });

    it('should return false for weak passwords', () => {
      expect(validatePasswordStrength('short')).toBe(false);
      expect(validatePasswordStrength('nouppercase123')).toBe(false);
      expect(validatePasswordStrength('NOLOWERCASE123')).toBe(false);
      expect(validatePasswordStrength('NoNumbers')).toBe(false);
      expect(validatePasswordStrength('')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should return true for valid phone numbers', () => {
      expect(validatePhoneNumber('1234567890')).toBe(true);
      expect(validatePhoneNumber('123-456-7890')).toBe(true);
      expect(validatePhoneNumber('(123) 456-7890')).toBe(true);
      expect(validatePhoneNumber('123 456 7890')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(false);
      expect(validatePhoneNumber('12345678901')).toBe(false); // 11 digits
      expect(validatePhoneNumber('abc1234567')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should return true for non-empty strings', () => {
      expect(validateRequired('test')).toBe(true);
      expect(validateRequired('  test  ')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
    });
  });

  describe('validateRegistrationForm', () => {
    it('should return no errors for valid form data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      const errors = validateRegistrationForm(validData);
      expect(hasFormErrors(errors)).toBe(false);
    });

    it('should return errors for invalid form data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'weak',
        confirmPassword: 'different',
        firstName: '',
        lastName: '',
        phoneNumber: '123',
      };

      const errors = validateRegistrationForm(invalidData);
      expect(hasFormErrors(errors)).toBe(true);
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
      expect(errors.confirmPassword).toBeDefined();
      expect(errors.firstName).toBeDefined();
      expect(errors.lastName).toBeDefined();
      expect(errors.phoneNumber).toBeDefined();
    });

    it('should validate password mismatch', () => {
      const data = {
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password456',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
      };

      const errors = validateRegistrationForm(data);
      expect(errors.confirmPassword).toBe('Passwords do not match');
    });
  });

  describe('validateLoginForm', () => {
    it('should return no errors for valid form data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const errors = validateLoginForm(validData);
      expect(hasFormErrors(errors)).toBe(false);
    });

    it('should return errors for invalid form data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: '',
      };

      const errors = validateLoginForm(invalidData);
      expect(hasFormErrors(errors)).toBe(true);
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    });
  });

  describe('hasFormErrors', () => {
    it('should return true when errors exist', () => {
      const errors = {email: 'Invalid email'};
      expect(hasFormErrors(errors)).toBe(true);
    });

    it('should return false when no errors exist', () => {
      const errors = {};
      expect(hasFormErrors(errors)).toBe(false);
    });
  });
});

