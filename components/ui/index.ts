/**
 * UI Component Library
 *
 * A comprehensive collection of reusable components for building consistent UIs quickly.
 *
 * @example
 * import {
 *   Button, Card, Text, Input, Badge, Avatar,
 *   Switch, Checkbox, Radio, Select, SegmentedControl,
 *   Screen, ScreenHeader, LoadingScreen, Spinner,
 *   ToastProvider, useToast, BottomSheet
 * } from '@/components/ui';
 */

// ===========================================
// BUTTON
// ===========================================
export { Button, IconButton, LinkButton } from './Button';
export type { ButtonProps, ButtonColor, ButtonVariant, ButtonSize } from './Button';

// ===========================================
// PRESSABLE SCALE
// ===========================================
export { PressableScale } from './PressableScale';

// ===========================================
// CARD
// ===========================================
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardDivider,
  CardImage,
  InfoCard,
  ActionCard,
} from './Card';
export type {
  CardProps,
  CardVariant,
  CardSize,
  CardHeaderProps,
  CardContentProps,
  CardFooterProps,
} from './Card';

// ===========================================
// TEXT
// ===========================================
export {
  Text,
  H1,
  H2,
  H3,
  H4,
  Body,
  Caption,
  Label,
  Overline,
  LinkText,
  ErrorText,
  SuccessText,
} from './Text';
export type { TextProps, TextSize, TextWeight, TextColor, TextAlign, TextVariant } from './Text';

// ===========================================
// INPUT
// ===========================================
export { Input, SearchInput, PasswordInput, EmailInput, Textarea } from './Input';
export type { InputProps, InputVariant, InputSize } from './Input';

// ===========================================
// SELECT
// ===========================================
export { Select, MultiSelect } from './Select';
export type {
  SelectProps,
  SelectOption,
  SelectVariant,
  SelectSize,
  MultiSelectProps,
} from './Select';

// ===========================================
// SWITCH
// ===========================================
export { Switch, SwitchRow, SwitchGroup } from './Switch';
export type {
  SwitchProps,
  SwitchSize,
  SwitchColor,
  SwitchRowProps,
  SwitchGroupProps,
} from './Switch';

// ===========================================
// CHECKBOX
// ===========================================
export { Checkbox, CheckboxGroup, CheckboxCard } from './Checkbox';
export type {
  CheckboxProps,
  CheckboxSize,
  CheckboxColor,
  CheckboxOption,
  CheckboxGroupProps,
  CheckboxCardProps,
} from './Checkbox';

// ===========================================
// RADIO
// ===========================================
export { Radio, RadioGroup, RadioCard, RadioCardGroup } from './Radio';
export type {
  RadioProps,
  RadioSize,
  RadioColor,
  RadioOption,
  RadioGroupProps,
  RadioCardProps,
  RadioCardGroupProps,
} from './Radio';

// ===========================================
// SEGMENTED CONTROL
// ===========================================
export { SegmentedControl, TabBar } from './SegmentedControl';
export type {
  SegmentedControlProps,
  SegmentedControlOption,
  SegmentedControlSize,
  SegmentedControlVariant,
  TabBarProps,
} from './SegmentedControl';

// ===========================================
// BADGE
// ===========================================
export { Badge, StatusBadge, CountBadge, NotificationDot } from './Badge';
export type { BadgeProps, BadgeColor, BadgeVariant, BadgeSize, StatusType } from './Badge';

// ===========================================
// AVATAR
// ===========================================
export { Avatar, AvatarGroup, UserAvatar, PlaceholderAvatar } from './Avatar';
export type {
  AvatarProps,
  AvatarSize,
  AvatarShape,
  AvatarStatus,
  AvatarColor,
  AvatarGroupProps,
} from './Avatar';

// ===========================================
// SCREEN
// ===========================================
export {
  Screen,
  ScreenHeader,
  ScreenContent,
  ScreenFooter,
  ScreenSection,
  Divider,
  Spacer,
} from './Screen';
export type {
  ScreenProps,
  ScreenHeaderProps,
  ScreenContentProps,
  ScreenFooterProps,
  ScreenSectionProps,
  DividerProps,
  SpacerProps,
} from './Screen';

