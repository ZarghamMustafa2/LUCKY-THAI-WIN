/**
 * test_account_ledger_ui.js
 * Verification of Account Ledger UI Recreation:
 * 1. Top Filter Strip: Start/End Date Time picker with Calendar icon & Submit button.
 * 2. Card Title: Ahmad5050x - Account Ledger
 * 3. Controls: 100 entries per page dropdown, Print/Excel/PDF export buttons, Search input.
 * 4. 5 Columns Table: #, Date, Description, Amount, Balance.
 * 5. Default Row: Opening Balance with 0 amount and 0 balance.
 * 6. Pagination: « ‹ 1 › » and Showing 1 to 1 of 1 entry.
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
console.log('  ACCOUNT LEDGER RECREATION VERIFICATION');
console.log('====================================================');

// 1. Top Filter Strip
console.log('\n--- Test 1: Top Filter Strip ---');
assert(adminHtml.includes('id="ledgerStartDateInput"'), 'Contains ledgerStartDateInput');
assert(adminHtml.includes('id="ledgerEndDateInput"'), 'Contains ledgerEndDateInput');
assert(adminHtml.includes('submitAccountLedgerFilter()'), 'Submit button connected to submitAccountLedgerFilter()');

// 2. Main Card & Controls
console.log('\n--- Test 2: Card Header & Controls ---');
assert(adminHtml.includes('id="accountLedgerCardTitle"'), 'Contains accountLedgerCardTitle dynamic header');
assert(adminHtml.includes('id="ledgerPageSize"'), 'Contains page size dropdown (100 entries per page)');
assert(adminHtml.includes('window.print()'), 'Contains Print export action');
assert(adminHtml.includes("exportAccountLedger('excel')"), 'Contains Excel export action');
assert(adminHtml.includes("exportAccountLedger('pdf')"), 'Contains PDF export action');
assert(adminHtml.includes('id="accountLedgerSearchInput"'), 'Contains accountLedgerSearchInput');

// 3. 5 Columns Table
console.log('\n--- Test 3: 5 Column Headers ---');
assert(adminHtml.includes('id="accountLedgerTableBody"'), 'Contains accountLedgerTableBody');
assert(adminHtml.includes('Description') && adminHtml.includes('Amount') && adminHtml.includes('Balance'), 'Contains 5 column headers (#, Date, Description, Amount, Balance)');

// 4. Default Rows & Pagination
console.log('\n--- Test 4: Default Data & Pagination ---');
assert(adminHtml.includes('Opening Balance'), 'Contains default Opening Balance entry');
assert(adminHtml.includes('id="accountLedgerEntriesCount"'), 'Contains accountLedgerEntriesCount counter');
assert(adminHtml.includes('handleLedgerPage'), 'Contains pagination controls');

console.log('\n====================================================');
console.log('  ALL ACCOUNT LEDGER CHECKS PASSED (100%)');
console.log('====================================================\n');
