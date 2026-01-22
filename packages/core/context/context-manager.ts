import { PortfolioProvider } from './portfolio-provider.ts';
import { KnowledgeBase } from './knowledge-base.ts';
import type { PortfolioData } from '../types/index.ts';

/**
 * ContextManager acts as a coordinator for gathering real-time data
 * from various sources like portfolio providers and knowledge bases.
 */
export class ContextManager {
  private portfolioProvider: PortfolioProvider;
  private knowledgeBase: KnowledgeBase;

  constructor() {
    this.portfolioProvider = new PortfolioProvider();
    this.knowledgeBase = new KnowledgeBase();
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
