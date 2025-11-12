import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Container} from '../components/Container';
import {FormInput} from '../components/FormInput';
import {Button} from '../components/Button';
import {useAuth} from '../context/AuthContext';
import {validateLoginForm, hasFormErrors} from '../utils/validation';
import {LoginFormData, FormErrors} from '../types';
import {StorageService} from '../services/storage';

type RootStackParamList = {
  Registration: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {login: loginUser} = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Check lockout status on mount and periodically
  useEffect(() => {
    const checkLockout = async () => {
      const locked = await StorageService.isLockedOut();
      setIsLockedOut(locked);
      if (locked) {
        const time = await StorageService.getRemainingLockoutTime();
        setRemainingTime(time);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    // Validate form
    const validationErrors = validateLoginForm(data);
    if (hasFormErrors(validationErrors)) {
      return;
    }

    // Check lockout before attempting login
    const locked = await StorageService.isLockedOut();
    if (locked) {
      const time = await StorageService.getRemainingLockoutTime();
      setIsLockedOut(true);
      setRemainingTime(time);
      Alert.alert(
        'Account Locked',
        `Too many failed attempts. Please try again in ${Math.ceil(
          time / 60,
        )} minutes.`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginUser(data);
      if (result.success) {
        // Navigation will be handled by auth state change
      } else {
        if (result.lockedOut) {
          setIsLockedOut(true);
          setRemainingTime(result.remainingTime || 0);
          Alert.alert(
            'Account Locked',
            result.error || 'Too many failed attempts',
          );
        } else {
          Alert.alert('Login Failed', result.error || 'Invalid credentials');
        }
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
  };

  const isFormValid = !hasFormErrors(formErrors);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container>
      <View style={styles.header}>
        <Text style={styles.title}>Sign In</Text>
      </View>

      <View style={styles.formContainer}>
        {isLockedOut && (
          <View style={styles.lockoutBanner} accessibilityRole="alert">
            <Text style={styles.lockoutText}>
              Account locked. Try again in {formatTime(remainingTime)}
            </Text>
          </View>
        )}

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
              placeholder="enter your email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!isLockedOut}
              error={formErrors.email}
              testID="login-email-input"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Password is required',
          }}
          render={({field: {onChange, onBlur, value}}) => (
            <FormInput
              label="Password"
              placeholder="enter your password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              editable={!isLockedOut}
              error={formErrors.password}
              testID="login-password-input"
            />
          )}
        />
      </View>

      <View style={styles.footer}>
        <Button
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          disabled={!isFormValid || isSubmitting || isLockedOut}
          loading={isSubmitting}
          testID="login-submit-button"
        />

        <View style={styles.registerLink}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <Text
            style={styles.registerLinkText}
            onPress={() => navigation.navigate('Registration')}
            accessibilityRole="link"
            accessibilityLabel="Register here">
            Register here
          </Text>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  lockoutBanner: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  lockoutText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLinkText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});

