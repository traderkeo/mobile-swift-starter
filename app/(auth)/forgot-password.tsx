import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const tintColor = '#0a7ea4';

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
      <View className="flex-1 p-6">
        <TouchableOpacity className="mb-6" onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>

        <View className="flex-1 justify-center items-center px-4">
          <View
            className="w-24 h-24 rounded-full justify-center items-center mb-6"
            style={{ backgroundColor: tintColor + '20' }}
          >
            <Ionicons name="lock-closed-outline" size={48} color={tintColor} />
          </View>

          <Text className="text-2xl font-bold mb-3 text-center" style={{ color: textColor }}>
            Password Recovery
          </Text>

          <Text
            className="text-base text-center mb-8 leading-6"
            style={{ color: textColor + '80' }}
          >
            This app uses local authentication stored on your device. Password recovery via email is
            not available.
          </Text>

          <View className="w-full gap-4">
            <View
              className="p-4 rounded-lg"
              style={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }}
            >
              <Text className="font-semibold mb-2" style={{ color: textColor }}>
                If you remember your password:
              </Text>
              <Text style={{ color: textColor + '80' }}>
                Go back and try signing in again. Make sure you are using the correct email and
                password.
              </Text>
            </View>

            <View
              className="p-4 rounded-lg"
              style={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }}
            >
              <Text className="font-semibold mb-2" style={{ color: textColor }}>
                If you forgot your password:
              </Text>
              <Text style={{ color: textColor + '80' }}>
                You will need to create a new account. Your app data is stored locally on this
                device. If you have an active subscription, you can restore it after creating a new
                account.
              </Text>
            </View>
          </View>

          <View className="w-full mt-8 gap-3">
            <TouchableOpacity
              className="h-14 rounded-lg justify-center items-center"
              style={{ backgroundColor: tintColor }}
              onPress={() => router.replace('/(auth)/login')}
            >
              <Text className="text-white text-base font-semibold">Back to Sign In</Text>
            </TouchableOpacity>

            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity
                className="h-14 rounded-lg justify-center items-center border"
                style={{ borderColor: tintColor }}
              >
                <Text className="text-base font-semibold" style={{ color: tintColor }}>
                  Create New Account
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
