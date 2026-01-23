import { z } from 'zod';
import type { Tool } from '../types/index';

export class Swap implements Tool {
  toolType = 'swap';
  description = 'Prepare a token swap transaction. This tool returns a transaction that must be signed by the user wallet.';

  inputSchema = z.object({
    tokenIn: z.string().describe('The token symbol to sell (e.g., SOL)'),
    tokenOut: z.string().describe('The token symbol to buy (e.g., USDC)'),
    amount: z.number().positive().describe('The amount of tokenIn to swap'),
    protocol: z.string().optional().describe('Specific protocol (e.g., jupiter)')
  });

  async execute(args: z.infer<typeof this.inputSchema>): Promise<any> {
    const { tokenIn, tokenOut, amount, protocol } = args;
    const usedProtocol = protocol || 'jupiter';
    console.log(`[SwapAdapter] Preparing mock TX: ${amount} ${tokenIn} -> ${tokenOut} via ${usedProtocol}`);
    const mockUnsignedTx = "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAHAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
    return {
      status: 'requires_confirmation',
      type: 'swap',
      unsignedTx: mockUnsignedTx,
      summary: `Swap ${amount} ${tokenIn} for approximately ${amount * 150} ${tokenOut}`,
      details: {
        tokenIn,
        tokenOut,
        amount,
        protocol: usedProtocol,
        estimatedFee: "0.000005 SOL"
      }
    };
  }
}
