/**
 * Help & FAQ screen
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LEGAL_URLS } from '@/config/legal-content';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I upgrade to Premium?',
    answer:
      'Go to your Profile and tap on "Subscription" to view available plans and upgrade your account.',
  },
  {
    question: 'How do I restore my purchases?',
    answer:
      'Go to Settings > Restore Purchases. This will restore any previous purchases made with your Apple ID or Google account.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer:
      'Subscriptions are managed through the App Store (iOS) or Google Play Store (Android). Go to your device settings to manage or cancel your subscription.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'Go to Settings > Delete Account. This will permanently remove your account and all associated data.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes, we use industry-standard encryption to protect your data. Your credentials are stored securely on your device.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'You can reach our support team by tapping "Contact Support" below or emailing us directly.',
  },
];

function FAQAccordion({ item, isDark }: { item: FAQItem; isDark: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TouchableOpacity
      className={`border-b ${isDark ? 'border-secondary-700' : 'border-secondary-200'}`}
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between py-4">
        <Text
          className={`flex-1 text-base font-medium pr-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          {item.question}
        </Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={isDark ? '#9ca3af' : '#6b7280'}
        />
      </View>
      {isExpanded && (
        <Text className={`pb-4 text-sm leading-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {item.answer}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function HelpScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleContactSupport = () => {
    Linking.openURL(`mailto:${LEGAL_URLS.support}`);
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
          Help & FAQ
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView className="flex-1">
        {/* FAQ Section */}
        <View className="px-4 pt-6">
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Frequently Asked Questions
          </Text>

          <View
            className={`rounded-xl overflow-hidden ${isDark ? 'bg-secondary-800' : 'bg-white'}`}
          >
            <View className="px-4">
              {FAQ_ITEMS.map((item, index) => (
                <FAQAccordion key={index} item={item} isDark={isDark} />
              ))}
            </View>
          </View>
        </View>

        {/* Contact Section */}
        <View className="px-4 pt-8 pb-8">
          <Text className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Still Need Help?
          </Text>

          <TouchableOpacity
            className={`flex-row items-center p-4 rounded-xl ${isDark ? 'bg-secondary-800' : 'bg-white'}`}
            onPress={handleContactSupport}
          >
            <View
              className={`w-12 h-12 rounded-full items-center justify-center ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}
            >
              <Ionicons name="mail-outline" size={24} color="#0a7ea4" />
            </View>
            <View className="ml-4 flex-1">
              <Text className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Contact Support
              </Text>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                We typically respond within 24 hours
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
          </TouchableOpacity>

          {/* Documentation Link */}
          <TouchableOpacity
            className={`flex-row items-center p-4 rounded-xl mt-3 ${isDark ? 'bg-secondary-800' : 'bg-white'}`}
            onPress={() => Linking.openURL(LEGAL_URLS.privacy)}
          >
            <View
              className={`w-12 h-12 rounded-full items-center justify-center ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}
            >
              <Ionicons name="document-text-outline" size={24} color="#0a7ea4" />
            </View>
            <View className="ml-4 flex-1">
              <Text className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Privacy Policy
              </Text>
              <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Learn how we handle your data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
