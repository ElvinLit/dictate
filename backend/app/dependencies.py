from functools import lru_cache
from app.services.agent.agent_service import AgentService
from app.services.voice_processing.audio_transcription_service import AudioTranscriptionService

@lru_cache()
def get_agent_service() -> AgentService:
    """Dependency function to get AgentService instance."""
    return AgentService()

@lru_cache()
def get_audio_transcription_service() -> AudioTranscriptionService:
    """Dependency function to get AudioTranscriptionService instance."""
    return AudioTranscriptionService()
