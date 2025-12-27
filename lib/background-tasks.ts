/**
 * Background Tasks support
 *
 * Handles background fetch and background processing for iOS and Android.
 * Use for syncing data, updating content, or processing tasks when app is in background.
 *
 * @example
 * ```typescript
 * import { registerBackgroundTask, BackgroundTaskName } from '@/lib/background-tasks';
 *
 * // Register a background fetch task
 * registerBackgroundTask(BackgroundTaskName.SYNC_DATA, async () => {
 *   await syncUserData();
 *   return true; // Return true on success
 * });
 * ```
 */

import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Task names
export enum BackgroundTaskName {
  SYNC_DATA = 'BACKGROUND_SYNC_DATA',
  REFRESH_CONTENT = 'BACKGROUND_REFRESH_CONTENT',
  PROCESS_OFFLINE_QUEUE = 'BACKGROUND_PROCESS_OFFLINE',
  CHECK_SUBSCRIPTION = 'BACKGROUND_CHECK_SUBSCRIPTION',
}

// Storage keys
const LAST_RUN_PREFIX = '@bg_task:last_run:';
const TASK_RESULT_PREFIX = '@bg_task:result:';

// Types
export interface BackgroundTaskResult {
  success: boolean;
  timestamp: number;
  error?: string;
  data?: unknown;
}

type TaskHandler = () => Promise<boolean>;

// Registered handlers
const taskHandlers = new Map<string, TaskHandler>();

/**
 * Define a task that can be executed in the background
 */
function defineTask(taskName: string) {
  TaskManager.defineTask(taskName, async () => {
    try {
      const handler = taskHandlers.get(taskName);
      if (!handler) {
        console.warn(`[BackgroundTasks] No handler for task: ${taskName}`);
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }

      const success = await handler();

      // Save task result
      await saveTaskResult(taskName, { success, timestamp: Date.now() });

      return success
        ? BackgroundFetch.BackgroundFetchResult.NewData
        : BackgroundFetch.BackgroundFetchResult.NoData;
    } catch (error) {
      console.error(`[BackgroundTasks] Task failed: ${taskName}`, error);
      await saveTaskResult(taskName, {
        success: false,
        timestamp: Date.now(),
        error: (error as Error).message,
      });
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
}

// Define all tasks on module load
Object.values(BackgroundTaskName).forEach(defineTask);

/**
 * Register a background task handler
 */
export async function registerBackgroundTask(
  taskName: BackgroundTaskName,
  handler: TaskHandler,
  options?: {
    minimumInterval?: number; // Minimum interval in seconds (default: 15 minutes)
    stopOnTerminate?: boolean; // Stop when app is terminated (Android)
    startOnBoot?: boolean; // Start on device boot (Android)
  }
): Promise<boolean> {
  const {
    minimumInterval = 15 * 60, // 15 minutes minimum
    stopOnTerminate = false,
    startOnBoot = true,
  } = options || {};

  // Store handler
  taskHandlers.set(taskName, handler);

  try {
    // Check if background fetch is available
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.BackgroundFetchStatus.Denied) {
      console.warn('[BackgroundTasks] Background fetch is denied');
      return false;
    }

    if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
      console.warn('[BackgroundTasks] Background fetch is restricted');
      return false;
    }

    // Register the task
    await BackgroundFetch.registerTaskAsync(taskName, {
      minimumInterval,
      stopOnTerminate,
      startOnBoot,
    });

    if (__DEV__) {
      console.log(`[BackgroundTasks] Registered: ${taskName}`);
    }

    return true;
  } catch (error) {
    console.error(`[BackgroundTasks] Failed to register: ${taskName}`, error);
    return false;
  }
}

/**
 * Unregister a background task
 */
export async function unregisterBackgroundTask(taskName: BackgroundTaskName): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(taskName);
    taskHandlers.delete(taskName);

    if (__DEV__) {
      console.log(`[BackgroundTasks] Unregistered: ${taskName}`);
    }
  } catch (error) {
    console.error(`[BackgroundTasks] Failed to unregister: ${taskName}`, error);
  }
}

/**
 * Check if a task is registered
 */
export async function isTaskRegistered(taskName: BackgroundTaskName): Promise<boolean> {
  return TaskManager.isTaskRegisteredAsync(taskName);
}

