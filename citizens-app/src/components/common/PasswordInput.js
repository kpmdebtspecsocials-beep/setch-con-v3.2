import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PasswordInput = ({
  label = 'Password',
  value,
  onChangeText,
  placeholder = 'Enter your password',
  showValidation = false,
  style,
  error,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const validatePassword = (password) => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

  const validation = showValidation ? validatePassword(value || '') : null;

  const ValidationRule = ({ isValid, text }) => (
    <View style={styles.validationRule}>
      <Ionicons
        name={isValid ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={isValid ? '#4CAF50' : '#F44336'}
      />
      <Text style={[styles.validationText, { color: isValid ? '#4CAF50' : '#F44336' }]}>
        {text}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>

      <View style={[
        styles.inputContainer,
        isFocused && styles.focused,
        error && styles.error,
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {showValidation && validation && (
        <View style={styles.validationContainer}>
          <Text style={styles.validationTitle}>Password must contain:</Text>
          <ValidationRule isValid={validation.minLength} text="At least 8 characters" />
          <ValidationRule isValid={validation.hasUppercase} text="One uppercase letter" />
          <ValidationRule isValid={validation.hasLowercase} text="One lowercase letter" />
          <ValidationRule isValid={validation.hasNumber} text="One number" />
          <ValidationRule isValid={validation.hasSpecialChar} text="One special character" />
        </View>
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
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#333' },
  eyeIcon: { padding: 12 },
  errorText: { marginTop: 4, fontSize: 14, color: '#F44336' },
  validationContainer: { marginTop: 8, padding: 12, backgroundColor: '#f8f9fa', borderRadius: 8 },
  validationTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  validationRule: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  validationText: { marginLeft: 8, fontSize: 14 },
});

export default PasswordInput;
