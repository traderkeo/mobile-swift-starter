/**
 * Camera Hook
 *
 * Hook for in-app camera functionality with full controls.
 *
 * INSTALLATION: expo install expo-camera
 *
 * @example
 * const { hasPermission, requestPermission, cameraRef, takePicture } = useCamera();
 *
 * // Check permission
 * if (!hasPermission) {
 *   await requestPermission();
 * }
 *
 * // Take picture
 * const photo = await takePicture({ quality: 0.8 });
 */

import { useState, useCallback, useRef } from 'react';

// Lazy load expo-camera
let useCameraPermissionsHook:
  | (() => [{ granted: boolean } | null, () => Promise<{ granted: boolean }>])
  | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expoCamera = require('expo-camera');
  useCameraPermissionsHook = expoCamera.useCameraPermissions;
} catch {
  // expo-camera not installed
}

export type CameraFacing = 'front' | 'back';
export type FlashMode = 'off' | 'on' | 'auto';

export interface TakePictureOptions {
  quality?: number;
  base64?: boolean;
  skipProcessing?: boolean;
}

export interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

// Camera view interface for ref
interface CameraViewRef {
  takePictureAsync: (options: {
    quality?: number;
    base64?: boolean;
    skipProcessing?: boolean;
  }) => Promise<{ uri: string; width: number; height: number; base64?: string }>;
}

export interface UseCameraReturn {
  cameraRef: React.RefObject<CameraViewRef | null>;
  hasPermission: boolean | null;
  isReady: boolean;
  facing: CameraFacing;
  flash: FlashMode;
  zoom: number;
  isLoading: boolean;
  error: string | null;
  photo: PhotoResult | null;
  requestPermission: () => Promise<boolean>;
  takePicture: (options?: TakePictureOptions) => Promise<PhotoResult | null>;
  toggleFacing: () => void;
  setFacing: (facing: CameraFacing) => void;
  setFlash: (flash: FlashMode) => void;
  setZoom: (zoom: number) => void;
  clearPhoto: () => void;
  onCameraReady: () => void;
}

// Fallback hook when expo-camera is not installed
function useFallbackPermissions(): [
  { granted: boolean } | null,
  () => Promise<{ granted: boolean }>,
] {
  return [null, async () => ({ granted: false })];
}

export function useCamera(): UseCameraReturn {
  const cameraRef = useRef<CameraViewRef | null>(null);
  const usePermissions = useCameraPermissionsHook || useFallbackPermissions;
  const [permission, requestPermissionAsync] = usePermissions();
  const [isReady, setIsReady] = useState(false);
  const [facing, setFacing] = useState<CameraFacing>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoom, setZoom] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PhotoResult | null>(null);

  const hasPermission = permission?.granted ?? null;

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const result = await requestPermissionAsync();
      if (!result.granted) {
        setError('Camera permission was denied');
        return false;
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request camera permission';
      setError(message);
      return false;
    }
  }, [requestPermissionAsync]);

  const takePicture = useCallback(
    async (options: TakePictureOptions = {}): Promise<PhotoResult | null> => {
      if (!cameraRef.current || !isReady) {
        setError('Camera is not ready');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result = await cameraRef.current.takePictureAsync({
          quality: options.quality ?? 0.8,
          base64: options.base64 ?? false,
          skipProcessing: options.skipProcessing ?? false,
        });

        if (!result) {
          setError('Failed to capture photo');
          return null;
        }

        const photoResult: PhotoResult = {
          uri: result.uri,
          width: result.width,
          height: result.height,
          base64: result.base64,
        };

        setPhoto(photoResult);
        return photoResult;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to take picture';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [isReady]
  );

  const toggleFacing = useCallback(() => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }, []);

  const clearPhoto = useCallback(() => {
    setPhoto(null);
    setError(null);
  }, []);

  const onCameraReady = useCallback(() => {
    setIsReady(true);
  }, []);

  return {
    cameraRef,
    hasPermission,
    isReady,
    facing,
    flash,
    zoom,
    isLoading,
    error,
    photo,
    requestPermission,
    takePicture,
    toggleFacing,
    setFacing,
    setFlash,
    setZoom,
    clearPhoto,
    onCameraReady,
  };
}
