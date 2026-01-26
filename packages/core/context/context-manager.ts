import { PortfolioProvider } from './portfolio-provider';
import { KnowledgeBase } from './knowledge-base';
import type { PortfolioData } from '../types/index';
import type { Address } from 'viem';

export type ContextManagerConfig = {
  rpc: string;
};

/**
 * ContextManager acts as a coordinator for gathering real-time data
 * from various sources like portfolio providers and knowledge bases.
 */
export class ContextManager {
  private portfolioProvider: PortfolioProvider;
  private knowledgeBase: KnowledgeBase;

  constructor(config: ContextManagerConfig) {
    this.portfolioProvider = new PortfolioProvider();
    this.knowledgeBase = new KnowledgeBase();
  }

  async stringtifyContext(address: Address): Promise<string> {
    return ""
  }

  async searchTokenByName(name: string): Promise<string | null> {
    return ""
  }

  /**
   * Fetches the portfolio for a given address.
   */
  async getPortfolio(address: string): Promise<PortfolioData> {
    return this.portfolioProvider.getPortfolio(address);
  }

  /**
   * Retrieves context from the knowledge base.
   */
  async queryKnowledgeBase(query: string): Promise<string[]> {
    return this.knowledgeBase.search(query);
  }
}
