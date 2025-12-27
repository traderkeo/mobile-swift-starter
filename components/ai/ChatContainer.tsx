/**
 * ChatContainer - Complete chat interface with NativeWind styling
 *
 * @example
 * ```tsx
 * import { useAIChat } from '@/hooks/use-ai-chat';
 * import { ChatContainer } from '@/components/ai';
 *
 * function ChatScreen() {
 *   const chat = useAIChat({
 *     system: 'You are a helpful assistant.',
 *   });
 *
 *   return (
 *     <ChatContainer
 *       messages={chat.messages}
 *       input={chat.input}
 *       onInputChange={chat.setInput}
 *       onSend={() => chat.sendMessage()}
 *       isLoading={chat.isLoading}
 *       isStreaming={chat.isStreaming}
 *       onStop={chat.stop}
 *     />
 *   );
 * }
 * ```
 */

import React, { useRef, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { Ionicons } from '@expo/vector-icons';

// Message type compatible with @ai-sdk/react
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

export interface ChatContainerProps {
  messages: Message[];
  input: string;
  onInputChange: (text: string) => void;
  onSend: () => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
  placeholder?: string;
  emptyState?: React.ReactNode;
  header?: React.ReactNode;
  showTimestamps?: boolean;
  onClear?: () => void;
  className?: string;
}

export function ChatContainer({
  messages,
  input,
  onInputChange,
  onSend,
  isLoading = false,
  isStreaming = false,
  onStop,
  placeholder,
  emptyState,
  header,
  showTimestamps = false,
  onClear,
  className = '',
}: ChatContainerProps) {
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const tintColor = '#0a7ea4';

  // Auto-scroll to bottom when new messages arrive
  const lastMessageContent = messages[messages.length - 1]?.content;
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, lastMessageContent]);

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isLast = index === messages.length - 1;
    const isAssistantStreaming = isLast && isStreaming && item.role === 'assistant';

    return (
      <ChatBubble
        role={item.role as 'user' | 'assistant' | 'system'}
        content={item.content}
        isStreaming={isAssistantStreaming}
        timestamp={showTimestamps ? new Date(item.createdAt || Date.now()) : undefined}
      />
    );
  };

  const renderEmptyState = () => {
    if (emptyState) {
      return <>{emptyState}</>;
    }

    return (
      <View className="items-center justify-center px-10">
        <View
          className="w-20 h-20 rounded-full justify-center items-center mb-4"
          style={{ backgroundColor: tintColor + '15' }}
        >
          <Ionicons name="chatbubbles-outline" size={40} color={tintColor} />
        </View>
        <Text className="text-xl font-semibold mb-2 text-center" style={{ color: textColor }}>
          Start a Conversation
        </Text>
        <Text
          className="text-[15px] text-center leading-[22px]"
          style={{ color: textColor + '70' }}
        >
          Send a message to begin chatting with AI
        </Text>
      </View>
    );
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'} ${className}`}>
      {/* Optional Header */}
      {header && <View className="border-b border-black/5">{header}</View>}

      {/* Clear button (if handler provided and has messages) */}
      {onClear && messages.length > 0 && (
        <TouchableOpacity
          className="flex-row items-center self-center px-3 py-1.5 rounded-full mt-2 gap-1"
          style={{ backgroundColor: textColor + '10' }}
          onPress={onClear}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={textColor + '70'} />
          <Text className="text-xs font-medium" style={{ color: textColor + '70' }}>
            Clear chat
          </Text>
        </TouchableOpacity>
      )}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerStyle={[
          { paddingVertical: 16 },
          messages.length === 0 && { flex: 1, justifyContent: 'center' },
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      {/* Input */}
      <ChatInput
        value={input}
        onChangeText={onInputChange}
        onSend={onSend}
        isLoading={isLoading}
        isStreaming={isStreaming}
        onStop={onStop}
        placeholder={placeholder}
      />
    </View>
  );
}
