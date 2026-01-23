import { describe, expect, it } from 'bun:test';
import { ToolManager } from '../tools/tool-manager';
import { ContextManager } from '../context/context-manager';
import { SwapAdapter } from '../tools/swap';

describe('ToolManager', () => {
  const contextManager = new ContextManager();
  const toolManager = new ToolManager(contextManager);

  // Register the adapter
  toolManager.registerAdapter(new SwapAdapter());

  it('should return defined tools', () => {
    const tools = toolManager.getTools() as any;
    expect(tools.get_portfolio).toBeDefined();
    expect(tools.search_knowledge).toBeDefined();
    expect(tools.swap).toBeDefined(); // Dynamically registered
  });

  it('should execute get_portfolio tool', async () => {
    const result = await toolManager.executeTool('get_portfolio', { address: '0x123' });
    expect(result).toBeDefined();
    expect(result.totalValueUsd).toBeDefined();
  });

  it('should execute search_knowledge tool', async () => {
    const result = await toolManager.executeTool('search_knowledge', { query: 'solana' });
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toContain('Jupiter');
  });

  it('should execute dynamic swap tool', async () => {
    const args = {
      tokenIn: 'SOL',
      tokenOut: 'USDC',
      amount: 1,
      chain: 'solana'
    };
    const result = await toolManager.executeTool('swap', args);
    expect(result.status).toBe('success');
    expect(result.details.protocol).toBe('jupiter');
  });

  it('should fail when executing unknown tool', async () => {
    try {
      await toolManager.executeTool('unknown_tool', {});
    } catch (e: any) {
      expect(e.message).toContain('Tool not found');
    }
  });
});