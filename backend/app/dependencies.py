from functools import lru_cache
from app.services.agent.agent_service import AgentService

@lru_cache()
def get_agent_service() -> AgentService:
    """Dependency function to get AgentService instance."""
    return AgentService()
