import { BaseAdapter } from './base-adapter.ts';
import { Action } from '../types/index.ts';

/**
 * Adapter for Jupiter Aggregator on Solana.
 */
export class JupiterAdapter extends BaseAdapter {
  name = 'jupiter';
  supportedChains = ['solana'];

  async execute(action: Action): Promise<any> {
    console.log(`[JupiterAdapter] Executing action: ${action.type}`);
    
    if (action.type !== 'swap') {
      throw new Error(`JupiterAdapter only supports 'swap' actions. Got: ${action.type}`);
    }

    // TODO: Implement actual Jupiter API call here
    // const { inputToken, outputToken, amount } = action.params;
    
    return {
      status: 'success',
      txHash: 'mock-tx-hash-solana-jupiter',
      details: {
        protocol: 'jupiter',
        action: 'swap',
        params: action.params
      }
    };
  }
}
