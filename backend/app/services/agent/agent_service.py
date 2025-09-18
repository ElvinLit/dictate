import logging
from typing import Dict, Any, Optional
from .agent_runtime import get_runtime

logger = logging.getLogger(__name__)

class AgentService:
    """Clean service interface for the agent runtime."""
    
    def __init__(self):
        self.runtime = None
        logger.info("✅ Agent service initialized")

    def _get_runtime(self):
        """Get or create the agent runtime instance."""
        if self.runtime is None:
            self.runtime = get_runtime()
        return self.runtime

    def process_text(self, text: str) -> str:
        """
        Process user text and return agent response.
        
        Args:
            text: The text to process
            
        Returns:
            Agent response text
        """
        try:
            runtime = self._get_runtime()
            
            if not runtime.is_ready():
                return "I'm still starting up. Please wait a moment and try again."
            
            logger.info(f"🤖 Processing text with agent: {text}")
            return runtime.process_text(text)
            
        except Exception as e:
            logger.error(f"❌ Error processing text: {e}")
            return f"Sorry, I encountered an error: {str(e)}"

    def is_ready(self) -> bool:
        """Check if the agent service is ready to process requests."""
        try:
            runtime = self._get_runtime()
            return runtime.is_ready()
        except Exception:
            return False

