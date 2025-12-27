/**
 * AI Chat Example Screen
 *
 * This is a complete example of how to use the AI SDK components.
 * You can use this as a template for your own AI-powered screens.
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAIChat } from '@/hooks/use-ai-chat';
import { ChatContainer } from '@/components/ai';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AIChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const tintColor = '#0a7ea4';

  // Initialize the AI chat hook
  const chat = useAIChat({
    // Customize the system prompt for your use case
    system: `You are a helpful AI assistant integrated into a mobile app.
Be concise and friendly in your responses.
If the user asks about features, explain that this is a demo of AI chat capabilities.`,

    // Handle errors gracefully
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  // Custom header for the chat
  const ChatHeader = () => (
    <View
      className="flex-row items-center px-4 py-3 border-b"
      style={{ borderBottomColor: textColor + '10' }}
    >
      <View
        className="w-10 h-10 rounded-full justify-center items-center mr-3"
        style={{ backgroundColor: tintColor + '15' }}
      >
        <Ionicons name="sparkles" size={20} color={tintColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold" style={{ color: textColor }}>
          AI Assistant
        </Text>
        <Text className="text-[13px] mt-0.5" style={{ color: textColor + '60' }}>
          Powered by AI SDK
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}
      edges={['bottom']}
    >
      <Stack.Screen
        options={{
          title: 'AI Chat',
          headerShown: true,
        }}
      />

      <ChatContainer
        messages={chat.messages}
        input={chat.input}
        onInputChange={chat.setInput}
        onSend={() => chat.sendMessage()}
        isLoading={chat.isLoading}
        isStreaming={chat.isStreaming}
        onStop={chat.stop}
        onClear={() => chat.setMessages([])}
        placeholder="Ask me anything..."
        header={<ChatHeader />}
      />
    </SafeAreaView>
  );
}