/**
 * Get all registered tasks
 */
export async function getRegisteredTasks(): Promise<TaskManager.RegisteredTask[]> {
  return TaskManager.getRegisteredTasksAsync();
}

/**
 * Get background fetch status
 */
export async function getBackgroundFetchStatus(): Promise<{
  status: BackgroundFetch.BackgroundFetchStatus;
  statusName: string;
  isAvailable: boolean;
}> {
  const status = await BackgroundFetch.getStatusAsync();

  const statusNames: Record<BackgroundFetch.BackgroundFetchStatus, string> = {
    [BackgroundFetch.BackgroundFetchStatus.Available]: 'Available',
    [BackgroundFetch.BackgroundFetchStatus.Denied]: 'Denied',
    [BackgroundFetch.BackgroundFetchStatus.Restricted]: 'Restricted',
  };

  const statusName = status != null ? statusNames[status] : 'Unknown';

  return {
    status: status ?? BackgroundFetch.BackgroundFetchStatus.Restricted,
    statusName,
    isAvailable: status === BackgroundFetch.BackgroundFetchStatus.Available,
  };
}

/**
 * Manually trigger a background task (for testing)
 */
export async function triggerBackgroundTask(
  taskName: BackgroundTaskName
): Promise<BackgroundTaskResult> {
  const handler = taskHandlers.get(taskName);
  if (!handler) {
    return {
      success: false,
      timestamp: Date.now(),
      error: 'Task not registered',
    };
  }

  try {
    const success = await handler();
    const result: BackgroundTaskResult = { success, timestamp: Date.now() };
    await saveTaskResult(taskName, result);
    return result;
  } catch (error) {
    const result: BackgroundTaskResult = {
      success: false,
      timestamp: Date.now(),
      error: (error as Error).message,
    };
    await saveTaskResult(taskName, result);
    return result;
  }
}

/**
 * Save task execution result
 */
async function saveTaskResult(taskName: string, result: BackgroundTaskResult): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_RUN_PREFIX + taskName, Date.now().toString());
    await AsyncStorage.setItem(TASK_RESULT_PREFIX + taskName, JSON.stringify(result));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get last task result
 */
export async function getTaskResult(
  taskName: BackgroundTaskName
): Promise<BackgroundTaskResult | null> {
  try {
    const data = await AsyncStorage.getItem(TASK_RESULT_PREFIX + taskName);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Get last run time for a task
 */
export async function getLastRunTime(taskName: BackgroundTaskName): Promise<Date | null> {
  try {
    const timestamp = await AsyncStorage.getItem(LAST_RUN_PREFIX + taskName);
    return timestamp ? new Date(parseInt(timestamp, 10)) : null;
  } catch {
    return null;
  }
}

/**
 * Initialize default background tasks
 * Call this in your app initialization
 */
export async function initializeBackgroundTasks(): Promise<void> {
  // Only available on native platforms
  if (Platform.OS === 'web') {
    return;
  }

  // Check status first
  const { isAvailable } = await getBackgroundFetchStatus();
  if (!isAvailable) {
    console.warn('[BackgroundTasks] Background fetch not available');
    return;
  }

  // Register default tasks with handlers
  // Override these with your own implementations

  // Sync data task - runs every 15 minutes
  await registerBackgroundTask(
    BackgroundTaskName.SYNC_DATA,
    async () => {
      // Implement your sync logic here
      if (__DEV__) {
        console.log('[BackgroundTasks] Sync data executed');
      }
      return true;
    },
    { minimumInterval: 15 * 60 }
  );

  // Process offline queue - runs every 30 minutes
  await registerBackgroundTask(
    BackgroundTaskName.PROCESS_OFFLINE_QUEUE,
    async () => {
      // Implement offline queue processing
      if (__DEV__) {
        console.log('[BackgroundTasks] Process offline queue executed');
      }
      return true;
    },
    { minimumInterval: 30 * 60 }
  );

  if (__DEV__) {
    console.log('[BackgroundTasks] Initialized');
  }
}

/**
 * Request background refresh permission (iOS)
 */
export async function requestBackgroundRefreshPermission(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return true; // Android doesn't need explicit permission
  }

  const { isAvailable } = await getBackgroundFetchStatus();
  return isAvailable;
}
