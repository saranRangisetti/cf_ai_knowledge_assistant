# AI Prompts Used in Development

This document contains technical prompts used with AI assistants during the development of this Cloudflare AI application.

## Technical Implementation Prompts

### Agent Class with WebSocket, SQLite, and LLM Integration
```
I'm building a Cloudflare Agent that extends the Agent class. I need it to:
1. Handle WebSocket connections for real-time chat using onWebSocketMessage
2. Store chat history in SQLite database using this.sql template literals
3. Integrate with Workers AI (Llama 3.3) via env.AI binding
4. Extract and store knowledge from conversations in separate SQLite tables
5. Have scheduled tasks for cleanup using scheduled() method

Can you help me implement the KnowledgeAgent class with proper Durable Objects patterns?
```

### WebSocket Implementation in Cloudflare Worker
```
I need help implementing WebSocket support in my Cloudflare Worker that:
- Accepts WebSocket upgrades in the fetch handler
- Connects to Durable Object agents using AgentNamespace.get()
- Handles bidirectional real-time messaging
- Properly handles WebSocketPair and accepts connections

Please show me how to implement this in the Worker's fetch handler with proper error handling.
```

### Llama 3.3 Integration with Workers AI
```
I'm using Cloudflare Workers AI with Llama 3.3. How do I:
1. Configure the AI binding in wrangler.toml
2. Call the model with conversation history from SQLite
3. Format messages array for @cf/meta/llama-3.3-70b-instruct chat format
4. Handle API errors and timeouts gracefully
5. Access AI binding from within Durable Object Agent class

Show me the implementation for calling the model with proper message formatting and error handling.
```

### Conversation Context Management
```
I need to implement conversation context for my AI assistant:
- Retrieve last N messages from SQLite database ordered by timestamp
- Format them as {role, content} array for LLM input
- Include system prompts with proper role
- Handle long conversations efficiently (limit context window)
- Reverse order to get chronological sequence

Please help me implement the getChatHistory method with proper SQL query and message formatting.
```

### SQLite Schema Design for Agents SDK
```
I need database tables for my AI assistant using Cloudflare Agents SQLite API:
1. chat_history: Store user and assistant messages with timestamps
2. knowledge_notes: Store extracted knowledge with topics and timestamps

Design the SQL schema using this.sql template literals and initialization code in the Agent's initialize() method.
```

### Complete Integration: Worker, Agent, WebSocket, Database
```
I have all the components ready. Help me integrate:
1. Worker entry point (index.ts) with WebSocket upgrade handling
2. Agent implementation (agent.ts) with Durable Objects
3. WebSocket message routing from Worker to Agent
4. Database initialization in Agent constructor/initialize
5. LLM calls with proper async/await and error handling
6. State management using setState/getState

Ensure everything works together and follows Cloudflare Durable Objects best practices.
```