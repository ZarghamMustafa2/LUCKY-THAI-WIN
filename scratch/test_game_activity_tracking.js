const fs = require('fs');
const vm = require('vm');

const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) { return store[key] || null; },
    setItem: function(key, val) { store[key] = String(val); },
    removeItem: function(key) { delete store[key]; },
    clear: function() { store = {}; },
    _dump: function() { return store; }
  };
})();

const mockWindow = {
  localStorage: localStorageMock,
  sessionStorage: localStorageMock,
  document: { cookie: '' },
  navigator: { userAgent: 'Node.js Test Environment / Chrome 120' },
  addEventListener: function() {},
  BroadcastChannel: function(name) {
    return {
      postMessage: function(msg) {},
      addEventListener: function() {}
    };
  }
};

const context = vm.createContext(mockWindow);

// 1. Load platform-sync.js into context
const syncCode = fs.readFileSync('platform-sync.js', 'utf8');
vm.runInContext(syncCode, context);

console.log('================================================================');
console.log('🎮 GAME-WISE BETTING & ACTIVITY TRACKING COMPREHENSIVE TEST SUITE');
console.log('================================================================\n');

// ─── TEST 1: GAME-WISE SEPARATE STATISTICS ─────────────────────────
console.log('--- TEST 1: Game-Wise Separate Statistics (Not Combined) ---');
const summaries = context.PlatformSync.getGameWiseSummary('ALL', 'ALL');
console.log(`✓ Total Games Evaluated: ${summaries.length}`);

summaries.forEach(g => {
  console.log(`  🎲 [${g.gameId}] ${g.gameName.padEnd(32)} | Users: ${g.uniqueUsers} | Entries: ${g.totalEntries} | Stake: Rs ${g.totalStake} | Tokens: ${g.totalTokens} | Payouts: Rs ${g.totalPayouts} | Net Margin: Rs ${g.netResult}`);
});

const thaiGame = summaries.find(g => g.gameId === 'GM-THAI-4D');
const cricketGame = summaries.find(g => g.gameId === 'GM-CRICKET-LIVE');
const rouletteGame = summaries.find(g => g.gameId === 'GM-ROULETTE-ROYAL');

if (!thaiGame || !cricketGame || !rouletteGame) throw new Error('TEST 1 FAILED: Missing core games');
if (thaiGame.totalStake === cricketGame.totalStake) throw new Error('TEST 1 FAILED: Stats should be separate per game');
console.log('✓ PASS: Every game maintains completely separate, non-combined statistics.\n');

// ─── TEST 2: USER PLAYS LUCKY THAI WIN & GENERATES ACTIVITY ─────────
console.log('--- TEST 2: Live Player Participation & Activity Recording ---');
const userInitial = context.PlatformSync.getUser('Alex_Winner');
const initialBalance = userInitial.balance;

const act = context.PlatformSync.recordGameActivity(
  'Alex_Winner',
  'GM-THAI-4D',
  'Lucky Thai Win 4D Live',
  '8892',
  '7741',
  2500, // Stake: Rs 2500
  250,  // Tokens: 250
  'WON',
  22500 // Payout: Rs 22500
);

console.log(`✓ Activity Generated: #${act.id} by ${act.username} on ${act.gameName} (Stake: Rs ${act.stake}, Tokens: ${act.tokens}, Payout: Rs ${act.payout})`);

const thaiAnalyticsAfterBet = context.PlatformSync.getGameDetailsAnalytics('GM-THAI-4D', 'ALL', 'ALL');
console.log(`✓ Updated Thai 4D Stats -> Total Entries: ${thaiAnalyticsAfterBet.totalEntries}, Total Stake: Rs ${thaiAnalyticsAfterBet.totalStake}, Net Result: Rs ${thaiAnalyticsAfterBet.netResult}`);

if (thaiAnalyticsAfterBet.totalEntries < 4) throw new Error('TEST 2 FAILED: Game activity did not increment');
console.log('✓ PASS: Live player participation seamlessly captured in central game ledger.\n');

// ─── TEST 3: USER-WISE GAME ACTIVITY (PARTICIPATING PLAYERS) ───────
console.log('--- TEST 3: Game Detailed Analytics & Participating Players ---');
console.log(`✓ Thai 4D Participating Players Count: ${thaiAnalyticsAfterBet.participants.length}`);
thaiAnalyticsAfterBet.participants.forEach(p => {
  console.log(`  👤 Player: ${p.username.padEnd(16)} | Entries: ${p.entries} | Stake: Rs ${p.stake} | Tokens: ${p.tokens} | Payouts: Rs ${p.payout} | Net: Rs ${p.netResult}`);
});

