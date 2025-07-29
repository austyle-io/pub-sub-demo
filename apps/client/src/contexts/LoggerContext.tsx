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
 * @summary Provides a centralized logging configuration and context to the application.
 * @remarks
 * This component creates a logger instance and a factory function for creating
 * module-specific loggers. It should be used to wrap the entire application.
 * @param props - The component props.
 * @param props.children - The child components.
 * @param props.appVersion - The version of the application.
 * @param props.userId - The ID of the current user.
 * @returns A JSX element.
 * @since 1.0.0
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
 * @summary A hook to access the logger context.
 * @remarks
 * This hook provides access to the logger instance and the `createLogger` function.
 * It must be used within a `LoggerProvider`.
 * @returns The logger context value.
 * @throws {Error} If used outside of a `LoggerProvider`.
 * @since 1.0.0
 */
export const useLoggerContext = (): LoggerContextType => {
  const context = useContext(LoggerContext);

  if (context === undefined) {
    throw new Error('useLoggerContext must be used within a LoggerProvider');
  }

  return context;
};

/**
 * @summary A hook to create a module-specific logger.
 * @param module - The name of the module for the logger.
 * @returns A `ClientLogger` instance for the specified module.
 * @since 1.0.0
 */
export const useModuleLogger = (module: string): ClientLogger => {
  const { createLogger } = useLoggerContext();
  return useMemo(() => createLogger(module), [createLogger, module]);
};
