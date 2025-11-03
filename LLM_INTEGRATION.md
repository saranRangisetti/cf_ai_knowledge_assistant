# LLM Integration Guide

This document explains how to integrate the actual Llama 3.3 model with Cloudflare Workers AI.

## Current Implementation

The current implementation uses a demonstration mode that provides sample responses. This allows the application to work and be tested without requiring Workers AI credits.

## Enabling Actual Llama 3.3

To use the real Llama 3.3 model, you need to:

### 1. Update `wrangler.toml`

Ensure the AI binding is configured:

```toml
[ai]
binding = "AI"
```

### 2. Access AI in the Agent

The Agents SDK provides access to bindings through the environment. You'll need to pass the AI binding to the agent or access it through the request context.

### 3. Modify `callLLM()` in `src/agent.ts`

Replace the demonstration code with:

```typescript
async callLLM(messages: Array<{ role: string; content: string }>, aiBinding?: any): Promise<string> {
  try {
    // If AI binding is available, use real LLM
    if (aiBinding) {
      const response = await aiBinding.run("@cf/meta/llama-3.3-70b-instruct", {
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });
      
      return response.response || response.text || "I couldn't generate a response.";
    }
    
    // Fallback to demonstration mode
    return this.getDemoResponse(messages);
  } catch (error) {
    console.error("LLM API error:", error);
    return this.getDemoResponse(messages);
  }
}

private getDemoResponse(messages: Array<{ role: string; content: string }>): string {
  // Current demonstration logic
  const lastUserMessage = messages[messages.length - 1]?.content || "";
  // ... existing demo response code
}
```

### 4. Pass AI Binding Through Requests

Update the `processWithLLM` method to accept and pass the AI binding:

```typescript
async processWithLLM(userMessage: string, aiBinding?: any): Promise<string> {
  // ... existing code ...
  const response = await this.callLLM(messages, aiBinding);
  // ... rest of method
}
```

And update WebSocket and HTTP handlers to pass the binding.

## Alternative: Using Request Context

If the Agents SDK supports accessing bindings directly, you might be able to:

```typescript
// This is pseudo-code - check Agents SDK documentation
const ai = await this.getBinding("AI");
const response = await ai.run("@cf/meta/llama-3.3-70b-instruct", { messages });
```

## Testing Without Credits

The current demonstration mode allows you to:
- Test all application components
- Verify database operations
- Test WebSocket connectivity
- Test UI functionality
- Deploy and run the application

## Available Models

Cloudflare Workers AI supports various models:
- `@cf/meta/llama-3.3-70b-instruct` - Recommended for this use case
- `@cf/meta/llama-3.1-8b-instruct` - Faster, smaller model
- `@cf/mistral/mistral-7b-instruct-v0.2` - Alternative option

## Cost Considerations

Workers AI has usage-based pricing. The demonstration mode allows testing without incurring costs. Enable real LLM when ready for production or evaluation.

## Notes

- The current implementation is fully functional for demonstration purposes
- All components (memory, state, WebSocket, UI) work independently of the LLM
- Switching to real LLM requires only updating the `callLLM()` method
