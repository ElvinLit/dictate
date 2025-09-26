import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { useTranscript } from '../hooks/useTranscript';
import { useAgent } from '../hooks/useAgent';

const Conversation: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { isConnected, sendMessage, onMessage, offMessage } = useWebSocket();
  const { 
    isRecording, 
    isSupported, 
    startRecording, 
    stopRecording, 
    getAudioBlob, 
    error: voiceError 
  } = useVoiceRecording();
  const { messages, addMessage, messagesEndRef } = useTranscript();
  const { sendUserMessage, sendDictateMessage } = useAgent();

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'transcript') {
        addMessage(message.data);
      } else if (message.type === 'cleared') {
        // TODO: Clear messages if needed
        // addMessage({ sender: 'System', text: 'Messages cleared', timestamp: new Date().toISOString() });
      }
    };

    onMessage(handleMessage);

    return () => {
      offMessage(handleMessage);
    };
  }, [onMessage, offMessage, addMessage]);

  const handleSendMessage = (sender: 'User' | 'Dictate') => {
    if (!inputText.trim()) return;
    
    if (sender === 'User') {
      sendUserMessage(inputText);
    } else {
      sendDictateMessage(inputText);
    }
    
    setInputText('');
  };

  const sendAudioMessage = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      // Convert audio blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // Send audio message via WebSocket
      sendMessage('audio', {
        audio_data: base64Audio
      });
      
    } catch (error) {
      console.error('Error sending audio message:', error);
      addMessage({
        sender: 'Dictate',
        text: `Audio transmission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      stopRecording();
      const audioBlob = getAudioBlob();
      if (audioBlob) {
        await sendAudioMessage(audioBlob);
      }
    } else {
      startRecording();
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header */}
      <div className="p-4 border-b border-gray-600/30 bg-gray-800/20">
        <h1 className="text-xl font-bold text-white">Dictate</h1>
        <div className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
        {voiceError && (
          <div className="text-sm text-red-400 mt-1">
            {voiceError}
          </div>
        )}
      </div>
      
      {/* Conversation Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            <p>No messages yet.</p>
            <p className="text-sm">Start a conversation below or use voice!</p>
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
                handleSendMessage('User');
              }
            }}
            placeholder="Type a message..."
            className="w-full px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            disabled={!isConnected}
          />
          
          <div className="flex gap-2">
            {/* Voice Recording Button */}
            <button
              onClick={handleVoiceRecording}
              disabled={!isConnected || !isSupported || isTranscribing}
              className={`flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
                  : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500'
              }`}
            >
              {isTranscribing ? 'Transcribing...' : isRecording ? 'Stop Recording' : 'Voice Input'}
            </button>
            
            <button
              onClick={() => handleSendMessage('User')}
              disabled={!isConnected || !inputText.trim()}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              User
            </button>
            <button
              onClick={() => handleSendMessage('Dictate')}
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