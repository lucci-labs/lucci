import { streamText, stepCountIs, generateText } from 'ai';
import { ContextManager } from '../context/context-manager';
import { ToolManager } from '../tools/tool-manager';
import { SwapAdapter } from '../adapters/swap-adapter';
import { TransferAdapter } from '../adapters/transfer-adapter';
import { google } from '@ai-sdk/google';
import { getSystemPrompt } from './system-prompt';

/**
 * Agent manages the central agentic loop with streaming support.
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
   * Main entry point for processing a chat request without streaming.
   * @param messages - The conversation history.
   */
  async requestResponse(messages: any[]) {
    // In a real scenario, we might want to fetch some initial context here
    // or let the tools fetch it dynamically.
    const initialContext = "No specific context provided yet.";

    const result = await generateText({
      model: google('gemini-3-flash-preview'), // Updated model name for better tool calling performance
      stopWhen: stepCountIs(5), // Allow multi-step interactions
      system: getSystemPrompt(initialContext),
      messages, // Pass the full conversation history
      tools: this.toolManager.getTools(),
    });

    return result;
  }

  /**
   * Main entry point for processing a chat request with streaming.
   * @param messages - The conversation history.
   */
  async streamResponse(messages: any[]) {
    // In a real scenario, we might want to fetch some initial context here
    // or let the tools fetch it dynamically.
    const userAddress = "0x1234567890123456789012345678901234567890";
    const initialContext = `
    User Address: ${userAddress}
    `

    const result = streamText({
      model: google('gemini-3-flash-preview'), // Updated model name for better tool calling performance
      stopWhen: stepCountIs(5), // Allow multi-step interactions
      system: getSystemPrompt(initialContext),
      messages, // Pass the full conversation history
      tools: this.toolManager.getTools(),
    });

    return result;
  }
}
