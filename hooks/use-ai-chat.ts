/**
 * AI Chat Hook
 *
 * A placeholder hook for AI chat functionality.
 * Replace with your preferred AI SDK (OpenAI, Anthropic, etc.)
 */

import React, { useState, useCallback, useRef } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export interface UseAIChatOptions {
  /** System prompt to configure the AI behavior */
  system?: string;
  /** Initial messages to start the conversation */
  initialMessages?: Message[];
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback when a message is received */
  onMessage?: (message: Message) => void;
}

export interface UseAIChatReturn {
  /** Array of messages in the conversation */
  messages: Message[];
  /** Set messages directly */
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  /** Current input value */
  input: string;
  /** Set input value */
  setInput: React.Dispatch<React.SetStateAction<string>>;
  /** Whether the AI is currently generating a response */
  isLoading: boolean;
  /** Whether the AI is currently streaming (alias for isLoading) */
  isStreaming: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Send a message to the AI */
  sendMessage: (content?: string) => Promise<void>;
  /** Clear all messages */
  clearMessages: () => void;
  /** Retry the last message */
  retry: () => Promise<void>;
  /** Stop the current generation */
  stop: () => void;
}

/**
 * Hook for AI chat functionality
 *
 * This is a placeholder implementation. To use with a real AI provider:
 * 1. Install an AI SDK (e.g., @ai-sdk/react, openai, anthropic)
 * 2. Replace this implementation with the SDK's chat hook
 *
 * Example with Vercel AI SDK:
 * ```tsx
 * import { useChat } from '@ai-sdk/react';
 * export const useAIChat = useChat;
 * ```
 */
export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const { system, initialMessages = [], onError, onMessage } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const sendMessage = useCallback(
    async (content?: string) => {
      const messageContent = content ?? input;
      if (!messageContent.trim()) return;

      // Clear input
      setInput('');

      // Create user message
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: messageContent.trim(),
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        // Placeholder: Simulate AI response
        // Replace this with actual AI API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: `This is a placeholder response. To enable real AI responses:

1. Install an AI SDK (OpenAI, Anthropic, Vercel AI, etc.)
2. Add your API key to .env
3. Update this hook with the SDK implementation

Your message was: "${messageContent}"`,
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        onMessage?.(assistantMessage);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        if (error.name !== 'AbortError') {
          setError(error);
          onError?.(error);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [onError, onMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const retry = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      // Remove the last assistant message if it exists
      setMessages((prev) => {
        const lastIndex = prev.findLastIndex((m) => m.role === 'assistant');
        if (lastIndex > -1) {
          return prev.slice(0, lastIndex);
        }
        return prev;
      });
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  return {
    messages,
    setMessages,
    input,
    setInput,
    isLoading,
    isStreaming: isLoading,
    error,
    sendMessage,
    clearMessages,
    retry,
    stop,
  };
}

export default useAIChat;
