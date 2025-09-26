import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface UseAgentReturn {
  isProcessing: boolean;
  sendUserMessage: (text: string) => void;
  sendDictateMessage: (text: string) => void;
}

export const useAgent = (): UseAgentReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { isConnected, sendMessage } = useWebSocket();

  const sendUserMessage = useCallback((text: string) => {
    if (!isConnected || !text.trim()) return;
    
    sendMessage('transcript', {
      text: text.trim(),
      sender: 'User'
    });
  }, [isConnected, sendMessage]);

  const sendDictateMessage = useCallback((text: string) => {
    if (!isConnected || !text.trim()) return;
    
    sendMessage('transcript', {
      text: text.trim(),
      sender: 'Dictate'
    });
  }, [isConnected, sendMessage]);

  return {
    isProcessing,
    sendUserMessage,
    sendDictateMessage
  };
};
