# API Testing Guide

This guide shows you how to test both HTTP and WebSocket APIs in your Dictate application.

## Prerequisites

Make sure you have the required dependencies:

```bash
# Install Python dependencies
cd backend
pip install -r requirements.txt

# Install additional testing dependencies
pip install aiohttp websockets
```

## Testing Methods

### Method 1: Using the Frontend (Recommended)

1. **Start the Backend Server:**
   ```bash
   cd backend
   python -m app.main
   ```

2. **Start the Frontend:**
   ```bash
   # In a new terminal
   npm run dev
   ```

3. **Test in Browser:**
   - Open http://localhost:5173 (or the URL shown in terminal)
   - You'll see two test sections:
     - **HTTP API Test**: Click "Refetch Data" to test HTTP endpoints
     - **WebSocket Test**: Type messages and see real-time responses

### Method 2: Using the Test Script

1. **Start the Backend Server:**
   ```bash
   cd backend
   python -m app.main
   ```

2. **Run the Test Script:**
   ```bash
   # In a new terminal
   python test_apis.py
   ```

### Method 3: Manual Testing with curl and wscat

#### Test HTTP API:
```bash
# Test root endpoint
curl -H "x-app-secret: secret-key-not-expose-backend-outside-app" http://127.0.0.1:8000/

# Test data endpoint
curl -H "x-app-secret: secret-key-not-expose-backend-outside-app" http://127.0.0.1:8000/data/
```

#### Test WebSocket API:
```bash
# Install wscat if you don't have it
npm install -g wscat

# Connect to WebSocket
wscat -c ws://127.0.0.1:8000/ws

# Then type messages and press Enter
```

## Expected Results

### HTTP API:
- **GET /** → `{"message": "Hello World"}`
- **GET /data/** → `{"message": "Hello from the Data Endpoint"}`

### WebSocket API:
- **Connect** → Connection established
- **Send message** → Receive echo + broadcast
- **Multiple clients** → All receive broadcast messages

## Troubleshooting

### Backend Issues:
- Make sure port 8000 is not in use
- Check that all dependencies are installed
- Verify the secret key matches in both frontend and backend

### Frontend Issues:
- Make sure the backend is running first
- Check browser console for errors
- Verify WebSocket URL is correct

### WebSocket Connection Issues:
- Check if CORS is properly configured
- Verify the WebSocket URL format
- Check firewall settings

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint |
| GET | `/data/` | Data endpoint |
| WebSocket | `/ws` | Real-time communication |

## Features Implemented

✅ **HTTP REST API** with FastAPI
✅ **WebSocket** real-time communication
✅ **CORS** support for cross-origin requests
✅ **Authentication** via secret header
✅ **Connection management** for WebSockets
✅ **Auto-reconnection** for WebSocket clients
✅ **Message broadcasting** to all connected clients
✅ **Frontend integration** with React hooks
✅ **Error handling** and status indicators
