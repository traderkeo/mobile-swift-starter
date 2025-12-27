/**
 * AI Components
 *
 * Reusable components for building AI-powered chat interfaces
 *
 * @example
 * ```tsx
 * import { ChatContainer, ChatBubble, ChatInput } from '@/components/ai';
 * import { useAIChat } from '@/hooks/use-ai-chat';
 *
 * function ChatScreen() {
 *   const chat = useAIChat({ system: 'You are a helpful assistant.' });
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

export { ChatBubble, type ChatBubbleProps } from './ChatBubble';
export { ChatInput, type ChatInputProps } from './ChatInput';
export { ChatContainer, type ChatContainerProps } from './ChatContainer';
