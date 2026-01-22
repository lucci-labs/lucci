import { z } from 'zod';
import type { ActionAdapter } from '../types/index.ts';

/**
 * Smart Action Adapter for token swaps.
 * Automatically routes execution based on the chain or requested protocol.
 */
export class SwapAdapter implements ActionAdapter {
  actionType = 'swap';
  description = 'Exchanges one token for another on a specific chain. Use this for all trading activities.';

  inputSchema = z.object({
    tokenIn: z.string().describe('The token symbol to sell (e.g., SOL, ETH)'),
    tokenOut: z.string().describe('The token symbol to buy (e.g., USDC, PEPE)'),
    amount: z.number().positive().describe('The amount of tokenIn to swap'),
    chain: z.string().describe('The blockchain network (e.g., solana, ethereum, base)'),
    protocol: z.string().optional().describe('Specific protocol to use (e.g., jupiter, uniswap). If omitted, the best aggregator is chosen.')
  });

  async execute(args: z.infer<typeof this.inputSchema>): Promise<any> {
    const { tokenIn, tokenOut, amount, chain, protocol } = args;
    console.log(`[SwapAdapter] Request: ${amount} ${tokenIn} -> ${tokenOut} on ${chain}`);

    // Smart Routing Stub
    let selectedProtocol = protocol;

    if (!selectedProtocol) {
      if (chain.toLowerCase() === 'solana') {
        selectedProtocol = 'jupiter';
      } else if (chain.toLowerCase() === 'ethereum' || chain.toLowerCase() === 'base') {
        selectedProtocol = 'uniswap';
      } else {
        selectedProtocol = 'generic-aggregator';
      }
      console.log(`[SwapAdapter] Smart Routing: Selected ${selectedProtocol} for ${chain}`);
    }

    // Mock Execution Logic
    return {
      status: 'success',
      type: 'swap',
      details: {
        chain,
        protocol: selectedProtocol,
        input: { token: tokenIn, amount },
        output: { token: tokenOut, estimatedAmount: amount * 1.5 } // Mock rate
      },
      txHash: `mock-tx-hash-${chain}-${selectedProtocol}-${Date.now()}`
    };
  }
}
