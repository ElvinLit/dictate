#!/usr/bin/env python3
"""
Test script for both HTTP and WebSocket APIs
Run this to verify both APIs are working correctly
"""

import asyncio
import aiohttp
import websockets
import json
import time

# Configuration
HTTP_BASE_URL = "http://127.0.0.1:8000"
WS_URL = "ws://127.0.0.1:8000/ws"
SECRET_HEADER = "x-app-secret"
SECRET_VALUE = "secret-key-not-expose-backend-outside-app"

async def test_http_api():
    """Test HTTP API endpoints"""
    print("🔗 Testing HTTP API...")
    
    headers = {
        SECRET_HEADER: SECRET_VALUE,
        "Content-Type": "application/json"
    }
    
    async with aiohttp.ClientSession() as session:
        try:
            # Test root endpoint
            async with session.get(f"{HTTP_BASE_URL}/", headers=headers) as response:
                data = await response.json()
                print(f"✅ Root endpoint: {response.status} - {data}")
            
            # Test data endpoint
            async with session.get(f"{HTTP_BASE_URL}/data/", headers=headers) as response:
                data = await response.json()
                print(f"✅ Data endpoint: {response.status} - {data}")
                
        except Exception as e:
            print(f"❌ HTTP API Error: {e}")

async def test_websocket_api():
    """Test WebSocket API"""
    print("\n🔌 Testing WebSocket API...")
    
    try:
        async with websockets.connect(WS_URL) as websocket:
            print("✅ WebSocket connected successfully")
            
            # Send test messages
            test_messages = [
                "Hello WebSocket!",
                "This is a test message",
                "Testing real-time communication"
            ]
            
            for i, message in enumerate(test_messages):
                print(f"📤 Sending: {message}")
                await websocket.send(message)
                
                # Wait for response
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                print(f"📥 Received: {response}")
                
                # Small delay between messages
                await asyncio.sleep(1)
            
            print("✅ WebSocket test completed successfully")
            
    except asyncio.TimeoutError:
        print("❌ WebSocket timeout - server might not be responding")
    except Exception as e:
        print(f"❌ WebSocket Error: {e}")

async def test_concurrent_connections():
    """Test multiple WebSocket connections"""
    print("\n🔄 Testing concurrent WebSocket connections...")
    
    async def single_connection(connection_id):
        try:
            async with websockets.connect(WS_URL) as websocket:
                await websocket.send(f"Message from connection {connection_id}")
                response = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                print(f"✅ Connection {connection_id}: {response}")
        except Exception as e:
            print(f"❌ Connection {connection_id} failed: {e}")
    
    # Create 3 concurrent connections
    tasks = [single_connection(i) for i in range(1, 4)]
    await asyncio.gather(*tasks, return_exceptions=True)

async def main():
    """Run all tests"""
    print("🚀 Starting API Tests...")
    print("=" * 50)
    
    # Test HTTP API
    await test_http_api()
    
    # Test WebSocket API
    await test_websocket_api()
    
    # Test concurrent connections
    await test_concurrent_connections()
    
    print("\n" + "=" * 50)
    print("✅ All tests completed!")

if __name__ == "__main__":
    print("Make sure your FastAPI server is running on http://127.0.0.1:8000")
    print("Run: cd backend && python -m app.main")
    print()
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Test runner error: {e}")
