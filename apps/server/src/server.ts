import { validateEnv } from './types/env';

// Validate and get typed environment variables at startup
const env = validateEnv();

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
import { initializeShareDB } from './services/sharedb.service';
import { connectToDatabase } from './utils/database';

/**
 * Main Express application. Sets up middleware, routes, and ShareDB server.
 */
const app: Express = express();
const PORT = parseInt(env.PORT, 10);
const shareDBService = initializeShareDB();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-eval'"], // For dev only
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'ws://localhost:3001'], // WebSocket
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// Request size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

// Passport will be configured on first use

// Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', environment: 'development' });
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', docRoutes);

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
      console.log(`Server listening on port ${PORT}`);
      console.log(`WebSocket server ready for ShareDB connections`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Only start if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, server };
