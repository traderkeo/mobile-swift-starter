/**
 * Edit Profile screen - Update name and avatar
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = async () => {
    if (!hasChanges) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await updateProfile({ fullName: fullName.trim() || undefined });
      router.back();
    } catch {
      // Error is handled in AuthContext
    }
  };

  const handleNameChange = (text: string) => {
    setFullName(text);
    setHasChanges(text.trim() !== (user?.fullName || ''));
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-secondary-200 dark:border-secondary-700">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Edit Profile
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges || isLoading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#0a7ea4" />
          ) : (
            <Text
              className={`text-base font-semibold ${hasChanges ? 'text-primary' : 'text-gray-400'}`}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Avatar Section */}
        <View className="items-center mb-8">
          <View
            className={`w-24 h-24 rounded-full items-center justify-center ${isDark ? 'bg-secondary-700' : 'bg-secondary-200'}`}
          >
            <Ionicons name="person" size={48} color={isDark ? '#9ca3af' : '#6b7280'} />
          </View>
          <TouchableOpacity
            className="mt-3"
            onPress={() => Alert.alert('Coming Soon', 'Avatar upload will be available soon.')}
          >
            <Text className="text-primary font-medium">Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="gap-4">
          {/* Full Name */}
          <View>
            <Text
              className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Full Name
            </Text>
            <TextInput
              className={`h-12 px-4 rounded-lg border ${isDark ? 'border-secondary-600 text-white' : 'border-secondary-300 text-gray-900'}`}
              placeholder="Enter your name"
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              value={fullName}
              onChangeText={handleNameChange}
              autoCapitalize="words"
            />
          </View>

          {/* Email (read-only) */}
          <View>
            <Text
              className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Email
            </Text>
            <View
              className={`h-12 px-4 rounded-lg border justify-center ${isDark ? 'border-secondary-600 bg-secondary-800' : 'border-secondary-300 bg-secondary-100'}`}
            >
              <Text className={isDark ? 'text-gray-400' : 'text-gray-500'}>{user?.email}</Text>
            </View>
            <Text className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Email cannot be changed
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
