from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
import json
import logging
from datetime import datetime
from typing import Dict, Any
from app.services.transcript import TranscriptService
from app.services.agent.agent_service import AgentService
from app.dependencies import get_agent_service
import asyncio

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize services
transcript_service = TranscriptService()

def create_message(message_type: str, data: Dict[str, Any], message_id: str = None, correlation_id: str = None) -> Dict[str, Any]:
    """Create standardized message format"""
    return {
        "type": message_type,
        "id": message_id,
        "corr": correlation_id,
        "ts": datetime.now().isoformat(),
        "data": data
    }

async def send_message(websocket: WebSocket, message_type: str, data: Dict[str, Any], message_id: str = None, correlation_id: str = None):
    """Send standardized message to client"""
    message = create_message(message_type, data, message_id, correlation_id)
    await websocket.send_text(json.dumps(message))
    logger.info(f"Sent {message_type}: {data}")

async def process_agent_response(websocket: WebSocket, text: str, agent_service: AgentService, correlation_id: str = None):
    """Process user text with agent and send response back to frontend."""
    try:
        # Process with agent service (handles both web actions and general chat)
        response_text = agent_service.process_text(text)
        
        # Store agent's response
        agent_transcript_data = transcript_service.store_transcript(
            text=response_text,
            sender="Dictate"
        )
        
        # Send agent's response back to frontend
        await send_message(websocket, "transcript", agent_transcript_data, correlation_id=correlation_id)
        
    except Exception as e:
        logger.error(f"Error processing agent response: {e}")
        # Send error message to frontend
        error_transcript_data = transcript_service.store_transcript(
            text=f"Sorry, I encountered an error: {str(e)}",
            sender="Dictate"
        )
        await send_message(websocket, "transcript", error_transcript_data, correlation_id=correlation_id)

@router.websocket("/dictate")
async def websocket_dictate(websocket: WebSocket, agent_service: AgentService = Depends(get_agent_service)):
    await websocket.accept()
    logger.info("WebSocket client connected to /dictate")
    
    try:
        while True:
            # Wait for message from client
            data = await websocket.receive_text()
            logger.info(f"Received: {data}")
            
            try:
                message = json.loads(data)
                message_type = message.get("type")
                message_data = message.get("data", {})
                correlation_id = message.get("corr")
                
                if message_type == "transcript":
                    # Process transcript message
                    logger.info("Processing transcript message")
                    
                    # Store transcript with sender
                    sender = message_data.get("sender")
                    if sender is None:
                        logger.error("Missing 'sender' field in transcript message, defaulting to 'User'")
                        sender = "User"
                    
                    text = message_data.get("text", "")
                    if not text:
                        logger.error("Missing or empty 'text' field in transcript message, defaulting to empty string")
                    
                    # Store the user's message
                    transcript_data = transcript_service.store_transcript(
                        text=text,
                        sender=sender
                    )
                    
                    # Send user's message back to frontend
                    await send_message(websocket, "transcript", transcript_data, correlation_id=correlation_id)
                    
                    # If it's a user message, process it with agent
                    if sender == "User":
                        logger.info(f"Processing user message with agent: {text}")
                        
                        # Process with agent service asynchronously (non-blocking)
                        asyncio.create_task(process_agent_response(websocket, text, agent_service, correlation_id))
                
                elif message_type == "ping":
                    # Respond to ping
                    await send_message(websocket, "pong", {"status": "alive"}, correlation_id=correlation_id)
                
                else:
                    # Unknown message type
                    await send_message(websocket, "error", {
                        "code": "UNKNOWN_MESSAGE_TYPE",
                        "message": f"Unknown message type: {message_type}"
                    }, correlation_id=correlation_id)
                    
            except json.JSONDecodeError as e:
                await send_message(websocket, "error", {
                    "code": "INVALID_JSON",
                    "message": f"Invalid JSON: {str(e)}"
                })
            
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await send_message(websocket, "error", {
                "code": "INTERNAL_ERROR",
                "message": str(e)
            })
        except:
            pass
    finally:
        # WebSocket connection closed
        pass