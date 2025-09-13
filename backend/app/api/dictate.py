from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import logging
from datetime import datetime
from typing import Dict, Any
from app.services.transcript import TranscriptService

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

@router.websocket("/dictate")
async def websocket_dictate(websocket: WebSocket):
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
                    
                    # Store transcript
                    transcript_data = transcript_service.store_transcript(
                        text=message_data.get("text", "")
                    )
                    
                    # Send transcript back
                    await send_message(websocket, "transcript", transcript_data, correlation_id=correlation_id)
                
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
