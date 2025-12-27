/**
 * ChatInput - Input field for sending messages with NativeWind styling
 *
 * @example
 * ```tsx
 * <ChatInput
 *   value={input}
 *   onChangeText={setInput}
 *   onSend={sendMessage}
 *   isLoading={isLoading}
 *   placeholder="Ask me anything..."
 * />
 * ```
 */

import React, { useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onStop?: () => void;
  isStreaming?: boolean;
  className?: string;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  isLoading = false,
  placeholder = 'Type a message...',
  disabled = false,
  onStop,
  isStreaming = false,
  className = '',
}: ChatInputProps) {
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const tintColor = '#0a7ea4';

  const canSend = value.trim().length > 0 && !isLoading && !disabled;
  const showStop = isStreaming && onStop;

  const handleSend = () => {
    if (!canSend && !showStop) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (showStop) {
      onStop?.();
    } else {
      onSend();
    }
  };

  const handleKeyPress = (e: any) => {
    // Submit on Enter (desktop/web)
    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey && canSend) {
      e.preventDefault?.();
      handleSend();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View
        className={`px-3 py-2 border-t ${isDark ? 'bg-background-dark' : 'bg-background'} ${className}`}
        style={{ borderTopColor: textColor + '15' }}
      >
        <View
          className="flex-row items-end rounded-3xl border pl-4 pr-1 py-1 min-h-[44px]"
          style={{
            backgroundColor: textColor + '08',
            borderColor: textColor + '15',
          }}
        >
          <TextInput
            ref={inputRef}
            className="flex-1 text-base py-2 pr-2"
            style={{
              color: textColor,
              lineHeight: 22,
              maxHeight: 120,
            }}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={textColor + '50'}
            multiline
            maxLength={4000}
            editable={!disabled && !isLoading}
            onKeyPress={handleKeyPress}
            returnKeyType="send"
            blurOnSubmit={false}
          />

          <TouchableOpacity
            className="w-9 h-9 rounded-full justify-center items-center mb-0.5"
            style={{
              backgroundColor: showStop ? '#ef4444' : canSend ? tintColor : textColor + '20',
            }}
            onPress={handleSend}
            disabled={!canSend && !showStop}
            activeOpacity={0.7}
          >
            {isLoading && !isStreaming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : showStop ? (
              <Ionicons name="stop" size={18} color="#fff" />
            ) : (
              <Ionicons name="arrow-up" size={18} color={canSend ? '#fff' : textColor + '40'} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
