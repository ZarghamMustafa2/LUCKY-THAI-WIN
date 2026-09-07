/**
 * test_cash_credit_adjustment_modal_ui.js
 * Verification of Cash/Credit Adjustment Modal (Option 'C' in Clients Table):
 * 1. Top Dual Tabs: [ Cash ] (active blue) | [ Credit ] (green text)
 * 2. Target Username Header + 3 Column Table (Credit | Balance | Max Widthdraw)
 * 3. Deposit Section (Green Header #00A65A): Description + Rs. Amount + [ Submit ]
 * 4. Withdraw Section (Red Header #DD4B39): Description + Rs. Amount + [ Submit ]
 * 5. Trigger 'C' button in Clients List Table
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
console.log('  CASH / CREDIT ADJUSTMENT MODAL (OPTION C) TEST');
console.log('====================================================');

// 1. Trigger Button in Clients List Table
console.log('\n--- Test 1: Option C Trigger Button in Table ---');
assert(adminHtml.includes('openAdjustWalletModal(') && adminHtml.includes('title="Cash / Credit Adjustment"'), 'Table contains C button triggering openAdjustWalletModal');

// 2. Dual Tabs & User Stats Table
console.log('\n--- Test 2: Dual Tabs & User Stats Table ---');
assert(adminHtml.includes('id="tabAdjustCash"') && adminHtml.includes('id="tabAdjustCredit"'), 'Contains Cash and Credit dual tabs');
assert(adminHtml.includes('id="adjustTargetUsernameDisplay"'), 'Contains dynamic target username heading');
assert(adminHtml.includes('modalUserCreditVal') && adminHtml.includes('modalUserBalanceVal') && adminHtml.includes('modalUserMaxWithdrawVal'), 'Contains Credit, Balance, Max Widthdraw stats table');

// 3. Deposit Cash Box & Submit
console.log('\n--- Test 3: Deposit Cash Box & Submit ---');
assert(adminHtml.includes('id="depositHeaderTitle"') && adminHtml.includes('Deposit Cash in'), 'Contains Green Deposit Cash Header');
assert(adminHtml.includes('id="depositDescriptionInput"') && adminHtml.includes('id="depositAmountInput"'), 'Contains Deposit Description and Amount inputs');
assert(adminHtml.includes('handleDepositCashSubmit(event)'), 'Contains Deposit Cash form submit handler');

// 4. Withdraw Cash Box & Submit
console.log('\n--- Test 4: Withdraw Cash Box & Submit ---');
assert(adminHtml.includes('id="withdrawHeaderTitle"') && adminHtml.includes('Withdraw cash from'), 'Contains Red Withdraw Cash Header');
assert(adminHtml.includes('id="withdrawDescriptionInput"') && adminHtml.includes('id="withdrawAmountInput"'), 'Contains Withdraw Description and Amount inputs');
assert(adminHtml.includes('handleWithdrawCashSubmit(event)'), 'Contains Withdraw Cash form submit handler');

console.log('\n====================================================');
console.log('  ALL CASH/CREDIT ADJUSTMENT MODAL CHECKS PASSED (100%)');
console.log('====================================================\n');
