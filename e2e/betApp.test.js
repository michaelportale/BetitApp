describe('BetitApp E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Authentication Flow', () => {
    it('should show login screen on launch', async () => {
      await expect(element(by.text('Welcome to BetitApp'))).toBeVisible();
      await expect(element(by.text('Quick Login for Demo'))).toBeVisible();
    });

    it('should allow login as Alice', async () => {
      await element(by.text('Alice')).tap();
      await expect(element(by.text('Dashboard'))).toBeVisible();
    });
  });

  describe('Dashboard and Navigation', () => {
    beforeEach(async () => {
      // Login as Alice for dashboard tests
      await element(by.text('Alice')).tap();
    });

    it('should show dashboard with recent bets', async () => {
      await expect(element(by.text('Dashboard'))).toBeVisible();
      await expect(element(by.text('Recent Bets'))).toBeVisible();
    });

    it('should navigate to Groups tab', async () => {
      await element(by.text('Groups')).tap();
      await expect(element(by.text('My Groups'))).toBeVisible();
    });

    it('should navigate to Bets tab', async () => {
      await element(by.text('Bets')).tap();
      await expect(element(by.text('My Bets'))).toBeVisible();
    });

    it('should navigate to Profile tab', async () => {
      await element(by.text('Profile')).tap();
      await expect(element(by.text('Alice'))).toBeVisible();
      await expect(element(by.text('alice@test.com'))).toBeVisible();
    });
  });

  describe('Create Bet Flow', () => {
    beforeEach(async () => {
      // Login as Alice and navigate to create bet
      await element(by.text('Alice')).tap();
      await element(by.id('create-bet-button')).tap();
    });

    it('should show create bet form', async () => {
      await expect(element(by.text('Create New Bet'))).toBeVisible();
      await expect(element(by.placeholder('Bet title'))).toBeVisible();
      await expect(element(by.placeholder('Bet description'))).toBeVisible();
    });

    it('should allow creating a new bet', async () => {
      await element(by.placeholder('Bet title')).typeText('Test E2E Bet');
      await element(by.placeholder('Bet description')).typeText('Testing bet creation flow');
      await element(by.placeholder('Option A')).typeText('Team A Wins');
      await element(by.placeholder('Option B')).typeText('Team B Wins');
      await element(by.placeholder('Stake amount')).typeText('50');
      
      // Select a group
      await element(by.text('Select Group')).tap();
      await element(by.text('College Friends')).tap();
      
      // Create the bet
      await element(by.text('Create Bet')).tap();
      
      await expect(element(by.text('Test E2E Bet'))).toBeVisible();
    });
  });

  describe('Bet Interaction Flow', () => {
    beforeEach(async () => {
      // Login as Alice
      await element(by.text('Alice')).tap();
    });

    it('should show bet details when tapping on a bet', async () => {
      await element(by.text('Lakers vs Warriors')).tap();
      await expect(element(by.text('Bet Details'))).toBeVisible();
      await expect(element(by.text('Lakers'))).toBeVisible();
      await expect(element(by.text('Warriors'))).toBeVisible();
    });

    it('should allow accepting a bet', async () => {
      // Navigate to a draft bet
      await element(by.text('Bets')).tap();
      await element(by.text('Elden Ring DLC Release')).tap();
      
      // Accept the bet
      await element(by.text('Accept Bet - Side A')).tap();
      await expect(element(by.text('Bet accepted!'))).toBeVisible();
    });
  });

  describe('Resolve Bet Flow', () => {
    beforeEach(async () => {
      // Login as Alice
      await element(by.text('Alice')).tap();
    });

    it('should allow voting on bet outcome', async () => {
      // Navigate to a bet in voting stage
      await element(by.text('Bets')).tap();
      await element(by.text('Lakers vs Warriors')).tap();
      
      // If bet is in voting stage, vote on outcome
      if (await element(by.text('Vote on Outcome')).isDisplayed()) {
        await element(by.text('Vote on Outcome')).tap();
        await element(by.text('Lakers Wins')).tap();
        await element(by.text('Submit Vote')).tap();
        await expect(element(by.text('Vote submitted!'))).toBeVisible();
      }
    });
  });

  describe('Group Management', () => {
    beforeEach(async () => {
      // Login as Alice and go to Groups
      await element(by.text('Alice')).tap();
      await element(by.text('Groups')).tap();
    });

    it('should show user groups', async () => {
      await expect(element(by.text('College Friends'))).toBeVisible();
      await expect(element(by.text('Office Squad'))).toBeVisible();
    });

    it('should show group details', async () => {
      await element(by.text('College Friends')).tap();
      await expect(element(by.text('Group Details'))).toBeVisible();
      await expect(element(by.text('Members'))).toBeVisible();
    });

    it('should allow creating a new group', async () => {
      await element(by.id('create-group-button')).tap();
      await element(by.placeholder('Group name')).typeText('E2E Test Group');
      await element(by.text('Create Group')).tap();
      await expect(element(by.text('E2E Test Group'))).toBeVisible();
    });
  });

  describe('Profile and Balance', () => {
    beforeEach(async () => {
      // Login as Alice and go to Profile
      await element(by.text('Alice')).tap();
      await element(by.text('Profile')).tap();
    });

    it('should display user balance', async () => {
      await expect(element(by.text('Current Balance'))).toBeVisible();
      // Balance might be positive, negative, or zero
      await expect(element(by.id('user-balance'))).toBeVisible();
    });

    it('should show transaction history', async () => {
      await element(by.text('Transaction History')).tap();
      await expect(element(by.text('Recent Transactions'))).toBeVisible();
    });
  });
});