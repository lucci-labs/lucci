import { tool } from 'ai';
import { z } from 'zod';
import { ContextManager } from '../context/context-manager.ts';
import type { ActionAdapter } from '../types/index.ts';

/**
 * ToolManager serves as a registry for tools available to the LLM.
 * It combines static base tools with dynamic Action Adapters.
 */
export class ToolManager {
  private contextManager: ContextManager;
  private adapters: Map<string, ActionAdapter> = new Map();

  constructor(contextManager: ContextManager) {
    this.contextManager = contextManager;
  }

  /**
   * Registers a new Action Adapter as a tool.
   * @param adapter - The Action Adapter to register.
   */
  registerAdapter(adapter: ActionAdapter) {
    this.adapters.set(adapter.actionType, adapter);
    console.log(`[ToolManager] Registered tool: ${adapter.actionType}`);
  }

  /**
   * Returns the complete map of tools for the LLM.
   * Merges base tools (portfolio, knowledge) with registered Action Adapters.
   */
  getTools() {
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
    
    for (const [name, adapter] of this.adapters) {
      actionTools[name] = tool({
        description: adapter.description,
        inputSchema: adapter.inputSchema,
        execute: async (args: any) => {
          return adapter.execute(args);
        }
      });
    }

    // 3. Return Merged Toolset
    return { ...baseTools, ...actionTools };
  }

  /**
   * Helper to execute a tool directly (useful for testing).
   */
  async executeTool(name: string, args: any): Promise<any> {
    const tools = this.getTools() as any;
    const toolInstance = tools[name];
    
    if (!toolInstance) {
      throw new Error(`Tool not found: ${name}`);
    }

    // Validate arguments against schema
    const validation = toolInstance.inputSchema.safeParse(args);
    if (!validation.success) {
      throw new Error(`Invalid arguments for tool ${name}: ${validation.error.message}`);
    }

    return toolInstance.execute(validation.data);
  }
}