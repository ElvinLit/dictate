from fastapi import FastAPI, Request, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.config.config import SECRET_KEY, ALLOWED_ORIGINS
from app.api import root, data

app = FastAPI()

# Add CORS middleware for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def verify_secret_header(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    
    # Allow access to documentation endpoints without secret key
    if request.url.path in ["/docs", "/redoc", "/openapi.json", "/favicon.ico"]:
        return await call_next(request)
    
    # Require secret key for all other HTTP endpoints
    if request.headers.get("x-app-secret") != SECRET_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")
    return await call_next(request)

# Simple WebSocket echo endpoint
@app.websocket("/ws/echo")
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

app.include_router(root.router)
app.include_router(data.router, prefix="/data")
