import { z } from 'zod';

export interface PortfolioData {
  address: string;
  totalValueUsd: number;
  assets: Asset[];
}

export interface Asset {
  symbol: string;
  amount: number;
  valueUsd: number;
  chain: string;
}

export interface Action {
  type: 'swap' | 'transfer' | 'bridge' | 'stake';
  protocol: string;
  params: Record<string, any>;
}

export interface AgentPlan {
  steps: Action[];
  reasoning: string;
}

export interface Adapter {
  name: string;
  supportedChains: string[];
  execute(action: Action): Promise<any>;
}