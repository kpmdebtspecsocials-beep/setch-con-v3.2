import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/common/Input';
import EmailInput from '../../components/common/EmailInput';
import PasswordInput from '../../components/common/PasswordInput';
import AddressInput from '../../components/common/AddressInput';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    lat: null,
    lng: null,
    municipality_id: null,
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressSelect = (addressData) => {
    setFormData(prev => ({
      ...prev,
      address: addressData.address,
      lat: addressData.lat,
      lng: addressData.lng,
      municipality_id: addressData.municipality_id,
    }));
  };

  const validatePassword = (password) => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    const passwordValidation = validatePassword(password);
    if (!Object.values(passwordValidation).every(Boolean)) {
      Alert.alert('Error', 'Please ensure your password meets all requirements');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const isFormValid = () => {
    const { name, email, password, confirmPassword } = formData;
    
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return false;
    }
    
    if (!validateEmail(email)) {
      return false;
    }
    
    const passwordValidation = validatePassword(password);
    if (!Object.values(passwordValidation).every(Boolean)) {
      return false;
    }
    
    if (password !== confirmPassword) {
      return false;
    }
    
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'citizen',
        home_address: formData.address || undefined,
        lat: formData.lat,
        lng: formData.lng,
        municipality_id: formData.municipality_id,
      };

      await signUp(userData);
      Alert.alert(
        'Success',
        'Account created successfully! Please sign in.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Join Setshaba Connect</Text>
            <Text style={styles.subtitle}>
              Create an account to start reporting community issues
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="Enter your full name"
            />

            <EmailInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Enter your email"
              showValidation={true}
            />

            <PasswordInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              placeholder="Create a password"
              showValidation={true}
            />

            <PasswordInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              placeholder="Confirm your password"
              showValidation={false}
            />

            <AddressInput
              label="Home Address"
              value={formData.address}
              onAddressSelect={handleAddressSelect}
              placeholder="Enter your home address"
              showGPSOption={true}
              required={false}
            />

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              disabled={!isFormValid()}
              style={styles.signupButton}
            />

            <Button
              title="Already have an account? Sign In"
              onPress={navigateToLogin}
              variant="secondary"
              style={styles.loginButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
  },
});

export default SignupScreen;