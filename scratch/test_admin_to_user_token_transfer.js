/**
 * test_admin_to_user_token_transfer.js
 * End-to-End verification:
 * When admin sends tokens to user address (Bp28233 / Alex_Winner),
 * the tokens are credited accurately and queried by user-facing functions.
 */

const fs = require('fs');
const path = require('path');

// Mock localStorage and broadcast mechanisms
const localStorageMock = (function() {
  let store = {};
  return {
    getItem(key) { return store[key] || null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { store = {}; },
    _dump() { return store; }
  };
})();

global.localStorage = localStorageMock;
global.window = global;
global.navigator = { userAgent: 'NodeJS Test Environment' };
global.BroadcastChannel = class {
  constructor(name) { this.name = name; }
  postMessage(msg) {}
  addEventListener(event, handler) {}
};

// Load platform-sync.js from project directory
const code = fs.readFileSync('e:\\NUMBER BET\\platform-sync.js', 'utf8');
eval(code);

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('====================================================');
console.log('  ADMIN TO USER TOKEN TRANSFER VERIFICATION SUITE');
console.log('====================================================');

// 1. Initial State
PlatformSync.init();
const initialBalance = PlatformSync.getUserTokenBalance('Alex_Winner');
console.log(`\n--- Test 1: Initial Token Balance ---`);
assert(initialBalance === 45000, `Initial token balance for Alex_Winner is 45,000 VTK: got ${initialBalance}`);

const initialById = PlatformSync.getUserTokenBalance('Bp28233');
assert(initialById === 45000, `Initial token balance by User ID Bp28233 is 45,000 VTK: got ${initialById}`);

// 2. Verify Recipient by User ID 'Bp28233'
console.log(`\n--- Test 2: Recipient Verification ---`);
const verify1 = PlatformSync.verifyRecipient('Bp28233', 'Alex_Winner');
assert(verify1.success === true, `verifyRecipient('Bp28233', 'Alex_Winner') succeeded`);
assert(verify1.user.id === 'Bp28233' && verify1.user.username === 'Alex_Winner', `Verified user is Bp28233 / Alex_Winner`);

const verify2 = PlatformSync.verifyRecipient('Bp28233', '');
assert(verify2.success === true, `verifyRecipient by User ID 'Bp28233' alone succeeded`);

const verify3 = PlatformSync.verifyRecipient('', 'Alex_Winner');
assert(verify3.success === true, `verifyRecipient by Username 'Alex_Winner' alone succeeded`);

// 3. Admin Transfer 10,000 VTK to 'Bp28233'
console.log(`\n--- Test 3: Admin Sends 10,000 Tokens to Address Bp28233 ---`);
const transferRes1 = PlatformSync.executeTokenTransfer({
  senderAccountId: 'ACC-MASTER-001',
  recipientUserId: 'Bp28233',
  recipientUsername: 'Alex_Winner',
  amount: 10000,
  reason: 'VIP Loyalty Reward Grant',
  operatorAdmin: { role: 'SUPER_ADMIN', companyId: 'COMP-01', name: 'Super Administrator' }
});

assert(transferRes1.success === true, 'Token transfer succeeded');
assert(transferRes1.recipientNewBalance === 55000, `New balance returned in result is 55,000 VTK: got ${transferRes1.recipientNewBalance}`);

const newBalanceUsername = PlatformSync.getUserTokenBalance('Alex_Winner');
assert(newBalanceUsername === 55000, `User platform query by username 'Alex_Winner' reflects 55,000 VTK: got ${newBalanceUsername}`);

const newBalanceId = PlatformSync.getUserTokenBalance('Bp28233');
assert(newBalanceId === 55000, `User platform query by User ID 'Bp28233' reflects 55,000 VTK: got ${newBalanceId}`);

// 4. Admin Transfer 25,000 VTK to '@Alex_Winner'
console.log(`\n--- Test 4: Admin Sends 25,000 Tokens to Username Alex_Winner ---`);
const transferRes2 = PlatformSync.executeTokenTransfer({
  senderAccountId: 'ACC-COMP-01',
  recipientUserId: 'Bp28233',
  recipientUsername: 'Alex_Winner',
  amount: 25000,
  reason: 'Weekly Promotional Token Distribution',
  operatorAdmin: { role: 'SUPER_ADMIN', companyId: 'COMP-01', name: 'Super Administrator' }
});

assert(transferRes2.success === true, 'Second token transfer succeeded');
assert(transferRes2.recipientNewBalance === 80000, `New balance returned in result is 80,000 VTK: got ${transferRes2.recipientNewBalance}`);

const finalBalance = PlatformSync.getUserTokenBalance('Alex_Winner');
assert(finalBalance === 80000, `Final token balance for user is 80,000 VTK: got ${finalBalance}`);

// 5. Verify Immutable Token Ledger Record
console.log(`\n--- Test 5: Ledger Integrity ---`);
const ledger = PlatformSync._get(PlatformSync.KEYS.TOKEN_LEDGER);
const latestEntry = ledger[0];
assert(latestEntry && latestEntry.amount === 25000, `Latest ledger entry is 25,000 VTK: got ${latestEntry ? latestEntry.amount : 'none'}`);
assert(latestEntry.receiverUsername === 'Alex_Winner', `Latest ledger entry recipient username is Alex_Winner: got ${latestEntry.receiverUsername}`);
assert(latestEntry.recipientUserId === 'Bp28233', `Latest ledger entry recipient User ID is Bp28233: got ${latestEntry.recipientUserId}`);

console.log('\n====================================================');
console.log('  ALL ADMIN-TO-USER TOKEN TESTS PASSED (100%)');
console.log('====================================================\n');
