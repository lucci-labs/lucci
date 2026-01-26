import { describe, expect, it } from 'bun:test';
import { Swap } from '../tools/swap';
import { ContextManager } from '../context/context-manager';

describe('SwapAdapter', () => {
  const contextManager = new ContextManager({ rpc: 'http://mock-rpc' });
  const adapter = new Swap(contextManager);

  it('should have correct actionType', () => {
    expect(adapter.toolType).toBe('swap');
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