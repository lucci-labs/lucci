import { describe, expect, it, mock } from 'bun:test';
import { Agent } from '../agents/orchestrator';

// Mock the AI SDK dependencies
mock.module('ai', () => ({
  generateText: async () => {
    return {
      text: 'Mocked AI response',
    };
  },
  stepCountIs: () => ({}),
  tool: (t: any) => t // Pass through for tool definition
}));

mock.module('@ai-sdk/google', () => ({
  google: () => ({})
}));

describe('Agent Orchestrator', () => {
  it('should process request using mocked AI', async () => {
    const agent = new Agent();
    const result = await agent.processRequest('Hello agent');
    
    expect(result).toBe('Mocked AI response');
  });
});
