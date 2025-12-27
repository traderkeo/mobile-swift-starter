/**
 * Debug Utilities
 *
 * Development-only debugging tools.
 * All debug features are automatically disabled in production.
 */

import { Platform } from 'react-native';

// ============================================
// CONFIGURATION
// ============================================

interface DebugConfig {
  enableNetworkLogging: boolean;
  enableStateLogging: boolean;
  enableRenderLogging: boolean;
  enablePerformanceMetrics: boolean;
  logLevel: 'verbose' | 'debug' | 'info' | 'warn' | 'error';
}

const defaultConfig: DebugConfig = {
  enableNetworkLogging: __DEV__,
  enableStateLogging: __DEV__,
  enableRenderLogging: false, // Can be noisy
  enablePerformanceMetrics: __DEV__,
  logLevel: __DEV__ ? 'debug' : 'error',
};

let config = { ...defaultConfig };

/**
 * Configure debug settings
 */
export function configureDebug(options: Partial<DebugConfig>): void {
  config = { ...config, ...options };
}

// ============================================
// LOGGING
// ============================================

type LogLevel = 'verbose' | 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  verbose: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

const LOG_COLORS: Record<LogLevel, string> = {
  verbose: '\x1b[37m', // white
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};

const RESET = '\x1b[0m';

function shouldLog(level: LogLevel): boolean {
  if (!__DEV__) return false;
  return LOG_LEVELS[level] >= LOG_LEVELS[config.logLevel];
}

function formatMessage(level: LogLevel, tag: string, message: string): string {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
  const color = LOG_COLORS[level];
  return `${color}[${timestamp}] [${level.toUpperCase()}] [${tag}]${RESET} ${message}`;
}

/**
 * Debug logger with tags and levels
 */
export const logger = {
  verbose(tag: string, message: string, ...args: unknown[]): void {
    if (shouldLog('verbose')) {
      console.log(formatMessage('verbose', tag, message), ...args);
    }
  },

  debug(tag: string, message: string, ...args: unknown[]): void {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', tag, message), ...args);
    }
  },

  info(tag: string, message: string, ...args: unknown[]): void {
    if (shouldLog('info')) {
      console.log(formatMessage('info', tag, message), ...args);
    }
  },

  warn(tag: string, message: string, ...args: unknown[]): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', tag, message), ...args);
    }
  },

  error(tag: string, message: string, ...args: unknown[]): void {
    if (shouldLog('error')) {
      console.error(formatMessage('error', tag, message), ...args);
    }
  },

  /**
   * Log with automatic tag from function name
   */
  log(message: string, ...args: unknown[]): void {
    this.debug('App', message, ...args);
  },

  /**
   * Group related logs
   */
  group(label: string, fn: () => void): void {
    if (!__DEV__) return;
    console.group(label);
    try {
      fn();
    } finally {
      console.groupEnd();
    }
  },

  /**
   * Log table data
   */
  table(data: unknown): void {
    if (!__DEV__) return;
    console.table(data);
  },

  /**
   * Time an operation
   */
  time(label: string): void {
    if (!__DEV__) return;
    console.time(label);
  },

  timeEnd(label: string): void {
    if (!__DEV__) return;
    console.timeEnd(label);
  },
};

// ============================================
// STATE INSPECTION
// ============================================

/**
 * Log state changes
 */
export function logStateChange<T>(
  tag: string,
  prevState: T,
  nextState: T,
  changes?: string[]
): void {
  if (!config.enableStateLogging) return;

  logger.group(`State Change: ${tag}`, () => {
    if (changes) {
      logger.debug('State', `Changed fields: ${changes.join(', ')}`);
    }
    logger.verbose('State', 'Previous:', prevState);
    logger.verbose('State', 'Next:', nextState);
  });
}

/**
 * Create a state logger for a specific context
 */
