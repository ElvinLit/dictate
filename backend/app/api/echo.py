from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

@router.websocket("/echo")
async def websocket_echo(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket client connected - DEBUG")
    
    try:
        while True:
            # Wait for message from client
            data = await websocket.receive_text()
            print(f"Received: {data}")
            
            # Echo back to client with exclamation mark
            await websocket.send_text(f"{data}!")
            print(f"Sent: {data}!")
            
    except WebSocketDisconnect:
        print("WebSocket client disconnected")
