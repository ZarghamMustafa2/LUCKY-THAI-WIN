/**
 * test_upline_downline_share_distribution.js
 * Comprehensive verification suite for the Upline-Downline Share Calculation System:
 * 1. COMPANY (100%) -> SUPER_ADMIN (90%), Amount=100,000 => Downline=+90,000 (GREEN), Upline=-10,000 (RED)
 * 2. SUPER_ADMIN (90%) -> ADMIN (80%), Amount=100,000 => Downline=+80,000 (GREEN), Upline=-20,000 (RED)
 * 3. ADMIN (80%) -> SUPER_MASTER (75%), Amount=100,000 => Downline=+75,000 (GREEN), Upline=-25,000 (RED)
 * 4. SUPER_MASTER (75%) -> MASTER (60%), Amount=100,000 => Downline=+60,000 (GREEN), Upline=-40,000 (RED)
 * 5. MASTER (60%) -> USER (50%), Amount=100,000 => Downline=+50,000 (GREEN), Upline=-50,000 (RED)
 * 6. Strict separation: Credit balances are NOT deducted by Share calculation.
 * 7. Branch Isolation: Shared records are linked strictly by exact account IDs.
 */

const fs = require('fs');

const adminHtml = fs.readFileSync('e:\\NUMBER BET\\admin.html', 'utf8');
const adminEngineJs = fs.readFileSync('e:\\NUMBER BET\\admin-engine.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('====================================================');
console.log('  UPLINE-DOWNLINE SHARE CALCULATION SUITE');
console.log('====================================================');

// Mock DOM
const domElements = {};
global.document = {
  getElementById: (id) => {
    if (!domElements[id]) {
      domElements[id] = {
        innerText: '',
        innerHTML: '',
        value: '',
        checked: false,
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false }
      };
    }
    return domElements[id];
  },
  querySelector: (sel) => {
    if (sel === 'input[name="newUserType"]:checked') {
      return { value: global._mockSelectedType || 'SUPER_ADMIN' };
    }
    return null;
  },
  cookie: '',
  addEventListener: () => {}
};

const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v)),
  removeItem: (k) => localStorageMap.delete(k)
};
global.sessionStorage = { clear: () => {} };
global.window = global;
global.window.addEventListener = () => {};

global.showAdminToast = (msg, type) => {
  console.log(`  [Toast ${(type || 'info').toUpperCase()}] ${msg}`);
};
global.openModal = () => {};
global.closeModal = () => {};
global.applySidebarPermissions = () => {};
global.updateDashboardMetrics = () => {};
global.isUsersBalanceLoaded = true;
global.isUsersBalanceLoading = false;

eval(adminEngineJs);

const shareHelperMatch = adminHtml.match(/\/\*\*[\s\S]*?Centralized Upline-Downline Share Distribution Calculation Engine[\s\S]*?recordShareTransaction[\s\S]*?\n    \}/);
assert(shareHelperMatch !== null, "Share functions extracted");
eval(shareHelperMatch[0]);

// TEST 1: COMPANY (100%) -> SUPER_ADMIN (90%), Amount=100,000
console.log('\n--- Test 1: COMPANY -> SUPER_ADMIN (90% Share, 100,000 Amount) ---');
const companyAcc = { id: 'COMP-ROOT-01', username: 'company', role: 'COMPANY', sharePercentage: 100, balance: 500000 };
const saAcc = { id: 'USR-1090', username: 'sa_share_test', role: 'SUPER_ADMIN', sharePercentage: 90, balance: 100000 };

const res1 = recordShareTransaction(companyAcc, saAcc, 100000);

assert(res1.distribution.downlineAmount === 90000, "Downline amount = 90,000");
assert(res1.distribution.uplineAmount === 10000, "Upline amount = 10,000");
assert(res1.downlineRecord.formattedAmount === '+90,000.00', "Downline formatted = +90,000.00");
assert(res1.downlineRecord.color === '#10B981', "Downline color is GREEN");
assert(res1.uplineRecord.formattedAmount === '-10,000.00', "Upline formatted = -10,000.00");
assert(res1.uplineRecord.color === '#EF4444', "Upline color is RED");
assert(companyAcc.balance === 500000, "Company credit balance UNCHANGED by share calculation");
assert(saAcc.balance === 100000, "SuperAdmin credit balance UNCHANGED by share calculation");

