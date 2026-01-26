import { describe, expect, it } from 'bun:test';
import { Agent } from '../agents/agent';
import { Swap } from '../tools/swap';

describe('Agent Tools', () => {
  const agent = new Agent();

  // Register the tool
  agent.use(Swap);

  // Access private getTools for testing
  const getTools = (agent as any).getTools;

  it('should return defined tools', () => {
    const tools = getTools();
    expect(tools.get_portfolio).toBeDefined();
    expect(tools.search_knowledge).toBeDefined();
    expect(tools.swap).toBeDefined(); // Dynamically registered
  });

  it('should execute get_portfolio tool', async () => {
    const tools = getTools();
    const result = await tools.get_portfolio.execute({ address: '0x123' });
    expect(result).toBeDefined();
    expect(result.totalValueUsd).toBeDefined();
  });

  it('should execute search_knowledge tool', async () => {
    const tools = getTools();
    const result = await tools.search_knowledge.execute({ query: 'solana' });
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toContain('Jupiter');
  });

  it('should execute dynamic swap tool', async () => {
    const tools = getTools();
    const args = {
      tokenIn: 'SOL',
      tokenOut: 'USDC',
      amount: 1,
      chain: 'solana'
    };
    // The execute function in AI SDK tools might return different structures depending on version, 
    // but typically it returns what the execute function returns.
    const result = await tools.swap.execute(args);

    // Check for the mock response structure from swap.ts
    expect(result.status).toBe('requires_confirmation');
    expect(result.unsignedTx).toBeDefined();
  });
});