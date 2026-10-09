import { betStore } from '@/lib/betStore';
import { LedgerService } from '@/services/LedgerService';

// LedgerService is bound to the singleton, so use a user id the seed data never touches.
const U = 'qa-ledger-user';

describe('LedgerService', () => {
  beforeAll(async () => {
    for (let i = 1; i <= 5; i++) {
      await LedgerService.addLedgerEntry({ userId: U, betId: `bet-${i}`, amount: i });
    }
  });

  it('8. passes balance through and paginates', async () => {
    expect(await LedgerService.getUserBalance(U)).toBe(betStore.getUserBalance(U));
    expect(await LedgerService.getUserBalance(U)).toBe(15);

    const page = await LedgerService.getUserLedgerPaginated(U, { offset: 2, limit: 2 });
    expect(page.data.map(e => e.betId)).toEqual(['bet-3', 'bet-4']);
    expect(page.total).toBe(5);
    expect(page.hasMore).toBe(true);

    const past = await LedgerService.getUserLedgerPaginated(U, { offset: 10, limit: 2 });
    expect(past.data).toEqual([]);
    expect(past.hasMore).toBe(false);
  });
});
