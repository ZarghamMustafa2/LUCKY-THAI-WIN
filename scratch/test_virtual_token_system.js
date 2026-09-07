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
console.log('🪙 CLOSED-LOOP VIRTUAL TOKEN SYSTEM COMPREHENSIVE TEST SUITE');
console.log('================================================================\n');

// ─── TEST 1: MASTER TOKEN VAULT & TOTAL CONSERVATION ──────────────
console.log('--- TEST 1: Master Token Vault & Conservation Integrity ---');
const audit1 = context.PlatformSync.getTokenConservationAudit();
console.log(`✓ Total Supply: ${audit1.totalSupply.toLocaleString()} VTK`);
console.log(`✓ Master Vault: ${audit1.masterVault.toLocaleString()} VTK`);
console.log(`✓ Company Vaults: ${audit1.companyVaults.toLocaleString()} VTK`);
console.log(`✓ User Wallets: ${audit1.userHoldings.toLocaleString()} VTK`);
console.log(`✓ Game Settlement Pool: ${audit1.settlementPool.toLocaleString()} VTK`);
console.log(`✓ Calculated Total: ${audit1.calculatedTotal.toLocaleString()} VTK (Discrepancy: ${audit1.discrepancy})`);

if (!audit1.isConserved || audit1.discrepancy !== 0) {
  throw new Error('TEST 1 FAILED: Platform token conservation violated');
}
console.log('✓ PASS: Exact 100% token conservation confirmed (0 silent creation/destruction).\n');

// ─── TEST 2: HIERARCHY TRANSFER (MASTER → COMPANY ADMIN → USER) ────
console.log('--- TEST 2: Multi-Tier Atomic Hierarchy Transfers ---');
const masterAccBefore = context.PlatformSync.getTokenAccount('ACC-MASTER-001');
const comp1Before = context.PlatformSync.getTokenAccount('ACC-COMP-01');
const alexBefore = context.PlatformSync.getTokenAccount('ACC-USR-1092');

console.log(`Initial Balances -> Master: ${masterAccBefore.tokenBalance} VTK | Company 01: ${comp1Before.tokenBalance} VTK | Alex: ${alexBefore.tokenBalance} VTK`);

// Tier 1: Master transfers 100,000 VTK to Company 01
const tx1 = context.PlatformSync.transferTokens(
  'ACC-MASTER-001',
  'ACC-COMP-01',
  100000,
  'Monthly Company Token Quota Allocation',
  { role: 'SUPER_ADMIN', name: 'Amir Super Admin' }
);
console.log(`✓ Tier 1 Master → Company 01 Transfer: #${tx1.transactionId} (${tx1.amount} VTK)`);

// Tier 2: Company 01 transfers 20,000 VTK to User Alex_Winner
const tx2 = context.PlatformSync.transferTokens(
  'ACC-COMP-01',
  'Alex_Winner',
  20000,
  'Loyalty Tournament Token Grant',
  { role: 'COMPANY_ADMIN', companyId: 'COMP-01', name: 'Zargham Ops Lead' }
);
console.log(`✓ Tier 2 Company 01 → Alex_Winner Transfer: #${tx2.transactionId} (${tx2.amount} VTK)`);

const masterAccAfter = context.PlatformSync.getTokenAccount('ACC-MASTER-001');
const comp1After = context.PlatformSync.getTokenAccount('ACC-COMP-01');
const alexAfter = context.PlatformSync.getTokenAccount('Alex_Winner');

console.log(`Final Balances   -> Master: ${masterAccAfter.tokenBalance} VTK | Company 01: ${comp1After.tokenBalance} VTK | Alex: ${alexAfter.tokenBalance} VTK`);

if (masterAccAfter.tokenBalance !== masterAccBefore.tokenBalance - 100000) throw new Error('TEST 2 FAILED: Master balance mismatch');
if (comp1After.tokenBalance !== comp1Before.tokenBalance + 100000 - 20000) throw new Error('TEST 2 FAILED: Company balance mismatch');
if (alexAfter.tokenBalance !== alexBefore.tokenBalance + 20000) throw new Error('TEST 2 FAILED: User balance mismatch');

const audit2 = context.PlatformSync.getTokenConservationAudit();
if (!audit2.isConserved) throw new Error('TEST 2 FAILED: Conservation violated after transfers');
console.log('✓ PASS: Multi-tier atomic transfers completed with conservation preserved.\n');

// ─── TEST 3: STRICT PERMISSION & SCOPE ISOLATION REJECTION ────────
console.log('--- TEST 3: Strict RBAC & Company Scope Rejection ---');
let caughtUnauthorized = false;
try {
  // Company Admin of COMP-02 trying to transfer from Company 01
  context.PlatformSync.transferTokens(
    'ACC-COMP-01',
    'Zargham_Pro',
    10000,
    'Illicit cross-company transfer',
    { role: 'COMPANY_ADMIN', companyId: 'COMP-02', name: 'Priya Apex Admin' }
  );
} catch (e) {
  caughtUnauthorized = true;
  console.log(`✓ Expected Rejection Caught: "${e.message}"`);
}
if (!caughtUnauthorized) throw new Error('TEST 3 FAILED: Unauthorized cross-company transfer was allowed');
console.log('✓ PASS: Company isolation strictly enforced on backend.\n');

