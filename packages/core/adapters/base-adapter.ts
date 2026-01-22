import type { Adapter, Action } from '../types/index.ts';

/**
 * Abstract base class for DeFi protocol adapters.
 * All specific protocol adapters should extend this class.
 */
export abstract class BaseAdapter implements Adapter {
  abstract name: string;
  abstract supportedChains: string[];

  /**
   * Executes a specific action on the protocol.
   * @param action - The action to execute.
   */
  abstract execute(action: Action): Promise<any>;

  /**
   * Validates if the adapter can handle the requested action.
   * @param action - The action to validate.
   */
  canHandle(action: Action): boolean {
    return action.protocol === this.name;
  }
}
