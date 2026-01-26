import { streamText, stepCountIs, generateText, tool, type GenerateTextResult, type StreamTextResult, type ModelMessage } from 'ai';
import { z } from 'zod';
import { ContextManager } from '../context/context-manager';
import { Swap } from '../tools/swap';
import { Transfer } from '../tools/transfer';
import { google } from '@ai-sdk/google';
import { getSystemPrompt } from './system-prompt';
import type { Tool, ToolConstructor } from '../types';
import type { Address } from '@solana/kit';

export type AgentTools = ReturnType<Agent['getTools']>
export type AgentConfig = {
  modelName?: string;
  rpc?: string;
}

/**
 * Agent manages the central agentic loop with streaming support.
 */
export class Agent {
  private contextManager: ContextManager;
  private tools: Map<string, Tool> = new Map();
  private modelName: string = 'gemini-3-flash-preview';

  constructor(config?: AgentConfig) {
    this.contextManager = new ContextManager({
      rpc: config?.rpc || 'https://api.mainnet-beta.solana.com',
    });
    if (config) {
      if (config.modelName) {
        this.modelName = config.modelName;
      }
    }
  }

  default = (): Agent => {
    // register default adapter
    this.use(Swap);
    this.use(Transfer);

    return this;
  }

  /**
   * Registers a new Action Adapter as a tool.
   * @param ToolClass - The Action Adapter class to register.
   */
  use = (ToolClass: ToolConstructor): Agent => {
    const toolInstance = new ToolClass(this.contextManager);
    if (this.tools.has(toolInstance.toolType)) {
      throw new Error(`Tool ${toolInstance.toolType} already registered.`);
    }
    this.tools.set(toolInstance.toolType, toolInstance);

    return this;
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
        execute: (args) => t.execute(args)
      });
    }

    // 3. Return Merged Toolset
    return { ...baseTools, ...actionTools };
  }

  private prepareContext = async (userAddress?: Address): Promise<string> => {
    let context = ""
    if (userAddress) {
      const portfolio = await this.contextManager.getPortfolio(userAddress);
      context = `User Address: ${userAddress}\nPortfolio: ${JSON.stringify(portfolio)}`;
    }
    return context;
  }

  /**
   * Processes a chat request using the LLM.
   * @param messages - The conversation history.
   * @param userAddress - The user's wallet address.
   */
  chat = async (messages: ModelMessage[], userAddress?: Address): Promise<GenerateTextResult<AgentTools, any>> => {
    const context = await this.prepareContext(userAddress);

    const result = await generateText({
      model: google(this.modelName),
      stopWhen: stepCountIs(5),
      system: getSystemPrompt(context),
      messages,
      tools: this.getTools(),
    });

    return result;
  }

  /**
   * Processes a chat request using the LLM with streaming output.
   * @param messages - The conversation history.
   * @param userAddress - The user's wallet address.
   */
  stream = async (messages: ModelMessage[], userAddress?: Address): Promise<StreamTextResult<AgentTools, any>> => {
    const context = await this.prepareContext(userAddress);

    const result = streamText({
      model: google(this.modelName),
      stopWhen: stepCountIs(5),
      system: getSystemPrompt(context),
      messages,
      tools: this.getTools(),
    });

    return result;
  }
}
