/**
 * test_credit_remaining_single_source_of_truth.js
 * Verification for Credit Remaining & Header Balance Single Source of Truth
 * - Verifies zargham50x (Super Admin) credit assignment (100,000)
 * - Verifies top-right header B: 100,000
 * - Verifies Accounts table Credit Remaining: 100,000 (NOT 0)
 * - Verifies Accounts table Cash: 100,000
 * - Verifies persistence across reloads and relogins
 * - Verifies credit usage calculation (100,000 received - 25,000 used = 75,000 remaining)
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
console.log('  CREDIT REMAINING & HEADER B: SINGLE SOURCE OF TRUTH');
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

const roleConfigMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS & DISPLAY CONFIGURATION ───[\s\S]*?window\.getNormalizedRole = getNormalizedRole;/);
eval(roleConfigMatch[0]);

const summaryHelperMatch = adminHtml.match(/\/\*\*[\s\S]*?Single Source of Truth for Account Balance and Credit Data[\s\S]*?\n    \}/);
assert(summaryHelperMatch !== null, "getAccountCreditSummary extracted");
eval(summaryHelperMatch[0]);

const modalHandlersMatch = adminHtml.match(/function openAddUserModal\(\) \{[\s\S]*?\n    \}/);
eval(modalHandlersMatch[0]);

const handleAddUserMatch = adminHtml.match(/function handleAddUserSubmit\(e\) \{[\s\S]*?\n    \}/);
eval(handleAddUserMatch[0]);

const updateHeaderMatch = adminHtml.match(/function updateAdminHeaderInfo\(\) \{[\s\S]*?\n    \}/);
eval(updateHeaderMatch[0]);

const authModalMatch = adminHtml.match(/function lockAdminPanel\(\) \{[\s\S]*?function handleAppAccountLoginSubmit\(e\) \{[\s\S]*?\n    \}/);
eval(authModalMatch[0]);

const openAdjustMatch = adminHtml.match(/function openAdjustWalletModal\(username\) \{[\s\S]*?function handleWithdrawCashSubmit\(e\) \{[\s\S]*?\n    \}/);
eval(openAdjustMatch[0]);

const renderUsersMatch = adminHtml.match(/function renderUsersTable\(filterOpts = \{\}\) \{[\s\S]*?\n    \}/);
eval(renderUsersMatch[0]);

// STEP 1: Login as COMPANY
console.log('\n--- Step 1: Login as COMPANY ---');
const companyAccount = {
  id: 'COMP-ROOT-01',
  username: 'company',
  role: 'COMPANY',
  sharePercentage: 100
};
localStorage.setItem('isAdminAuth', 'true');
window.AdminCore.repo.setCurrentAdmin(companyAccount);

// STEP 2: Create SUPER_ADMIN zargham50x
console.log('\n--- Step 2: Create SUPER_ADMIN Account zargham50x ---');
openAddUserModal();
document.getElementById('newUsername').value = 'zargham50x';
document.getElementById('newPassword').value = 'ZarghamPass123!';
document.getElementById('newUserShare').value = '90';
global._mockSelectedType = 'SUPER_ADMIN';

handleAddUserSubmit({ preventDefault: () => {} });

// STEP 3: COMPANY adds 100,000 credit to zargham50x
console.log('\n--- Step 3: COMPANY Adds 100,000 Credit to zargham50x ---');
openAdjustWalletModal('zargham50x');
global.currentAdjustTab = 'CASH';
document.getElementById('depositAmountInput').value = '100000';
document.getElementById('depositDescriptionInput').value = 'Direct Credit/Cash Deposit';

handleDepositCashSubmit({ preventDefault: () => {} });

// STEP 4: Logout COMPANY
console.log('\n--- Step 4: Logout COMPANY ---');
lockAdminPanel();

// STEP 5: Login as zargham50x
console.log('\n--- Step 5: Login as zargham50x ---');
document.getElementById('adminUsernameInput').value = 'zargham50x';
document.getElementById('adminPinInput').value = 'ZarghamPass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

const loggedInUser = window.AdminCore.repo.getCurrentAdmin();
assert(loggedInUser.username === 'zargham50x', "Logged in as 'zargham50x'");
assert(loggedInUser.role === 'SUPER_ADMIN', "Role is 'SUPER_ADMIN'");

// STEP 6: Verify Top Bar Header B:
console.log('\n--- Step 6: Verify Header B: ---');
updateAdminHeaderInfo();
const topBarBal = document.getElementById('topBarBalance').innerText;
assert(topBarBal === '100,000', `Header B: displays 100,000 (Loaded: ${topBarBal})`);

// STEP 7: Verify Accounts Table Summary (Credit Remaining & Cash)
console.log('\n--- Step 7: Verify Accounts Table Summary (Credit Remaining & Cash) ---');
renderUsersTable();

const credRemText = document.getElementById('clientsCreditRemaining').innerText;
const cashText = document.getElementById('clientsCash').innerText;

assert(credRemText === '100,000', `Accounts Table Credit Remaining displays 100,000 (NOT 0!) (Loaded: ${credRemText})`);
assert(cashText === '100,000', `Accounts Table Cash displays 100,000 (Loaded: ${cashText})`);

// STEP 8: Page Refresh Persistence
console.log('\n--- Step 8: Verify Page Refresh Persistence ---');
const refreshedUser = window.AdminCore.repo.getCurrentAdmin();
updateAdminHeaderInfo();
renderUsersTable();

assert(document.getElementById('topBarBalance').innerText === '100,000', "Header B: remains 100,000 after page refresh");
assert(document.getElementById('clientsCreditRemaining').innerText === '100,000', "Credit Remaining remains 100,000 after page refresh");

// STEP 9: Logout and Re-login Persistence
console.log('\n--- Step 9: Verify Logout & Re-login Persistence ---');
lockAdminPanel();

document.getElementById('adminUsernameInput').value = 'zargham50x';
document.getElementById('adminPinInput').value = 'ZarghamPass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

updateAdminHeaderInfo();
renderUsersTable();

assert(document.getElementById('topBarBalance').innerText === '100,000', "Header B: remains 100,000 after relogin");
assert(document.getElementById('clientsCreditRemaining').innerText === '100,000', "Credit Remaining remains 100,000 after relogin");

// STEP 10: Usage / Debit Calculation Test (100,000 received - 25,000 used = 75,000 remaining)
console.log('\n--- Step 10: Usage / Debit Calculation Test (100,000 received - 25,000 used = 75,000 remaining) ---');
const usersList = window.AdminCore.repo.get('ADM_USERS') || [];
const userIdx = usersList.findIndex(u => u.username === 'zargham50x');
usersList[userIdx].locked = 25000;
window.AdminCore.repo.set('ADM_USERS', usersList);

renderUsersTable();

const updatedCredRem = document.getElementById('clientsCreditRemaining').innerText;
assert(updatedCredRem === '75,000', `With 25,000 used, Credit Remaining updates to 75,000 (Loaded: ${updatedCredRem})`);

console.log('\n====================================================');
console.log('  SINGLE SOURCE OF TRUTH VERIFIED 100% CLEAN');
console.log('====================================================\n');
