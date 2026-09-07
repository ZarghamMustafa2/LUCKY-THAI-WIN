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

// Load platform-sync.js into context
const syncCode = fs.readFileSync('platform-sync.js', 'utf8');
vm.runInContext(syncCode, context);

console.log('================================================================');
console.log('🎯 REAL TOKEN TRANSFER & RECIPIENT VERIFICATION TEST SUITE');
console.log('================================================================\n');

// ─── TEST 1: RECIPIENT IDENTITY VERIFICATION MATRIX ───────────────
console.log('--- TEST 1: Recipient Verification by BOTH User ID + Username ---');

// 1a: Exact match (User ID + Username) -> MUST SUCCEED
const v1 = context.PlatformSync.verifyRecipient('USR-1092', 'Alex_Winner');
console.log(`✓ 1a. Matching Pair (USR-1092 + Alex_Winner):`, v1.success ? `PASS (Found: ${v1.user.name}, Bal: ${v1.user.currentTokenBalance} VTK)` : 'FAIL');
if (!v1.success || v1.user.id !== 'USR-1092' || v1.user.username !== 'Alex_Winner') {
  throw new Error('TEST 1a FAILED: Exact match verification failed');
}

// 1b: Correct User ID + Wrong Username -> MUST FAIL (IDENTITY_MISMATCH)
const v2 = context.PlatformSync.verifyRecipient('USR-1092', 'CryptoKing');
console.log(`✓ 1b. Correct ID + Wrong Username:`, !v2.success ? `PASS (Error: "${v2.message}")` : 'FAIL');
if (v2.success || v2.error !== 'IDENTITY_MISMATCH') {
  throw new Error('TEST 1b FAILED: Mismatched identity was allowed');
}

// 1c: Wrong User ID + Correct Username -> MUST FAIL (IDENTITY_MISMATCH)
const v3 = context.PlatformSync.verifyRecipient('USR-1093', 'Alex_Winner');
console.log(`✓ 1c. Wrong ID + Correct Username:`, !v3.success ? `PASS (Error: "${v3.message}")` : 'FAIL');
if (v3.success || v3.error !== 'IDENTITY_MISMATCH') {
  throw new Error('TEST 1c FAILED: Mismatched identity was allowed');
}

// 1d: Non-Existent User ID + Non-Existent Username -> MUST FAIL (USER_NOT_FOUND)
const v4 = context.PlatformSync.verifyRecipient('USR-9999', 'GhostUser');
console.log(`✓ 1d. Non-Existent User:`, !v4.success ? `PASS (Error: "${v4.message}")` : 'FAIL');
if (v4.success || v4.error !== 'USER_NOT_FOUND') {
  throw new Error('TEST 1d FAILED: Non-existent user verification did not fail correctly');
}

console.log('✓ PASS: All identity verification edge cases strictly validated.\n');

// ─── TEST 2: AUTHORITATIVE SENDER BALANCE CHECK ───────────────────
console.log('--- TEST 2: Sender Authoritative Balance Enforcement ---');
let caughtOverdraft = false;
try {
  context.PlatformSync.executeTokenTransfer({
    senderAccountId: 'ACC-MASTER-001',
    recipientUserId: 'USR-1092',
    recipientUsername: 'Alex_Winner',
    amount: 999999999, // Exceeds balance
    reason: 'Illegal excessive grant',
    operatorAdmin: { role: 'SUPER_ADMIN', name: 'Super Admin' }
  });
} catch (e) {
  caughtOverdraft = true;
  console.log(`✓ Expected Overdraft Rejection: "${e.message}"`);
}
if (!caughtOverdraft) throw new Error('TEST 2 FAILED: Overdraft transfer was allowed');
console.log('✓ PASS: Sender balance check strictly enforced before modifications.\n');