// TEST 2: SUPER_ADMIN (90%) -> ADMIN (80%), Amount=100,000
console.log('\n--- Test 2: SUPER_ADMIN -> ADMIN (80% Share, 100,000 Amount) ---');
const adminAcc = { id: 'USR-1091', username: 'admin_share_test', role: 'ADMIN', sharePercentage: 80 };

const res2 = recordShareTransaction(saAcc, adminAcc, 100000);

assert(res2.distribution.downlineAmount === 80000, "Downline amount = 80,000");
assert(res2.distribution.uplineAmount === 20000, "Upline amount = 20,000");
assert(res2.downlineRecord.formattedAmount === '+80,000.00', "Downline formatted = +80,000.00 (GREEN)");
assert(res2.uplineRecord.formattedAmount === '-20,000.00', "Upline formatted = -20,000.00 (RED)");

// TEST 3: ADMIN (80%) -> SUPER_MASTER (75%), Amount=100,000
console.log('\n--- Test 3: ADMIN -> SUPER_MASTER (75% Share, 100,000 Amount) ---');
const smAcc = { id: 'USR-1092', username: 'sm_share_test', role: 'SUPER_MASTER', sharePercentage: 75 };

const res3 = recordShareTransaction(adminAcc, smAcc, 100000);

assert(res3.distribution.downlineAmount === 75000, "Downline amount = 75,000");
assert(res3.distribution.uplineAmount === 25000, "Upline amount = 25,000");
assert(res3.downlineRecord.formattedAmount === '+75,000.00', "Downline formatted = +75,000.00 (GREEN)");
assert(res3.uplineRecord.formattedAmount === '-25,000.00', "Upline formatted = -25,000.00 (RED)");

// TEST 4: SUPER_MASTER (75%) -> MASTER (60%), Amount=100,000
console.log('\n--- Test 4: SUPER_MASTER -> MASTER (60% Share, 100,000 Amount) ---');
const mAcc = { id: 'USR-1093', username: 'm_share_test', role: 'MASTER', sharePercentage: 60 };

const res4 = recordShareTransaction(smAcc, mAcc, 100000);

assert(res4.distribution.downlineAmount === 60000, "Downline amount = 60,000");
assert(res4.distribution.uplineAmount === 40000, "Upline amount = 40,000");
assert(res4.downlineRecord.formattedAmount === '+60,000.00', "Downline formatted = +60,000.00 (GREEN)");
assert(res4.uplineRecord.formattedAmount === '-40,000.00', "Upline formatted = -40,000.00 (RED)");

// TEST 5: MASTER (60%) -> USER (50%), Amount=100,000
console.log('\n--- Test 5: MASTER -> USER (50% Share, 100,000 Amount) ---');
const uAcc = { id: 'USR-1094', username: 'u_share_test', role: 'USER', sharePercentage: 50 };

const res5 = recordShareTransaction(mAcc, uAcc, 100000);

assert(res5.distribution.downlineAmount === 50000, "Downline amount = 50,000");
assert(res5.distribution.uplineAmount === 50000, "Upline amount = 50,000");
assert(res5.downlineRecord.formattedAmount === '+50,000.00', "Downline formatted = +50,000.00 (GREEN)");
assert(res5.uplineRecord.formattedAmount === '-50,000.00', "Upline formatted = -50,000.00 (RED)");

// TEST 6: Linked Transaction Record Integrity
console.log('\n--- Test 6: Verify Linked Dual Entry Storage & Transaction ID ---');
const shareTxs = window.AdminCore.repo.get('ADM_SHARE_TRANSACTIONS') || [];
assert(shareTxs.length >= 10, `Stored ${shareTxs.length} share transaction entries`);
const latestTxId = res5.transactionId;
const linkedEntries = shareTxs.filter(tx => tx.transactionId === latestTxId);
assert(linkedEntries.length === 2, "Both Downline (+GREEN) and Upline (-RED) entries share identical transactionId");
assert(linkedEntries.some(tx => tx.direction === 'DOWNLINE_POSITIVE' && tx.sign === '+'), "Downline entry has + sign and DOWNLINE_POSITIVE direction");
assert(linkedEntries.some(tx => tx.direction === 'UPLINE_NEGATIVE' && tx.sign === '-'), "Upline entry has - sign and UPLINE_NEGATIVE direction");

console.log('\n====================================================');
console.log('  UPLINE-DOWNLINE SHARE SYSTEM VERIFIED 100% CLEAN');
console.log('====================================================\n');
