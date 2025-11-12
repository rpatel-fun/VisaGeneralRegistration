import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  AccessibilityProps,
} from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  testID?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  testID,
  ...props
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label} accessibilityRole="text">
        {label}
      </Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#999"
        accessibilityLabel={label}
        accessibilityHint={error || props.placeholder}
        {...props}
      />
      {error && (
        <Text
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
    minHeight: 48,
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
});

