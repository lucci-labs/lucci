// core/adapters/swap-adapter.ts
import { z } from 'zod';
import type { ActionAdapter } from '../types/index';

export class SwapAdapter implements ActionAdapter {
  actionType = 'swap';
  description = 'Prepare a token swap transaction. This tool returns a transaction that must be signed by the user wallet.';

  inputSchema = z.object({
    tokenIn: z.string().describe('The token symbol to sell (e.g., SOL)'),
    tokenOut: z.string().describe('The token symbol to buy (e.g., USDC)'),
    amount: z.number().positive().describe('The amount of tokenIn to swap'),
    chain: z.string().default('solana').describe('The blockchain network'),
    protocol: z.string().optional().describe('Specific protocol (e.g., jupiter)')
  });

  async execute(args: z.infer<typeof this.inputSchema>): Promise<any> {
    const { tokenIn, tokenOut, amount, chain, protocol } = args;

    // Default protocol based on chain if not specified
    const usedProtocol = protocol || (chain === 'solana' ? 'jupiter' : 'uniswap');

    // Giả lập logic lấy Quote và soạn thảo Transaction
    // Trong thực tế, đây là nơi bạn gọi Jupiter API /swap
    console.log(`[SwapAdapter] Preparing mock TX: ${amount} ${tokenIn} -> ${tokenOut} on ${chain} via ${usedProtocol}`);

    // Giả lập một Unsigned Transaction (thường là base64 encoded string của Solana Transaction)
    const mockUnsignedTx = "AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAHAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

    return {
      status: 'requires_confirmation', // Flag quan trọng để UI nhận biết
      type: 'swap',
      unsignedTx: mockUnsignedTx,
      summary: `Swap ${amount} ${tokenIn} for approximately ${amount * 150} ${tokenOut}`,
      details: {
        chain,
        tokenIn,
        tokenOut,
        amount,
        protocol: usedProtocol,
        estimatedFee: "0.000005 SOL"
      }
    };
  }
}
