/**
 * Image Picker Hook
 *
 * Hook for picking images from device library or camera.
 *
 * INSTALLATION: expo install expo-image-picker
 *
 * @example
 * const { pickImage, takePhoto, image, isLoading, error } = useImagePicker();
 *
 * // Pick from library
 * await pickImage();
 *
 * // Take with camera
 * await takePhoto();
 *
 * // With options
 * await pickImage({ allowsEditing: true, aspect: [1, 1] });
 */

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface ImageResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface UseImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  base64?: boolean;
  allowsMultipleSelection?: boolean;
  selectionLimit?: number;
}

export interface UseImagePickerReturn {
  image: ImageResult | null;
  images: ImageResult[];
  isLoading: boolean;
  error: string | null;
  pickImage: (options?: UseImagePickerOptions) => Promise<ImageResult | null>;
  pickMultipleImages: (options?: UseImagePickerOptions) => Promise<ImageResult[]>;
  takePhoto: (options?: UseImagePickerOptions) => Promise<ImageResult | null>;
  clearImage: () => void;
  clearImages: () => void;
  requestLibraryPermission: () => Promise<boolean>;
  requestCameraPermission: () => Promise<boolean>;
}

const DEFAULT_OPTIONS: UseImagePickerOptions = {
  allowsEditing: false,
  quality: 0.8,
  base64: false,
  allowsMultipleSelection: false,
};

export function useImagePicker(): UseImagePickerReturn {
  const [image, setImage] = useState<ImageResult | null>(null);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLibraryPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission to access media library was denied');
      return false;
    }
    return true;
  }, []);

  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Permission to access camera was denied');
      return false;
    }
    return true;
  }, []);

  const mapResult = (asset: ImagePicker.ImagePickerAsset): ImageResult => ({
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    base64: asset.base64 ?? undefined,
    fileName: asset.fileName ?? undefined,
    fileSize: asset.fileSize ?? undefined,
    mimeType: asset.mimeType ?? undefined,
  });

  const pickImage = useCallback(
    async (options: UseImagePickerOptions = {}): Promise<ImageResult | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const hasPermission = await requestLibraryPermission();
        if (!hasPermission) return null;

        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: mergedOptions.allowsEditing,
          aspect: mergedOptions.aspect,
          quality: mergedOptions.quality,
          base64: mergedOptions.base64,
          allowsMultipleSelection: false,
        });

        if (result.canceled || !result.assets?.[0]) {
          return null;
        }

        const imageResult = mapResult(result.assets[0]);
        setImage(imageResult);
        return imageResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to pick image';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [requestLibraryPermission]
  );

  const pickMultipleImages = useCallback(
    async (options: UseImagePickerOptions = {}): Promise<ImageResult[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const hasPermission = await requestLibraryPermission();
        if (!hasPermission) return [];

        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: mergedOptions.quality,
          base64: mergedOptions.base64,
          allowsMultipleSelection: true,
          selectionLimit: mergedOptions.selectionLimit ?? 0,
        });

        if (result.canceled || !result.assets?.length) {
          return [];
        }

        const imageResults = result.assets.map(mapResult);
        setImages(imageResults);
        if (imageResults.length > 0) {
          setImage(imageResults[0]);
        }
        return imageResults;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to pick images';
        setError(message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [requestLibraryPermission]
  );

  const takePhoto = useCallback(
    async (options: UseImagePickerOptions = {}): Promise<ImageResult | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return null;

        const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: mergedOptions.allowsEditing,
          aspect: mergedOptions.aspect,
          quality: mergedOptions.quality,
          base64: mergedOptions.base64,
        });

        if (result.canceled || !result.assets?.[0]) {
          return null;
        }

        const imageResult = mapResult(result.assets[0]);
        setImage(imageResult);
        return imageResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to take photo';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [requestCameraPermission]
  );

  const clearImage = useCallback(() => {
    setImage(null);
    setError(null);
  }, []);

  const clearImages = useCallback(() => {
    setImage(null);
    setImages([]);
    setError(null);
  }, []);

  return {
    image,
    images,
    isLoading,
    error,
    pickImage,
    pickMultipleImages,
    takePhoto,
    clearImage,
    clearImages,
    requestLibraryPermission,
    requestCameraPermission,
  };
}
