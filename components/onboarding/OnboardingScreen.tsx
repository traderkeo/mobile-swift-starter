import React, { useState, useRef } from 'react';
import { View, Text, Dimensions, FlatList, TouchableOpacity, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

interface OnboardingScreenProps {
  slides: OnboardingSlide[];
  onComplete: () => void;
  onSkip?: () => void;
}

export function OnboardingScreen({ slides, onComplete, onSkip }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const tintColor = '#0a7ea4';

  const isLastSlide = currentIndex === slides.length - 1;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View className="flex-1 justify-center items-center px-10" style={{ width }}>
      <View
        className="w-40 h-40 rounded-full justify-center items-center mb-10"
        style={{ backgroundColor: tintColor + '15' }}
      >
        <Ionicons name={item.icon} size={80} color={tintColor} />
      </View>
      <Text className="text-[28px] font-bold text-center mb-4" style={{ color: textColor }}>
        {item.title}
      </Text>
      <Text className="text-base text-center leading-6" style={{ color: textColor + '80' }}>
        {item.description}
      </Text>
    </View>
  );

  const renderPagination = () => (
    <View className="flex-row justify-center items-center gap-2 my-5">
      {slides.map((_, index) => (
        <View
          key={index}
          className="h-2 rounded-full"
          style={{
            backgroundColor: index === currentIndex ? tintColor : textColor + '30',
            width: index === currentIndex ? 24 : 8,
          }}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background'}`}>
      <View className="flex-row justify-end px-5 pt-2.5">
        <TouchableOpacity
          onPress={handleSkip}
          className={`py-2 px-4 rounded-full ${isDark ? 'bg-secondary-800' : 'bg-secondary-100'}`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-base font-semibold" style={{ color: tintColor }}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

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

      {renderPagination()}

      <View className="px-5 pb-5">
        <TouchableOpacity
          className="flex-row h-14 rounded-lg justify-center items-center gap-2"
          style={{ backgroundColor: tintColor }}
          onPress={handleNext}
        >
          <Text className="text-white text-lg font-semibold">
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
          {!isLastSlide && <Ionicons name="arrow-forward" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
