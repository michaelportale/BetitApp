import { betStore, type Bet } from '@/lib/betStore';
import { PaginatedResponse, PaginationParams, createPaginatedResponse } from '@/hooks/usePaginatedQuery';

export class BetService {
  // Read operations
  static async getBet(id: string): Promise<Bet | undefined> {
    return betStore.getBet(id);
  }

  static async getUserBets(userId: string): Promise<Bet[]> {
    return betStore.getUserBets(userId);
  }

  static async getGroupBets(groupId: string): Promise<Bet[]> {
    return betStore.getGroupBets(groupId);
  }

  static async getUserBetsPaginated(
    userId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<Bet>> {
    const allBets = betStore.getUserBets(userId);
    const paginatedData = allBets.slice(params.offset, params.offset + params.limit);
    return createPaginatedResponse(paginatedData, params.limit, params.offset, allBets.length);
  }

  static async getGroupBetsPaginated(
    groupId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<Bet>> {
    const allBets = betStore.getGroupBets(groupId);
    const paginatedData = allBets.slice(params.offset, params.offset + params.limit);
    return createPaginatedResponse(paginatedData, params.limit, params.offset, allBets.length);
  }

  // Write operations
  static async createBet(bet: Omit<Bet, 'id' | 'status' | 'participants' | 'createdAt'>): Promise<Bet> {
    return betStore.createBet(bet);
  }

  static async acceptBet(betId: string, userId: string, side: 'A' | 'B'): Promise<Bet | null> {
    return betStore.acceptBet(betId, userId, side);
  }

  static async lockBet(betId: string): Promise<void> {
    betStore.lockBet(betId);
  }

  static async submitProof(betId: string, userId: string, proof: string): Promise<void> {
    betStore.submitProof(betId, userId, proof);
  }

  static async voteOnBet(betId: string, userId: string, winningSide: 'A' | 'B'): Promise<void> {
    betStore.voteOnBet(betId, userId, winningSide);
  }

  static async resolveBet(betId: string, winningSide: 'A' | 'B'): Promise<void> {
    betStore.resolveBet(betId, winningSide);
  }

  static async updateBetStatus(betId: string, status: Bet['status']): Promise<void> {
    betStore.updateBetStatus(betId, status);
  }

  // Development helper methods
  static async addTestParticipants(betId: string): Promise<boolean> {
    return betStore.addTestParticipants(betId);
  }

  static checkAndProgressBet(betId: string): void {
    betStore.checkAndProgressBet(betId);
  }
}