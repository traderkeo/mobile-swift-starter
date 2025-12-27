/**
 * Network state detection and offline support
 *
 * Provides hooks and utilities for monitoring network connectivity
 * and handling offline scenarios gracefully.
 *
 * @example
 * ```typescript
 * import { useNetwork } from '@/lib/network';
 *
 * function MyComponent() {
 *   const { isConnected, isInternetReachable, type } = useNetwork();
 *
 *   if (!isConnected) {
 *     return <OfflineBanner />;
 *   }
 *
 *   return <Content />;
 * }
 * ```
 */

import { useEffect, useState, useCallback } from 'react';
import NetInfo, {
  NetInfoState,
  NetInfoStateType,
  NetInfoSubscription,
} from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_ACTIONS_KEY = '@network:offline_actions';

// Types
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: NetInfoStateType;
  isWifi: boolean;
  isCellular: boolean;
  details: NetInfoState['details'];
}

export interface OfflineAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

// Global state for synchronous access
let currentNetworkState: NetworkState = {
  isConnected: true,
  isInternetReachable: true,
  type: NetInfoStateType.unknown,
  isWifi: false,
  isCellular: false,
  details: null,
};

/**
 * Transform NetInfo state to our NetworkState
 */
function transformState(state: NetInfoState): NetworkState {
  return {
    isConnected: state.isConnected ?? false,
    isInternetReachable: state.isInternetReachable,
    type: state.type,
    isWifi: state.type === NetInfoStateType.wifi,
    isCellular: state.type === NetInfoStateType.cellular,
    details: state.details,
  };
}

/**
 * Get current network state (async)
 */
export async function getNetworkState(): Promise<NetworkState> {
  const state = await NetInfo.fetch();
  currentNetworkState = transformState(state);
  return currentNetworkState;
}

/**
 * Get current network state synchronously (uses cached value)
 * Note: This may be stale if network changed recently
 */
export function getNetworkStateSync(): NetworkState {
  return currentNetworkState;
}

/**
 * Check if device is connected to the internet
 */
export async function isOnline(): Promise<boolean> {
  const state = await getNetworkState();
  return state.isConnected && state.isInternetReachable !== false;
}

/**
 * Subscribe to network state changes
 */
export function subscribeToNetworkChanges(
  callback: (state: NetworkState) => void
): NetInfoSubscription {
  return NetInfo.addEventListener((state) => {
    currentNetworkState = transformState(state);
    callback(currentNetworkState);
  });
}

/**
 * Hook to monitor network state
 */
export function useNetwork(): NetworkState & {
  refresh: () => Promise<void>;
} {
  const [state, setState] = useState<NetworkState>(currentNetworkState);

  useEffect(() => {
    // Get initial state
    getNetworkState().then(setState);

    // Subscribe to changes
    const unsubscribe = subscribeToNetworkChanges(setState);

    return () => {
      unsubscribe();
    };
  }, []);

  const refresh = useCallback(async () => {
    const newState = await getNetworkState();
    setState(newState);
  }, []);

  return { ...state, refresh };
}

/**
 * Hook that returns true when online
 */
export function useIsOnline(): boolean {
  const { isConnected, isInternetReachable } = useNetwork();
  return isConnected && isInternetReachable !== false;
}

/**
 * Hook that triggers callback when network state changes
 */
export function useNetworkEffect(onOnline?: () => void, onOffline?: () => void): void {
  const [wasOnline, setWasOnline] = useState<boolean | null>(null);
  const { isConnected, isInternetReachable } = useNetwork();
  const isOnlineNow = isConnected && isInternetReachable !== false;

  useEffect(() => {
    if (wasOnline === null) {
      setWasOnline(isOnlineNow);
      return;
    }

    if (isOnlineNow && !wasOnline) {
      onOnline?.();
    } else if (!isOnlineNow && wasOnline) {
      onOffline?.();
    }

    setWasOnline(isOnlineNow);
  }, [isOnlineNow, wasOnline, onOnline, onOffline]);
}

// Offline action queue
/**
 * Queue an action to be executed when online
 */
export async function queueOfflineAction(type: string, payload: unknown): Promise<string> {
  const action: OfflineAction = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
  };

  const actions = await getOfflineActions();
  actions.push(action);
  await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(actions));

  return action.id;
}

/**
 * Get all queued offline actions
 */
export async function getOfflineActions(): Promise<OfflineAction[]> {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_ACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Remove a specific offline action
 */
export async function removeOfflineAction(id: string): Promise<void> {
  const actions = await getOfflineActions();
  const filtered = actions.filter((a) => a.id !== id);
  await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(filtered));
}

/**
 * Clear all offline actions
 */
export async function clearOfflineActions(): Promise<void> {
  await AsyncStorage.removeItem(OFFLINE_ACTIONS_KEY);
}

/**
 * Process offline actions with a handler
 */
export async function processOfflineActions(
  handler: (action: OfflineAction) => Promise<boolean>
): Promise<{ processed: number; failed: number }> {
  const actions = await getOfflineActions();
  let processed = 0;
  let failed = 0;

  const remaining: OfflineAction[] = [];

  for (const action of actions) {
    try {
      const success = await handler(action);
      if (success) {
        processed++;
      } else {
        action.retryCount++;
        if (action.retryCount < 3) {
          remaining.push(action);
        }
        failed++;
      }
    } catch {
      action.retryCount++;
      if (action.retryCount < 3) {
        remaining.push(action);
      }
      failed++;
    }
  }

  await AsyncStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(remaining));
  return { processed, failed };
}

/**
 * Wait for network connection with timeout
 */
export function waitForConnection(timeoutMs: number = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeoutMs);

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      }
    });

    // Check immediately
    NetInfo.fetch().then((state) => {
      if (state.isConnected && state.isInternetReachable) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(true);
      }
    });
  });
}

export { NetInfoStateType };
