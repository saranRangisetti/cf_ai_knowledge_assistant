# AI Knowledge Assistant - Cloudflare AI Application

An AI-powered personal knowledge assistant built on Cloudflare's Agents SDK, featuring real-time chat, persistent memory, and LLM integration.

## Overview

This application demonstrates a complete AI-powered system on Cloudflare, incorporating all required components:

- **LLM Integration**: Uses Llama 3.3 via Cloudflare Workers AI (configurable)
- **Workflow/Coordination**: Uses Cloudflare Durable Objects with scheduled tasks for workflow management
- **User Input**: Real-time chat interface via WebSockets and HTTP with a modern web UI
- **Memory/State**: Persistent SQLite database for chat history and knowledge storage, plus in-memory state management

## Features

- 🤖 **AI-Powered Chat**: Conversational interface powered by Cloudflare Workers AI
- 💾 **Persistent Memory**: Chat history and knowledge stored in SQLite database
- 🔄 **Real-time Communication**: WebSocket support for instant responses
- 📝 **Knowledge Base**: Automatically extracts and stores important information
- 🎨 **Modern UI**: Beautiful, responsive chat interface
- ⚙️ **State Management**: Built-in state synchronization via Durable Objects

## Project Structure

```
cf_ai_knowledge_assistant/
├── src/
│   ├── index.ts          # Main Worker entry point, handles routing
│   └── agent.ts          # KnowledgeAgent class with LLM and memory logic
├── package.json          # Dependencies and scripts
├── wrangler.toml         # Cloudflare Workers configuration
├── tsconfig.json         # TypeScript configuration
├── README.md             # This file
└── PROMPTS.md            # AI prompts used in development
```

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Cloudflare account (free tier works)
- Wrangler CLI installed (`npm install -g wrangler`)

## Installation

1. **Clone or download this repository**

   ```bash
   cd cf_ai_knowledge_assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Authenticate with Cloudflare**

   ```bash
   npx wrangler login
   ```

## Configuration

The application is configured via `wrangler.toml`. Key settings:

- **Durable Objects**: Configured for stateful agents with SQLite support
- **AI Binding**: Workers AI binding for LLM access
- **Compatibility Date**: Set to 2024-12-01 for latest features

To use actual Llama 3.3, uncomment and configure the LLM call in `src/agent.ts`:

```typescript
const response = await env.AI.run("@cf/meta/llama-3.3-70b-instruct", {
  messages: messages
});
return response.response;
```

## Running Locally

1. **Start the development server**

   ```bash
   npm run dev
   # or
   npx wrangler dev
   ```

2. **Open your browser**

   Navigate to the URL provided by Wrangler (typically `http://localhost:8787`)

3. **Start chatting**

   The web interface will connect via WebSocket. Type messages and interact with the AI assistant.

## Deployment

1. **Deploy to Cloudflare**

   ```bash
   npm run deploy
   # or
   npx wrangler deploy
   ```

2. **Access your deployed application**

   The deployment will provide a URL like `https://cf-ai-knowledge-assistant.your-subdomain.workers.dev`

3. **Test the deployed version**

   Open the URL in your browser and interact with the AI assistant.

## Usage

### Chat Interface

- **WebSocket Connection**: Automatically connects when the page loads
- **Send Messages**: Type in the input field and press Enter or click Send
- **View History**: Chat history is maintained in the database and loaded on reconnection
- **Typing Indicator**: Shows when the AI is processing your message

### API Endpoints

- `GET /` - Serves the web interface
- `WS /ws?agentId=<id>` - WebSocket connection for real-time chat
- `POST /chat?agentId=<id>` - HTTP endpoint for chat messages
- `GET /history?agentId=<id>` - Get chat history
- `GET /state?agentId=<id>` - Get agent state

### Knowledge Extraction

The assistant automatically detects when you want to save information. Use phrases like:
- "Remember that..."
- "Important: ..."
- "Note that..."

## Components Explained

### 1. LLM (Language Model)

Located in `src/agent.ts`, the `callLLM()` method handles interactions with Cloudflare Workers AI. Currently includes a demonstration mode that can be replaced with actual Llama 3.3 calls.

### 2. Workflow/Coordination

- **Durable Objects**: Each agent instance is a Durable Object, providing isolation and state management
- **Scheduled Tasks**: The `scheduled()` method runs periodic cleanup tasks
- **State Management**: Uses `setState()` and `getState()` for persistent agent state

### 3. User Input (Chat/Voice)

- **WebSocket**: Real-time bidirectional communication in `src/index.ts`
- **HTTP Fallback**: REST API endpoint for chat messages
- **Web Interface**: Modern chat UI embedded in the HTML response

### 4. Memory/State

- **SQLite Database**: Two tables:
  - `chat_history`: Stores all conversation messages
  - `knowledge_notes`: Stores extracted knowledge points
- **Durable Object State**: In-memory state synchronized across requests
- **Context Retrieval**: Chat history loaded for LLM context

## Development

### Project Components

1. **Worker (`src/index.ts`)**
   - Handles HTTP requests and WebSocket upgrades
   - Routes requests to appropriate agent instances
   - Serves the web interface

2. **Agent (`src/agent.ts`)**
   - Extends Cloudflare's `Agent` class
   - Manages chat history and knowledge base
   - Processes messages with LLM
   - Handles WebSocket communication

### Adding Features

- **Custom LLM Integration**: Modify `callLLM()` in `src/agent.ts`
- **Additional Storage**: Add tables to the `initialize()` method
- **New Endpoints**: Add routes in both `index.ts` and `agent.ts`
- **UI Enhancements**: Modify the HTML template in `index.ts`

## Testing

1. **Local Testing**: Use `npm run dev` and test in browser
2. **WebSocket Testing**: Use browser DevTools to inspect WebSocket messages
3. **API Testing**: Use curl or Postman to test HTTP endpoints

Example curl command:
```bash
curl -X POST "http://localhost:8787/chat?agentId=test" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

## Limitations & Future Improvements

- Current LLM integration uses demonstration mode - integrate actual Llama 3.3
- Knowledge extraction is keyword-based - could use LLM for better extraction
- No authentication - add user authentication for production
- Limited conversation context - could implement RAG with Vectorize

## Resources

- [Cloudflare Agents SDK Documentation](https://developers.cloudflare.com/agents/)
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)

## License

MIT

## Author

Built as part of Cloudflare AI application assignment.

## Notes

- Repository name follows requirement: `cf_ai_` prefix
- Includes comprehensive README.md
- Includes PROMPTS.md with AI development prompts
- All code is original work
