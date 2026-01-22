import type { PortfolioData } from '../types/index.ts';

/**
 * Interface for portfolio data providers.
 */
export interface IPortfolioProvider {
  getPortfolio(address: string): Promise<PortfolioData>;
}

/**
 * Mock implementation of a portfolio provider.
 * TODO: Integrate with real providers like Debank or RPC.
 */
export class PortfolioProvider implements IPortfolioProvider {
  async getPortfolio(address: string): Promise<PortfolioData> {
    // Mock data return
    return {
      address,
      totalValueUsd: 15430.50,
      assets: [
        {
          symbol: 'SOL',
          amount: 145.5,
          valueUsd: 14550,
          chain: 'solana'
        },
        {
          symbol: 'USDC',
          amount: 880.50,
          valueUsd: 880.50,
          chain: 'solana'
        }
      ]
    };
  }
}