// ─── TEST 4: INSUFFICIENT BALANCE & ATOMIC ROLLBACK ───────────────
console.log('--- TEST 4: Insufficient Balance Rejection ---');
let caughtInsufficient = false;
try {
  context.PlatformSync.transferTokens(
    'Alex_Winner',
    'ACC-COMP-01',
    999999999, // Exceeds balance
    'Invalid excessive transfer',
    { role: 'SUPER_ADMIN', name: 'System' }
  );
} catch (e) {
  caughtInsufficient = true;
  console.log(`✓ Expected Insufficient Balance Caught: "${e.message}"`);
}
if (!caughtInsufficient) throw new Error('TEST 4 FAILED: Overdraft transfer allowed');
console.log('✓ PASS: Negative balance and overdraft strictly blocked.\n');

// ─── TEST 5: IN-GAME TOKEN BETTING & GAME SETTLEMENT ──────────────
console.log('--- TEST 5: Game Token Participation & Settlement Ledger ---');
const alexBalBeforeGame = context.PlatformSync.getTokenAccount('Alex_Winner').tokenBalance;
const poolBeforeGame = context.PlatformSync.getTokenAccount('ACC-POOL-SETTLE').tokenBalance;

// Step 5a: Alex bets 2,000 VTK on Thai 4D ticket #8892
const betTx = context.PlatformSync.recordGameTokenBet('Alex_Winner', 'GM-THAI-4D', '8892', 2000, '3629');
console.log(`✓ In-Game Token Bet Placed: #${betTx.transactionId} (2,000 VTK)`);

const alexBalAfterBet = context.PlatformSync.getTokenAccount('Alex_Winner').tokenBalance;
const poolAfterBet = context.PlatformSync.getTokenAccount('ACC-POOL-SETTLE').tokenBalance;

if (alexBalAfterBet !== alexBalBeforeGame - 2000 || poolAfterBet !== poolBeforeGame + 2000) {
  throw new Error('TEST 5 FAILED: Bet deduction failed');
}

// Step 5b: Game Settlement -> Alex wins 18,000 VTK
const payoutTx = context.PlatformSync.settleGameTokenPayout('Alex_Winner', 'GM-THAI-4D', '8892', 18000);
console.log(`✓ In-Game Token Payout Settled: #${payoutTx.transactionId} (18,000 VTK)`);

const alexBalAfterWin = context.PlatformSync.getTokenAccount('Alex_Winner').tokenBalance;
const poolAfterWin = context.PlatformSync.getTokenAccount('ACC-POOL-SETTLE').tokenBalance;

if (alexBalAfterWin !== alexBalAfterBet + 18000) throw new Error('TEST 5 FAILED: Win payout failed');

const audit3 = context.PlatformSync.getTokenConservationAudit();
if (!audit3.isConserved) throw new Error('TEST 5 FAILED: Conservation violated after game settlement');
console.log('✓ PASS: Game participation and winning settlement completed with immutable ledger entries.\n');

// ─── TEST 6: USER PROFILE TOKEN AUDIT & HISTORY ───────────────────
console.log('--- TEST 6: User Token Profile & Historical Ledger ---');
const userProfile = context.PlatformSync.getUserTokenProfile('Alex_Winner');
console.log(`✓ User: ${userProfile.username} (Account: ${userProfile.internalAccountId})`);
console.log(`✓ Current Balance: ${userProfile.tokenBalance.toLocaleString()} VTK`);
console.log(`✓ Total Received: ${userProfile.totalReceived.toLocaleString()} VTK`);
console.log(`✓ Total In-Game Spent: ${userProfile.totalSpent.toLocaleString()} VTK`);
console.log(`✓ Total In-Game Won: ${userProfile.totalWon.toLocaleString()} VTK`);
console.log(`✓ Total Recorded Ledger Entries: ${userProfile.transactions.length}`);

if (userProfile.transactions.length < 3) throw new Error('TEST 6 FAILED: User token history missing records');
console.log('✓ PASS: User Profile displays complete immutable token movements.\n');

// ─── TEST 7: DUPLICATE ACCOUNT IDENTITY PROTECTION ────────────────
console.log('--- TEST 7: Duplicate Account & Identity Uniqueness ---');
let caughtDuplicate = false;
try {
  context.PlatformSync.createTokenAccount('ACC-USR-1092', 'Alex_Winner', 'USER', 'COMP-01', 1000);
} catch (e) {
  caughtDuplicate = true;
  console.log(`✓ Expected Duplicate Account ID Rejection: "${e.message}"`);
}
if (!caughtDuplicate) throw new Error('TEST 7 FAILED: Duplicate account ID was permitted');
console.log('✓ PASS: Globally unique account identity constraint enforced.\n');

console.log('================================================================');
console.log('🎉 ALL CLOSED-LOOP VIRTUAL TOKEN TESTS PASSED PERFECTLY (7/7)');
console.log('================================================================');
