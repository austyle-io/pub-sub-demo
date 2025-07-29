import 'dotenv/config';
import http from 'node:http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import passport from 'passport';
import authRoutes from './routes/auth.routes';
import docRoutes from './routes/doc.routes';
import { apiLogger, serverLogger } from './services/logger';
import { initializeShareDB } from './services/sharedb.service';
import { validateEnv } from './types/env';
import { connectToDatabase } from './utils/database';

// Validate and get typed environment variables at startup
const env = validateEnv();

/**
 * Main Express application. Sets up middleware, routes, and ShareDB server.
 */
const app: Express = express();
const PORT = Number.parseInt(env.PORT, 10);
const shareDBService = initializeShareDB();

// Enhanced Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          ...(env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : []),
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          ...(env.NODE_ENV === 'development'
            ? ['ws://localhost:3001']
            : ['wss:']),
        ],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
      },
      reportOnly: env.NODE_ENV === 'development',
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// Additional Security Headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
    ].join(', '),
  );
  res.removeHeader('Server');
  next();
});

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();

  apiLogger.info('Request started', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;

    apiLogger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
    });

    if (duration > 1000) {
      apiLogger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration,
      });
    }

    return originalSend.call(this, data);
  };

  next();
});

// Enhanced Rate Limiting
const isTestEnvironment = env.NODE_ENV === 'test';

const generalLimiter = rateLimit({
  windowMs: isTestEnvironment ? 1000 : 15 * 60 * 1000,
  max: isTestEnvironment ? 1000 : 100,
  message: {
    error: 'Too many requests from this IP address. Please try again later.',
    retryAfter: isTestEnvironment ? 1 : 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestEnvironment ? () => true : undefined,
  handler: (req, res) => {
    apiLogger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: 'Too many requests from this IP address. Please try again later.',
      retryAfter: isTestEnvironment ? 1 : 900,
    });
  },
});

const authLimiter = rateLimit({
  windowMs: isTestEnvironment ? 1000 : 15 * 60 * 1000,
  max: isTestEnvironment ? 100 : 5,
  message: {
    error: 'Too many authentication attempts. Please try again later.',
    retryAfter: isTestEnvironment ? 1 : 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: isTestEnvironment ? () => true : undefined,
  handler: (req, res) => {
    apiLogger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      email: req.body?.email,
      path: req.path,
    });
    res.status(429).json({
      error: 'Too many authentication attempts. Please try again later.',
      retryAfter: isTestEnvironment ? 1 : 900,
    });
  },
});

const documentLimiter = rateLimit({
  windowMs: isTestEnvironment ? 1000 : 5 * 60 * 1000,
  max: isTestEnvironment ? 500 : 50,
  message: {
    error: 'Too many document operations. Please slow down.',
    retryAfter: isTestEnvironment ? 1 : 300,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: isTestEnvironment ? () => true : undefined,
  handler: (req, res) => {
    apiLogger.warn('Document rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });
    res.status(429).json({
      error: 'Too many document operations. Please slow down.',
      retryAfter: isTestEnvironment ? 1 : 300,
    });
  },
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/documents/', documentLimiter);

// Request size limits with security consideration
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Input Sanitization Middleware
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }
  next();
});

function sanitizeObject(obj: Record<string, unknown>): void {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = (obj[key] as string)
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .trim();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key] as Record<string, unknown>);
    }
  }
}

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(passport.initialize());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', docRoutes);

// Global Error Handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    apiLogger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path,
      ip: req.ip,
    });

    const message =
      env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

    res.status(500).json({
      error: message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  },
);

const server = http.createServer(app);

/**
 * Initialize database, attach ShareDB, and start HTTP/WebSocket server.
 */
async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectToDatabase();

    // Attach ShareDB to server
    shareDBService.attachToServer(server);

    // Start server
    server.listen(PORT, () => {
      serverLogger.info('Server started successfully', {
        port: PORT,
        nodeEnv: env.NODE_ENV,
        clientUrl: env.CLIENT_URL,
        features: {
          security: true,
          websockets: true,
          sharedb: true,
        },
      });
    });
  } catch (error) {
    serverLogger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      port: PORT,
    });
    process.exit(1);
  }
}

// Only start if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, server };
