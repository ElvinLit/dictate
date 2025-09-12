from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/echo")
async def websocket_echo(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket client connected - DEBUG")
    
    try:
        while True:
            # Wait for message from client
            data = await websocket.receive_text()
            logger.info(f"Received: {data}")
            
            # Echo back to client with exclamation mark
            await websocket.send_text(f"{data}!")
            logger.info(f"Sent: {data}!")
            
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
