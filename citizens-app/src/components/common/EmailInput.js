import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmailInput = ({
  label = 'Email',
  value,
  onChangeText,
  placeholder = 'Enter your email',
  showValidation = false,
  style,
  error,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [isValid, setIsValid] = useState(true);

  const validateEmail = (email) => {
    if (!email) return { isValid: true, message: '' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { isValid: false, message: 'Please enter a valid email address' };
    return { isValid: true, message: 'Valid email address' };
  };

  useEffect(() => {
    if (showValidation && value) {
      const validation = validateEmail(value);
      setIsValid(validation.isValid);
      setValidationMessage(validation.message);
    } else {
      setValidationMessage('');
      setIsValid(true);
    }
  }, [value, showValidation]);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.focused,
        error && styles.error,
        showValidation && !isValid && value && styles.invalid,
        showValidation && isValid && value && styles.valid,
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {showValidation && value && (
          <Ionicons
            name={isValid ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color={isValid ? '#4CAF50' : '#F44336'}
            style={styles.validationIcon}
          />
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {showValidation && validationMessage && (
        <Text style={[styles.validationText, { color: isValid ? '#4CAF50' : '#F44336' }]}>
          {validationMessage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
  },
  focused: { borderColor: '#2196F3' },
  error: { borderColor: '#F44336' },
  valid: { borderColor: '#4CAF50' },
  invalid: { borderColor: '#F44336' },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#333' },
  validationIcon: { marginLeft: 8 },
  errorText: { marginTop: 4, fontSize: 14, color: '#F44336' },
  validationText: { marginTop: 4, fontSize: 14 },
});

export default EmailInput;
