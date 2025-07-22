import { betStore, type LedgerEntry } from '@/lib/betStore';
import {
  PaginatedResponse,
  PaginationParams,
  createPaginatedResponse,
} from '@/hooks/usePaginatedQuery';

export class LedgerService {
  // Read operations
  static async getUserBalance(userId: string): Promise<number> {
    return betStore.getUserBalance(userId);
  }

  static async getUserLedger(userId: string): Promise<LedgerEntry[]> {
    return betStore.getUserLedger(userId);
  }

  static async getUserLedgerPaginated(
    userId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<LedgerEntry>> {
    const allEntries = betStore.getUserLedger(userId);
    const paginatedData = allEntries.slice(params.offset, params.offset + params.limit);
    return createPaginatedResponse(paginatedData, params.limit, params.offset, allEntries.length);
  }

  // Write operations
  static async addLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'createdAt'>): Promise<LedgerEntry> {
    return betStore.addLedgerEntry(entry);
  }
}