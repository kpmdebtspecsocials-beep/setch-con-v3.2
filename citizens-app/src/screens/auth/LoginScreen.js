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
import EmailInput from '../../components/common/EmailInput';
import PasswordInput from '../../components/common/PasswordInput';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
      // Navigation will be handled by the auth state change
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to report issues in your community
            </Text>
          </View>

          <View style={styles.form}>
            <EmailInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              showValidation={false}
            />

            <PasswordInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              showValidation={false}
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <Button
              title="Don't have an account? Sign Up"
              onPress={navigateToSignup}
              variant="secondary"
              style={styles.signupButton}
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
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  signupButton: {
    marginTop: 8,
  },
});

export default LoginScreen;