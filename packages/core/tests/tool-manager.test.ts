import { describe, expect, it } from 'bun:test';
import { ToolManager } from '../tools/tool-manager';
import { ContextManager } from '../context/context-manager';
import { JupiterAdapter } from '../adapters/jupiter-adapter';

describe('ToolManager', () => {
  const contextManager = new ContextManager();
  const toolManager = new ToolManager(contextManager);

  // Register the adapter so execute_action works
  toolManager.registerAdapter(new JupiterAdapter());

  it('should return defined tools', () => {
    const tools = toolManager.getTools();
    expect(tools.get_portfolio).toBeDefined();
    expect(tools.search_knowledge).toBeDefined();
    expect(tools.execute_action).toBeDefined();
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

  it('should execute execute_action tool', async () => {
    const args = {
      protocol: 'jupiter',
      type: 'swap',
      params: {
        input: 'SOL',
        output: 'USDC',
        amount: 1
      }
    };
    const result = await toolManager.executeTool('execute_action', args);
    expect(result.status).toBe('success');
  });

  it('should fail when executing unknown tool', async () => {
    try {
        await toolManager.executeTool('unknown_tool', {});
    } catch (e: any) {
        expect(e.message).toContain('Tool not found');
    }
  });

  it('should fail when executing action with unknown protocol', async () => {
    const args = {
        protocol: 'unknown_protocol',
        type: 'swap',
        params: {}
      };
      
    try {
        await toolManager.executeTool('execute_action', args);
    } catch (e: any) {
        expect(e.message).toContain('No adapter registered');
    }
  });
});
