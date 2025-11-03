import { Agent } from "agents";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export class KnowledgeAgent extends Agent {
  // Initialize memory/state in the database
  async initialize() {
    // Create table for chat history if it doesn't exist
    await this.sql`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      )
    `;
    
    // Create table for knowledge notes
    await this.sql`
      CREATE TABLE IF NOT EXISTS knowledge_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `;
    
    // Initialize state
    const state = await this.getState();
    if (!state.initialized) {
      await this.setState({
        initialized: true,
        messageCount: 0,
        lastInteraction: Date.now(),
      });
    }
  }

  // Handle WebSocket messages for real-time chat
  async onWebSocketMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data as string);
      
      if (data.type === "chat" && data.message) {
        // Save user message to database
        await this.saveMessage("user", data.message);
        
        // Update state
        const state = await this.getState();
        await this.setState({
          ...state,
          messageCount: (state.messageCount || 0) + 1,
          lastInteraction: Date.now(),
        });
        
        // Send thinking indicator
        this.sendWebSocket(JSON.stringify({ type: "thinking" }));
        
        // Process message with LLM
        const response = await this.processWithLLM(data.message);
        
        // Save assistant response
        await this.saveMessage("assistant", response);
        
        // Send response to client
        this.sendWebSocket(JSON.stringify({
          type: "response",
          message: response,
        }));
      }
    } catch (error) {
      console.error("WebSocket message error:", error);
      this.sendWebSocket(JSON.stringify({
        type: "error",
        message: "Sorry, an error occurred processing your message.",
      }));
    }
  }

  // Handle HTTP requests
  async fetch(request: Request): Promise<Response> {
    await this.initialize();
    
    const url = new URL(request.url);
    
    if (url.pathname === "/chat" && request.method === "POST") {
      const { message } = await request.json();
      
      // Save user message
      await this.saveMessage("user", message);
      
      // Process with LLM
      const response = await this.processWithLLM(message);
      
      // Save assistant response
      await this.saveMessage("assistant", response);
      
      return new Response(JSON.stringify({ response }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (url.pathname === "/history" && request.method === "GET") {
      const history = await this.getChatHistory();
      return new Response(JSON.stringify({ history }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (url.pathname === "/state" && request.method === "GET") {
      const state = await this.getState();
      return new Response(JSON.stringify({ state }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    
    return new Response("Not Found", { status: 404 });
  }

  // Process message with Llama 3.3 LLM
  async processWithLLM(userMessage: string): Promise<string> {
    try {
      // Get chat history for context (last 10 messages)
      const history = await this.getChatHistory(10);
      
      // Build conversation context
      const messages = [
        {
          role: "system",
          content: `You are a helpful AI knowledge assistant. You help users organize information, answer questions, and remember important details. 
          Be conversational, friendly, and concise. You can remember information from previous conversations.`,
        },
        ...history.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content: userMessage,
        },
      ];
      
      // Call Llama 3.3 via Workers AI
      // Note: In production, you would use env.AI.run() with proper bindings
      // For now, we'll simulate with a response that could be replaced with actual AI call
      const response = await this.callLLM(messages);
      
      // Extract and store knowledge if the user shares information
      await this.extractKnowledge(userMessage, response);
      
      return response;
    } catch (error) {
      console.error("LLM processing error:", error);
      return "I'm having trouble processing that right now. Could you try again?";
    }
  }

  // Call LLM using Workers AI (Llama 3.3)
  async callLLM(messages: Array<{ role: string; content: string }>): Promise<string> {
    // NOTE: To use actual Llama 3.3, uncomment and configure the code below
    // You'll need to pass the AI binding through the agent context
    
    // Production LLM integration (uncomment when ready):
    /*
    try {
      // Access AI binding from environment
      // The exact method depends on Agents SDK implementation
      const aiBinding = await this.getEnv?.()?.AI;
      if (aiBinding) {
        const response = await aiBinding.run("@cf/meta/llama-3.3-70b-instruct", {
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        });
        return response.response || response.text || this.getDemoResponse(messages);
      }
    } catch (error) {
      console.error("LLM API error:", error);
      // Fall through to demo mode on error
    }
    */
    
    // Demonstration mode (works without Workers AI credits)
    return this.getDemoResponse(messages);
  }

  // Demonstration response generator (for testing without LLM)
  private getDemoResponse(messages: Array<{ role: string; content: string }>): Promise<string> {
    return new Promise(async (resolve) => {
      const lastUserMessage = messages[messages.length - 1]?.content || "";
      const historyCount = messages.filter(m => m.role !== "system").length - 1;
      
      // Simple pattern matching for demo responses
      if (lastUserMessage.toLowerCase().includes("remember")) {
        resolve("I'll remember that for you! I've saved it to my knowledge base so we can refer to it later in our conversations.");
        return;
      }
      
      if (lastUserMessage.toLowerCase().includes("what") || lastUserMessage.toLowerCase().includes("tell me")) {
        resolve("Based on our conversation history, I can help you with that. I remember our previous discussions. " + 
               "Is there something specific you'd like to know more about?");
        return;
      }
      
      if (lastUserMessage.toLowerCase().includes("hello") || lastUserMessage.toLowerCase().includes("hi")) {
        const state = await this.getState();
        const count = state.messageCount || 0;
        resolve(`Hello! I'm your AI knowledge assistant powered by Cloudflare Workers AI. ` +
               `I'm here to help you organize information and answer questions. ` +
               `We've had ${count} messages so far. What would you like to talk about?`);
        return;
      }
      
      if (lastUserMessage.toLowerCase().includes("help")) {
        resolve(`I'm your AI knowledge assistant! I can:
- Answer questions using my knowledge base
- Remember important information you share
- Help organize and retrieve information
- Have conversations with context from our chat history

Try asking me to remember something, or ask me a question!`);
        return;
      }
      
      resolve(`I understand you said: "${lastUserMessage}". ` +
             `In production, this would use Cloudflare Workers AI with Llama 3.3 to generate intelligent, contextual responses. ` +
             `The system maintains ${historyCount} previous messages for context, and I have access to our conversation history and knowledge base.`);
    });
  }

  // Save message to database
  async saveMessage(role: "user" | "assistant" | "system", content: string) {
    await this.sql`
      INSERT INTO chat_history (role, content, timestamp)
      VALUES (${role}, ${content}, ${Date.now()})
    `;
  }

  // Get chat history from database
  async getChatHistory(limit: number = 20): Promise<ChatMessage[]> {
    const result = await this.sql`
      SELECT role, content, timestamp
      FROM chat_history
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;
    
    return (result as any[]).reverse().map((row) => ({
      role: row.role as "user" | "assistant" | "system",
      content: row.content,
      timestamp: row.timestamp,
    }));
  }

  // Extract and store knowledge from conversations
  async extractKnowledge(userMessage: string, assistantResponse: string) {
    // Simple keyword detection for knowledge extraction
    // In production, you could use the LLM to identify important facts
    const knowledgeKeywords = ["remember", "important", "note", "save", "favorite"];
    const hasKnowledge = knowledgeKeywords.some((keyword) =>
      userMessage.toLowerCase().includes(keyword)
    );
    
    if (hasKnowledge) {
      // Extract topic (simple heuristic - in production, use LLM)
      const words = userMessage.split(" ");
      const topic = words.slice(0, 3).join(" ");
      
      await this.sql`
        INSERT INTO knowledge_notes (topic, content, created_at, updated_at)
        VALUES (${topic}, ${userMessage}, ${Date.now()}, ${Date.now()})
      `;
    }
  }

  // Schedule periodic tasks (example workflow/coordination)
  async scheduled(controller: ScheduledController): Promise<void> {
    await this.initialize();
    
    // Example: Clean up old messages (keep last 100)
    await this.sql`
      DELETE FROM chat_history
      WHERE id NOT IN (
        SELECT id FROM chat_history
        ORDER BY timestamp DESC
        LIMIT 100
      )
    `;
    
    // Update state
    const state = await this.getState();
    await this.setState({
      ...state,
      lastScheduledTask: Date.now(),
    });
  }
}