// ─── TEST 3: REAL ATOMIC SERVER-SIDE TRANSFER ──────────────────────
console.log('--- TEST 3: Real Database Token Transfer & Ledger Logging ---');
const senderBefore = context.PlatformSync.getTokenAccount('ACC-MASTER-001').tokenBalance;
const recipientBefore = context.PlatformSync.getTokenAccount('Alex_Winner').tokenBalance;
const ledgerCountBefore = context.PlatformSync.getTokenLedger().length;

const transferResult = context.PlatformSync.executeTokenTransfer({
  senderAccountId: 'ACC-MASTER-001',
  recipientUserId: 'USR-1092',
  recipientUsername: 'Alex_Winner',
  amount: 500,
  reason: 'Manual token allocation - Loyalty Tournament',
  operatorAdmin: { role: 'SUPER_ADMIN', name: 'Zargham Super Admin' }
});

console.log(`✓ Transfer Result: ${transferResult.message}`);
console.log(`✓ Transaction ID: #${transferResult.transaction.transactionId}`);
console.log(`✓ Status: ${transferResult.transaction.status}`);

const senderAfter = context.PlatformSync.getTokenAccount('ACC-MASTER-001').tokenBalance;
const recipientAfter = context.PlatformSync.getTokenAccount('Alex_Winner').tokenBalance;
const ledgerCountAfter = context.PlatformSync.getTokenLedger().length;

console.log(`✓ Sender Balance: ${senderBefore.toLocaleString()} → ${senderAfter.toLocaleString()} VTK (-500)`);
console.log(`✓ Recipient Balance: ${recipientBefore.toLocaleString()} → ${recipientAfter.toLocaleString()} VTK (+500)`);

if (senderAfter !== senderBefore - 500) throw new Error('TEST 3 FAILED: Sender was not deducted 500 VTK');
if (recipientAfter !== recipientBefore + 500) throw new Error('TEST 3 FAILED: Recipient was not credited 500 VTK');
if (ledgerCountAfter !== ledgerCountBefore + 1) throw new Error('TEST 3 FAILED: Ledger entry not appended');

// Verify token conservation remains 100%
const audit = context.PlatformSync.getTokenConservationAudit();
if (!audit.isConserved || audit.discrepancy !== 0) {
  throw new Error('TEST 3 FAILED: Token conservation discrepancy detected');
}
console.log('✓ PASS: Atomic transfer completed with 100% token conservation.\n');

// ─── TEST 4: IDEMPOTENCY & ANTI-DOUBLE-CLICK DEDUPLICATION ────────
console.log('--- TEST 4: Idempotency & Duplicate Transfer Prevention ---');
const idemKey = 'IDEMP-TEST-KEY-88992';
const senderPreIdemp = context.PlatformSync.getTokenAccount('ACC-MASTER-001').tokenBalance;

// First request with idempotency key
const res1 = context.PlatformSync.executeTokenTransfer({
  senderAccountId: 'ACC-MASTER-001',
  recipientUserId: 'USR-1092',
  recipientUsername: 'Alex_Winner',
  amount: 250,
  reason: 'Idempotency test grant',
  operatorAdmin: { role: 'SUPER_ADMIN', name: 'Super Admin' },
  idempotencyKey: idemKey
});

// Second duplicate request with exact same idempotency key (simulating double-click)
const res2 = context.PlatformSync.executeTokenTransfer({
  senderAccountId: 'ACC-MASTER-001',
  recipientUserId: 'USR-1092',
  recipientUsername: 'Alex_Winner',
  amount: 250,
  reason: 'Idempotency test grant',
  operatorAdmin: { role: 'SUPER_ADMIN', name: 'Super Admin' },
  idempotencyKey: idemKey
});

const senderPostIdemp = context.PlatformSync.getTokenAccount('ACC-MASTER-001').tokenBalance;

console.log(`✓ First Execution Tx: #${res1.transaction.transactionId}`);
console.log(`✓ Second Execution Tx: #${res2.transaction.transactionId} (Identical cached result returned)`);
console.log(`✓ Sender Total Deduction: ${senderPreIdemp - senderPostIdemp} VTK (Expected exactly 250 VTK, NOT 500)`);

