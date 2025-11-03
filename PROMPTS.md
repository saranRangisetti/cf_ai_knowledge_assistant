# AI Prompts Used in Development

This document contains all prompts used with AI assistants (like Claude, ChatGPT, etc.) during the development of this Cloudflare AI application.

## Project Setup & Architecture

### Prompt 1: Initial Project Structure
```
I need to build an AI-powered application for Cloudflare that includes:
- LLM integration (Llama 3.3 on Workers AI recommended)
- Workflow/coordination (Workflows, Workers, or Durable Objects)
- User input via chat (Pages or Realtime)
- Memory/state management

The repository must be named with cf_ai_ prefix. Please help me create the project structure using Cloudflare Agents SDK.
```

### Prompt 2: Agent Class Implementation
```
I'm building a Cloudflare Agent that extends the Agent class. I need it to:
1. Handle WebSocket connections for real-time chat
2. Store chat history in SQLite database
3. Integrate with Workers AI (Llama 3.3)
4. Extract and store knowledge from conversations
5. Have scheduled tasks for cleanup

Can you help me implement the KnowledgeAgent class with these features?
```

### Prompt 3: WebSocket Implementation
```
I need help implementing WebSocket support in my Cloudflare Worker that:
- Accepts WebSocket upgrades
- Connects to Durable Object agents
- Handles bidirectional real-time messaging
- Falls back to HTTP if WebSocket fails

Please show me how to implement this in the Worker's fetch handler.
```

## UI Development

### Prompt 4: Chat Interface Design
```
I need a modern, beautiful chat interface embedded in my Cloudflare Worker HTML response. It should:
- Have a gradient background
- Show message bubbles for user and assistant
- Include typing indicators
- Show connection status
- Handle WebSocket reconnection
- Be responsive and modern

Please provide the HTML, CSS, and JavaScript for this interface.
```

## LLM Integration

### Prompt 5: Llama 3.3 Integration
```
I'm using Cloudflare Workers AI with Llama 3.3. How do I:
1. Configure the AI binding in wrangler.toml
2. Call the model with conversation history
3. Format messages for the chat format
4. Handle errors gracefully

Show me the implementation for calling @cf/meta/llama-3.3-70b-instruct with proper message formatting.
```

### Prompt 6: Context Management
```
I need to implement conversation context for my AI assistant:
- Retrieve last N messages from SQLite database
- Format them for LLM input
- Include system prompts
- Handle long conversations efficiently

Please help me implement the getChatHistory and context building logic.
```

## Memory & State

### Prompt 7: SQLite Schema Design
```
I need database tables for my AI assistant:
1. chat_history: Store user and assistant messages with timestamps
2. knowledge_notes: Store extracted knowledge with topics

Design the SQL schema and initialization code using Cloudflare Agents SQLite API.
```

### Prompt 8: Knowledge Extraction
```
How can I automatically extract important information from user messages to store in a knowledge base? The system should:
- Detect when users want to save information (keywords like "remember", "important")
- Extract topics and content
- Store in structured format

Provide a simple keyword-based approach that could later be enhanced with LLM-based extraction.
```

## Workflow & Scheduling

### Prompt 9: Scheduled Tasks
```
I need to implement scheduled tasks in my Cloudflare Agent for:
- Cleaning up old chat history (keep last 100 messages)
- Updating agent state
- Running periodic maintenance

Show me how to implement the scheduled() method in the Agent class.
```

## Error Handling & Edge Cases

### Prompt 10: Error Handling
```
I need robust error handling for:
- WebSocket connection failures
- LLM API errors
- Database operation failures
- Invalid user input

Please help me add try-catch blocks and graceful error responses.
```

## Documentation

### Prompt 11: README Creation
```
Create a comprehensive README.md for my Cloudflare AI application that includes:
- Project overview and features
- Installation instructions
- Running locally and deployment
- Usage examples
- Component explanations
- Testing instructions
- All required sections for the assignment

The README should be professional and complete.
```

## Code Improvements

### Prompt 12: TypeScript Types
```
Help me add proper TypeScript types for:
- ChatMessage interface
- Agent state structure
- WebSocket message formats
- API request/response types

Ensure all types are properly defined and exported.
```

### Prompt 13: Code Organization
```
Review my Cloudflare Agent code and suggest improvements for:
- Code organization and modularity
- Best practices for Durable Objects
- Efficient database queries
- WebSocket message handling

Provide refactored code where appropriate.
```

## Testing & Debugging

### Prompt 14: Testing Strategy
```
How can I test my Cloudflare AI application:
- Locally with wrangler dev
- WebSocket connections
- Database operations
- LLM integration

Provide testing approaches and example test cases.
```

## Final Integration

### Prompt 15: Complete Integration
```
I have all the components ready. Help me integrate:
1. Worker entry point (index.ts)
2. Agent implementation (agent.ts)
3. WebSocket handling
4. HTML interface
5. Database initialization
6. LLM calls

Ensure everything works together and follows Cloudflare best practices.
```

## Repository Requirements

### Prompt 16: Repository Setup
```
I need to ensure my repository meets the assignment requirements:
- Name starts with cf_ai_
- Includes README.md with clear instructions
- Includes PROMPTS.md with all AI prompts
- All code is original

Verify that my project structure meets these requirements.
```

---

## Summary

All prompts above were used iteratively during development to:
1. Understand Cloudflare Agents SDK architecture
2. Implement required components (LLM, Workflow, Input, Memory)
3. Create a user-friendly interface
4. Handle edge cases and errors
5. Document the project comprehensively

The AI assistant helped with:
- Code generation and refactoring
- Best practices for Cloudflare Workers
- TypeScript type definitions
- Error handling patterns
- Documentation writing

All final code has been reviewed, adapted, and integrated to ensure originality and functionality.
