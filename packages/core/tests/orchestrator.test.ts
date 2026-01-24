import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { Agent } from '../agents/agent';

// Mock values to verify later
const mockGenerateText = mock(async () => ({
  text: 'Mocked AI response',
}));

// Mock the AI SDK dependencies
mock.module('ai', () => ({
  generateText: mockGenerateText,
  stepCountIs: () => ({}),
  tool: (t: any) => t // Pass through for tool definition
}));

mock.module('@ai-sdk/google', () => ({
  google: () => ({})
}));

describe('Agent Orchestrator', () => {
  beforeEach(() => {
    mockGenerateText.mockClear();
  });

  it('should process request using mocked AI', async () => {
    const agent = new Agent();
    const result = await agent.chat([]);
    expect(result.text).toBe('Mocked AI response');
  });

  it('should register default tools and pass them to AI', async () => {
    const agent = new Agent();
    // Register default tools (Swap, Transfer)
    agent.default();

    await agent.chat([]);

    // Check the arguments passed to generateText
    const callArgs = mockGenerateText.mock.calls[0]; // First call
    // args[0] is the config object passed to generateText
    const tools = (callArgs as any)[0].tools;

    expect(tools).toBeDefined();
    expect(tools.swap).toBeDefined();
    expect(tools.transfer).toBeDefined();
    expect(tools.get_portfolio).toBeDefined(); // Base tool
  });

  it('should inject user context into system prompt', async () => {
    const agent = new Agent();
    const userAddress = "0x123" as any; // Cast to bypass Address type check

    // Mock getPortfolio directly on the private contextManager if possible, 
    // or we can rely on the real one returning a mock if it's already mocked elsewhere. 
    // Since we didn't mock ContextManager module, it uses the real one. 
    // But ContextManager might fetch real data? 
    // Let's assume ContextManager.getPortfolio returns something predictable or we spy on it.
    // For now, let's just check if the system prompt receives the address string we passed.

    // We can spy on the ContextManager prototype to return mock data
    // But easier: The system prompt function is what generates the string.
    // Agent calls `getSystemPrompt(context)`. 
    // We can check if `generateText` received a system prompt containing our address.

    mockGenerateText.mockClear();

    // We need to patch ContextManager to avoid real network calls if any
    // Access private contextManager via any cast
    const mockPortfolio = { totalValueUsd: 1000, assets: [] };
    (agent as any).contextManager.getPortfolio = mock(async () => mockPortfolio);

    await agent.chat([], userAddress);

    const callArgs = mockGenerateText.mock.calls[0];
    const systemPrompt = (callArgs as any)[0].system;

    // Verify system prompt contains the user address and portfolio data
    expect(systemPrompt).toContain(userAddress);
    expect(systemPrompt).toContain('1000'); // Check for portfolio value
  });
});
