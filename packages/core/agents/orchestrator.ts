import { ContextManager } from '../context/context-manager.ts';
import { ToolManager } from '../tools/tool-manager.ts';
import { JupiterAdapter } from '../adapters/jupiter-adapter.ts';

/**
 * AgentOrchestrator manages the central agentic loop.
 * 
 * Flow:
 * 1. Receives a user message.
 * 2. Analyzes context and determines if a tool call is needed (Mocked LLM decision).
 * 3. Calls the ToolManager to execute the tool if selected.
 * 4. Receives tool output.
 * 5. Decides next step: another tool call or final response.
 * 6. Returns the final response to the user.
 */
export class AgentOrchestrator {
  private contextManager: ContextManager;
  private toolManager: ToolManager;

  constructor() {
    this.contextManager = new ContextManager();
    this.toolManager = new ToolManager(this.contextManager);

    // Register default adapters
    // In a real app, this might be dynamic or configuration-based
    this.toolManager.registerAdapter(new JupiterAdapter());
  }

  /**
   * Main entry point for processing a user request.
   * @param userMessage - The input string from the user.
   */
  async processRequest(userMessage: string): Promise<string> {
    console.log(`[Orchestrator] Received: "${userMessage}"`);

    // --- AGENTIC LOOP START ---
    
    // Step 1: LLM "Think" (Mocked logic for demonstration)
    // In a real implementation, this would call an LLM API with the conversation history and tool definitions.
    const toolCall = await this.mockLlmDecision(userMessage);

    if (toolCall) {
      console.log(`[Orchestrator] Decided to call tool: ${toolCall.name}`);
      
      try {
        // Step 2: Execute Tool
        const result = await this.toolManager.executeTool(toolCall.name, toolCall.args);
        console.log(`[Orchestrator] Tool output:`, result);

        // Step 3: LLM Synthesis (Mocked)
        // Feed tool output back to LLM to generate final response
        return this.mockLlmSynthesis(userMessage, toolCall.name, result);

      } catch (error) {
        console.error(`[Orchestrator] Tool execution failed:`, error);
        return "I encountered an error while trying to process your request.";
      }
    }

    // Fallback if no tool needed (Direct conversation)
    return "I can help you with checking your portfolio or executing trades on Solana. What would you like to do?";
  }

  /**
   * Mocks the LLM's decision-making process to select a tool.
   */
  private async mockLlmDecision(message: string): Promise<{ name: string; args: any } | null> {
    const msg = message.toLowerCase();

    if (msg.includes('portfolio') || msg.includes('balance')) {
      return {
        name: 'get_portfolio',
        args: { address: '0x123...mock_address' }
      };
    }

    if (msg.includes('swap') && msg.includes('jupiter')) {
      return {
        name: 'execute_action',
        args: {
          protocol: 'jupiter',
          type: 'swap',
          params: { input: 'SOL', output: 'USDC', amount: 1 }
        }
      };
    }
    
    if (msg.includes('how to') || msg.includes('explain') || msg.includes('what is')) {
      return {
        name: 'search_knowledge',
        args: { query: message }
      };
    }

    return null;
  }

  /**
   * Mocks the LLM's final response generation based on tool output.
   */
  private mockLlmSynthesis(originalMessage: string, toolName: string, toolResult: any): string {
    if (toolName === 'get_portfolio') {
      return `Your portfolio contains ${toolResult.assets.length} assets with a total value of $${toolResult.totalValueUsd}.`;
    }

    if (toolName === 'execute_action') {
      return `I've successfully prepared the swap transaction on Jupiter. Tx Hash: ${toolResult.txHash}`;
    }

    if (toolName === 'search_knowledge') {
      return `Here is what I found: ${toolResult[0]}`;
    }

    return "Task completed.";
  }
}
