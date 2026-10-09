import { BetStore, type Bet } from '@/lib/betStore';

// Fresh store per test. Never use the exported `betStore` singleton: it seeds mock data on import.
let store: BetStore;
let a: string, b: string, c: string, d: string, groupId: string;

const baseBet = (stake: number): Omit<Bet, 'id' | 'status' | 'participants' | 'createdAt'> => ({
  groupId,
  creatorId: a,
  title: 'Test bet',
  description: '',
  sideA: 'A',
  sideB: 'B',
  stake,
  eventDate: new Date(Date.now() + 86_400_000),
  proofType: 'vote',
});

const betTotal = (betId: string) =>
  [a, b, c, d]
    .flatMap(u => store.getUserLedger(u))
    .filter(e => e.betId === betId)
    .reduce((s, e) => s + e.amount, 0);

const isWholeCents = (n: number) => Number.isInteger(Math.round(n * 100)) && Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;

beforeEach(() => {
  store = new BetStore();
  a = store.addUser({ email: 'a@t.com', displayName: 'A' }).id;
  b = store.addUser({ email: 'b@t.com', displayName: 'B' }).id;
  c = store.addUser({ email: 'c@t.com', displayName: 'C' }).id;
  d = store.addUser({ email: 'd@t.com', displayName: 'D' }).id;
  const g = store.createGroup('G', a);
  [b, c, d].forEach(u => store.joinGroup(g.inviteCode, u));
  groupId = g.id;
});

describe('BetStore', () => {
  // BUG: createBet has no stake validation; a $0 bet is accepted and writes $0 ledger rows.
  it('1. rejects a zero stake', () => {
    expect(() => store.createBet(baseBet(0))).toThrow();
  });

  // BUG: negative stakes are accepted, so the "loser" gains money on resolve.
  it('2. rejects a negative stake', () => {
    expect(() => store.createBet(baseBet(-25))).toThrow();
  });

  it('3. 1v1 settlement pays the winner and nets to zero', () => {
    const bet = store.createBet(baseBet(25));
    store.acceptBet(bet.id, b, 'A');
    store.acceptBet(bet.id, c, 'B');
    store.resolveBet(bet.id, 'A');
    expect(store.getUserBalance(b)).toBe(25);
    expect(store.getUserBalance(c)).toBe(-25);
    expect(betTotal(bet.id)).toBe(0);
  });

  // BUG: (a) acceptBet locks at 2 participants, so a 3v1 bet can't be formed through the API;
  // (b) payout is float math (stake * losers / winners), giving 3.333... instead of whole cents.
  it('4. uneven split (3 winners vs 1 loser) pays whole cents and nets to zero', () => {
    const bet = store.createBet(baseBet(10));
    store.acceptBet(bet.id, a, 'A');
    store.acceptBet(bet.id, b, 'A');
    store.acceptBet(bet.id, c, 'A');
    store.acceptBet(bet.id, d, 'B');
    expect(store.getBet(bet.id)!.participants).toHaveLength(4);
    store.resolveBet(bet.id, 'A');
    [a, b, c].forEach(u => expect(isWholeCents(store.getUserBalance(u))).toBe(true));
    expect(betTotal(bet.id)).toBe(0);
  });

  it('5. resolving twice writes ledger rows only once', () => {
    const bet = store.createBet(baseBet(25));
    store.acceptBet(bet.id, b, 'A');
    store.acceptBet(bet.id, c, 'B');
    store.resolveBet(bet.id, 'A');
    store.resolveBet(bet.id, 'B');
    expect(store.getUserLedger(b)).toHaveLength(1);
    expect(store.getUserLedger(c)).toHaveLength(1);
    expect(store.getBet(bet.id)!.winnerSide).toBe('A');
  });

  // BUG: resolveBet only guards `resolved`; a void (or draft) bet flips to resolved.
  it('6. a void or draft bet cannot be resolved', () => {
    const v = store.createBet(baseBet(25));
    store.acceptBet(v.id, b, 'A');
    store.acceptBet(v.id, c, 'B');
    store.updateBetStatus(v.id, 'void');
    store.resolveBet(v.id, 'A');
    expect(store.getBet(v.id)!.status).toBe('void');
    expect(betTotal(v.id)).toBe(0);

    const draft = store.createBet(baseBet(25));
    store.resolveBet(draft.id, 'A');
    expect(store.getBet(draft.id)!.status).toBe('draft');
  });

  it('7. only participants are paid; no double-accept; no joining a locked bet', () => {
    const bet = store.createBet(baseBet(25));
    store.acceptBet(bet.id, b, 'A');
    expect(store.acceptBet(bet.id, b, 'B')).toBeNull();
    store.acceptBet(bet.id, c, 'B');
    expect(store.getBet(bet.id)!.status).toBe('locked');
    expect(store.acceptBet(bet.id, d, 'A')).toBeNull();
    store.resolveBet(bet.id, 'A');
    expect(store.getUserBalance(a)).toBe(0);
    expect(store.getUserBalance(d)).toBe(0);
  });
});
