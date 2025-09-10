import { Button } from "@/components/ui/button";
import useAxios from "@/hooks/useAxios";
import useWebSocket from "@/hooks/useWebSocket";
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
  
  // WebSocket hook
  const { 
    isConnected, 
    sendMessage, 
    lastMessage, 
    connectionStatus, 
    messages 
  } = useWebSocket('ws://127.0.0.1:8000/ws');
  
  // WebSocket state
  const [wsMessage, setWsMessage] = useState("");

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
      
      {/* HTTP API Section */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">HTTP API Test</h2>
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            variant={"outline"}
            onClick={() => setRefetchData(!refetchData)}
          >
            Refetch Data
          </Button>
        </div>
      </div>

      {/* WebSocket Section */}
      <div className="mb-8 p-4 border rounded-lg bg-blue-50">
        <h2 className="text-xl font-semibold mb-4">WebSocket Test</h2>
        <div className="mb-4">
          <p className="text-sm">
            Status: <span className={`font-semibold ${
              connectionStatus === 'Connected' ? 'text-green-600' : 
              connectionStatus === 'Error' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>
              {connectionStatus}
            </span>
          </p>
        </div>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={wsMessage}
            onChange={(e) => setWsMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-md"
            onKeyPress={(e) => e.key === 'Enter' && wsMessage && sendMessage(wsMessage) && setWsMessage('')}
          />
          <Button
            onClick={() => {
              if (wsMessage) {
                sendMessage(wsMessage);
                setWsMessage('');
              }
            }}
            disabled={!isConnected || !wsMessage}
          >
            Send
          </Button>
        </div>
        
        <div className="max-h-40 overflow-y-auto bg-white p-2 rounded border">
          <h3 className="text-sm font-semibold mb-2">Messages:</h3>
          {messages.length === 0 ? (
            <p className="text-gray-500 text-sm">No messages yet</p>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="text-sm mb-1 p-1 bg-gray-100 rounded">
                {msg}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-center gap-4">
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
