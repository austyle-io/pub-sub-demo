import { IncomingMessage } from 'http'
import { parse } from 'url'
import type { Socket } from 'net'
import { verifyAccessToken } from '@collab-edit/shared'
import type { JwtPayload } from '@collab-edit/shared'

export interface AuthenticatedRequest extends IncomingMessage {
  user?: {
    sub: string
    email: string
    role: string
  }
}

export function authenticateWebSocket(
  req: IncomingMessage,
  socket: Socket,
  _head: Buffer,
  callback: (authenticated: boolean) => void
): void {
  try {
    // Extract token from query string
    const { query } = parse(req.url || '', true)
    const token = query['token'] as string
    
    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      callback(false)
      return
    }
    
    // Verify token
    const verifyFn = verifyAccessToken
    const decoded = verifyFn(token) as JwtPayload
    
    // Attach user to request
    (req as AuthenticatedRequest).user = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role
    }
    
    callback(true)
  } catch (error) {
    console.error('WebSocket authentication failed:', error)
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
    callback(false)
  }
}