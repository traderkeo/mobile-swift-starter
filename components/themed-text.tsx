/**
 * ThemedText Component (Legacy)
 *
 * This component is kept for backward compatibility.
 * For new code, prefer using the Text component from @/components/ui.
 *
 * @example
 * // Legacy usage
 * <ThemedText type="title">Hello</ThemedText>
 *
 * // Preferred new usage
 * import { Text, H1 } from '@/components/ui';
 * <Text variant="h1">Hello</Text>
 * <H1>Hello</H1>
 */

import { Text as RNText, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

/**
 * Type styles mapping to Tailwind classes
 * These map to the new Text component variants for consistency
 */
const typeStyles: Record<NonNullable<ThemedTextProps['type']>, string> = {
  default: 'text-base leading-6 text-foreground dark:text-foreground-dark',
  defaultSemiBold: 'text-base leading-6 font-semibold text-foreground dark:text-foreground-dark',
  title: 'text-[32px] font-bold leading-8 text-foreground dark:text-foreground-dark tracking-tight',
  subtitle: 'text-xl font-bold text-foreground dark:text-foreground-dark',
  link: 'text-base leading-[30px] text-primary underline',
};

/**
 * @deprecated Use Text component from @/components/ui instead
 */
export function ThemedText({ type = 'default', className = '', ...rest }: ThemedTextProps) {
  return <RNText className={`${typeStyles[type]} ${className}`} {...rest} />;
}
