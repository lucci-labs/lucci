import { describe, expect, it } from 'bun:test';
import { SwapAdapter } from '../adapters/swap-adapter';

describe('SwapAdapter', () => {
  const adapter = new SwapAdapter();

  it('should have correct actionType', () => {
    expect(adapter.actionType).toBe('swap');
  });

  it('should execute swap action correctly', async () => {
    const args = {
      tokenIn: 'SOL',
      tokenOut: 'USDC',
      amount: 1,
      chain: 'solana'
    };

    const result = await adapter.execute(args);

    expect(result.status).toBe('requires_confirmation');
    expect(result.type).toBe('swap');
    expect(result.details.protocol).toBe('jupiter'); // Smart routing default for Solana
  });
});