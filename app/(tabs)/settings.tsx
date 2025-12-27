/**
 * Settings screen with app preferences, account management, and support
 */

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRevenueCat } from '@/hooks/use-revenuecat';
import { LEGAL_URLS } from '@/config/product';

// Local color constants for icons and switch (match tailwind.config.js)
const ICON_COLORS = {
  light: { muted: '#687076' },
  dark: { muted: '#9BA1A6' },
};

const STATUS_COLORS = {
  primary: '#0a7ea4',
  primaryLight: '#38bdf8', // primary-400
  danger: '#ef4444',
  secondary200: '#e5e7eb',
};

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
};

function SettingItem({ icon, title, subtitle, onPress, rightElement, danger }: SettingItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const iconColors = ICON_COLORS[colorScheme];

  return (
    <TouchableOpacity
      className="flex-row items-center p-3.5"
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View
        className={`w-9 h-9 rounded-lg justify-center items-center mr-3 ${
          danger ? 'bg-danger/15' : 'bg-primary/15'
        }`}
      >
        <Ionicons
          name={icon}
          size={20}
          color={danger ? STATUS_COLORS.danger : STATUS_COLORS.primary}
        />
      </View>
      <View className="flex-1">
        <ThemedText className={`text-base font-medium ${danger ? 'text-danger' : ''}`}>
          {title}
        </ThemedText>
        {subtitle && <ThemedText className="text-[13px] mt-0.5 opacity-60">{subtitle}</ThemedText>}
      </View>
      {rightElement ||
        (onPress && <Ionicons name="chevron-forward" size={20} color={iconColors.muted} />)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, deleteAccount } = useAuth();
  const { restorePurchases } = useRevenueCat();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode || '1';

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
  };

  const handleContactSupport = () => {
    Linking.openURL(`${LEGAL_URLS.support}?subject=Support Request`);
  };

  const handlePrivacyPolicy = () => {
    router.push('/legal/privacy');
  };

  const handleTermsOfService = () => {
    router.push('/legal/terms');
  };

  const handleFAQ = () => {
    router.push('/account/help');
  };

  const handleManageSubscription = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL(LEGAL_URLS.manageSubscriptions);
    } else {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  const handleRestorePurchases = async () => {
    Alert.alert(
      'Restore Purchases',
      'This will restore any previous purchases associated with your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            const success = await restorePurchases();
            if (success) {
              Alert.alert('Success', 'Your purchases have been restored.');
            } else {
              Alert.alert('No Purchases Found', 'No previous purchases were found to restore.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your local data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch {
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        {/* Header */}
        <View className="mb-6">
          <ThemedText className="text-[32px] font-bold">Settings</ThemedText>
        </View>

        {/* Preferences Section */}
        <View className="mb-6">
          <ThemedText className="text-xs font-semibold mb-2 ml-1 opacity-60 tracking-wide">
            PREFERENCES
          </ThemedText>
          <View className="border border-border dark:border-border-dark rounded-lg overflow-hidden">
            <SettingItem
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Receive updates about your subscription"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{
                    false: STATUS_COLORS.secondary200,
                    true: STATUS_COLORS.primaryLight,
                  }}
                  thumbColor={notificationsEnabled ? STATUS_COLORS.primary : '#f4f3f4'}
                />
              }
            />
            <View className="h-px ml-[62px] bg-border/50 dark:bg-border-dark/50" />
            <SettingItem
              icon={colorScheme === 'dark' ? 'moon-outline' : 'sunny-outline'}
              title="Appearance"
              subtitle={colorScheme === 'dark' ? 'Dark mode' : 'Light mode'}
            />
          </View>
        </View>

        {/* Subscription Section */}
        <View className="mb-6">
          <ThemedText className="text-xs font-semibold mb-2 ml-1 opacity-60 tracking-wide">
            SUBSCRIPTION
          </ThemedText>
          <View className="border border-border dark:border-border-dark rounded-lg overflow-hidden">
            <SettingItem
              icon="card-outline"
              title="Manage Subscription"
              subtitle={
                Platform.OS === 'ios'
                  ? 'View, modify, or cancel in App Store'
                  : 'View, modify, or cancel subscription'
              }
              onPress={handleManageSubscription}
            />
            <View className="h-px ml-[62px] bg-border/50 dark:bg-border-dark/50" />
            <SettingItem
              icon="refresh-outline"
              title="Restore Purchases"
              subtitle="Restore previous purchases"
              onPress={handleRestorePurchases}
            />
          </View>
        </View>

        {/* Support Section */}
        <View className="mb-6">
          <ThemedText className="text-xs font-semibold mb-2 ml-1 opacity-60 tracking-wide">
            SUPPORT
          </ThemedText>
          <View className="border border-border dark:border-border-dark rounded-lg overflow-hidden">
            <SettingItem
              icon="mail-outline"
              title="Contact Support"
              subtitle="Get help with your account"
              onPress={handleContactSupport}
            />
            <View className="h-px ml-[62px] bg-border/50 dark:bg-border-dark/50" />
            <SettingItem
              icon="help-circle-outline"
              title="FAQ"
              subtitle="Frequently asked questions"
              onPress={handleFAQ}
            />
          </View>
        </View>

        {/* Legal Section */}
        <View className="mb-6">
          <ThemedText className="text-xs font-semibold mb-2 ml-1 opacity-60 tracking-wide">
            LEGAL
          </ThemedText>
          <View className="border border-border dark:border-border-dark rounded-lg overflow-hidden">
            <SettingItem
              icon="document-text-outline"
              title="Privacy Policy"
              onPress={handlePrivacyPolicy}
            />
            <View className="h-px ml-[62px] bg-border/50 dark:bg-border-dark/50" />
            <SettingItem
              icon="shield-checkmark-outline"
              title="Terms of Service"
              onPress={handleTermsOfService}
            />
          </View>
        </View>

        {/* Account Section */}
        <View className="mb-6">
          <ThemedText className="text-xs font-semibold mb-2 ml-1 opacity-60 tracking-wide">
            ACCOUNT
          </ThemedText>
          <View className="border border-border dark:border-border-dark rounded-lg overflow-hidden">
            <SettingItem
              icon="person-outline"
              title="Edit Profile"
              subtitle={user?.email || 'Not signed in'}
              onPress={() => router.push('/account/edit-profile')}
            />
            <View className="h-px ml-[62px] bg-border/50 dark:bg-border-dark/50" />
            <SettingItem
              icon="lock-closed-outline"
              title="Change Password"
              subtitle="Update your password"
              onPress={() => router.push('/account/change-password')}
            />
            <View className="h-px ml-[62px] bg-border/50 dark:bg-border-dark/50" />
            {isDeleting ? (
              <View className="flex-row items-center p-3.5">
                <ActivityIndicator color={STATUS_COLORS.danger} />
                <ThemedText className="text-base font-medium ml-3">Deleting account...</ThemedText>
              </View>
            ) : (
              <SettingItem
                icon="trash-outline"
                title="Delete Account"
                subtitle="Permanently delete your account and data"
                onPress={handleDeleteAccount}
                danger
              />
            )}
          </View>
        </View>

        {/* App Info */}
        <View className="items-center mt-4">
          <ThemedText className="text-[13px] opacity-40">
            Version {appVersion} ({buildNumber})
          </ThemedText>
          <ThemedText className="text-xs mt-1 opacity-30">Made with Expo + RevenueCat</ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
