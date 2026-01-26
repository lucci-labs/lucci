import { z } from 'zod';
import type { Tool } from '../types/index';
import type { ContextManager } from '../context/context-manager';

/**
 * Action Adapter for asset transfers.
 * Handles sending native tokens or SPL/ERC20 tokens to another address.
 */
export class Transfer implements Tool {
  private contextManager: ContextManager;

  constructor(contextManager: ContextManager) {
    this.contextManager = contextManager;
  }

  toolType = 'transfer';
  description = 'Sends crypto assets from the user wallet to another address.';

  inputSchema = z.object({
    toAddress: z.string().describe('The destination wallet address'),
    token: z.string().describe('The token symbol to send (e.g., ETH, USDC)'),
    amount: z.number().positive().describe('The amount to transfer'),
    chain: z.string().describe('The blockchain network (e.g., ethereum, solana)')
  });

  async execute(args: z.infer<typeof this.inputSchema>): Promise<any> {
    const { toAddress, token, amount, chain } = args;
    console.log(`[TransferAdapter] Request: Send ${amount} ${token} to ${toAddress} on ${chain}`);

    // Mock Execution Logic
    return {
      status: 'success',
      type: 'transfer',
      details: {
        chain,
        to: toAddress,
        asset: token,
        amount
      },
      txHash: `mock-tx-hash-transfer-${chain}-${Date.now()}`
    };
  }
}