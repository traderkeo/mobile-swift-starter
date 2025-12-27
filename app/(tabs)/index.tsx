/**
 * Counter screen - Simple +/- counter starting at 0
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CounterScreen() {
  const [count, setCount] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
      edges={['top']}
    >
      <View className="flex-1 justify-center items-center px-8">
        <Text className={`text-6xl font-bold mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {count}
        </Text>

        <View className="flex-row gap-6">
          <TouchableOpacity
            onPress={decrement}
            className="w-20 h-20 rounded-full bg-red-500 justify-center items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white text-4xl font-bold">−</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={increment}
            className="w-20 h-20 rounded-full bg-green-500 justify-center items-center"
            activeOpacity={0.7}
          >
            <Text className="text-white text-4xl font-bold">+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
