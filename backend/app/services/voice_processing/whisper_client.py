import whisper
import tempfile
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class WhisperClient:
    def __init__(self, model_name: str = "base"):
        """Initialize Whisper client with specified model."""
        self.model_name = model_name
        self._model = None
        logger.info(f"Initializing WhisperClient with model: {model_name}")
    
    def _get_model(self):
        """Get or load the Whisper model (lazy loading)."""
        if self._model is None:
            logger.info(f"Loading Whisper model: {self.model_name}")
            self._model = whisper.load_model(self.model_name)
            logger.info("Whisper model loaded successfully")
        return self._model
    
    async def transcribe_audio(self, audio_data: bytes) -> str:
        """
        Transcribe audio data to text using Whisper.
        
        Args:
            audio_data: Raw audio bytes (e.g., from WebM file)
            
        Returns:
            Transcribed text string
            
        Raises:
            Exception: If transcription fails
        """
        try:
            # Get Whisper model
            model = self._get_model()
            
            # Create temporary file for audio data
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
                temp_file.write(audio_data)
                temp_file_path = temp_file.name
            
            try:
                # Transcribe using Whisper
                logger.info(f"Transcribing audio data ({len(audio_data)} bytes)")
                result = model.transcribe(temp_file_path)
                
                # Extract text from result
                transcribed_text = result["text"].strip()
                
                if not transcribed_text:
                    raise Exception("No speech detected in audio data")
                
                logger.info(f"Transcription successful: {len(transcribed_text)} characters")
                return transcribed_text
                
            finally:
                # Clean up temp file
                try:
                    os.unlink(temp_file_path)
                except OSError:
                    pass
                    
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            raise Exception(f"Transcription failed: {str(e)}")
    
    def get_model_info(self) -> dict:
        """Get information about the loaded model."""
        return {
            "model_name": self.model_name,
            "loaded": self._model is not None
        }
