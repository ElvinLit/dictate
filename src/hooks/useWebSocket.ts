import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (message: string) => void;
  lastMessage: string | null;
  connectionStatus: 'Connecting' | 'Connected' | 'Disconnected' | 'Error';
  messages: string[];
}

const useWebSocket = (url: string): UseWebSocketReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Connected' | 'Disconnected' | 'Error'>('Disconnected');
  const [messages, setMessages] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('Connecting');
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
      setConnectionStatus('Connected');
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message = event.data;
      setLastMessage(message);
      setMessages(prev => [...prev, message]);
      console.log('WebSocket message received:', message);
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      setSocket(null);
      setConnectionStatus('Disconnected');
      console.log('WebSocket disconnected:', event.code, event.reason);
      
      // Auto-reconnect after 3 seconds
      if (event.code !== 1000) { // Not a normal closure
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error');
    };
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socketRef.current) {
      socketRef.current.close(1000, 'User disconnected');
    }
  }, []);

  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
      console.log('WebSocket message sent:', message);
    } else {
      console.warn('WebSocket is not connected. Cannot send message:', message);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { 
    socket, 
    isConnected, 
    sendMessage, 
    lastMessage, 
    connectionStatus,
    messages
  };
};

export default useWebSocket;
