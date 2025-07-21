import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';
import { type ClientLogger, createClientLogger } from '../hooks/useLogger';

// Logger context type
type LoggerContextType = {
  logger: ClientLogger;
  createLogger: (module: string) => ClientLogger;
};

// Create the context
const LoggerContext = createContext<LoggerContextType | undefined>(undefined);

// Logger provider props
type LoggerProviderProps = {
  children: ReactNode;
  appVersion?: string;
  userId?: string;
};

/**
 * Logger Provider Component
 * Provides centralized logging configuration and context to the entire React app
 */
export const LoggerProvider = ({
  children,
  appVersion = '1.0.0',
  userId,
}: LoggerProviderProps) => {
  const value = useMemo(() => {
    // Base context for all loggers
    const baseContext = {
      appVersion,
      userId,
      sessionId: `session_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`,
    };

    // Create main app logger
    const logger = createClientLogger('app', baseContext);

    // Factory function for creating module-specific loggers
    const createLogger = (module: string): ClientLogger => {
      return createClientLogger(module, baseContext);
    };

    return {
      logger,
      createLogger,
    };
  }, [appVersion, userId]);

  return (
    <LoggerContext.Provider value={value}>{children}</LoggerContext.Provider>
  );
};

/**
 * Hook to access the logger context
 * Throws an error if used outside of LoggerProvider
 */
export const useLoggerContext = (): LoggerContextType => {
  const context = useContext(LoggerContext);

  if (context === undefined) {
    throw new Error('useLoggerContext must be used within a LoggerProvider');
  }

  return context;
};

/**
 * Hook to get a module-specific logger
 * Automatically includes global context from LoggerProvider
 */
export const useModuleLogger = (module: string): ClientLogger => {
  const { createLogger } = useLoggerContext();
  return useMemo(() => createLogger(module), [createLogger, module]);
};
