import { type AppLogger, createAppLogger } from '@collab-edit/shared';

// Create dedicated audit logger with file output for production
const auditLogger: AppLogger = createAppLogger('audit', {
  enableFile: true,
  filePath: 'logs/audit.log',
  level: 'info',
});

export type AuditEvent = {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'allowed' | 'denied';
  reason?: string;
  metadata?: Record<string, unknown>;
};

export const logAuditEvent = (event: AuditEvent): void => {
  auditLogger.info('AUDIT_EVENT', {
    eventType: 'audit',
    timestamp: new Date().toISOString(),
    ...event,
  });
};
