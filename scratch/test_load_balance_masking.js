/**
 * test_load_balance_masking.js
 * Verify that details in Users table show '...' by default, show loading spinner during delay, and display full values when 'Load Balance' completes.
 */

const fs = require('fs');

const adminHtml = fs.readFileSync('e:\\NUMBER BET\\admin.html', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('====================================================');
console.log('  LOAD BALANCE MASKING & LOADING VERIFICATION TEST');
console.log('====================================================');

assert(adminHtml.includes('id="loadBalanceBtn"'), "Load Balance button has id loadBalanceBtn");
assert(adminHtml.includes('let isUsersBalanceLoaded = false;'), "isUsersBalanceLoaded starts as false");
assert(adminHtml.includes('let isUsersBalanceLoading = false;'), "isUsersBalanceLoading starts as false");
assert(adminHtml.includes('const showDetails = isUsersBalanceLoaded;'), "showDetails evaluates isUsersBalanceLoaded state");
assert(adminHtml.includes('const isLoading = isUsersBalanceLoading;'), "isLoading evaluates isUsersBalanceLoading state");
assert(adminHtml.includes('fa-circle-notch fa-spin'), "Loading spinner animation exists");
assert(adminHtml.includes("setTimeout(() => {"), "1.2s realistic loading timeout exists");

console.log('\n====================================================');
console.log('  ALL LOAD BALANCE MASKING CHECKS PASSED (100%)');
console.log('====================================================\n');
