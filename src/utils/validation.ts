import {FormErrors, RegistrationFormData, LoginFormData} from '../types';

/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Requirements: at least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export const validatePasswordStrength = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber
  );
};

/**
 * Validates phone number format (US format: XXX-XXX-XXXX or (XXX) XXX-XXXX)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\(\)]+$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digitsOnly.length === 10;
};

/**
 * Validates required text field
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validates registration form
 */
export const validateRegistrationForm = (
  data: RegistrationFormData,
): FormErrors => {
  const errors: FormErrors = {};

  // Email validation
  if (!validateRequired(data.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!validateRequired(data.password)) {
    errors.password = 'Password is required';
  } else if (!validatePasswordStrength(data.password)) {
    errors.password =
      'Password must be at least 8 characters with uppercase, lowercase, and number';
  }

  // Confirm password validation
  if (!validateRequired(data.confirmPassword)) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // First name validation
  if (!validateRequired(data.firstName)) {
    errors.firstName = 'First name is required';
  }

  // Last name validation
  if (!validateRequired(data.lastName)) {
    errors.lastName = 'Last name is required';
  }

  // Phone number validation
  if (!validateRequired(data.phoneNumber)) {
    errors.phoneNumber = 'Phone number is required';
  } else if (!validatePhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid phone number';
  }

  return errors;
};

/**
 * Validates login form
 */
export const validateLoginForm = (data: LoginFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!validateRequired(data.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!validateRequired(data.password)) {
    errors.password = 'Password is required';
  }

  return errors;
};

/**
 * Checks if form has any errors
 */
export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

