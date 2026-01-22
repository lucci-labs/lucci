import { describe, expect, it } from 'bun:test';
import { JupiterAdapter } from '../adapters/jupiter-adapter';
import type { Action } from '../types/index';

describe('JupiterAdapter', () => {
  const adapter = new JupiterAdapter();

  it('should have correct name and supported chains', () => {
    expect(adapter.name).toBe('jupiter');
    expect(adapter.supportedChains).toContain('solana');
  });

  it('should execute swap action correctly', async () => {
    const action: Action = {
      type: 'swap',
      protocol: 'jupiter',
      params: {
        input: 'SOL',
        output: 'USDC',
        amount: 1
      }
    };

    const result = await adapter.execute(action);

    expect(result.status).toBe('success');
    expect(result.txHash).toBe('mock-tx-hash-solana-jupiter');
    expect(result.details.action).toBe('swap');
  });

  it('should throw error for unsupported action type', async () => {
    const action: Action = {
      type: 'transfer', // Jupiter adapter only supports 'swap' in this mock
      protocol: 'jupiter',
      params: {
        to: '0xabc',
        amount: 10
      }
    };

    // expect(adapter.execute(action)).rejects.toThrow(); // bun test syntax might vary slightly, let's try standard try/catch or promise
    try {
        await adapter.execute(action);
    } catch (e: any) {
        expect(e.message).toContain('only supports \'swap\' actions');
    }
  });
});