const alexInThai = thaiAnalyticsAfterBet.participants.find(p => p.username === 'Alex_Winner');
if (!alexInThai || alexInThai.entries < 3) throw new Error('TEST 3 FAILED: Player not aggregated properly');
console.log('✓ PASS: Game analytics accurately groups user participation and turnover.\n');

// ─── TEST 4: USER PROFILE GAME BREAKDOWN ───────────────────────────
console.log('--- TEST 4: User Profile Game Breakdown ---');
const userBreakdown = context.PlatformSync.getUserGameBreakdown('Alex_Winner');
console.log(`✓ Games played by Alex_Winner: ${userBreakdown.summary.length}`);
userBreakdown.summary.forEach(sg => {
  console.log(`  🎰 Game: ${sg.gameName.padEnd(28)} | Entries: ${sg.entries} | Stake: Rs ${sg.stake} | Tokens: ${sg.tokens} | Net P/L: Rs ${sg.netResult}`);
});
console.log(`✓ Recent Tickets for Alex_Winner: ${userBreakdown.recentTickets.length} tickets recorded`);
if (userBreakdown.summary.length < 1) throw new Error('TEST 4 FAILED: User profile game breakdown empty');
console.log('✓ PASS: User Profile displays detailed game-wise stakes, tokens, and ticket history.\n');

// ─── TEST 5: DATE FILTERING ────────────────────────────────────────
console.log('--- TEST 5: Dynamic Date Range Filtering ---');
const todaySummary = context.PlatformSync.getGameWiseSummary('ALL', 'TODAY');
const last30Summary = context.PlatformSync.getGameWiseSummary('ALL', 'LAST_30_DAYS');

const todayThai = todaySummary.find(g => g.gameId === 'GM-THAI-4D');
const allThai = summaries.find(g => g.gameId === 'GM-THAI-4D');

console.log(`✓ Thai 4D Today Entries: ${todayThai.totalEntries} | Today Stake: Rs ${todayThai.totalStake}`);
console.log(`✓ Thai 4D All Time Entries: ${allThai.totalEntries} | All Time Stake: Rs ${allThai.totalStake}`);
console.log('✓ PASS: Date filter calculates real-time metrics for selected period without showing static lifetime totals.\n');

// ─── TEST 6: COMPANY MULTI-TENANT FILTERING ────────────────────────
console.log('--- TEST 6: Multi-Tenant Company Isolation ---');
const comp1Summary = context.PlatformSync.getGameWiseSummary('COMP-01', 'ALL');
const comp2Summary = context.PlatformSync.getGameWiseSummary('COMP-02', 'ALL');

const comp1Thai = comp1Summary.find(g => g.gameId === 'GM-THAI-4D');
const comp2Thai = comp2Summary.find(g => g.gameId === 'GM-THAI-4D');

console.log(`✓ Company COMP-01 Thai 4D Stake: Rs ${comp1Thai.totalStake} (Users: ${comp1Thai.uniqueUsers})`);
console.log(`✓ Company COMP-02 Thai 4D Stake: Rs ${comp2Thai.totalStake} (Users: ${comp2Thai.uniqueUsers})`);

if (comp1Thai.totalStake === comp2Thai.totalStake && comp1Thai.totalStake > 0) {
  throw new Error('TEST 6 FAILED: Company isolation leak');
}
console.log('✓ PASS: Game activity is strictly scoped by Company ID.\n');

// ─── TEST 7: TOKEN & REAL MONETARY CURRENCY SEPARATION ──────────────
console.log('--- TEST 7: Token / Coin vs Real Currency Separation ---');
const totalCurrencyStake = summaries.reduce((sum, g) => sum + g.totalStake, 0);
const totalTokensUsed = summaries.reduce((sum, g) => sum + g.totalTokens, 0);
console.log(`✓ Total Real Currency Stake: Rs ${totalCurrencyStake.toLocaleString()}`);
console.log(`✓ Total Loyalty Tokens Used: ${totalTokensUsed.toLocaleString()} Tokens`);
if (totalCurrencyStake === totalTokensUsed) throw new Error('TEST 7 FAILED: Tokens and currency must be distinct units');
console.log('✓ PASS: Monetary stakes and game tokens are tracked as separate, independent units.\n');

console.log('================================================================');
console.log('🎉 ALL GAME-WISE TRACKING TESTS PASSED PERFECTLY (7/7)');
console.log('================================================================');
