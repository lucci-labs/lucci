import { describe, expect, it } from 'bun:test';
import { ContextManager } from '../context/context-manager';
import { zeroAddress } from 'viem';

describe('ContextManager', () => {
  const contextManager = new ContextManager({
    rpc: 'https://api.mainnet-beta.solana.com',
  });

  it('should fetch portfolio data', async () => {
    const address = '0x123...';
    const portfolio = await contextManager.getPortfolio(address);

    expect(portfolio).toBeDefined();
    expect(portfolio.address).toBe(address);
    expect(portfolio.assets.length).toBeGreaterThan(0);
    expect(portfolio.totalValueUsd).toBeGreaterThan(0);
  });

  it('should query knowledge base', async () => {
    const query = 'solana';
    const results = await contextManager.queryKnowledgeBase(query);

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toContain('Jupiter');
  });

  it('should return default knowledge for unknown query', async () => {
    const query = 'unknown query';
    const results = await contextManager.queryKnowledgeBase(query);

    expect(results).toBeDefined();
    expect(results[0]).toContain('Lucci SDK');
  });

  it('should stringify context', async () => {
    const contextString = await contextManager.stringtifyContext(zeroAddress);
    console.log('Context String:', contextString);
  })
});
