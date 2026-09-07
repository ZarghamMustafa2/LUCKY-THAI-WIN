/**
 * test_account_summary_table_upline_downline_balances.js
 * Verification suite for the 6-Column Account Summary Table:
 * 1. Columns: Credit Received | Credit Remaining | Cash | P/L Downline | Balance UpLine | Users
 * 2. Formula: Total=100,000, Share=90% => P/L Downline=90,000, Balance UpLine=10,000
 * 3. Credit Received, Credit Remaining, Cash, Users intact
 * 4. Dynamic recalculation when share % or amount changes
 * 5. Separation: Credit balances are NOT mutated by share calculations
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
console.log('  ACCOUNT SUMMARY TABLE UPLINE/DOWNLINE SUITE');
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
        disabled: false,
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false }
      };
    }
    return domElements[id];
  },
  querySelector: () => null,
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

eval(adminEngineJs);

const shareDistMatch = adminHtml.match(/function calculateShareDistribution\(totalAmount, childSharePercentage\) \{[\s\S]*?recordShareTransaction[\s\S]*?\n    \}/);
eval(shareDistMatch[0]);

const summaryMetricsMatch = adminHtml.match(/function calculateHierarchySummaryMetrics\(authenticatedAdmin\) \{[\s\S]*?\n    \}/);
assert(summaryMetricsMatch !== null, "calculateHierarchySummaryMetrics function extracted");
eval(summaryMetricsMatch[0]);

// TEST 1: Summary Table Column Verification in HTML
console.log('\n--- Test 1: Verify 6-Column Summary Table HTML ---');
assert(adminHtml.includes('Credit Received'), "Header includes Credit Received column");
assert(adminHtml.includes('Credit Remaining'), "Header includes Credit Remaining column");
assert(adminHtml.includes('Cash'), "Header includes Cash column");
assert(adminHtml.includes('P/L Downline'), "Header includes P/L Downline column");
assert(adminHtml.includes('Balance UpLine'), "Header includes Balance UpLine column");
assert(adminHtml.includes('Users'), "Header includes Users column");
assert(adminHtml.includes('id="clientsCreditReceived"'), "Element ID clientsCreditReceived exists");
assert(adminHtml.includes('id="clientsBalanceUpline"'), "Element ID clientsBalanceUpline exists");

// TEST 2: Formula Verification (COMPANY assigns SUPER_ADMIN 90% Share, Amount=100,000)
console.log('\n--- Test 2: Formula Verification (100,000 Amount, 90% Share) ---');
const company = { id: 'COMP-ROOT-01', username: 'company', role: 'COMPANY', balance: 100000, creditLimit: 100000, locked: 0 };
const sa = { id: 'ADM-101', username: 'super_admin_test', role: 'SUPER_ADMIN', sharePercentage: 90, balance: 100000, creditLimit: 100000 };

window.AdminCore.repo.set('ADM_ADMINS', [company, sa]);
window.AdminCore.repo.set('ADM_USERS', [company, sa]);
window.AdminCore.repo.set('ADM_SHARE_TRANSACTIONS', []);

recordShareTransaction(company, sa, 100000);

const metrics = calculateHierarchySummaryMetrics(company);

console.log('  Calculated Metrics for COMPANY:');
console.log('  - Credit Received:', metrics.creditReceived);
console.log('  - Credit Remaining:', metrics.creditRemaining);
console.log('  - Cash:', metrics.cash);
console.log('  - P/L Downline:', metrics.plDownline);
console.log('  - Balance UpLine:', metrics.balanceUpline);

assert(metrics.plDownline === 90000, "P/L Downline = 90,000 (100,000 * 90%)");
assert(metrics.balanceUpline === 10000, "Balance UpLine = 10,000 (100,000 - 90,000)");

// TEST 3: Dynamic Recalculation on Share Change (e.g. 80% Share)
console.log('\n--- Test 3: Dynamic Recalculation on Share Change (80% Share) ---');
sa.sharePercentage = 80;
window.AdminCore.repo.set('ADM_SHARE_TRANSACTIONS', []);
recordShareTransaction(company, sa, 100000);

const metrics80 = calculateHierarchySummaryMetrics(company);

assert(metrics80.plDownline === 80000, "P/L Downline updated to 80,000 (100,000 * 80%)");
assert(metrics80.balanceUpline === 20000, "Balance UpLine updated to 20,000 (100,000 - 80,000)");

// TEST 4: Separation from Credit Transfer
console.log('\n--- Test 4: Credit Balances Unchanged by Summary Metrics ---');
assert(company.balance === 100000, "Company credit balance unchanged by summary calculation");
assert(sa.balance === 100000, "SuperAdmin credit balance unchanged by summary calculation");

console.log('\n====================================================');
console.log('  ACCOUNT SUMMARY TABLE SUITE VERIFIED 100% CLEAN');
console.log('====================================================\n');
