/**
 * Carousel component for image galleries, onboarding, and content sliders
 *
 * Usage:
 * ```tsx
 * // Basic carousel
 * <Carousel
 *   data={images}
 *   renderItem={({ item }) => <Image source={item.uri} />}
 * />
 *
 * // Image carousel
 * <ImageCarousel
 *   images={[{ uri: '...' }, { uri: '...' }]}
 *   height={300}
 * />
 *
 * // Card carousel
 * <CardCarousel
 *   data={products}
 *   renderItem={({ item }) => <ProductCard product={item} />}
 * />
 *
 * // With autoplay
 * <Carousel data={slides} autoplay autoplayInterval={5000} />
 * ```
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  ViewToken,
  Image,
  TouchableOpacity,
  Animated,
  ImageSourcePropType,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SemanticColors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Local color constant (match tailwind.config.js)
const PRIMARY_COLOR = '#0a7ea4';

// Types
export interface CarouselProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor?: (item: T, index: number) => string;
  itemWidth?: number;
  gap?: number;
  showPagination?: boolean;
  paginationStyle?: 'dots' | 'numbers' | 'progress';
  paginationPosition?: 'inside' | 'outside';
  showArrows?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  loop?: boolean;
  onIndexChange?: (index: number) => void;
  initialIndex?: number;
  snapToInterval?: boolean;
  className?: string;
}

export interface PageIndicatorProps {
  total: number;
  current: number;
  style?: 'dots' | 'numbers' | 'progress';
  color?: string;
  className?: string;
}

export interface ImageCarouselProps {
  images: (ImageSourcePropType | { uri: string })[];
  height?: number;
  showPagination?: boolean;
  showArrows?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch';
  onImagePress?: (index: number) => void;
  className?: string;
}

// Page Indicator Component
export function PageIndicator({
  total,
  current,
  style = 'dots',
  color = PRIMARY_COLOR,
  className = '',
}: PageIndicatorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const inactiveColor = isDark ? '#374151' : '#E5E7EB';

  if (style === 'numbers') {
    return (
      <View
        className={`px-3 py-1 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'} ${className}`}
      >
        <View className="flex-row items-center">
          <Animated.Text className={`text-sm font-semibold`} style={{ color }}>
            {current + 1}
          </Animated.Text>
          <Animated.Text className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {' / '}
            {total}
          </Animated.Text>
        </View>
      </View>
    );
  }

  if (style === 'progress') {
    const progress = ((current + 1) / total) * 100;
    return (
      <View
        className={`h-1 rounded-full overflow-hidden ${className}`}
        style={{ backgroundColor: inactiveColor }}
      >
        <Animated.View
          className="h-full rounded-full"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </View>
    );
  }

  // Default: dots
  return (
    <View className={`flex-row items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: total }).map((_, index) => (
        <Animated.View
          key={index}
          className="h-2 rounded-full"
          style={{
            backgroundColor: index === current ? color : inactiveColor,
            width: index === current ? 24 : 8,
          }}
        />
      ))}
    </View>
  );
}

// Main Carousel Component
export function Carousel<T>({
  data,
  renderItem,
  keyExtractor = (_, index) => index.toString(),
  itemWidth = SCREEN_WIDTH,
  gap = 0,
  showPagination = true,
  paginationStyle = 'dots',
  paginationPosition = 'outside',
  showArrows = false,
  autoplay = false,
  autoplayInterval = 3000,
  loop = false,
  onIndexChange,
  initialIndex = 0,
  snapToInterval = true,
  className = '',
}: CarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const effectiveWidth = itemWidth + gap;

  // Viewability configuration
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      const newIndex = viewableItems[0].index;
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Navigation
  const goToIndex = useCallback(
    (index: number) => {
      const targetIndex = loop
        ? ((index % data.length) + data.length) % data.length
        : Math.max(0, Math.min(index, data.length - 1));

      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
      });
    },
    [data.length, loop]
  );

  const goToNext = useCallback(() => {
    if (currentIndex < data.length - 1 || loop) {
      goToIndex(currentIndex + 1);
    }
  }, [currentIndex, data.length, loop, goToIndex]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0 || loop) {
      goToIndex(currentIndex - 1);
    }
  }, [currentIndex, loop, goToIndex]);

  // Autoplay
  useEffect(() => {
    if (autoplay && data.length > 1) {
      autoplayTimerRef.current = setInterval(() => {
        goToNext();
      }, autoplayInterval);

      return () => {
        if (autoplayTimerRef.current) {
          clearInterval(autoplayTimerRef.current);
        }
      };
    }
  }, [autoplay, autoplayInterval, goToNext, data.length]);

  // Reset autoplay on user interaction
  const handleScrollBegin = () => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
    }
  };

  const handleScrollEnd = () => {
    if (autoplay && data.length > 1) {
      autoplayTimerRef.current = setInterval(goToNext, autoplayInterval);
    }
  };

  const renderCarouselItem = ({ item, index }: { item: T; index: number }) => (
    <View style={{ width: itemWidth, marginHorizontal: gap / 2 }}>
      {renderItem({ item, index })}
    </View>
  );

  return (
    <View className={className}>
      <View className="relative">
        <FlatList
          ref={flatListRef}
          data={data}
          renderItem={renderCarouselItem}
          keyExtractor={keyExtractor}
          horizontal
          pagingEnabled={!gap}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          snapToInterval={snapToInterval ? effectiveWidth : undefined}
          snapToAlignment="center"
          decelerationRate="fast"
          bounces={!loop}
          onScrollBeginDrag={handleScrollBegin}
          onScrollEndDrag={handleScrollEnd}
          onMomentumScrollEnd={handleScrollEnd}
          contentContainerStyle={{ paddingHorizontal: gap / 2 }}
          getItemLayout={(_, index) => ({
            length: effectiveWidth,
            offset: effectiveWidth * index,
            index,
          })}
          initialScrollIndex={initialIndex}
        />

        {/* Arrows */}
        {showArrows && data.length > 1 && (
          <>
            <TouchableOpacity
              className={`absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center ${
                isDark ? 'bg-gray-800/80' : 'bg-white/80'
              }`}
              onPress={goToPrevious}
              disabled={!loop && currentIndex === 0}
              style={{ opacity: !loop && currentIndex === 0 ? 0.3 : 1 }}
            >
              <Ionicons name="chevron-back" size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
            <TouchableOpacity
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center ${
                isDark ? 'bg-gray-800/80' : 'bg-white/80'
              }`}
              onPress={goToNext}
              disabled={!loop && currentIndex === data.length - 1}
              style={{ opacity: !loop && currentIndex === data.length - 1 ? 0.3 : 1 }}
            >
              <Ionicons name="chevron-forward" size={24} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </>
        )}

        {/* Inside pagination */}
        {showPagination && paginationPosition === 'inside' && data.length > 1 && (
          <View className="absolute bottom-4 left-0 right-0 items-center">
            <PageIndicator total={data.length} current={currentIndex} style={paginationStyle} />
          </View>
        )}
      </View>

      {/* Outside pagination */}
      {showPagination && paginationPosition === 'outside' && data.length > 1 && (
        <View className="mt-4">
          <PageIndicator total={data.length} current={currentIndex} style={paginationStyle} />
        </View>
      )}
    </View>
  );
}

// Image Carousel - specialized for images
export function ImageCarousel({
  images,
  height = 250,
  showPagination = true,
  showArrows = false,
  autoplay = false,
  autoplayInterval = 3000,
  resizeMode = 'cover',
  onImagePress,
  className = '',
}: ImageCarouselProps) {
  const renderImage = useCallback(
    ({ item, index }: { item: ImageSourcePropType | { uri: string }; index: number }) => {
      const imageContent = (
        <Image
          source={typeof item === 'object' && 'uri' in item ? { uri: item.uri } : item}
          style={{ width: '100%', height }}
          resizeMode={resizeMode}
        />
      );

      if (onImagePress) {
        return (
          <TouchableOpacity activeOpacity={0.9} onPress={() => onImagePress(index)}>
            {imageContent}
          </TouchableOpacity>
        );
      }

      return imageContent;
    },
    [height, resizeMode, onImagePress]
  );

  return (
    <Carousel
      data={images}
      renderItem={renderImage}
      showPagination={showPagination}
      paginationPosition="inside"
      showArrows={showArrows}
      autoplay={autoplay}
      autoplayInterval={autoplayInterval}
      className={className}
    />
  );
}

// Card Carousel - for card-style items with peek
export interface CardCarouselProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor?: (item: T, index: number) => string;
  cardWidth?: number;
  gap?: number;
  showPagination?: boolean;
  onIndexChange?: (index: number) => void;
  className?: string;
}

export function CardCarousel<T>({
  data,
  renderItem,
  keyExtractor,
  cardWidth = SCREEN_WIDTH * 0.85,
  gap = 16,
  showPagination = true,
  onIndexChange,
  className = '',
}: CardCarouselProps<T>) {
  return (
    <Carousel
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      itemWidth={cardWidth}
      gap={gap}
      showPagination={showPagination}
      onIndexChange={onIndexChange}
      className={className}
    />
  );
}

// Feature Carousel - for onboarding/feature highlights
export interface FeatureSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color?: string;
}

export interface FeatureCarouselProps {
  slides: FeatureSlide[];
  onComplete?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  showProgress?: boolean;
  nextLabel?: string;
  completeLabel?: string;
  className?: string;
}

export function FeatureCarousel({
  slides,
  onComplete,
  onSkip,
  showSkip = true,
  showProgress = true,
  nextLabel = 'Next',
  completeLabel = 'Get Started',
  className = '',
}: FeatureCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isLastSlide = currentIndex === slides.length - 1;
  const primaryColor = SemanticColors.primary.DEFAULT;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete?.();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }: { item: FeatureSlide }) => {
    const slideColor = item.color || primaryColor;
    return (
      <View className="flex-1 justify-center items-center px-10" style={{ width: SCREEN_WIDTH }}>
        <View
          className="w-32 h-32 rounded-full justify-center items-center mb-8"
          style={{ backgroundColor: slideColor + '20' }}
        >
          <Ionicons name={item.icon} size={64} color={slideColor} />
        </View>
        <Animated.Text
          className={`text-2xl font-bold text-center mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          {item.title}
        </Animated.Text>
        <Animated.Text
          className={`text-base text-center leading-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
        >
          {item.description}
        </Animated.Text>
      </View>
    );
  };

  return (
    <View className={`flex-1 ${className}`}>
      {/* Skip button */}
      {showSkip && !isLastSlide && (
        <View className="absolute top-4 right-4 z-10">
          <TouchableOpacity onPress={onSkip || onComplete} className="px-4 py-2">
            <Animated.Text className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Skip
            </Animated.Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Footer */}
      <View className="px-6 pb-8">
        {/* Progress indicator */}
        {showProgress && (
          <View className="mb-6">
            <PageIndicator
              total={slides.length}
              current={currentIndex}
              style="dots"
              color={primaryColor}
            />
          </View>
        )}

        {/* Next/Complete button */}
        <TouchableOpacity
          className="h-14 rounded-xl justify-center items-center flex-row gap-2"
          style={{ backgroundColor: primaryColor }}
          onPress={handleNext}
        >
          <Animated.Text className="text-white text-lg font-semibold">
            {isLastSlide ? completeLabel : nextLabel}
          </Animated.Text>
          {!isLastSlide && <Ionicons name="arrow-forward" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Thumbnail Carousel - with thumbnail navigation
export interface ThumbnailCarouselProps {
  images: (ImageSourcePropType | { uri: string })[];
  mainHeight?: number;
  thumbnailSize?: number;
  gap?: number;
  className?: string;
}

export function ThumbnailCarousel({
  images,
  mainHeight = 300,
  thumbnailSize = 60,
  gap = 8,
  className = '',
}: ThumbnailCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const mainRef = useRef<FlatList>(null);

  const goToIndex = (index: number) => {
    mainRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View className={className}>
      {/* Main image */}
      <FlatList
        ref={mainRef}
        data={images}
        renderItem={({ item }) => (
          <Image
            source={typeof item === 'object' && 'uri' in item ? { uri: item.uri } : item}
            style={{ width: SCREEN_WIDTH, height: mainHeight }}
            resizeMode="cover"
          />
        )}
        keyExtractor={(_, index) => `main-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Thumbnails */}
      <View className="mt-3">
        <FlatList
          data={images}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => goToIndex(index)}
              className={`rounded-lg overflow-hidden ${
                index === currentIndex ? 'border-2 border-primary' : ''
              }`}
              style={{ marginRight: gap }}
            >
              <Image
                source={typeof item === 'object' && 'uri' in item ? { uri: item.uri } : item}
                style={{ width: thumbnailSize, height: thumbnailSize }}
                resizeMode="cover"
              />
              {index !== currentIndex && <View className="absolute inset-0 bg-black/30" />}
            </TouchableOpacity>
          )}
          keyExtractor={(_, index) => `thumb-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>
    </View>
  );
}