// ===========================================
// LOADING
// ===========================================
export {
  LoadingScreen,
  LoadingSpinner,
  Spinner,
  SkeletonList,
  SkeletonAvatar,
  SkeletonButton,
  InlineLoading,
} from './Loading';
export type { SpinnerSize, SpinnerColor } from './Loading';

// ===========================================
// TOAST
// ===========================================
export { ToastProvider, useToast } from './Toast';
export type { ToastType, ToastConfig } from './Toast';

// ===========================================
// BOTTOM SHEET
// ===========================================
export { BottomSheet } from './BottomSheet';

// ===========================================
// STEPPER
// ===========================================
export { Stepper, ProgressStepper, StepContainer, WizardNavigation } from './Stepper';
export type {
  StepperProps,
  StepItem,
  StepStatus,
  ProgressStepperProps,
  StepContainerProps,
  WizardNavigationProps,
} from './Stepper';

// ===========================================
// ALERT / DIALOG
// ===========================================
export {
  Alert,
  ConfirmDialog,
  PromptDialog,
  AlertProvider,
  useAlert,
  DeleteConfirmDialog,
  DiscardChangesDialog,
  LogoutConfirmDialog,
} from './Alert';
export type {
  AlertProps,
  AlertType,
  AlertButton,
  ConfirmDialogProps,
  PromptDialogProps,
} from './Alert';

// ===========================================
// CAROUSEL
// ===========================================
export {
  Carousel,
  PageIndicator,
  ImageCarousel,
  CardCarousel,
  FeatureCarousel,
  ThumbnailCarousel,
} from './Carousel';
export type {
  CarouselProps,
  PageIndicatorProps,
  ImageCarouselProps,
  CardCarouselProps,
  FeatureSlide,
  FeatureCarouselProps,
  ThumbnailCarouselProps,
} from './Carousel';

// ===========================================
// ACTION SHEET
// ===========================================
export {
  ActionSheet,
  MenuSheet,
  ShareSheet,
  ActionSheetProvider,
  useActionSheet,
} from './ActionSheet';
export type {
  ActionSheetProps,
  ActionSheetAction,
  ActionColor,
  MenuSheetProps,
  ShareSheetProps,
} from './ActionSheet';

// ===========================================
// PROGRESS
// ===========================================
export {
  ProgressBar,
  CircularProgress,
  UploadProgress,
  MultiProgress,
  GoalProgress,
} from './Progress';
export type {
  ProgressBarProps,
  CircularProgressProps,
  UploadProgressProps,
  MultiProgressProps,
  GoalProgressProps,
  ProgressColor,
  ProgressSize,
} from './Progress';

// ===========================================
// SLIDER
// ===========================================
export { Slider, RangeSlider, RatingSlider, VolumeSlider, TemperatureSlider } from './Slider';
export type {
  SliderProps,
  RangeSliderProps,
  RatingSliderProps,
  VolumeSliderProps,
  TemperatureSliderProps,
  SliderColor,
  SliderSize,
} from './Slider';

// ===========================================
// EMPTY STATE
// ===========================================
export { EmptyState, NoResults, NoData, ErrorState, OfflineState } from './EmptyState';
export type {
  EmptyStateProps,
  EmptyStateVariant,
  NoResultsProps,
  NoDataProps,
  ErrorStateProps,
  OfflineStateProps,
} from './EmptyState';

// ===========================================
// LIST ITEM
// ===========================================
export { ListItem, ListGroup, SettingsItem, MenuOption, NavigationItem } from './ListItem';
export type { ListItemProps, ListItemVariant, ListItemSize, ListGroupProps } from './ListItem';

// ===========================================
// CHIP
// ===========================================
export { Chip, ChipGroup, FilterChip, Tag, CategoryChip } from './Chip';
export type {
  ChipProps,
  ChipVariant,
  ChipColor,
  ChipSize,
  ChipOption,
  ChipGroupProps,
  TagProps,
} from './Chip';

// ===========================================
// FAB (Floating Action Button)
// ===========================================
export { FAB, SpeedDial } from './FAB';
export type {
  FABProps,
  FABPosition,
  FABSize,
  FABColor,
  SpeedDialProps,
  SpeedDialAction,
} from './FAB';

