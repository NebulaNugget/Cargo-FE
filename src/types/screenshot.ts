/**
 * TypeScript type definitions for WebSocket screenshot components
 */

/**
 * Represents a screenshot data object
 */
export interface ScreenshotData {
  /** Unique identifier for the screenshot */
  id: string;
  /** Base64-encoded image data or data URL */
  image: string;
  /** ISO timestamp when the screenshot was taken */
  timestamp: string;
  /** Optional filename for the screenshot */
  filename?: string;
}

/**
 * WebSocket message types for screenshot communication
 */
export type ScreenshotMessageType = 
  | 'screenshot'
  | 'task_update'
  | 'error'
  | 'connection_status';

/**
 * Data payload for screenshot messages
 */
export interface ScreenshotMessageData {
  /** Base64-encoded PNG image data */
  image?: string;
  /** ISO timestamp when the screenshot was taken */
  timestamp?: string;
  /** Task ID associated with the screenshot */
  task_id?: string;
  /** Filename for the screenshot */
  filename?: string;
}

/**
 * WebSocket message structure for screenshot communication
 */
export interface ScreenshotMessage {
  /** Type of the message */
  type: ScreenshotMessageType;
  /** Optional data payload */
  data?: ScreenshotMessageData;
  /** Optional text message */
  message?: string;
}

/**
 * Configuration options for the screenshot WebSocket hook
 */
export interface UseScreenshotWebSocketOptions {
  /** Task ID for the WebSocket connection */
  taskId: string;
  /** Authentication token (optional, falls back to localStorage) */
  token?: string;
  /** Whether to auto-connect on mount */
  autoConnect?: boolean;
  /** Maximum number of screenshots to keep in memory */
  maxScreenshots?: number;
  /** Number of reconnection attempts before giving up */
  reconnectAttempts?: number;
  /** Delay between reconnection attempts in milliseconds */
  reconnectDelay?: number;
  /** Interval for sending ping messages in milliseconds */
  pingInterval?: number;
}

/**
 * Return type for the screenshot WebSocket hook
 */
export interface UseScreenshotWebSocketReturn {
  /** Whether the WebSocket is currently connected */
  isConnected: boolean;
  /** Whether a connection attempt is in progress */
  isConnecting: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Array of screenshot data objects */
  screenshots: ScreenshotData[];
  /** Currently displayed screenshot (base64 data URL) */
  currentScreenshot: string | null;
  /** Number of connection attempts made */
  connectionAttempts: number;
  /** Function to manually connect to the WebSocket */
  connect: () => void;
  /** Function to manually disconnect from the WebSocket */
  disconnect: () => void;
  /** Function to clear all screenshots from memory */
  clearScreenshots: () => void;
  /** Function to clear the current error */
  clearError: () => void;
}

/**
 * Props for the ScreenshotViewer component
 */
export interface ScreenshotViewerProps {
  /** Task ID for the WebSocket connection */
  taskId: string;
  /** Authentication token (optional, falls back to localStorage) */
  token?: string;
  /** Additional CSS classes to apply */
  className?: string;
  /** Whether to auto-connect on mount */
  autoConnect?: boolean;
  /** Maximum number of screenshots to keep in memory */
  maxScreenshots?: number;
}

/**
 * WebSocket connection states
 */
export enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}

/**
 * WebSocket close codes
 */
export enum WebSocketCloseCode {
  NORMAL_CLOSURE = 1000,
  GOING_AWAY = 1001,
  PROTOCOL_ERROR = 1002,
  UNSUPPORTED_DATA = 1003,
  NO_STATUS_RECEIVED = 1005,
  ABNORMAL_CLOSURE = 1006,
  INVALID_FRAME_PAYLOAD_DATA = 1007,
  POLICY_VIOLATION = 1008,
  MESSAGE_TOO_BIG = 1009,
  MANDATORY_EXTENSION = 1010,
  INTERNAL_SERVER_ERROR = 1011,
  SERVICE_RESTART = 1012,
  TRY_AGAIN_LATER = 1013,
  BAD_GATEWAY = 1014,
  TLS_HANDSHAKE = 1015
}

/**
 * Error types for screenshot WebSocket operations
 */
export enum ScreenshotErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  MESSAGE_PROCESSING_FAILED = 'MESSAGE_PROCESSING_FAILED',
  BINARY_DATA_PROCESSING_FAILED = 'BINARY_DATA_PROCESSING_FAILED',
  RECONNECTION_FAILED = 'RECONNECTION_FAILED',
  INVALID_TASK_ID = 'INVALID_TASK_ID',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Screenshot error object
 */
export interface ScreenshotError {
  /** Type of error */
  type: ScreenshotErrorType;
  /** Human-readable error message */
  message: string;
  /** Original error object, if available */
  originalError?: Error;
  /** Timestamp when the error occurred */
  timestamp: string;
  /** Task ID associated with the error */
  taskId?: string;
}

/**
 * Configuration for screenshot download
 */
export interface ScreenshotDownloadOptions {
  /** Screenshot data to download */
  screenshot: ScreenshotData;
  /** Custom filename (optional) */
  filename?: string;
  /** Image quality for conversion (0-1) */
  quality?: number;
  /** Image format for conversion */
  format?: 'png' | 'jpeg' | 'webp';
}

/**
 * Statistics for screenshot WebSocket connection
 */
export interface ScreenshotConnectionStats {
  /** Total number of screenshots received */
  totalScreenshots: number;
  /** Number of connection attempts */
  connectionAttempts: number;
  /** Total bytes received */
  bytesReceived: number;
  /** Connection uptime in milliseconds */
  uptime: number;
  /** Average time between screenshots in milliseconds */
  averageInterval: number;
  /** Last screenshot timestamp */
  lastScreenshotTime: string | null;
}

/**
 * Event handlers for screenshot WebSocket
 */
export interface ScreenshotWebSocketEventHandlers {
  /** Called when a new screenshot is received */
  onScreenshot?: (screenshot: ScreenshotData) => void;
  /** Called when connection state changes */
  onConnectionChange?: (isConnected: boolean) => void;
  /** Called when an error occurs */
  onError?: (error: ScreenshotError) => void;
  /** Called when connection is established */
  onConnect?: () => void;
  /** Called when connection is closed */
  onDisconnect?: (code: number, reason: string) => void;
  /** Called when a task update is received */
  onTaskUpdate?: (data: any) => void;
}

/**
 * Advanced configuration for screenshot WebSocket
 */
export interface AdvancedScreenshotWebSocketOptions extends UseScreenshotWebSocketOptions {
  /** Custom WebSocket URL (overrides default construction) */
  customUrl?: string;
  /** Event handlers */
  eventHandlers?: ScreenshotWebSocketEventHandlers;
  /** Whether to enable debug logging */
  debug?: boolean;
  /** Custom headers for WebSocket connection */
  headers?: Record<string, string>;
  /** Protocols to use for WebSocket connection */
  protocols?: string | string[];
  /** Whether to enable binary data processing */
  enableBinaryData?: boolean;
  /** Maximum message size in bytes */
  maxMessageSize?: number;
}