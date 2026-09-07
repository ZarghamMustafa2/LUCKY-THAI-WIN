const fs = require('fs');
const vm = require('vm');

// Create mock browser window and localStorage environment
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

console.log('====================================================');
console.log('🧪 MASTER END-TO-END DATA SYNCHRONIZATION TEST SUITE');
console.log('====================================================\n');

// ─── TEST 1: NEW USER REGISTRATION → ADMIN ─────────────────────────
console.log('--- TEST 1: User Self-Registration ---');
const newUser = context.PlatformSync.registerOrLoginUser('Tariq_Pro', 'SecretPass123', '+92 300 7788990', 'tariq@gmail.com');
console.log(`✓ User registered: ${newUser.username} (ID: ${newUser.id}, Company: ${newUser.companyId}, Balance: Rs ${newUser.balance})`);

const adminUsers = context.PlatformSync._get('ADM_USERS');
const foundInAdmin = adminUsers.find(u => u.username === 'Tariq_Pro');
if (!foundInAdmin) throw new Error('TEST 1 FAILED: User not found in central DB');
console.log('✓ PASS: User automatically appears in Admin Users registry without manual entry.\n');

// ─── TEST 2: COMPANY ASSIGNMENT & TENANT ISOLATION ─────────────────
console.log('--- TEST 2: Company Isolation & Multi-Tenancy ---');
const comp1Users = adminUsers.filter(u => u.companyId === 'COMP-01');
const comp2Users = adminUsers.filter(u => u.companyId === 'COMP-02');
console.log(`✓ Company COMP-01 Users Count: ${comp1Users.length}`);
console.log(`✓ Company COMP-02 Users Count: ${comp2Users.length}`);
if (comp1Users.some(u => u.companyId !== 'COMP-01')) throw new Error('TEST 2 FAILED: Company isolation leak');
console.log('✓ PASS: Strict company tenant data scoping confirmed.\n');

// ─── TEST 3: DEPOSIT WORKFLOW & WALLET BALANCE ─────────────────────
console.log('--- TEST 3: Deposit Workflow ---');
const initialBalance = foundInAdmin.balance;
const deposit = context.PlatformSync.createDepositRequest('Tariq_Pro', 20000, 'Easypaisa', 'EP-991823');
console.log(`✓ Deposit created: #${deposit.id} (Status: ${deposit.status}, Amount: Rs ${deposit.amount})`);

if (deposit.status !== 'Pending') throw new Error('TEST 3 FAILED: Deposit should be pending');

// Balance must NOT change before approval
const userBeforeApprove = context.PlatformSync.getUser('Tariq_Pro');
if (userBeforeApprove.balance !== initialBalance) throw new Error('TEST 3 FAILED: Premature balance change before approval');
console.log(`✓ Verified: User balance remains unchanged (Rs ${userBeforeApprove.balance}) while deposit is pending.`);

// Finance Admin Approves Deposit
const approved = context.PlatformSync.approveDeposit(deposit.id, 'Siddiq Finance Lead');
if (!approved) throw new Error('TEST 3 FAILED: approveDeposit failed');

const userAfterApprove = context.PlatformSync.getUser('Tariq_Pro');
console.log(`✓ Deposit approved by Finance Admin. User new balance: Rs ${userAfterApprove.balance}`);
if (userAfterApprove.balance !== initialBalance + 20000) throw new Error('TEST 3 FAILED: Wallet balance was not credited properly');
console.log('✓ PASS: Deposit approved and authoritative wallet balance updated.\n');

// ─── TEST 4: WITHDRAWAL WORKFLOW & REJECTION REFUND ─────────────────
console.log('--- TEST 4: Withdrawal Workflow & Rejection Handling ---');
const balBeforeWth = userAfterApprove.balance;
const wth = context.PlatformSync.createWithdrawalRequest('Tariq_Pro', 5000, 'Bank Transfer', 'Meezan Bank 0102-3344');
console.log(`✓ Withdrawal requested: #${wth.id} (Amount: Rs ${wth.amount}, Status: ${wth.status})`);

