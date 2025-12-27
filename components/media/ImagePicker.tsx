/**
 * ImagePicker Component
 *
 * A ready-to-use component for selecting images from the device library.
 *
 * INSTALLATION: expo install expo-image-picker
 *
 * @example
 * // Basic usage
 * <ImagePicker onImageSelected={(image) => console.log(image)} />
 *
 * // With editing
 * <ImagePicker allowsEditing aspect={[1, 1]} onImageSelected={handleImage} />
 *
 * // Multiple images
 * <ImagePicker multiple onImagesSelected={(images) => console.log(images)} />
 *
 * // Custom trigger
 * <ImagePicker onImageSelected={handleImage}>
 *   <Text>Custom Button</Text>
 * </ImagePicker>
 *
 * // With preview
 * <ImagePicker showPreview onImageSelected={handleImage} />
 */

import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import {
  useImagePicker,
  type ImageResult,
  type UseImagePickerOptions,
} from '@/hooks/use-image-picker';
import { useIsDark } from '@/hooks/use-theme-color';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

export interface ImagePickerProps extends UseImagePickerOptions {
  onImageSelected?: (image: ImageResult) => void;
  onImagesSelected?: (images: ImageResult[]) => void;
  onError?: (error: string) => void;
  multiple?: boolean;
  showPreview?: boolean;
  previewSize?: number;
  placeholder?: string;
  buttonText?: string;
  buttonVariant?: 'solid' | 'soft' | 'outline' | 'ghost';
  buttonColor?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function ImagePicker({
  onImageSelected,
  onImagesSelected,
  onError,
  multiple = false,
  showPreview = false,
  previewSize = 120,
  placeholder = 'Select an image',
  buttonText = 'Choose Photo',
  buttonVariant = 'soft',
  buttonColor = 'primary',
  disabled = false,
  children,
  className = '',
  ...options
}: ImagePickerProps) {
  const isDark = useIsDark();
  const {
    image,
    images,
    isLoading,
    error,
    pickImage,
    pickMultipleImages,
    clearImage,
    clearImages,
  } = useImagePicker();

  const handlePick = async () => {
    if (multiple) {
      const result = await pickMultipleImages(options);
      if (result.length > 0) {
        onImagesSelected?.(result);
      }
    } else {
      const result = await pickImage(options);
      if (result) {
        onImageSelected?.(result);
      }
    }
  };

  React.useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  const iconColor = isDark ? '#9BA1A6' : '#687076';
  const bgColor = isDark ? 'bg-background-dark-tertiary' : 'bg-background-secondary';
  const borderColor = isDark ? 'border-border-dark' : 'border-border';

  const renderPreview = () => {
    if (!showPreview) return null;

    if (multiple && images.length > 0) {
      return (
        <View className="flex-row flex-wrap gap-2 mb-4">
          {images.map((img, index) => (
            <View key={img.uri} className="relative">
              <Image
                source={{ uri: img.uri }}
                style={{ width: previewSize, height: previewSize, borderRadius: 8 }}
                contentFit="cover"
              />
              <TouchableOpacity
                className="absolute -top-2 -right-2 w-6 h-6 bg-danger rounded-full items-center justify-center"
                onPress={() => {
                  const newImages = images.filter((_, i) => i !== index);
                  if (newImages.length === 0) {
                    clearImages();
                  }
                }}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      );
    }

    if (image) {
      return (
        <View className="relative mb-4" style={{ width: previewSize, height: previewSize }}>
          <Image
            source={{ uri: image.uri }}
            style={{ width: previewSize, height: previewSize, borderRadius: 8 }}
            contentFit="cover"
          />
          <TouchableOpacity
            className="absolute -top-2 -right-2 w-6 h-6 bg-danger rounded-full items-center justify-center"
            onPress={clearImage}
          >
            <Ionicons name="close" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View
        className={`mb-4 items-center justify-center rounded-xl border-2 border-dashed ${bgColor} ${borderColor}`}
        style={{ width: previewSize, height: previewSize }}
      >
        <Ionicons name="image-outline" size={32} color={iconColor} />
        <Text size="xs" color="muted" className="mt-2 text-center px-2">
          {placeholder}
        </Text>
      </View>
    );
  };

  if (children) {
    return (
      <TouchableOpacity
        onPress={handlePick}
        disabled={disabled || isLoading}
        className={className}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={className}>
      {renderPreview()}
      <Button
        variant={buttonVariant}
        color={buttonColor}
        onPress={handlePick}
        disabled={disabled || isLoading}
        leftIcon={isLoading ? undefined : 'images-outline'}
      >
        {isLoading ? <ActivityIndicator size="small" color="#fff" /> : buttonText}
      </Button>
      {error && (
        <Text size="xs" color="danger" className="mt-2">
          {error}
        </Text>
      )}
    </View>
  );
}

export type { ImageResult } from '@/hooks/use-image-picker';
