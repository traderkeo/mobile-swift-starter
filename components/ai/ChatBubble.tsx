/**
 * ChatBubble - Displays a single chat message with NativeWind styling
 *
 * @example
 * ```tsx
 * <ChatBubble
 *   role="user"
 *   content="Hello, how can you help me?"
 * />
 * <ChatBubble
 *   role="assistant"
 *   content="I'm here to help! What would you like to know?"
 *   isStreaming={true}
 * />
 * ```
 */

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';

export interface ChatBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
  timestamp?: Date;
  className?: string;
}

export function ChatBubble({
  role,
  content,
  isStreaming = false,
  timestamp,
  className = '',
}: ChatBubbleProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isUser = role === 'user';
  const isSystem = role === 'system';

  // Don't render system messages in the UI by default
  if (isSystem) {
    return null;
  }

  const tintColor = '#0a7ea4';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  return (
    <View
      className={`flex-row my-1 px-3 items-end ${
        isUser ? 'justify-end' : 'justify-start'
      } ${className}`}
    >
      {/* Avatar for assistant */}
      {!isUser && (
        <View
          className="w-7 h-7 rounded-full justify-center items-center mx-2"
          style={{ backgroundColor: tintColor + '20' }}
        >
          <Ionicons name="sparkles" size={16} color={tintColor} />
        </View>
      )}

      <View
        className={`max-w-[75%] px-3.5 py-2.5 rounded-[18px] ${
          isUser ? 'rounded-br-[4px] bg-primary' : 'rounded-bl-[4px]'
        }`}
        style={!isUser ? { backgroundColor: textColor + '10' } : undefined}
      >
        <Text className="text-[15px] leading-[21px]" style={{ color: isUser ? '#fff' : textColor }}>
          {content}
          {isStreaming && <Text className="opacity-50">|</Text>}
        </Text>

        {/* Streaming indicator */}
        {isStreaming && !content && (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator size="small" color={isUser ? '#fff' : textColor} />
            <Text className="text-[13px] italic" style={{ color: isUser ? '#fff' : textColor }}>
              Thinking...
            </Text>
          </View>
        )}

        {/* Timestamp */}
        {timestamp && (
          <Text
            className="text-[10px] mt-1 self-end"
            style={{ color: (isUser ? '#fff' : textColor) + '60' }}
          >
            {timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </View>

      {/* Avatar for user */}
      {isUser && (
        <View className="w-7 h-7 rounded-full justify-center items-center mx-2 bg-primary">
          <Ionicons name="person" size={16} color="#fff" />
        </View>
      )}
    </View>
  );
}
