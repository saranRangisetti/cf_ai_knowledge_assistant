import { AgentNamespace } from "agents";
import { KnowledgeAgent } from "./agent";

export interface Env {
  KnowledgeAgent: AgentNamespace<KnowledgeAgent>;
  AI: any; // Workers AI binding
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle WebSocket upgrade for real-time chat
    if (url.pathname === "/ws") {
      const upgradeHeader = request.headers.get("Upgrade");
      if (upgradeHeader !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
      }

      // Get or create agent instance
      const agentId = url.searchParams.get("agentId") || "default";
      const agent = env.KnowledgeAgent.get(agentId);

      // Upgrade to WebSocket
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      // Accept the WebSocket connection
      agent.acceptWebSocket(server);
      
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // Handle HTTP requests for chat
    if (url.pathname === "/chat" && request.method === "POST") {
      const agentId = url.searchParams.get("agentId") || "default";
      const agent = env.KnowledgeAgent.get(agentId);
      
      const { message } = await request.json();
      
      const response = await agent.request({
        path: "/chat",
        method: "POST",
        body: JSON.stringify({ message }),
      });
      
      return response;
    }

    // Serve the web interface
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(HTML_PAGE, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
};

const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Knowledge Assistant</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    
    .container {
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 800px;
      height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 24px;
      margin-bottom: 5px;
    }
    
    .header p {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f8f9fa;
    }
    
    .message {
      margin-bottom: 15px;
      display: flex;
      align-items: flex-start;
    }
    
    .message.user {
      justify-content: flex-end;
    }
    
    .message-bubble {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 18px;
      word-wrap: break-word;
    }
    
    .message.user .message-bubble {
      background: #667eea;
      color: white;
      border-bottom-right-radius: 4px;
    }
    
    .message.assistant .message-bubble {
      background: white;
      color: #333;
      border-bottom-left-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .message-time {
      font-size: 11px;
      opacity: 0.6;
      margin-top: 4px;
    }
    
    .input-area {
      padding: 20px;
      background: white;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 10px;
    }
    
    .input-area input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 25px;
      font-size: 16px;
      outline: none;
      transition: border-color 0.3s;
    }
    
    .input-area input:focus {
      border-color: #667eea;
    }
    
    .input-area button {
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .input-area button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    
    .input-area button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    .status {
      padding: 10px 20px;
      background: #fff3cd;
      border-bottom: 1px solid #e0e0e0;
      font-size: 14px;
      color: #856404;
    }
    
    .status.connected {
      background: #d4edda;
      color: #155724;
    }
    
    .typing-indicator {
      display: inline-flex;
      gap: 4px;
      padding: 8px 12px;
    }
    
    .typing-indicator span {
      width: 8px;
      height: 8px;
      background: #667eea;
      border-radius: 50%;
      animation: typing 1.4s infinite;
    }
    
    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.7;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 AI Knowledge Assistant</h1>
      <p>Powered by Cloudflare Workers AI & Agents SDK</p>
    </div>
    <div class="status" id="status">Connecting...</div>
    <div class="chat-messages" id="messages"></div>
    <div class="input-area">
      <input type="text" id="input" placeholder="Type your message..." disabled>
      <button id="sendBtn" disabled>Send</button>
    </div>
  </div>
  
  <script>
    const messagesDiv = document.getElementById('messages');
    const input = document.getElementById('input');
    const sendBtn = document.getElementById('sendBtn');
    const status = document.getElementById('status');
    
    let ws = null;
    let agentId = 'user_' + Date.now();
    
    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = protocol + '//' + window.location.host + '/ws?agentId=' + agentId;
      
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        status.textContent = 'Connected ✓';
        status.className = 'status connected';
        input.disabled = false;
        sendBtn.disabled = false;
        addMessage('system', 'Connected to AI Assistant. How can I help you today?');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'response') {
          removeTypingIndicator();
          addMessage('assistant', data.message);
        } else if (data.type === 'thinking') {
          addTypingIndicator();
        }
      };
      
      ws.onerror = () => {
        status.textContent = 'Connection error. Trying HTTP fallback...';
        status.className = 'status';
      };
      
      ws.onclose = () => {
        status.textContent = 'Disconnected. Reconnecting...';
        status.className = 'status';
        input.disabled = true;
        sendBtn.disabled = true;
        setTimeout(connect, 3000);
      };
    }
    
    function addMessage(role, text) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'message ' + role;
      
      const bubble = document.createElement('div');
      bubble.className = 'message-bubble';
      bubble.textContent = text;
      
      const time = document.createElement('div');
      time.className = 'message-time';
      time.textContent = new Date().toLocaleTimeString();
      
      bubble.appendChild(time);
      messageDiv.appendChild(bubble);
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    function addTypingIndicator() {
      if (document.getElementById('typing')) return;
      
      const messageDiv = document.createElement('div');
      messageDiv.id = 'typing';
      messageDiv.className = 'message assistant';
      
      const bubble = document.createElement('div');
      bubble.className = 'message-bubble typing-indicator';
      bubble.innerHTML = '<span></span><span></span><span></span>';
      
      messageDiv.appendChild(bubble);
      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    
    function removeTypingIndicator() {
      const typing = document.getElementById('typing');
      if (typing) typing.remove();
    }
    
    function sendMessage() {
      const message = input.value.trim();
      if (!message || !ws || ws.readyState !== WebSocket.OPEN) return;
      
      addMessage('user', message);
      input.value = '';
      
      ws.send(JSON.stringify({
        type: 'chat',
        message: message
      }));
      
      addTypingIndicator();
    }
    
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
    
    connect();
  </script>
</body>
</html>`;
