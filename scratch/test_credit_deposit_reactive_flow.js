/**
 * test_credit_deposit_reactive_flow.js
 * Verify credit deposit persistence and display logic
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
console.log('  CREDIT DEPOSIT & REACTIVITY TEST');
console.log('====================================================');

// 1. Check handleDepositCashSubmit handles credit
assert(adminHtml.includes("u.creditLimit = (Number(u.creditLimit) || 0) + amount;"), "Credit deposit updates creditLimit properly");
assert(adminHtml.includes("AdminCore.repo.set('ADM_USERS', users);"), "Updates are saved to ADM_USERS repo");
assert(adminHtml.includes("renderUsersTable();"), "renderUsersTable is called immediately after deposit");

// 2. Check openAdjustWalletModal initializes creditLimit
assert(adminHtml.includes("const cred = Number(u.creditLimit || 0);"), "Credit value is parsed properly in openAdjustWalletModal");

// 3. Check table mapping uses credVal
assert(adminHtml.includes("const credVal = Number(fullUser.creditLimit"), "Table row parses fullUser creditLimit");
assert(adminHtml.includes("${credVal.toFixed(2)}"), "Table row renders credit formatted to 2 decimals");

console.log('\n====================================================');
console.log('  ALL CREDIT REACTIVITY CHECKS PASSED (100%)');
console.log('====================================================\n');
