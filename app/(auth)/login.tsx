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
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

// Only import what we need for icons (which can't use className)
const ICON_COLORS = {
  light: { text: '#11181C', error: '#ef4444' },
  dark: { text: '#ECEDEE', error: '#ef4444' },
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const { signInWithEmail, signInWithApple, isLoading } = useAuth();

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      await signInWithEmail(email, password);
    } catch (err) {
      const error = err as { message?: string };
      setErrors({ general: error.message || 'Invalid email or password' });
    }
  };

  const handleAppleSignIn = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      await signInWithApple({
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
      });
    } catch (err) {
      const error = err as { code?: string; message?: string };
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        setErrors({ general: error.message || 'Apple Sign In failed' });
      }
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
              Welcome Back
            </Text>
            <Text
              className={`text-base opacity-70 ${isDark ? 'text-foreground-dark' : 'text-foreground'}`}
            >
              Sign in to continue
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

            <TouchableOpacity
              className={`h-14 rounded-lg justify-center items-center mt-2 bg-primary ${isLoading ? 'opacity-50' : ''}`}
              onPress={handleEmailLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-semibold">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mt-4">
              <View className={`flex-1 h-px ${isDark ? 'bg-secondary-600' : 'bg-secondary-300'}`} />
              <Text
                className={`mx-4 text-sm ${isDark ? 'text-foreground-dark/50' : 'text-foreground/50'}`}
              >
                or
              </Text>
              <View className={`flex-1 h-px ${isDark ? 'bg-secondary-600' : 'bg-secondary-300'}`} />
            </View>

            {/* Apple Sign In */}
            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={
                  isDark
                    ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                    : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={8}
                style={{ height: 56, width: '100%' }}
                onPress={handleAppleSignIn}
              />
            )}
          </View>

          <View className="flex-row justify-center mt-8">
            <Text
              className={`text-sm ${isDark ? 'text-foreground-dark/80' : 'text-foreground/80'}`}
            >
              {"Don't have an account? "}
            </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-semibold text-primary">Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
