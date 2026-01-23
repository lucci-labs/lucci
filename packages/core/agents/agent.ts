import { streamText, stepCountIs, generateText, tool } from 'ai';
import { z } from 'zod';
import { ContextManager } from '../context/context-manager';
import { Swap } from '../tools/swap';
import { Transfer } from '../tools/transfer';
import { google } from '@ai-sdk/google';
import { getSystemPrompt } from './system-prompt';
import type { Tool } from '../types';

/**
 * Agent manages the central agentic loop with streaming support.
 */
export class Agent {
  private contextManager: ContextManager;
  private tools: Map<string, Tool> = new Map();

  constructor() {
    this.contextManager = new ContextManager();
  }

  default = () => {
    // register default adapter
    this.use(new Swap());
    this.use(new Transfer());
  }

  /**
   * Registers a new Action Adapter as a tool.
   * @param adapter - The Action Adapter to register.
   */
  use = (tool: Tool) => {
    this.tools.set(tool.toolType, tool);
    console.log(`[Agent] Registered tool: ${tool.toolType}`);
  }

  /**
   * Returns the complete map of tools for the LLM.
   * Merges base tools (portfolio, knowledge) with registered Action Adapters.
   */
  private getTools = () => {
    // 1. Define Base Tools
    const baseTools = {
      get_portfolio: tool({
        description: 'Fetches the portfolio assets for a given user address.',
        inputSchema: z.object({
          address: z.string().describe('The user wallet address')
        }),
        execute: async ({ address }: { address: string }) => {
          return this.contextManager.getPortfolio(address);
        }
      }),
      search_knowledge: tool({
        description: 'Searches the knowledge base for information about protocols, concepts, or static data.',
        inputSchema: z.object({
          query: z.string().describe('The search query')
        }),
        execute: async ({ query }: { query: string }) => {
          return this.contextManager.queryKnowledgeBase(query);
        }
      })
    };

    // 2. Generate Dynamic Tools from Adapters
    const actionTools: Record<string, any> = {};

    for (const [n, t] of this.tools) {
      actionTools[n] = tool({
        description: t.description,
        inputSchema: t.inputSchema,
        execute: async (args: any) => {
          return t.execute(args);
        }
      });
    }

    // 3. Return Merged Toolset
    return { ...baseTools, ...actionTools };
  }

  /**
   * Main entry point for processing a chat request without streaming.
   * @param messages - The conversation history.
   */
  requestResponse = async (messages: any[]) => {
    // In a real scenario, we might want to fetch some initial context here
    // or let the tools fetch it dynamically.
    const initialContext = "No specific context provided yet.";

    const result = await generateText({
      model: google('gemini-3-flash-preview'), // Updated model name for better tool calling performance
      stopWhen: stepCountIs(5), // Allow multi-step interactions
      system: getSystemPrompt(initialContext),
      messages, // Pass the full conversation history
      tools: this.getTools(),
    });

    return result;
  }

  /**
   * Main entry point for processing a chat request with streaming.
   * @param messages - The conversation history.
   */
  streamResponse = async (messages: any[]) => {
    // In a real scenario, we might want to fetch some initial context here
    // or let the tools fetch it dynamically.
    const userAddress = "0x1234567890123456789012345678901234567890";
    const initialContext = `
    User Address: ${userAddress}
    `

    const result = streamText({
      model: google('gemini-3-flash-preview'), // Updated model name for better tool calling performance
      // @ts-ignore
      maxSteps: 5, // Allow multi-step interactions
      system: getSystemPrompt(initialContext),
      messages, // Pass the full conversation history
      tools: this.getTools(),
    });

    return result;
  }
}