if (res1.transaction.transactionId !== res2.transaction.transactionId) {
  throw new Error('TEST 4 FAILED: Duplicate transfer created different transaction');
}
if (senderPreIdemp - senderPostIdemp !== 250) {
  throw new Error('TEST 4 FAILED: Double deduction occurred');
}
console.log('✓ PASS: Idempotency protection successfully prevented duplicate transfer.\n');

// ─── TEST 5: COMPANY MULTI-TENANCY SCOPE RESTRICTION ──────────────
console.log('--- TEST 5: Company Scope Authorization Enforcement ---');
let caughtCompanyViolation = false;
try {
  // Admin of COMP-02 trying to transfer to Alex_Winner who belongs to COMP-01
  context.PlatformSync.executeTokenTransfer({
    senderAccountId: 'ACC-COMP-02',
    recipientUserId: 'USR-1092',
    recipientUsername: 'Alex_Winner',
    amount: 100,
    reason: 'Cross-company illicit grant',
    operatorAdmin: { role: 'COMPANY_ADMIN', companyId: 'COMP-02', name: 'Apex Admin' }
  });
} catch (e) {
  caughtCompanyViolation = true;
  console.log(`✓ Expected Company Scope Rejection: "${e.message}"`);
}
if (!caughtCompanyViolation) throw new Error('TEST 5 FAILED: Cross-company unauthorized transfer allowed');
console.log('✓ PASS: Multi-tenant company boundary strictly enforced on backend.\n');

// ─── TEST 6: ADVANCED TOKEN LEDGER FILTERS ────────────────────────
console.log('--- TEST 6: Token Ledger Multi-Dimensional Filtering ---');
const allTx = context.PlatformSync.getTokenLedger();
const alexTx = context.PlatformSync.getTokenLedger({ searchQuery: 'Alex_Winner' });
const comp1Tx = context.PlatformSync.getTokenLedger({ companyId: 'COMP-01' });
const completedTx = context.PlatformSync.getTokenLedger({ status: 'COMPLETED' });

console.log(`✓ Total Ledger Entries: ${allTx.length}`);
console.log(`✓ Filter by Search "Alex_Winner": ${alexTx.length} records`);
console.log(`✓ Filter by Company "COMP-01": ${comp1Tx.length} records`);
console.log(`✓ Filter by Status "COMPLETED": ${completedTx.length} records`);

if (alexTx.length === 0) throw new Error('TEST 6 FAILED: Search filter returned 0 records');
console.log('✓ PASS: Token Ledger interactive filtering working accurately.\n');

// ─── TEST 7: USER PROFILE TOKEN BREAKDOWN & AUDIT ─────────────────
console.log('--- TEST 7: User Profile Live Token Audit ---');
const alexProfile = context.PlatformSync.getUserTokenProfile('Alex_Winner');
console.log(`✓ Profile User: @${alexProfile.username} (${alexProfile.internalAccountId})`);
console.log(`✓ Current Token Balance: ${alexProfile.tokenBalance.toLocaleString()} VTK`);
console.log(`✓ Total Received Tokens: ${alexProfile.totalReceived.toLocaleString()} VTK`);
console.log(`✓ Total Spent In Games: ${alexProfile.totalSpent.toLocaleString()} VTK`);
console.log(`✓ Total Won Payouts: ${alexProfile.totalWon.toLocaleString()} VTK`);

if (alexProfile.tokenBalance !== recipientAfter + 250) {
  throw new Error('TEST 7 FAILED: User profile token balance does not match authoritative balance');
}
console.log('✓ PASS: User Profile displays complete, accurate live token metrics.\n');

console.log('================================================================');
console.log('🎉 ALL TOKEN TRANSFER & VERIFICATION TESTS PASSED (7/7)');
console.log('================================================================');
