import { ContextManager } from '../context/context-manager.ts';
import { ToolDefinition, Action, Adapter } from '../types/index.ts';

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
  getTools(): ToolDefinition[] {
    return [
      {
        name: 'get_portfolio',
        description: 'Fetches the portfolio assets for a given user address.',
        parameters: {
          type: 'object',
          properties: {
            address: { type: 'string', description: 'The user wallet address' }
          },
          required: ['address']
        },
        execute: async ({ address }: { address: string }) => {
          return this.contextManager.getPortfolio(address);
        }
      },
      {
        name: 'search_knowledge',
        description: 'Searches the knowledge base for information about protocols, concepts, or static data.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'The search query' }
          },
          required: ['query']
        },
        execute: async ({ query }: { query: string }) => {
          return this.contextManager.queryKnowledgeBase(query);
        }
      },
      {
        name: 'execute_action',
        description: 'Executes a DeFi action (swap, transfer, etc.) using a registered protocol adapter.',
        parameters: {
          type: 'object',
          properties: {
            protocol: { type: 'string', description: 'The protocol to use (e.g., jupiter)' },
            type: { type: 'string', enum: ['swap', 'transfer', 'bridge', 'stake'], description: 'Type of action' },
            params: { type: 'object', description: 'Parameters for the action' }
          },
          required: ['protocol', 'type', 'params']
        },
        execute: async (args: any) => {
          const { protocol, type, params } = args;
          const adapter = this.adapters.get(protocol);
          
          if (!adapter) {
            throw new Error(`No adapter registered for protocol: ${protocol}`);
          }

          const action: Action = { protocol, type, params };
          return adapter.execute(action);
        }
      }
    ];
  }

  /**
   * helper to execute a tool by name
   */
  async executeTool(name: string, args: any): Promise<any> {
    const tools = this.getTools();
    const tool = tools.find(t => t.name === name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return tool.execute(args);
  }
}
