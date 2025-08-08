import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  ScreenshotData,
  ScreenshotMessage,
  UseScreenshotWebSocketOptions,
  UseScreenshotWebSocketReturn
} from '../types/screenshot';

export const useScreenshotWebSocket = ({
  taskId,
  token,
  autoConnect = true,
  maxScreenshots = 10,
  reconnectAttempts = 5,
  reconnectDelay = 3000,
  pingInterval = 30000
}: UseScreenshotWebSocketOptions): UseScreenshotWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<ScreenshotData[]>([]);
  const [currentScreenshot, setCurrentScreenshot] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const WS_BASE_URL = API_BASE_URL.replace('http', 'ws');

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearScreenshots = useCallback(() => {
    setScreenshots([]);
    setCurrentScreenshot(null);
  }, []);

  const handleWebSocketMessage = useCallback((message: any) => {
    console.log('Processing message:', message);
    switch (message.type) {
      case 'screenshot':
        // Handle both message.data.image and message.data directly
        const imageData = message.data?.image || message.data;
        if (imageData) {
          // Ensure the image data has the proper data URL format
          const formattedImage = imageData.startsWith('data:') ? imageData : `data:image/png;base64,${imageData}`;
          
          const newScreenshot: ScreenshotData = {
            id: Date.now().toString(),
            image: formattedImage,
            timestamp: message.timestamp || message.data?.timestamp || new Date().toISOString(),
            filename: message.filename || message.data?.filename || `screenshot_${Date.now()}.png`
          };
          
          console.log('Adding new screenshot:', newScreenshot);
          
          setScreenshots(prev => {
            const updated = [newScreenshot, ...prev];
            return updated.slice(0, maxScreenshots);
          });
          
          setCurrentScreenshot(formattedImage);
        } else {
          console.log('No image data found in screenshot message:', message);
        }
        break;
        
      case 'task_update':
        console.log('Task update received:', message.data);
        break;
        
      case 'error':
        setError(message.message || 'Unknown error occurred');
        break;
        
      case 'connection_status':
        console.log('Connection status:', message.message);
        break;
        
      default:
        console.log('Unknown message type:', message);
    }
  }, [maxScreenshots]);

  const handleBinaryData = useCallback(async (blob: Blob) => {
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const newScreenshot: ScreenshotData = {
          id: Date.now().toString(),
          image: base64,
          timestamp: new Date().toISOString(),
          filename: `screenshot_${Date.now()}.png`
        };
        
        setScreenshots(prev => {
          const updated = [newScreenshot, ...prev];
          return updated.slice(0, maxScreenshots);
        });
        
        setCurrentScreenshot(base64);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error processing binary data:', error);
      setError('Failed to process screenshot data');
    }
  }, [maxScreenshots]);

  const startPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send('ping');
      }
    }, pingInterval);
  }, [pingInterval]);

  const stopPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (isConnecting || isConnected) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      const authToken = token || localStorage.getItem('access_token');
      if (!authToken) {
        throw new Error('No authentication token available');
      }

      const wsUrl = `${WS_BASE_URL}/api/v1/tasks/ws/${taskId}?token=${authToken}`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected for task:', taskId);
        console.log('WebSocket URL:', wsUrl);
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        setConnectionAttempts(0);
        
        // Start ping interval
        startPingInterval();
        
        // Send initial ping
        ws.send('ping');
        
        // Send a test message to request screenshots
        ws.send(JSON.stringify({
          type: 'request_screenshots',
          taskId: taskId
        }));
      };

      ws.onmessage = (event) => {
        console.log('WebSocket message received:', {
          type: typeof event.data,
          isBlob: event.data instanceof Blob,
          data: typeof event.data === 'string' ? event.data : 'Binary data'
        });
        
        try {
          // Handle text messages (JSON)
          if (typeof event.data === 'string') {
            if (event.data === 'pong') {
              console.log('Received pong response');
              return; // Ignore pong responses
            }
            
            console.log('Parsing JSON message:', event.data);
            const message: ScreenshotMessage = JSON.parse(event.data);
            console.log('Parsed message:', message);
            handleWebSocketMessage(message);
          }
          // Handle binary data (PNG files)
          else if (event.data instanceof Blob) {
            console.log('Received binary data (Blob):', {
              size: event.data.size,
              type: event.data.type
            });
            handleBinaryData(event.data);
          }
          else {
            console.log('Received unknown data type:', typeof event.data, event.data);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          setError('Failed to process incoming message');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnecting(false);
        stopPingInterval();
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        wsRef.current = null;
        stopPingInterval();
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && connectionAttempts < reconnectAttempts) {
          setConnectionAttempts(prev => prev + 1);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else if (connectionAttempts >= reconnectAttempts) {
          setError(`Failed to reconnect after ${reconnectAttempts} attempts`);
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnecting(false);
    }
  }, [taskId, token, isConnecting, isConnected, connectionAttempts, reconnectAttempts, reconnectDelay, handleWebSocketMessage, handleBinaryData, startPingInterval, stopPingInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopPingInterval();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionAttempts(0);
  }, [stopPingInterval]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && taskId) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [taskId, autoConnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    screenshots,
    currentScreenshot,
    connectionAttempts,
    connect,
    disconnect,
    clearScreenshots,
    clearError
  };
};

export default useScreenshotWebSocket;