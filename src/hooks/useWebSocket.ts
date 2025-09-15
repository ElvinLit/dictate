import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  id?: string;
  corr?: string;
  ts: string;
  data: any;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (type: string, data: any, correlationId?: string) => void;
  onMessage: (callback: (message: WebSocketMessage) => void) => void;
  offMessage: (callback: (message: WebSocketMessage) => void) => void;
}

export const useWebSocket = (url: string = 'ws://127.0.0.1:8000/ws/dictate'): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messageCallbacks = useRef<Set<(message: WebSocketMessage) => void>>(new Set());

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const websocket = new WebSocket(url);
    
    websocket.onopen = () => {
      setIsConnected(true);
      wsRef.current = websocket;
    };
    
    websocket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        // Notify all registered callbacks
        messageCallbacks.current.forEach(callback => {
          try {
            callback(message);
          } catch (error) {
            console.error('Error in message callback:', error);
          }
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    websocket.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (!wsRef.current) {
          connect();
        }
      }, 3000);
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, [url]);

  const sendMessage = useCallback((type: string, data: any, correlationId?: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const message: WebSocketMessage = {
      type,
      id: Math.random().toString(36).substr(2, 9),
      corr: correlationId,
      ts: new Date().toISOString(),
      data
    };

    wsRef.current.send(JSON.stringify(message));
  }, []);

  const onMessage = useCallback((callback: (message: WebSocketMessage) => void) => {
    messageCallbacks.current.add(callback);
  }, []);

  const offMessage = useCallback((callback: (message: WebSocketMessage) => void) => {
    messageCallbacks.current.delete(callback);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      messageCallbacks.current.clear();
    };
  }, [connect]);

  return {
    isConnected,
    sendMessage,
    onMessage,
    offMessage
  };
};