export function createStateLogger<T>(contextName: string) {
  return {
    logChange(prev: T, next: T, action?: string): void {
      if (!config.enableStateLogging) return;
      logger.debug(contextName, `${action || 'State changed'}`);
      logger.verbose(contextName, 'From:', prev);
      logger.verbose(contextName, 'To:', next);
    },

    logAction(action: string, payload?: unknown): void {
      if (!config.enableStateLogging) return;
      logger.info(contextName, `Action: ${action}`, payload || '');
    },
  };
}

// ============================================
// NETWORK DEBUGGING
// ============================================

interface NetworkLog {
  id: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  requestBody?: unknown;
  responseBody?: unknown;
  error?: string;
  timestamp: Date;
}

const networkLogs: NetworkLog[] = [];
const MAX_NETWORK_LOGS = 100;

/**
 * Log a network request
 */
export function logNetworkRequest(log: Omit<NetworkLog, 'id' | 'timestamp'>): string {
  if (!config.enableNetworkLogging) return '';

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const entry: NetworkLog = {
    ...log,
    id,
    timestamp: new Date(),
  };

  networkLogs.unshift(entry);
  if (networkLogs.length > MAX_NETWORK_LOGS) {
    networkLogs.pop();
  }

  const statusColor = log.status && log.status >= 400 ? 'error' : 'info';
  logger[statusColor](
    'Network',
    `${log.method} ${log.url} - ${log.status || 'pending'} (${log.duration || 0}ms)`
  );

  return id;
}

/**
 * Get recent network logs
 */
export function getNetworkLogs(): NetworkLog[] {
  return [...networkLogs];
}

/**
 * Clear network logs
 */
export function clearNetworkLogs(): void {
  networkLogs.length = 0;
}

// ============================================
// DEVICE INFO
// ============================================

/**
 * Get device/environment info for debugging
 */
export function getDebugInfo(): Record<string, unknown> {
  return {
    platform: Platform.OS,
    version: Platform.Version,
    isDev: __DEV__,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Print debug info to console
 */
export function printDebugInfo(): void {
  if (!__DEV__) return;

  const info = getDebugInfo();
  logger.group('Debug Info', () => {
    logger.table(info);
  });
}

// ============================================
// ASSERTIONS
// ============================================

/**
 * Assert a condition (development only)
 */
export function assert(condition: boolean, message: string): asserts condition {
  if (!__DEV__) return;

  if (!condition) {
    logger.error('Assert', message);
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Assert value is not null/undefined
 */
export function assertDefined<T>(value: T | null | undefined, name: string): asserts value is T {
  if (!__DEV__) return;

  if (value === null || value === undefined) {
    logger.error('Assert', `${name} is ${value === null ? 'null' : 'undefined'}`);
    throw new Error(`${name} must be defined`);
  }
}

// ============================================
// DEBUG OVERLAY HELPERS
// ============================================

interface DebugMetrics {
  fps: number;
  memory: number;
  renderCount: number;
}

let metricsCallback: ((metrics: DebugMetrics) => void) | null = null;

/**
 * Subscribe to debug metrics updates
 */
export function subscribeToMetrics(callback: (metrics: DebugMetrics) => void): () => void {
  metricsCallback = callback;
  return () => {
    metricsCallback = null;
  };
}

/**
 * Update debug metrics
 */
export function updateMetrics(metrics: Partial<DebugMetrics>): void {
  if (metricsCallback && config.enablePerformanceMetrics) {
    metricsCallback({
      fps: 60,
      memory: 0,
      renderCount: 0,
      ...metrics,
    });
  }
}

// ============================================
// CONDITIONAL EXECUTION
// ============================================

/**
 * Run code only in development
 */
export function devOnly<T>(fn: () => T): T | undefined {
  if (__DEV__) {
    return fn();
  }
  return undefined;
}

/**
 * Run code only in production
 */
export function prodOnly<T>(fn: () => T): T | undefined {
  if (!__DEV__) {
    return fn();
  }
  return undefined;
}

// Initialize debug info on load
if (__DEV__) {
  printDebugInfo();
}
