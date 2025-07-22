
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const router = useRouter();
  const { signIn, signUp, isLoading } = useAuth();

  const handleAuth = async () => {
    if (isLogin) {
      const result = await signIn(email, password);
      if (result.success) {
        router.replace('/(app)');
      } else {
        Alert.alert('Login Failed', result.error);
      }
    } else {
      const result = await signUp(email, password, displayName);
      if (result.success) {
        router.replace('/(app)');
      } else {
        Alert.alert('Sign-Up Failed', result.error);
      }
    }
  };

  const handleQuickLogin = async (testEmail: string) => {
    const result = await signIn(testEmail, 'password');
    if (result.success) {
      router.replace('/(app)');
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Sign in to continue' : 'Get started with your crew'}
        </Text>

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Display Name"
            placeholderTextColor="#8e8e93"
            value={displayName}
            onChangeText={setDisplayName}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8e8e93"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8e8e93"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={isLoading}>
          <Text style={styles.buttonText}>
            {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
          </Text>
        </TouchableOpacity>

        {isLogin && (
          <View style={styles.quickLoginSection}>
            <Text style={styles.quickLoginTitle}>Quick Login (Dev)</Text>
            <View style={styles.quickLoginButtons}>
              <TouchableOpacity 
                style={styles.quickLoginButton} 
                onPress={() => handleQuickLogin('alice@test.com')}
              >
                <Text style={styles.quickLoginText}>Alice</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickLoginButton} 
                onPress={() => handleQuickLogin('bob@test.com')}
              >
                <Text style={styles.quickLoginText}>Bob</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickLoginButton} 
                onPress={() => handleQuickLogin('charlie@test.com')}
              >
                <Text style={styles.quickLoginText}>Charlie</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickLoginButton} 
                onPress={() => handleQuickLogin('diana@test.com')}
              >
                <Text style={styles.quickLoginText}>Diana</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
          </Text>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.footerLink}>{isLogin ? 'Sign Up' : 'Login'}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.footerLink}>← Back to home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e',
  },
  card: {
    width: '90%',
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8e8e93',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#3a3a3c',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#0e7490',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  footerText: {
    color: '#8e8e93',
    fontSize: 14,
  },
  footerLink: {
    color: '#0e7490',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  backButton: {
    marginTop: 16,
  },
  quickLoginSection: {
    marginTop: 24,
    width: '100%',
  },
  quickLoginTitle: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
    marginBottom: 12,
  },
  quickLoginButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickLoginButton: {
    backgroundColor: '#3a3a3c',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
  },
  quickLoginText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 