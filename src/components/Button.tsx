import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  AccessibilityProps,
} from 'react-native';

interface ButtonProps extends AccessibilityProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  testID,
  ...accessibilityProps
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        isDisabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{disabled: isDisabled}}
      accessibilityLabel={title}
      testID={testID}
      {...accessibilityProps}>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : '#007AFF'}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'primary'
              ? styles.primaryButtonText
              : styles.secondaryButtonText,
            isDisabled && styles.buttonTextDisabled,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});

