import { Tabs } from 'expo-router';
import React from 'react';

import { CustomTabBar } from '@/components/navigation';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Local tint colors for tab bar (must match tailwind.config.js)
const TINT_COLORS = {
  light: '#0a7ea4',
  dark: '#ffffff',
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: TINT_COLORS[colorScheme ?? 'light'],
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Counter',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="plusminus.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.2.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
