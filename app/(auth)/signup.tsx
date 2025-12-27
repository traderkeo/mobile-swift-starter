import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

// Only import what we need for icons (which can't use className)
const ICON_COLORS = {
  light: { text: '#11181C', error: '#ef4444' },
  dark: { text: '#ECEDEE', error: '#ef4444' },
};

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const { signUpWithEmail, isLoading } = useAuth();

  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Only used for icons (which require hex values)
  const iconColors = ICON_COLORS[colorScheme];

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      await signUpWithEmail(email, password, fullName || undefined);
    } catch (err) {
      const error = err as { message?: string };
      setErrors({ general: error.message || 'Failed to create account. Please try again.' });
    }
  };

  // Dynamic className helpers
  const inputBorderClass = (hasError: boolean) =>
    hasError ? 'border-danger' : isDark ? 'border-secondary-600' : 'border-secondary-300';

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-1 p-6 justify-center"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-10">
            <Text
              className={`text-[32px] font-bold mb-2 ${isDark ? 'text-foreground-dark' : 'text-foreground'}`}
            >
              Create Account
            </Text>
            <Text
              className={`text-base opacity-70 ${isDark ? 'text-foreground-dark' : 'text-foreground'}`}
            >
              Sign up to get started
            </Text>
          </View>

          <View className="gap-4">
            {/* General error message */}
            {errors.general && (
              <View className="flex-row items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/30">
                <Ionicons name="alert-circle" size={18} color={iconColors.error} />
                <Text className="text-sm text-danger flex-1">{errors.general}</Text>
              </View>
            )}

            {/* Full Name Input (optional - no validation) */}
            <View className="flex-row items-center relative">
              <Ionicons
                name="person-outline"
                size={20}
                color={iconColors.text}
                style={{ position: 'absolute', left: 16, zIndex: 1 }}
              />
              <TextInput
                className={`flex-1 h-14 border rounded-lg text-base px-12 ${isDark ? 'text-foreground-dark' : 'text-foreground'} ${isDark ? 'border-secondary-600' : 'border-secondary-300'}`}
                placeholder="Full Name (optional)"
                placeholderTextColor={isDark ? '#ECEDEE60' : '#11181C60'}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            {/* Email Input */}
            <View>
              <View className="flex-row items-center relative">
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={errors.email ? iconColors.error : iconColors.text}
                  style={{ position: 'absolute', left: 16, zIndex: 1 }}
                />
                <TextInput
                  className={`flex-1 h-14 border rounded-lg text-base px-12 ${isDark ? 'text-foreground-dark' : 'text-foreground'} ${inputBorderClass(!!errors.email)}`}
                  placeholder="Email"
                  placeholderTextColor={isDark ? '#ECEDEE60' : '#11181C60'}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && (
                <Text className="text-sm text-danger mt-1 ml-1">{errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View>
              <View className="flex-row items-center relative">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.password ? iconColors.error : iconColors.text}
                  style={{ position: 'absolute', left: 16, zIndex: 1 }}
                />
                <TextInput
                  className={`flex-1 h-14 border rounded-lg text-base px-12 ${isDark ? 'text-foreground-dark' : 'text-foreground'} ${inputBorderClass(!!errors.password)}`}
                  placeholder="Password"
                  placeholderTextColor={isDark ? '#ECEDEE60' : '#11181C60'}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={iconColors.text}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-sm text-danger mt-1 ml-1">{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View>
              <View className="flex-row items-center relative">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.confirmPassword ? iconColors.error : iconColors.text}
                  style={{ position: 'absolute', left: 16, zIndex: 1 }}
                />
                <TextInput
                  className={`flex-1 h-14 border rounded-lg text-base px-12 ${isDark ? 'text-foreground-dark' : 'text-foreground'} ${inputBorderClass(!!errors.confirmPassword)}`}
                  placeholder="Confirm Password"
                  placeholderTextColor={isDark ? '#ECEDEE60' : '#11181C60'}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4"
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={iconColors.text}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="text-sm text-danger mt-1 ml-1">{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              className={`h-14 rounded-lg justify-center items-center mt-2 bg-primary ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold">Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text
              className={`text-sm ${isDark ? 'text-foreground-dark/80' : 'text-foreground/80'}`}
            >
              Already have an account?{' '}
            </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-semibold text-primary">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
