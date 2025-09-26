import base64
import logging
from typing import Dict, Any, Optional
from .whisper_client import WhisperClient

logger = logging.getLogger(__name__)

class AudioTranscriptionService:
    """
    Service for handling audio transcription requests.
    Manages Whisper client and provides clean interface for audio-to-text conversion.
    """
    
    def __init__(self, model_name: str = "base"):
        """Initialize the audio transcription service."""
        self.whisper_client = WhisperClient(model_name)
        logger.info("✅ Audio transcription service initialized")
    
    async def transcribe_audio_message(self, message_data: Dict[str, Any]) -> str:
        """
        Transcribe audio from WebSocket message data.
        
        Args:
            message_data: Dictionary containing 'audio_data' field with base64 encoded audio
            
        Returns:
            Transcribed text string
            
        Raises:
            Exception: If audio data is missing or transcription fails
        """
        try:
            # Get audio data from message
            audio_data_b64 = message_data.get("audio_data")
            if not audio_data_b64:
                raise Exception("Missing 'audio_data' field in audio message")
            
            # Decode base64 audio data
            try:
                audio_data = base64.b64decode(audio_data_b64)
            except Exception as e:
                raise Exception(f"Failed to decode base64 audio data: {str(e)}")
            
            # Transcribe using Whisper client
            transcribed_text = await self.whisper_client.transcribe_audio(audio_data)
            
            return transcribed_text
            
        except Exception as e:
            logger.error(f"Error in audio transcription service: {e}")
            raise Exception(f"Audio transcription failed: {str(e)}")
    
    def get_service_info(self) -> Dict[str, Any]:
        """Get information about the transcription service."""
        return {
            "service": "AudioTranscriptionService",
            "whisper_client": self.whisper_client.get_model_info()
        }
