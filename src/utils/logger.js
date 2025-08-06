/**
 * Logger Utility
 * Provides structured logging for the Has-Needs protocol
 */

import debug from 'debug';

// Log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  trace: 4
};

// Default log level from environment or 'info'
const DEFAULT_LOG_LEVEL = process.env.LOG_LEVEL || 'info';

/**
 * Create a logger instance for a specific namespace
 */
export function createLogger(namespace) {
  const logLevel = LOG_LEVELS[DEFAULT_LOG_LEVEL] || LOG_LEVELS.info;
  
  // Create debug instances for each level
  const debuggers = {
    error: debug(`has-needs:${namespace}:error`),
    warn: debug(`has-needs:${namespace}:warn`),
    info: debug(`has-needs:${namespace}:info`),
    debug: debug(`has-needs:${namespace}:debug`),
    trace: debug(`has-needs:${namespace}:trace`)
  };

  // Enable colors
  debuggers.error.color = 1; // Red
  debuggers.warn.color = 3;  // Yellow
  debuggers.info.color = 4;  // Blue
  debuggers.debug.color = 2; // Green
  debuggers.trace.color = 8; // Gray

  const logger = {
    error: (...args) => {
      if (logLevel >= LOG_LEVELS.error) {
        debuggers.error(...args);
        // Also log to console.error for errors
        if (process.env.NODE_ENV !== 'test') {
          console.error(`[${namespace}:ERROR]`, ...args);
        }
      }
    },
    
    warn: (...args) => {
      if (logLevel >= LOG_LEVELS.warn) {
        debuggers.warn(...args);
      }
    },
    
    info: (...args) => {
      if (logLevel >= LOG_LEVELS.info) {
        debuggers.info(...args);
      }
    },
    
    debug: (...args) => {
      if (logLevel >= LOG_LEVELS.debug) {
        debuggers.debug(...args);
      }
    },
    
    trace: (...args) => {
      if (logLevel >= LOG_LEVELS.trace) {
        debuggers.trace(...args);
      }
    },

    // Utility methods
    setLevel: (level) => {
      // This would require more complex implementation to change level at runtime
      logger.info(`Log level change requested: ${level} (requires restart)`);
    },

    child: (childNamespace) => {
      return createLogger(`${namespace}:${childNamespace}`);
    }
  };

  return logger;
}

/**
 * Create a performance logger that measures execution time
 */
export function createPerformanceLogger(namespace) {
  const logger = createLogger(`${namespace}:perf`);
  
  return {
    time: (label) => {
      const startTime = Date.now();
      return {
        end: () => {
          const duration = Date.now() - startTime;
          logger.debug(`${label}: ${duration}ms`);
          return duration;
        }
      };
    },
    
    measure: async (label, fn) => {
      const timer = logger.time(label);
      try {
        const result = await fn();
        timer.end();
        return result;
      } catch (error) {
        timer.end();
        throw error;
      }
    }
  };
}

/**
 * Enable debug output for specific namespaces
 */
export function enableDebug(namespaces = 'has-needs:*') {
  debug.enabled = () => true;
  process.env.DEBUG = namespaces;
}

/**
 * Configure logging based on environment
 */
export function configureLogging() {
  if (process.env.NODE_ENV === 'development') {
    enableDebug('has-needs:*');
  } else if (process.env.NODE_ENV === 'production') {
    enableDebug('has-needs:*:error,has-needs:*:warn,has-needs:*:info');
  }
}

// Auto-configure based on environment
configureLogging();

export default { createLogger, createPerformanceLogger, enableDebug, configureLogging };