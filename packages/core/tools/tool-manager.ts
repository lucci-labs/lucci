import { tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { ContextManager } from '../context/context-manager.ts';
import type { Action, Adapter } from '../types/index.ts';

/**
 * ToolManager serves as a registry for tools available to the LLM.
 * It also manages protocol adapters for the 'execute_action' tool.
 */
export class ToolManager {
  private contextManager: ContextManager;
  private adapters: Map<string, Adapter> = new Map();

  constructor(contextManager: ContextManager) {
    this.contextManager = contextManager;
  }

  /**
   * Registers a new DeFi protocol adapter.
   * @param adapter - The adapter instance to register.
   */
  registerAdapter(adapter: Adapter) {
    this.adapters.set(adapter.name, adapter);
    console.log(`Registered adapter: ${adapter.name}`);
  }

  /**
   * Returns the list of available tools for the LLM.
   */
  getTools() {
    return {
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
      }),
      execute_action: tool({
        description: 'Executes a DeFi action (swap, transfer, etc.) using a registered protocol adapter.',
        inputSchema: z.object({
          protocol: z.string().describe('The protocol to use (e.g., jupiter)'),
          type: z.enum(['swap', 'transfer', 'bridge', 'stake']).describe('Type of action'),
          params: z.record(z.string(), z.any()).describe('Parameters for the action')
        }),
        execute: async (args: any) => {
          const { protocol, type, params } = args;
          const adapter = this.adapters.get(protocol);
          
          if (!adapter) {
            throw new Error(`No adapter registered for protocol: ${protocol}`);
          }

          const action: Action = { protocol, type, params };
          return adapter.execute(action);
        }
      })
    };
  }

  /**
   * helper to execute a tool by name
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
