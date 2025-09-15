import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

interface Message {
  sender: string;
  text: string;
  timestamp: string;
}

const Conversation: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const { isConnected, sendMessage, onMessage, offMessage } = useWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'transcript') {
        setMessages(prev => [...prev, message.data]);
      } else if (message.type === 'cleared') {
        setMessages([]);
      }
    };

    onMessage(handleMessage);

    return () => {
      offMessage(handleMessage);
    };
  }, [onMessage, offMessage]);

  const sendTranscriptMessage = (sender: 'User' | 'Dictate') => {
    if (!isConnected || !inputText.trim()) return;
    
    sendMessage('transcript', {
      text: inputText.trim(),
      sender: sender
    });
    
    setInputText('');
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header */}
      <div className="p-4 border-b border-gray-600/30 bg-gray-800/20">
        <h1 className="text-xl font-bold text-white">Dictate</h1>
        <div className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>
      
      {/* Conversation Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>No messages yet.</p>
            <p className="text-sm">Start a conversation below!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-3 py-2 rounded-lg ${
                message.sender === 'User' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-100'
              }`}>
                <div className="text-xs font-medium opacity-75 mb-1">{message.sender}</div>
                <div className="text-sm">{message.text}</div>
                <div className="text-xs opacity-60 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-600/30 bg-gray-800/20">
        <div className="space-y-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendTranscriptMessage('User');
              }
            }}
            placeholder="Type a message..."
            className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            disabled={!isConnected}
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => sendTranscriptMessage('User')}
              disabled={!isConnected || !inputText.trim()}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              User
            </button>
            <button
              onClick={() => sendTranscriptMessage('Dictate')}
              disabled={!isConnected || !inputText.trim()}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Dictate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversation;