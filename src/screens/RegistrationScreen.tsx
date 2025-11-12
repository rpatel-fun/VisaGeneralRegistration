import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Container} from '../components/Container';
import {FormInput} from '../components/FormInput';
import {Button} from '../components/Button';
import {useAuth} from '../context/AuthContext';
import {hasFormErrors, validateRegistrationForm} from '../utils/validation';
import {RegistrationFormData, FormErrors} from '../types';
import {StorageService} from '../services/storage';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {register: registerUser} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: {errors},
  } = useForm<RegistrationFormData>({
    mode: 'onTouched',
    reValidateMode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
  });

  // Load partial registration data on mount
  useEffect(() => {
    const loadPartialData = async () => {
      const partialData = await StorageService.getPartialRegistration();
      if (partialData) {
        if (partialData.email) setValue('email', partialData.email);
        if (partialData.firstName) setValue('firstName', partialData.firstName);
        if (partialData.lastName) setValue('lastName', partialData.lastName);
        if (partialData.phoneNumber)
          setValue('phoneNumber', partialData.phoneNumber);
      }
    };
    loadPartialData();
  }, [setValue]);

  // Save partial registration data on change
  useEffect(() => {
    const subscription = watch((data) => {
      // Don't save passwords
      const partialData: Partial<RegistrationFormData> = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      };
      StorageService.storePartialRegistration(partialData);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: RegistrationFormData) => {
    // Validate form
    const validationErrors = validateRegistrationForm(data);
    if (hasFormErrors(validationErrors)) {
      // React Hook Form will handle displaying errors
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await registerUser(data);
      if (result.success) {
        // Clear partial registration data
        await StorageService.clearPartialRegistration();
        // Navigation will be handled by auth state change
      } else {
        Alert.alert('Registration Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formErrors: FormErrors = {
    email: errors.email?.message,
    password: errors.password?.message,
    confirmPassword: errors.confirmPassword?.message,
    firstName: errors.firstName?.message,
    lastName: errors.lastName?.message,
    phoneNumber: errors.phoneNumber?.message,
  };

  const isFormValid = !hasFormErrors(formErrors);
  console.log(formErrors, isFormValid);

  return (
    <Container>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Account setup</Text>
        </View>

        <View style={styles.formContainer}>
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            validate: (value: string) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(value) || 'Please enter a valid email';
            },
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <FormInput
              label="Email address"
              placeholder="enter a email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              error={formErrors.email}
              testID="registration-email-input"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Password is required',
            validate: (value: string) => {
              const minLength = 8;
              const hasUpperCase = /[A-Z]/.test(value);
              const hasLowerCase = /[a-z]/.test(value);
              const hasNumber = /\d/.test(value);
              if (
                value.length < minLength ||
                !hasUpperCase ||
                !hasLowerCase ||
                !hasNumber
              ) {
                return 'Password must be at least 8 characters with uppercase, lowercase, and number';
              }
              return true;
            },
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <FormInput
              label="Password"
              placeholder="enter a password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              error={formErrors.password}
              testID="registration-password-input"
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: 'Please confirm your password',
            validate: (value: string) => {
              const password = watch('password');
              return value === password || 'Passwords do not match';
            },
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <FormInput
              label="Confirm Password"
              placeholder="confirm your password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              error={formErrors.confirmPassword}
              testID="registration-confirm-password-input"
            />
          )}
        />

        <Controller
          control={control}
          name="firstName"
          rules={{
            required: 'First name is required',
            validate: (value: string) => value.trim().length > 0 || 'First name is required',
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <FormInput
              label="First name"
              placeholder="enter your first name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              autoComplete="given-name"
              textContentType="givenName"
              error={formErrors.firstName}
              testID="registration-first-name-input"
            />
          )}
        />

        <Controller
          control={control}
          name="lastName"
          rules={{
            required: 'Last name is required',
            validate: (value: string) => value.trim().length > 0 || 'Last name is required',
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <FormInput
              label="Last Name"
              placeholder="enter your last name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              autoComplete="family-name"
              textContentType="familyName"
              error={formErrors.lastName}
              testID="registration-last-name-input"
            />
          )}
        />

        <Controller
          control={control}
          name="phoneNumber"
          rules={{
            required: 'Phone number is required',
            validate: (value: string) => {
              const phoneRegex = /^[\d\s\-\(\)]+$/;
              const digitsOnly = value.replace(/\D/g, '');
              return (
                (phoneRegex.test(value) && digitsOnly.length === 10) ||
                'Please enter a valid phone number'
              );
            },
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <FormInput
              label="Phone number"
              placeholder="enter a phone number"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              error={formErrors.phoneNumber}
              testID="registration-phone-input"
            />
          )}
        />

        <View style={styles.signInLink}>
          <Text style={styles.signInText}>Already registered? </Text>
          <Text
            style={styles.signInLinkText}
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="link"
            accessibilityLabel="Sign in here">
            Sign in here
          </Text>
        </View>
      </View>

        <View style={styles.footer}>
          <Button
            title="SAVE & START"
            onPress={handleSubmit(onSubmit)}
            disabled={!isFormValid || isSubmitting}
            loading={isSubmitting}
            testID="registration-submit-button"
          />
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textTransform: 'uppercase',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  signInLink: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  signInText: {
    fontSize: 14,
    color: '#666',
  },
  signInLinkText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    marginTop: 16,
    paddingBottom: 20,
  },
});

