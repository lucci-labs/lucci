import { generateText, stepCountIs } from 'ai';
import { ContextManager } from '../context/context-manager.ts';
import { ToolManager } from '../tools/tool-manager.ts';
import { SwapAdapter } from '../adapters/swap-adapter.ts';
import { TransferAdapter } from '../adapters/transfer-adapter.ts';
import { google } from '@ai-sdk/google';
import { getSystemPrompt } from './system-prompt.ts';

/**
 * Agent manages the central agentic loop.
 * 
 * Flow:
 * 1. Receives a user message.
 * 2. Analyzes context and determines tool calls.
 * 3. Uses ToolManager to provide tool definitions and execution logic.
 * 4. AI SDK handles the loop (stopWhen).
 * 5. Returns the final response to the user.
 */
export class Agent {
  private contextManager: ContextManager;
  private toolManager: ToolManager;

  constructor() {
    this.contextManager = new ContextManager();
    this.toolManager = new ToolManager(this.contextManager);

    // Register Action Adapters
    this.toolManager.registerAdapter(new SwapAdapter());
    this.toolManager.registerAdapter(new TransferAdapter());
  }

  /**
   * Main entry point for processing a user request.
   * @param userMessage - The input string from the user.
   */
  async processRequest(userMessage: string): Promise<string> {
    // In a real scenario, we might want to fetch some initial context here
    // or let the tools fetch it dynamically.
    const initialContext = "No specific context provided yet.";

    const result = await generateText({
      model: google('gemini-1.5-pro-latest'),
      stopWhen: stepCountIs(5),
      system: getSystemPrompt(initialContext),
      prompt: userMessage,
      tools: this.toolManager.getTools(),
    });

    return result.text;
  }
}