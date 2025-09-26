import { useState, useCallback, useRef, useEffect } from 'react';

export interface Message {
  sender: string;
  text: string;
  timestamp: string;
}

interface UseTranscriptReturn {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  scrollToBottom: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const useTranscript = (): UseTranscriptReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return {
    messages,
    addMessage,
    clearMessages,
    scrollToBottom,
    messagesEndRef
  };
};
