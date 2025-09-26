import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  getAudioBlob: () => Blob | null;
  error: string | null;
}

export const useVoiceRecording = (): UseVoiceRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const checkSupport = useCallback(() => {
    const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setIsSupported(supported);
    if (!supported) {
      setError('Voice recording is not supported in this browser');
    }
    return supported;
  }, []);

  const startRecording = useCallback(async () => {
    if (!checkSupport()) return;
    
    try {
      setError(null);
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.start(100); // Collect data every 100ms
      setIsRecording(true);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
      setIsRecording(false);
    }
  }, [checkSupport]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, [isRecording]);

  const getAudioBlob = useCallback((): Blob | null => {
    if (audioChunksRef.current.length === 0) return null;
    
    return new Blob(audioChunksRef.current, { 
      type: 'audio/webm;codecs=opus' 
    });
  }, []);

  // Check support on mount
  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  return {
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    getAudioBlob,
    error
  };
};
