import winston from 'winston';

const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/audit.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export interface AuditEvent {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  result: 'allowed' | 'denied';
  reason?: string;
  metadata?: Record<string, unknown>;
}

export const logAuditEvent = (event: AuditEvent): void => {
  auditLogger.info('AUDIT_EVENT', event);
};
