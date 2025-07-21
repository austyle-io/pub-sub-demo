# Testing Real-time Collaboration

## Current Status

The ShareDB real-time sync implementation has been completed with the following changes:

### 1. WebSocket Authentication ✅
- Client now passes JWT token as query parameter in WebSocket URL
- Server authenticates WebSocket connections during the upgrade handshake
- Failed authentication results in 401 response and connection rejection

### 2. OT Operations Implementation ✅
- DocumentEditor now submits proper json0 OT operations for content changes
- Title changes are also submitted as OT operations
- Remote operations are listened to and applied to local state

### 3. Real-time Synchronization ✅
- Added event listener for 'op' events on ShareDB document
- Local state updates when remote changes arrive
- Both content and title fields are synchronized

## Implementation Details

### Client-side Changes (useShareDB.ts):
```typescript
// Pass JWT token in WebSocket connection URL
const socket = new ReconnectingWebSocketLib(
  `ws://localhost:3001?token=${encodeURIComponent(accessToken)}`,
);
```

### Server-side Changes (sharedb.service.ts):
```typescript
// Authenticate WebSocket during upgrade
server.on('upgrade', async (request, socket, head) => {
  try {
    const user = await authenticateWebSocket(request);
    (request as any).user = user;
    // Handle upgrade...
  } catch (error) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
  }
});
```

### DocumentEditor Changes:
```typescript
// Submit OT operations
const op = [{
  p: ['content'], // Path to field
  oi: newContent, // Object insert (new value)
  od: doc.data.content ?? '', // Object delete (old value)
}];
doc.submitOp(op);

// Listen for remote changes
doc.on('op', handleOp);
```

## Testing Instructions

To test the real-time collaboration:

1. Ensure MongoDB is running (already running in Docker)
2. Start the dev servers with: `export JWT_SECRET=test-secret && pnpm run dev`
3. Open two browser windows/tabs
4. Login with different users in each window
5. Create a document in one window
6. Share the document URL with the second window
7. Edit the document in either window - changes should appear in real-time in both

## Known Issues

1. Module resolution issues with ESM/CommonJS compatibility
2. Dev server startup needs fixing for proper testing

## Next Steps

1. Fix the dev server startup issues
2. Create an editor state machine with XState for better connection management
3. Add connection status indicators
4. Implement proper error handling and reconnection logic