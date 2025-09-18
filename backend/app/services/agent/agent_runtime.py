import os
import asyncio
import threading
import logging
from typing import Dict, Any, List, Optional

# MCP client (stdio)
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# LangChain + MCP adapters + agent
from langchain_mcp_adapters.tools import load_mcp_tools
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from langchain.memory import ConversationBufferMemory

# Validate OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is required for agent functionality")

logger = logging.getLogger(__name__)

class AgentRuntime:
    """Persistent agent runtime for voice-controlled web actions with browser context."""
    
    def __init__(self):
        self.loop = asyncio.new_event_loop()
        self.thread = threading.Thread(target=self.loop.run_forever, daemon=True)
        self.thread.start()
        self.session = None
        self.agent = None
        self.memory = ConversationBufferMemory(return_messages=True)
        self._ready = False
        self._client_ctx = None
        self._sync(self._start())

    def _sync(self, coro):
        """Run async coroutine in the background thread and return result synchronously."""
        fut = asyncio.run_coroutine_threadsafe(coro, self.loop)
        return fut.result()

    async def _start(self):
        """Initialize MCP connection and create agent with persistent browser context."""
        try:
            logger.info("🔧 Initializing agent runtime with Playwright...")
            
            # Launch Playwright MCP with persistent browser
            args = ["@playwright/mcp@latest", "--browser", "chrome"]
            self.server = StdioServerParameters(command="npx", args=args)

            self._client_ctx = stdio_client(self.server)
            self.read, self.write = await self._client_ctx.__aenter__()
            self.session = ClientSession(self.read, self.write)
            await self.session.__aenter__()
            await self.session.initialize()

            # Load MCP tools and create agent - this maintains browser context
            tools = await load_mcp_tools(self.session)
            logger.info(f"📦 Loaded {len(tools)} MCP tools")
            
            # Create the agent with MCP tools - this maintains persistent browser context
            self.agent = create_react_agent(
                ChatOpenAI(model="gpt-4o-mini", temperature=0), 
                tools  # MCP Playwright tools for persistent browser actions
            )
            
            self._ready = True
            logger.info("✅ Agent runtime ready with persistent browser context")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize agent runtime: {e}")
            self._ready = False

    def process_text(self, text: str) -> str:
        """Process user text and return agent response with web actions."""
        if not self._ready:
            return "Sorry, I'm still starting up. Please wait a moment and try again."
            
        try:
            logger.info(f"🤖 Processing text with agent: {text}")
            
            # System prompt for web browsing
            system_prompt = (
                "You are a careful web-browsing agent. Use MCP Playwright tools to navigate, read, and extract. "
                "Minimize steps. Return concise answers and try not to use too many words. If a site blocks automation, explain briefly."
            )
            
            # Get conversation history from memory
            memory_variables = self.memory.load_memory_variables({})
            chat_history = memory_variables.get("history", [])
            
            # Build messages with memory
            messages = [("system", system_prompt)]
            
            # Add conversation history
            for message in chat_history:
                if hasattr(message, 'content'):
                    role = "human" if message.__class__.__name__ == "HumanMessage" else "assistant"
                    messages.append((role, message.content))
            
            # Add current user message
            messages.append(("human", text))
            
            # Run the async agent.ainvoke in the background thread
            async def _invoke_agent():
                return await self.agent.ainvoke({"messages": messages})
            
            result = self._sync(_invoke_agent())
            
            # Extract response text
            response_text = self.extract_final_text(result)
            
            # Save to memory
            self.memory.save_context(
                {"input": text},
                {"output": response_text}
            )
            
            return response_text
            
        except Exception as e:
            logger.error(f"Error processing text with agent: {e}")
            return f"Sorry, I encountered an error: {str(e)}"

    def extract_final_text(self, result) -> str:
        """LangGraph returns a dict with 'messages'; extract the final content safely."""
        try:
            msgs = result.get("messages", [])
            if not msgs:
                return str(result)
            final = msgs[-1].content
            if isinstance(final, list):
                # Sometimes content is a list of chunks
                return " ".join(getattr(x, "content", str(x)) for x in final)
            return final
        except Exception:
            return str(result)

    def is_ready(self) -> bool:
        """Check if the agent runtime is ready to process requests."""
        return self._ready


# Global runtime instance - persists across all requests
_runtime: Optional[AgentRuntime] = None

def get_runtime() -> AgentRuntime:
    """Get or create the global agent runtime instance."""
    global _runtime
    if _runtime is None:
        _runtime = AgentRuntime()
    return _runtime

