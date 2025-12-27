# Theming Guide

This project uses **NativeWind v4** (Tailwind CSS for React Native) for styling. All design tokens are centralized in `tailwind.config.js`, making it easy to customize the entire app's appearance by editing a single file.

## Quick Start: Customize Your App

### 1. Change Brand Colors

Edit the `primary` color in `tailwind.config.js`:

```javascript
// tailwind.config.js
colors: {
  primary: {
    DEFAULT: '#your-brand-color',  // Main brand color
    50: '#lightest-shade',
    100: '#lighter-shade',
    // ... generate shades at https://uicolors.app/create
    600: '#your-brand-color',      // Usually same as DEFAULT
    900: '#darkest-shade',
  },
}
```

**Tip**: Use [UI Colors](https://uicolors.app/create) to generate a complete color palette from a single hex value.

### 2. Common Customizations

| What to Change       | Where to Edit                     |
| -------------------- | --------------------------------- |
| Brand color          | `colors.primary`                  |
| Secondary color      | `colors.secondary`                |
| Accent/highlight     | `colors.accent`                   |
| Button roundness     | `borderRadius` values             |
| Background colors    | `colors.background`               |
| Text colors          | `colors.foreground`               |
| Success/Error colors | `colors.success`, `colors.danger` |

## Theme Structure

### Color System

```javascript
colors: {
  // Brand Colors - Your app's identity
  primary: { ... },      // Main actions, links, highlights
  secondary: { ... },    // Secondary UI elements
  accent: { ... },       // Special highlights, badges

  // Semantic Colors - Consistent meaning
  success: { ... },      // Positive states, confirmations
  warning: { ... },      // Caution states
  danger: { ... },       // Errors, destructive actions
  info: { ... },         // Informational states

  // UI Colors - Layout and structure
  background: { ... },   // Screen backgrounds
  foreground: { ... },   // Text colors
  border: { ... },       // Border colors
}
```

### Dark Mode

The app automatically supports dark mode. Each color category has dark variants:

```javascript
background: {
  DEFAULT: '#ffffff',           // Light mode
  dark: '#151718',              // Dark mode
  'dark-secondary': '#1a1a1a',  // Dark mode secondary
}
```

In components, use the `useColorScheme` hook:

```tsx
const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';

return (
  <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
    <Text className={isDark ? 'text-foreground-dark' : 'text-foreground'}>Hello</Text>
  </View>
);
```

## Using Theme Colors in Components

### With className (Recommended)

```tsx
// Background colors
<View className="bg-primary" />           // Brand color background
<View className="bg-primary-100" />       // Light shade
<View className="bg-background" />        // Default background

// Text colors
<Text className="text-primary" />         // Brand color text
<Text className="text-foreground" />      // Default text
<Text className="text-foreground-muted" /> // Muted text

// Border colors
<View className="border border-border" /> // Default border
<View className="border-primary" />       // Brand color border

// Status colors
<View className="bg-success" />           // Success background
<Text className="text-danger" />          // Error text
```

### With Dynamic Values (when className isn't enough)

For dynamic colors or opacity variations, use the style prop:

```tsx
const tintColor = '#0a7ea4';

<View style={{ backgroundColor: tintColor + '15' }} />  // 15% opacity
<Text style={{ color: textColor + '60' }} />            // 60% opacity
```

## Component Patterns

### Screen Layout

```tsx
export default function MyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
      <ScrollView className="flex-1 p-6">
        <ThemedText className="text-2xl font-bold mb-4">Title</ThemedText>
        {/* Content */}
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Card Component

```tsx
<View className="rounded-xl p-4 border" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
  <ThemedText className="text-lg font-semibold">Card Title</ThemedText>
  <ThemedText className="text-sm opacity-70">Card description</ThemedText>
</View>
```

### Button Variants

```tsx
// Primary button
<TouchableOpacity className="bg-primary py-4 rounded-lg items-center">
  <Text className="text-white font-semibold">Primary Action</Text>
</TouchableOpacity>

// Secondary/outline button
<TouchableOpacity
  className="py-4 rounded-lg items-center border"
  style={{ borderColor: '#0a7ea4' }}
>
  <Text className="text-primary font-semibold">Secondary Action</Text>
</TouchableOpacity>

// Danger button
<TouchableOpacity className="bg-danger py-4 rounded-lg items-center">
  <Text className="text-white font-semibold">Delete</Text>
</TouchableOpacity>
```

## Example: Rebranding for a New App

Let's say you want to create a fitness app with a green brand color:

### Step 1: Generate Color Palette

Go to [uicolors.app](https://uicolors.app/create) and enter your brand color (e.g., `#10b981` for green).

### Step 2: Update tailwind.config.js

```javascript
colors: {
  primary: {
    DEFAULT: '#10b981',
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  // Optionally update accent for contrast
  accent: {
    DEFAULT: '#f59e0b',
    // ... amber palette for contrast
  },
}
```

### Step 3: Done!

All components using `bg-primary`, `text-primary`, `border-primary`, etc. will automatically use your new green color.

## Tailwind Class Reference

### Common Spacing Classes

| Class   | Value    |
| ------- | -------- |
| `p-1`   | 4px      |
| `p-2`   | 8px      |
| `p-3`   | 12px     |
| `p-4`   | 16px     |
| `p-6`   | 24px     |
| `p-8`   | 32px     |
| `gap-2` | 8px gap  |
| `gap-4` | 16px gap |

### Common Layout Classes

```tsx
// Flexbox
<View className="flex-row" />           // Horizontal layout
<View className="flex-1" />             // Fill available space
<View className="items-center" />       // Center items on cross axis
<View className="justify-center" />     // Center items on main axis
<View className="justify-between" />    // Space between items

// Sizing
<View className="w-full" />             // Full width
<View className="h-14" />               // 56px height
<View className="w-10 h-10" />          // 40x40px square
```

### Common Typography Classes

```tsx
<Text className="text-xs" />            // 12px
<Text className="text-sm" />            // 14px
<Text className="text-base" />          // 16px
<Text className="text-lg" />            // 18px
<Text className="text-xl" />            // 20px
<Text className="text-2xl" />           // 24px

<Text className="font-medium" />        // 500 weight
<Text className="font-semibold" />      // 600 weight
<Text className="font-bold" />          // 700 weight

<Text className="text-center" />        // Center aligned
<Text className="opacity-70" />         // 70% opacity
```

### Common Border Classes

```tsx
<View className="rounded" />            // 8px radius
<View className="rounded-lg" />         // 12px radius
<View className="rounded-xl" />         // 16px radius
<View className="rounded-full" />       // Fully round

<View className="border" />             // 1px border
<View className="border-2" />           // 2px border
```

## Files Overview

| File                  | Purpose                                    |
| --------------------- | ------------------------------------------ |
| `tailwind.config.js`  | All design tokens (colors, spacing, fonts) |
| `global.css`          | Tailwind CSS imports                       |
| `nativewind-env.d.ts` | TypeScript support for className           |
| `babel.config.js`     | NativeWind babel configuration             |
| `metro.config.js`     | NativeWind metro bundler config            |

## Resources

- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [UI Colors - Palette Generator](https://uicolors.app/create)
- [Tailwind Color Shades](https://tailwindcss.com/docs/customizing-colors)
