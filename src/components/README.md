# WebSocket Screenshot Components

This directory contains React components for receiving and displaying PNG files via WebSocket connections. The components are designed to work with a backend that sends screenshots through WebSocket endpoints.

## Components

### 1. ScreenshotViewer

A complete React component that displays live screenshots received via WebSocket.

**Features:**
- Real-time WebSocket connection to receive PNG files
- Automatic reconnection with configurable retry attempts
- Screenshot history with thumbnail navigation
- Fullscreen viewing mode
- Download functionality for individual screenshots
- Connection status indicators
- Error handling and display
- Configurable screenshot limit to prevent memory issues

**Props:**
```typescript
interface ScreenshotViewerProps {
  taskId: string;              // Required: Task ID for WebSocket connection
  token?: string;              // Optional: Auth token (falls back to localStorage)
  className?: string;          // Optional: Additional CSS classes
  autoConnect?: boolean;       // Optional: Auto-connect on mount (default: true)
  maxScreenshots?: number;     // Optional: Max screenshots to keep (default: 10)
}
```

**Usage:**
```tsx
import { ScreenshotViewer } from './components/ScreenshotViewer';

// Basic usage
<ScreenshotViewer taskId="task_123" />

// With custom configuration
<ScreenshotViewer 
  taskId="task_123"
  token="your-auth-token"
  autoConnect={false}
  maxScreenshots={20}
  className="custom-styles"
/>
```

### 2. useScreenshotWebSocket Hook

A custom React hook that manages WebSocket connections for screenshot data.

**Features:**
- WebSocket connection management
- Automatic reconnection logic
- Screenshot data processing (JSON and binary)
- Connection state management
- Error handling
- Configurable options

**Parameters:**
```typescript
interface UseScreenshotWebSocketOptions {
  taskId: string;
  token?: string;
  autoConnect?: boolean;
  maxScreenshots?: number;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  pingInterval?: number;
}
```

**Returns:**
```typescript
interface UseScreenshotWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  screenshots: ScreenshotData[];
  currentScreenshot: string | null;
  connectionAttempts: number;
  connect: () => void;
  disconnect: () => void;
  clearScreenshots: () => void;
  clearError: () => void;
}
```

**Usage:**
```tsx
import { useScreenshotWebSocket } from './hooks/useScreenshotWebSocket';

const MyComponent = () => {
  const {
    isConnected,
    screenshots,
    currentScreenshot,
    connect,
    disconnect
  } = useScreenshotWebSocket({
    taskId: 'task_123',
    autoConnect: true
  });

  return (
    <div>
      <button onClick={isConnected ? disconnect : connect}>
        {isConnected ? 'Disconnect' : 'Connect'}
      </button>
      {currentScreenshot && (
        <img src={currentScreenshot} alt="Current Screenshot" />
      )}
    </div>
  );
};
```

### 3. ScreenshotViewerExample

A demonstration component showing how to integrate the ScreenshotViewer with task management.

**Features:**
- Task ID input and validation
- Start/stop viewing controls
- Configuration settings panel
- Usage instructions
- Integration examples

## WebSocket Protocol

The components expect the backend to implement the following WebSocket protocol:

### Connection
- **URL:** `ws://localhost:8000/api/v1/tasks/ws/{taskId}?token={authToken}`
- **Authentication:** Token-based via query parameter

### Message Types

#### Text Messages (JSON)
```json
{
  "type": "screenshot" | "task_update" | "error" | "connection_status",
  "data": {
    "image": "base64-encoded-png",
    "timestamp": "2024-01-01T12:00:00Z",
    "task_id": "task_123",
    "filename": "screenshot.png"
  },
  "message": "Optional message"
}
```

#### Binary Messages
- Raw PNG file data as Blob
- Automatically converted to base64 for display

#### Ping/Pong
- Client sends "ping" every 30 seconds
- Server should respond with "pong"

## Backend Integration

Your backend should implement WebSocket endpoints that:

1. **Accept connections** at `/api/v1/tasks/ws/{task_id}`
2. **Validate authentication** tokens
3. **Send screenshots** as either:
   - JSON messages with base64-encoded images
   - Binary PNG data
4. **Handle ping/pong** for connection keepalive
5. **Send task updates** and error messages

### Example Backend (Python/FastAPI)
```python
@app.websocket("/api/v1/tasks/ws/{task_id}")
async def websocket_endpoint(websocket: WebSocket, task_id: str, token: str):
    # Validate token
    if not validate_token(token):
        await websocket.close(code=1008)
        return
    
    await websocket.accept()
    
    try:
        while True:
            # Send screenshot as JSON
            screenshot_data = {
                "type": "screenshot",
                "data": {
                    "image": base64_encoded_png,
                    "timestamp": datetime.now().isoformat(),
                    "task_id": task_id,
                    "filename": "screenshot.png"
                }
            }
            await websocket.send_json(screenshot_data)
            
            # Or send as binary
            # await websocket.send_bytes(png_bytes)
            
            await asyncio.sleep(1)  # Send every second
            
    except WebSocketDisconnect:
        pass
```

## Environment Configuration

Set the following environment variables:

```env
VITE_API_BASE_URL=http://localhost:8000
```

The WebSocket URL is automatically derived by replacing `http` with `ws`.

## Error Handling

The components handle various error scenarios:

- **Connection failures:** Automatic retry with exponential backoff
- **Authentication errors:** Clear error messages
- **Network issues:** Reconnection attempts
- **Invalid data:** Graceful error handling
- **Memory management:** Automatic cleanup of old screenshots

## Styling

The components use Tailwind CSS classes. You can customize the appearance by:

1. **Passing custom className props**
2. **Overriding Tailwind classes**
3. **Using CSS modules or styled-components**

## Performance Considerations

- **Memory usage:** Screenshots are limited by `maxScreenshots` prop
- **Network efficiency:** Binary data is preferred over base64 JSON
- **Reconnection logic:** Prevents excessive connection attempts
- **Image optimization:** Consider compressing PNGs on the backend

## Troubleshooting

### Common Issues

1. **Connection fails:**
   - Check if backend WebSocket endpoint is running
   - Verify authentication token
   - Check CORS settings

2. **No screenshots appear:**
   - Verify task ID is correct
   - Check if backend is sending data
   - Look for JavaScript console errors

3. **Memory issues:**
   - Reduce `maxScreenshots` value
   - Clear screenshots periodically
   - Monitor browser memory usage

### Debug Mode

Enable debug logging by opening browser console. The components log:
- Connection events
- Message reception
- Error details
- Reconnection attempts

## License

These components are part of the CargoWise AI Frontend project.