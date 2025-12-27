/**
 * CameraCapture Component
 *
 * A full-featured camera component for in-app photo capture.
 *
 * INSTALLATION: expo install expo-camera
 *
 * @example
 * // Basic usage
 * <CameraCapture onPhotoTaken={(photo) => console.log(photo)} />
 *
 * // Fullscreen camera
 * <CameraCapture fullscreen onPhotoTaken={handlePhoto} onClose={closeCamera} />
 *
 * // With custom aspect ratio
 * <CameraCapture aspectRatio={4/3} onPhotoTaken={handlePhoto} />
 *
 * // With preview
 * <CameraCapture showPreview onPhotoTaken={handlePhoto} />
 */

import React, { useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useCamera, type PhotoResult, type CameraFacing, type FlashMode } from '@/hooks/use-camera';
import { useIsDark } from '@/hooks/use-theme-color';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';

// Lazy import expo-camera to handle cases where it's not installed
let CameraView: React.ComponentType<{
  style?: object;
  facing?: string;
  flash?: string;
  ref?: React.RefObject<unknown>;
}> | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  CameraView = require('expo-camera').CameraView;
} catch {
  // expo-camera not installed
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface CameraCaptureProps {
  onPhotoTaken?: (photo: PhotoResult) => void;
  onClose?: () => void;
  onError?: (error: string) => void;
  fullscreen?: boolean;
  aspectRatio?: number;
  showPreview?: boolean;
  showControls?: boolean;
  initialFacing?: CameraFacing;
  quality?: number;
  base64?: boolean;
  className?: string;
}

export function CameraCapture({
  onPhotoTaken,
  onClose,
  onError,
  fullscreen = false,
  aspectRatio = 4 / 3,
  showPreview = false,
  showControls = true,
  initialFacing = 'back',
  quality = 0.8,
  base64 = false,
  className = '',
}: CameraCaptureProps) {
  const isDark = useIsDark();
  const {
    cameraRef,
    hasPermission,
    isReady,
    facing,
    flash,
    isLoading,
    error,
    photo,
    requestPermission,
    takePicture,
    toggleFacing,
    setFacing,
    setFlash,
    clearPhoto,
  } = useCamera();

  useEffect(() => {
    setFacing(initialFacing);
  }, [initialFacing, setFacing]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  const handleTakePicture = async () => {
    const result = await takePicture({ quality, base64 });
    if (result) {
      onPhotoTaken?.(result);
    }
  };

  const handleRetake = () => {
    clearPhoto();
  };

  const handleConfirm = () => {
    if (photo) {
      onPhotoTaken?.(photo);
    }
  };

  const cycleFlash = () => {
    const modes: FlashMode[] = ['off', 'on', 'auto'];
    const currentIndex = modes.indexOf(flash);
    const nextIndex = (currentIndex + 1) % modes.length;
    setFlash(modes[nextIndex]);
  };

  const getFlashIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (flash) {
      case 'on':
        return 'flash';
      case 'auto':
        return 'flash-outline';
      default:
        return 'flash-off';
    }
  };

  const containerStyle = fullscreen
    ? styles.fullscreenContainer
    : { width: SCREEN_WIDTH, aspectRatio };

  if (hasPermission === null) {
    return (
      <View className={`items-center justify-center p-8 ${className}`} style={containerStyle}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text color="muted" className="mt-4">
          Checking camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View
        className={`items-center justify-center p-8 rounded-xl ${isDark ? 'bg-background-dark-tertiary' : 'bg-background-secondary'} ${className}`}
        style={containerStyle}
      >
        <Ionicons name="camera-outline" size={48} color={isDark ? '#9BA1A6' : '#687076'} />
        <Text weight="semibold" className="mt-4 text-center">
          Camera Access Required
        </Text>
        <Text color="muted" size="sm" className="mt-2 text-center">
          We need camera permission to take photos
        </Text>
        <Button className="mt-6" onPress={requestPermission}>
          Grant Permission
        </Button>
        {onClose && (
          <Button variant="ghost" className="mt-2" onPress={onClose}>
            Cancel
          </Button>
        )}
      </View>
    );
  }

  if (showPreview && photo) {
    return (
      <View className={className} style={containerStyle}>
        <Image
          source={{ uri: photo.uri }}
          style={[styles.preview, containerStyle]}
          contentFit="cover"
        />
        <View style={styles.previewControls}>
          <Button
            variant="soft"
            color="secondary"
            leftIcon="refresh"
            onPress={handleRetake}
            className="flex-1 mr-2"
          >
            Retake
          </Button>
          <Button leftIcon="checkmark" onPress={handleConfirm} className="flex-1 ml-2">
            Use Photo
          </Button>
        </View>
      </View>
    );
  }

  if (!CameraView) {
    return (
      <View
        className={`items-center justify-center p-8 rounded-xl ${isDark ? 'bg-background-dark-tertiary' : 'bg-background-secondary'} ${className}`}
        style={containerStyle}
      >
        <Ionicons name="camera-outline" size={48} color={isDark ? '#9BA1A6' : '#687076'} />
        <Text weight="semibold" className="mt-4 text-center">
          Camera Not Available
        </Text>
        <Text color="muted" size="sm" className="mt-2 text-center">
          Install expo-camera to enable camera functionality
        </Text>
      </View>
    );
  }

  return (
    <View className={`overflow-hidden rounded-xl ${className}`} style={containerStyle}>
      <CameraView
        ref={cameraRef as React.RefObject<unknown>}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
      />

      {showControls && (
        <>
          <View style={styles.topControls}>
            {onClose && (
              <TouchableOpacity style={styles.controlButton} onPress={onClose}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            )}
            <View className="flex-1" />
            <TouchableOpacity style={styles.controlButton} onPress={cycleFlash}>
              <Ionicons name={getFlashIcon()} size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomControls}>
            <View style={styles.sideButton} />

            <TouchableOpacity
              style={[styles.captureButton, isLoading && styles.captureButtonDisabled]}
              onPress={handleTakePicture}
              disabled={!isReady || isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideButton} onPress={toggleFacing}>
              <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text color="danger" size="sm" className="text-center">
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  preview: {
    flex: 1,
  },
  previewControls: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
  sideButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 8,
  },
});

export type { PhotoResult, CameraFacing, FlashMode } from '@/hooks/use-camera';
