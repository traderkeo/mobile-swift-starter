/**
 * Media Components
 *
 * Components for handling media (images, camera) in the app.
 *
 * INSTALLATION REQUIRED:
 * - expo install expo-image-picker (for ImagePicker)
 * - expo install expo-camera (for CameraCapture)
 *
 * @example
 * import { ImagePicker, CameraCapture } from '@/components/media';
 *
 * // Pick image from library
 * <ImagePicker onImageSelected={(image) => console.log(image)} />
 *
 * // Take photo with camera
 * <CameraCapture onPhotoTaken={(photo) => console.log(photo)} />
 */

export { ImagePicker } from './ImagePicker';
export type { ImagePickerProps, ImageResult } from './ImagePicker';

export { CameraCapture } from './CameraCapture';
export type { CameraCaptureProps, PhotoResult, CameraFacing, FlashMode } from './CameraCapture';