// ===========================================
// STAT CARD
// ===========================================
export { StatCard, StatGrid, MetricCard, KPICard, MiniStat } from './StatCard';
export type {
  StatCardProps,
  StatCardVariant,
  StatCardColor,
  TrendIndicator,
  StatGridProps,
  KPICardProps,
  MiniStatProps,
} from './StatCard';

// ===========================================
// ICON SYMBOL
// ===========================================
export { IconSymbol } from './icon-symbol';

// ===========================================
// MODAL
// ===========================================
export { Modal, ModalProvider, useModal, BottomModal, FullScreenModal, SheetModal } from './Modal';
export type { ModalProps, ModalSize, ModalPosition, SheetModalProps } from './Modal';

// ===========================================
// ACCORDION
// ===========================================
export { Accordion, AccordionItem, FAQAccordion, SettingsAccordion } from './Accordion';
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionVariant,
  FAQItem,
  FAQAccordionProps,
} from './Accordion';

// ===========================================
// TABS
// ===========================================
export { Tabs, TabPanel, TabView, IconTabs, ScrollableTabs } from './Tabs';
export type {
  TabsProps,
  TabItem,
  TabVariant,
  TabSize,
  TabViewProps,
  TabPanelProps,
  IconTabItem,
  IconTabsProps,
} from './Tabs';

// ===========================================
// TOOLTIP
// ===========================================
export { Tooltip, InfoTooltip, HelpTooltip } from './Tooltip';
export type { TooltipProps, TooltipPosition, TooltipVariant, InfoTooltipProps } from './Tooltip';

// ===========================================
// PAGINATION
// ===========================================
export { Pagination, SimplePagination, CompactPagination, MinimalPagination } from './Pagination';
export type { PaginationProps, PaginationVariant, PaginationSize } from './Pagination';

// ===========================================
// RATING
// ===========================================
export {
  Rating,
  StarRating,
  HeartRating,
  ReviewRating,
  RatingInput,
  RatingBreakdown,
} from './Rating';
export type {
  RatingProps,
  RatingSize,
  RatingIcon,
  ReviewRatingProps,
  RatingInputProps,
  RatingBreakdownProps,
} from './Rating';

// ===========================================
// FORM FIELD
// ===========================================
export {
  FormField,
  EmailField,
  PasswordField,
  SearchField,
  PhoneField,
  TextArea,
  FormFieldGroup,
  InlineFormFields,
} from './FormField';
export type {
  FormFieldProps,
  FormFieldVariant,
  FormFieldSize,
  FormFieldGroupProps,
  InlineFormFieldsProps,
} from './FormField';

// ===========================================
// DATA TABLE
// ===========================================
export { DataTable, SimpleTable, KeyValueTable, SelectableTable } from './DataTable';
export type {
  DataTableProps,
  Column,
  SortOrder,
  TableSize,
  SimpleTableProps,
  KeyValueTableProps,
  SelectableTableProps,
} from './DataTable';

// ===========================================
// TIMELINE
// ===========================================
export {
  Timeline,
  OrderTimeline,
  ActivityTimeline,
  StepTimeline,
  HistoryTimeline,
} from './Timeline';
export type {
  TimelineProps,
  TimelineItem,
  TimelineStatus,
  TimelineVariant,
  TimelineSize,
  OrderTimelineProps,
  ActivityItem,
  ActivityTimelineProps,
  StepTimelineProps,
  HistoryEvent,
  HistoryTimelineProps,
} from './Timeline';

// ===========================================
// DATE PICKER
// ===========================================
export { DatePicker, DateRangePicker, BirthdayPicker, FutureDatePicker } from './DatePicker';
export type { DatePickerProps, DatePickerMode, DateRangePickerProps } from './DatePicker';

// ===========================================
// SKELETON / SHIMMER LOADING
// ===========================================
export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonProductCard,
  PaywallSkeleton,
  ProfileSkeleton,
} from './Skeleton';

// ===========================================
// ANIMATED COMPONENTS
// ===========================================
export {
  AnimatedView,
  FadeIn,
  SlideIn,
  ScaleIn,
  ZoomIn,
  Entrance,
  Stagger,
  AnimatedPresence,
  Pulse,
  Shimmer,
  Rotating,
  Shakeable,
  Bouncy,
  DelayedRender,
  AnimatedListItem,
} from './Animated';
export type { ShakeRef, BounceRef } from './Animated';