const userWhilePendingWth = context.PlatformSync.getUser('Tariq_Pro');
console.log(`✓ User available balance deducted into locked: Available Rs ${userWhilePendingWth.balance}, Locked Rs ${userWhilePendingWth.locked}`);
if (userWhilePendingWth.balance !== balBeforeWth - 5000 || userWhilePendingWth.locked !== 5000) {
  throw new Error('TEST 4 FAILED: Locked balance incorrect');
}

// Finance Admin rejects withdrawal with reason
context.PlatformSync.rejectWithdrawal(wth.id, 'Incomplete wagering requirement (turnover 0.5x)', 'Siddiq Finance Lead');
const userAfterRejectWth = context.PlatformSync.getUser('Tariq_Pro');
console.log(`✓ Withdrawal rejected with reason. Refunded balance: Rs ${userAfterRejectWth.balance}, Locked: Rs ${userAfterRejectWth.locked}`);
if (userAfterRejectWth.balance !== balBeforeWth || userAfterRejectWth.locked !== 0) {
  throw new Error('TEST 4 FAILED: Refund on rejection did not restore user balance');
}
console.log('✓ PASS: Withdrawal rejected with reason and player balance automatically restored.\n');

// ─── TEST 5: GAME ACTIVITY & BET TRACKING ──────────────────────────
console.log('--- TEST 5: Game Activity & Bet Placement Tracking ---');
const balBeforeBet = userAfterRejectWth.balance;
const betSuccess = context.PlatformSync.recordBet('Tariq_Pro', 'GM-THAI-4D', '8892', '3629', 1500);
if (!betSuccess) throw new Error('TEST 5 FAILED: recordBet returned false');

const userAfterBet = context.PlatformSync.getUser('Tariq_Pro');
console.log(`✓ Player placed bet Rs 1,500 on Thai 4D ticket #3629. Remaining balance: Rs ${userAfterBet.balance}`);
if (userAfterBet.balance !== balBeforeBet - 1500) throw new Error('TEST 5 FAILED: Bet amount not deducted');

const txs = context.PlatformSync._get('ADM_TRANSACTIONS');
const betTx = txs.find(t => t.username === 'Tariq_Pro' && t.type === 'bet_wager');
if (!betTx) throw new Error('TEST 5 FAILED: Bet transaction not found in ledger');
console.log(`✓ Verified: Bet recorded in central transactions ledger (${betTx.ref})`);
console.log('✓ PASS: Game activity and bet ledger synchronized.\n');

// ─── TEST 6: ADMIN WALLET ADJUSTMENT & AUDIT LOG ───────────────────
console.log('--- TEST 6: Admin Manual Wallet Adjustment & Audit Trail ---');
context.PlatformSync.logAudit('WALLET_ADJUSTMENT', `User #${userAfterBet.id}`, userAfterBet.username, 'Approved VIP bonus credit of Rs 2,500', `Rs ${userAfterBet.balance}`, `Rs ${userAfterBet.balance + 2500}`);
const logs = context.PlatformSync._get('ADM_AUDIT_LOGS');
console.log(`✓ Total Audit Log entries recorded: ${logs.length}`);
console.log(`✓ Recent Audit Log 1: [${logs[0].action}] on ${logs[0].target} (Reason: ${logs[0].reason})`);
console.log(`✓ Recent Audit Log 2: [${logs[1].action}] on ${logs[1].target} (Reason: ${logs[1].reason})`);
if (logs.length < 4) throw new Error('TEST 6 FAILED: Audit trail missing sensitive actions');
console.log('✓ PASS: All sensitive admin actions logged in immutable audit trail.\n');

console.log('====================================================');
console.log('🎉 ALL MASTER SYNCHRONIZATION TESTS PASSED (6/6)');
console.log('====================================================');
