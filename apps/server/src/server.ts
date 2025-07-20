import 'dotenv/config'
import express, { type Express } from 'express'
import cors from 'cors'
import http from 'http'
import passport from 'passport'
import { connectToDatabase } from './utils/database'
import { configurePassport } from './middleware/passport'
import { ShareDBService } from './services/sharedb.service'
import authRoutes from './routes/auth.routes'

/**
 * Main Express application. Sets up middleware, routes, and ShareDB server.
 */
const app: Express = express()
const PORT = process.env['PORT'] || 3001
const shareDBService = new ShareDBService()

// Middleware
app.use(cors({
  origin: process.env['CLIENT_URL'] || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(passport.initialize())

// Passport will be configured on first use

// Routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', environment: 'development' })
})

app.use('/api/auth', authRoutes)

const server = http.createServer(app)

/**
 * Initialize database, attach ShareDB, and start HTTP/WebSocket server.
 */
async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectToDatabase()
    
    // Attach ShareDB to server
    shareDBService.attachToServer(server)
    
    // Start server
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
      console.log(`WebSocket server ready for ShareDB connections`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Only start if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer()
}

export { app, server }
