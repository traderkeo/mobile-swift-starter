---
name: mobile-ux-architect
description: Expert in high-performance Expo, NativeWind, and React Native interfaces. Focuses on mobile-first ergonomics, premium haptics, and avoiding dark patterns while maintaining a high-fidelity, bespoke aesthetic.
---

This skill guides the creation of production-grade mobile interfaces that feel like "Apple Design Award" winners rather than generic cross-platform templates. It leverages the Expo ecosystem and NativeWind (Tailwind for React Native) to build fluid, high-performance apps with a deep focus on mobile ergonomics and ethical UX.

## Mobile Design Philosophy

Before writing a single line of JSX, define the **Thumb-Zone Strategy** and **Interaction Model**:

- **Ergonomics**: Is the primary action reachable with one hand? Avoid "reach-stretching" to the top corners.
- **Platform Intent**: Should this feel like a "Native Citizen" (using iOS/Android conventions) or a "Branded Experience" (custom UI that transcends the OS)?
- **Micro-Feedback**: Plan for haptics, layout transitions, and gesture-based navigation.
- **Ethical UX**: Actively identify and eliminate Dark Patterns (e.g., hidden "unsubscribe," forced continuity, or deceptive "X" buttons). Design for user autonomy.

## Technical Stack & Constraints

- **Styling**: Use NativeWind (`className`) for rapid, consistent styling.
- **Primitives**: Use Expo-specific APIs (`expo-haptics`, `expo-blur`, `expo-image`) for that premium feel.
- **Animation**: Prioritize Reanimated 3 for 60fps gesture-driven UI.
- **Performance**: Optimize for the bridge. Use `FlashList` for long lists and avoid unnecessary re-renders in heavy scroll views.

## NativeWind Theming Requirements (CRITICAL)

**Before writing any component, check if the project uses NativeWind theming:**

1. Look for `tailwind.config.js` with color definitions
2. Check for `constants/theme.ts` with `SemanticColors`
3. Check for theme hooks in `hooks/use-theme-color.ts`

**Always prefer NativeWind classes over inline styles:**

```tsx
// ❌ BAD - Hardcoded hex values
<View style={{ backgroundColor: '#ef4444', borderColor: '#d1d5db' }}>

// ❌ BAD - Importing theme constants for static colors
import { SemanticColors } from '@/constants/theme';
<View style={{ backgroundColor: SemanticColors.danger.DEFAULT }}>

// ✅ GOOD - NativeWind classes
<View className="bg-danger border-secondary-300">

// ✅ GOOD - Dark mode with NativeWind
<View className={`${isDark ? 'bg-secondary-900' : 'bg-secondary-50'}`}>

// ✅ GOOD - Use theme constants ONLY for non-className scenarios (icons, charts)
import { SemanticColors } from '@/constants/theme';
<Ionicons color={SemanticColors.primary.DEFAULT} /> // Icons need hex values
```

**When to use programmatic theme access (theme constants/hooks):**

- Third-party components that don't support className (icons, charts, maps)
- Animated values that need interpolation
- Dynamic colors computed at runtime

**When to use NativeWind className:**

- All View, Text, TouchableOpacity backgrounds and borders
- All text colors
- All spacing, padding, margins
- All static styling

**Available NativeWind color classes from tailwind.config.js:**

- Brand: `bg-primary`, `text-primary-500`, `border-primary-700`
- Secondary: `bg-secondary-100`, `text-secondary-600`
- Status: `bg-success`, `text-danger`, `border-warning`
- Background: `bg-background`, `bg-background-dark`
- Text: `text-foreground`, `text-foreground-muted`

## Mobile Aesthetic Guidelines

### 1. Typography & Readability

- **Scale**: Use a clear typographic scale that accounts for varying screen sizes.
- **Hierarchy**: Use weight and letter-spacing rather than just size to create hierarchy on small screens.
- **Fonts**: Avoid system defaults when a brand voice is needed. Use `expo-font` to load characterful, legible typefaces.

### 2. Layout & Spatial Logic

- **The Bottom-Heavy Pattern**: Place navigation and primary actions in the bottom third of the screen.
- **Safe Areas**: Respect the notch and the home indicator religiously using `react-native-safe-area-context`.
- **Depth**: Use Canvas (Flashlight/Skia) or subtle Shadows (with platform-specific adjustments) to create a sense of Z-index hierarchy.

### 3. Motion & Gestures

- **Interaction over Static**: Mobile is a tactile medium. Use `GestureDetector` for swipes, pinches, and pulls.
- **Meaningful Motion**: Animations should explain where an element came from and where it's going (e.g., a shared element transition from a list card to a detail view).
- **Haptics**: Integrate `ImpactFeedbackStyle` to provide physical confirmation of digital actions.

### 4. Color & Theming

- **OLED Optimization**: For dark modes, consider "True Black" (`#000000`) to save battery and increase contrast, or deep navy/charcoal for a softer "Premium Dark" feel.
- **Stateful Colors**: Use distinct, accessible colors for success, warning, and error states that remain legible under high sunlight/outdoor conditions.

## Avoiding the "Generic AI" Mobile Look

**NO** basic "cards on a white background" with standard 8px border radii.

**NO** generic bottom tab bars that look like every boilerplate template.

**NO** "Slop" interactions (instant pop-ups with no transition).

**YES** to custom-drawn SVG icons, unique tab bar shapes, layout-level transitions, and contextual headers that collapse on scroll.

## Ethical & UX Checklist

- **Anti-Dark Pattern**: Ensure "Cancel" or "Back" buttons are as visible as "Buy" or "Continue."
- **Loading States**: Use Shimmer effects (Skeleton screens) instead of generic spinners.
- **Empty States**: Treat empty lists as opportunities for personality and branding.

## Code Review Checklist

Before completing any component or screen, verify:

### Theming & Styling

- [ ] **No hardcoded hex colors** - All colors use NativeWind classes or theme constants
- [ ] **className over style** - Static colors use `className="bg-primary"` not `style={{ backgroundColor }}`
- [ ] **Theme constants only for icons/charts** - Only use `SemanticColors` for components that can't use className
- [ ] **Dark mode support** - Uses `isDark` conditional or NativeWind dark: prefix

### Mobile UX

- [ ] **Touch targets ≥ 44pt** - All buttons have adequate hit areas (use `hitSlop` if needed)
- [ ] **Thumb-zone friendly** - Primary actions in bottom third of screen
- [ ] **Haptic feedback** - Important actions trigger `expo-haptics`
- [ ] **Safe areas respected** - Uses `react-native-safe-area-context`

### Accessibility & Ethics

- [ ] **Cancel/Back visible** - Dismissal options as prominent as continue/buy
- [ ] **Loading states** - Uses Skeleton components, not spinners
- [ ] **Error states inline** - Form errors shown near the field, not alerts
- [ ] **Restore purchases prominent** - Not hidden in settings
