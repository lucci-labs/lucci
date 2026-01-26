import { z } from 'zod';
import type { ContextManager } from '../context/context-manager';

export interface PortfolioData {
  address: string;
  totalValueUsd: number;
  assets: Asset[];
}

export interface Asset {
  symbol: string;
  amount: number;
  valueUsd: number;
  chain: string;
}

/**
 * Interface for Tool-based Adapters.
 * Instead of protocols, we register capabilities (e.g., Swap, Transfer).
 */
export interface Tool<T = any> {
  /**
   * The name of the tool (e.g., 'swap', 'transfer').
   * This will be used as the tool name for the AI.
   */
  toolType: string;

  /**
   * Description for the AI to understand when to use this tool.
   */
  description: string;

  /**
   * Zod schema defining the input parameters for this action.
   */
  inputSchema: z.ZodType<T>;

  /**
   * Executes the action with the validated arguments.
   */
  execute(args: T): Promise<any>;
}

export interface ToolConstructor<T = any> {
  new (context: ContextManager): Tool<T>;
}

export interface AgentPlan {
  steps: any[]; // Loosened for now as Action structure is dynamic
  reasoning: string;
}
