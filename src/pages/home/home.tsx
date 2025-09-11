import { Button } from "@/components/ui/button";
import useAxios from "@/hooks/useAxios";
import { useEffect, useState } from "react";
import logoVite from "../../assets/vite.svg";
import logoReact from "../../assets/react.svg";
import logoElectron from "../../assets/electron.svg";
import logoFastAPI from "../../assets/fastapi.svg";

const HomePage = () => {
  const axios = useAxios();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [refetchData, setRefetchData] = useState(false);
  
  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false);
  const [wsMessage, setWsMessage] = useState("");
  const [wsMessages, setWsMessages] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // WebSocket functions
  const connectWebSocket = () => {
    if (ws) return;
    
    const websocket = new WebSocket('ws://127.0.0.1:8000/ws/echo');
    
    websocket.onopen = () => {
      console.log('WebSocket connected');
      setWsConnected(true);
      setWs(websocket);
    };
    
    websocket.onmessage = (event) => {
      console.log('Received:', event.data);
      setWsMessages(prev => [...prev, event.data]);
    };
    
    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnected(false);
      setWs(null);
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };
  
  const disconnectWebSocket = () => {
    if (ws) {
      ws.close();
      setWs(null);
      setWsConnected(false);
    }
  };
  
  const sendMessage = () => {
    if (ws && wsMessage.trim()) {
      ws.send(wsMessage);
      setWsMessage('');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/data");
        setMessage(response.data.message);
      } catch (error) {
        setMessage("An Error Occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refetchData]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 text-center">
      <div className="flex justify-center gap-8">
        <img src={logoElectron} className="w-24 h-24" alt="Electron" />
        <img src={logoReact} className="w-24 h-24" alt="React" />
        <img src={logoVite} className="w-24 h-24" alt="Vite" />
        <img src={logoFastAPI} className="w-24 h-24" alt="FastAPI" />
      </div>
      <h1 className="mt-4 text-lg text-center text-gray-700">
        This template is designed to quickly bootstrap projects.
      </h1>
      <div className="mt-6">
        <h3 className="text-center text-xl text-gray-600">
          Start by customizing the components and backend to fit your needs.
          Happy coding!
        </h3>
      </div>
      <p className="text-center text-lg my-6 h-4">
        {loading ? "Loading" : <>{message}</>}
      </p>
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          variant={"outline"}
          onClick={() => setRefetchData(!refetchData)}
        >
          Refetch Data
        </Button>
        <Button
          size="lg"
          variant={"outline"}
          onClick={() =>
            window.electron.sendNotification({
              title: "Hi",
              body: "Thanks for cloning my template",
            })
          }
        >
          Send Notification
        </Button>
      </div>

      <hr className="my-2" />
      
      {/* WebSocket Echo Test */}
      <div className="mt-8 p-6 border rounded-lg bg-gray-50 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">WebSocket Echo Test</h3>
        
        {/* Connection Status */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">
            {wsConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {/* Connect/Disconnect Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            onClick={connectWebSocket}
            disabled={wsConnected}
          >
            Connect
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={disconnectWebSocket}
            disabled={!wsConnected}
          >
            Disconnect
          </Button>
        </div>
        
        {/* Message Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={wsMessage}
            onChange={(e) => setWsMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-md"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            disabled={!wsConnected}
          />
          <Button
            size="sm"
            onClick={sendMessage}
            disabled={!wsConnected || !wsMessage.trim()}
          >
            Send
          </Button>
        </div>
        
        {/* Messages Display */}
        {wsMessages.length > 0 && (
          <div className="bg-white p-3 rounded border max-h-40 overflow-y-auto">
            <div className="text-sm text-gray-600 mb-2">Messages:</div>
            {wsMessages.map((msg, index) => (
              <div key={index} className="text-sm py-1 border-b last:border-b-0">
                {msg}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <Button
          size="lg"
          onClick={() =>
            window.electron.openExternal(
              "https://github.com/ShakeefAhmedRakin/electron-react-ts-tailwind-shadcn-fastapi-template"
            )
          }
        >
          See Guide
        </Button>
      </div>

      <footer className="mt-8">
        <p className="text-center text-sm text-gray-500">
          Created by me for the community to use!
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
