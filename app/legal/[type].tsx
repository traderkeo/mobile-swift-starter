/**
 * Legal Document Screen
 *
 * Dynamic screen that displays Privacy Policy, Terms of Service, or FAQ
 * based on the route parameter.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  PRIVACY_POLICY,
  TERMS_OF_SERVICE,
  FAQ_CONTENT,
  type LegalDocument,
} from '@/config/legal-content';

type LegalType = 'privacy' | 'terms' | 'faq';

const LEGAL_DOCUMENTS: Record<LegalType, LegalDocument> = {
  privacy: PRIVACY_POLICY,
  terms: TERMS_OF_SERVICE,
  faq: FAQ_CONTENT,
};

export default function LegalScreen() {
  const { type } = useLocalSearchParams<{ type: LegalType }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const document = type ? LEGAL_DOCUMENTS[type as LegalType] : null;

  if (!document) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <View className="flex-1 justify-center items-center p-6">
          <ThemedText className="text-lg text-center">Document not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const backgroundColor = isDark ? '#151718' : '#FFFFFF';
  const sectionBg = isDark ? '#1E2021' : '#F8F9FA';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: document.title,
          headerStyle: { backgroundColor },
          headerTintColor: textColor,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>{document.title}</ThemedText>
          <ThemedText style={[styles.lastUpdated, { color: textColor + '80' }]}>
            Last updated: {document.lastUpdated}
          </ThemedText>
        </View>

        {/* Sections */}
        {document.sections.map((section, index) => (
          <View key={index} style={[styles.section, { backgroundColor: sectionBg }]}>
            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            <ThemedText style={[styles.sectionContent, { color: textColor + 'E0' }]}>
              {section.content}
            </ThemedText>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: textColor + '60' }]}>
            If you have any questions about this document, please contact us through the app
            settings.
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
});
