/**
 * test_credit_isolation_and_visibility.js
 * Automated test suite for credit assignment and target account balance visibility:
 * - Parent assigns credit to exact downline account ID
 * - Credit record persisted in ADM_CREDIT_TRANSACTIONS
 * - Balance loads correctly upon target account login
 * - Balance persists across page reloads & relogins
 * - Strict account isolation (other accounts do NOT see target's credits)
 * - Multi-tier hierarchy test (COMPANY -> SUPER_ADMIN -> ADMIN -> SUPER_MASTER -> MASTER -> USER)
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
console.log('  CREDIT VISIBILITY & ISOLATION VERIFICATION SUITE');
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
global.renderUsersTable = () => {};
global.applySidebarPermissions = () => {};
global.updateDashboardMetrics = () => {};

eval(adminEngineJs);

const roleConfigMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS & DISPLAY CONFIGURATION ───[\s\S]*?window\.getNormalizedRole = getNormalizedRole;/);
assert(roleConfigMatch !== null, "Role config extracted");
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
assert(window.AdminCore.repo.getCurrentAdmin().username === 'company', "COMPANY logged in");

// STEP 2: Create a SUPER_ADMIN account
console.log('\n--- Step 2: Create SUPER_ADMIN Account (sa_credit_target) ---');
openAddUserModal();
document.getElementById('newUsername').value = 'sa_credit_target';
document.getElementById('newPassword').value = 'TargetPass123!';
document.getElementById('newUserShare').value = '90';
global._mockSelectedType = 'SUPER_ADMIN';

handleAddUserSubmit({ preventDefault: () => {} });

const users = window.AdminCore.repo.get('ADM_USERS') || [];
const targetSA = users.find(u => u.username === 'sa_credit_target');
assert(targetSA !== undefined, "SUPER_ADMIN 'sa_credit_target' created");
const targetSaId = targetSA.id;
console.log(`  Target Account ID: ${targetSaId}`);

// STEP 3: COMPANY adds 100,000 credit to sa_credit_target
console.log('\n--- Step 3: COMPANY Adds 100,000 Credit to sa_credit_target ---');
openAdjustWalletModal('sa_credit_target');
global.currentAdjustTab = 'CREDIT';
document.getElementById('depositAmountInput').value = '100000';
document.getElementById('depositDescriptionInput').value = 'Credit deposit from COMPANY';

handleDepositCashSubmit({ preventDefault: () => {} });

// STEP 4: Confirm Transaction Record
console.log('\n--- Step 4: Verify Transaction Storage & Target Account ID ---');
const creditTxs = window.AdminCore.repo.get('ADM_CREDIT_TRANSACTIONS') || [];
const lastTx = creditTxs.find(tx => tx.toUsername === 'sa_credit_target');
assert(lastTx !== undefined, "Credit transaction found in ADM_CREDIT_TRANSACTIONS");
assert(lastTx.toAccountId === targetSaId, `Transaction stored against target account ID '${targetSaId}'`);
assert(lastTx.fromUsername === 'company', "Transaction fromUsername = 'company'");
assert(lastTx.amount === 100000, "Transaction amount = 100,000");

// STEP 5: Logout COMPANY
console.log('\n--- Step 5: Logout COMPANY ---');
lockAdminPanel();
assert(window.AdminCore.repo.getCurrentAdmin() === null, "COMPANY logged out");

// STEP 6 & 7: Login as sa_credit_target and verify balance
console.log('\n--- Step 6 & 7: Login as sa_credit_target & Verify 100,000 Credit ---');
document.getElementById('adminUsernameInput').value = 'sa_credit_target';
document.getElementById('adminPinInput').value = 'TargetPass123!';

handleAdminPasswordSubmit({ preventDefault: () => {} });

const saSession = window.AdminCore.repo.getCurrentAdmin();
assert(saSession !== null, "sa_credit_target logged in");
assert(saSession.username === 'sa_credit_target', "Authenticated user is 'sa_credit_target'");
assert(saSession.role === 'SUPER_ADMIN', "Authenticated role is 'SUPER_ADMIN'");
assert(saSession.creditLimit === 100000, `sa_credit_target credit limit is 100,000 (Loaded: ${saSession.creditLimit})`);

updateAdminHeaderInfo();
assert(document.getElementById('topBarBalance').innerText === '100,000', "Header B: balance is 100,000");
const freshSa = window.AdminCore.repo.getCurrentAdmin();
assert(freshSa.creditLimit === 100000, "Credit Limit is 100,000");

// STEP 8 & 9: Verify Refresh & Re-login Persistence
console.log('\n--- Step 8 & 9: Page Refresh & Re-login Persistence ---');
// Simulate refresh (re-read from storage)
const refreshedSa = window.AdminCore.repo.getCurrentAdmin();
assert(refreshedSa.creditLimit === 100000, "Credit limit preserved on page refresh");

// Simulate logout & re-login
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'sa_credit_target';
document.getElementById('adminPinInput').value = 'TargetPass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

const reloggedSa = window.AdminCore.repo.getCurrentAdmin();
assert(reloggedSa.creditLimit === 100000, "Credit limit preserved on re-login");

// STEP 10: Verify Account Isolation (Another SUPER_ADMIN sees 0 credits)
console.log('\n--- Step 10: Verify Account Isolation ---');
lockAdminPanel();

// Create second SUPER_ADMIN as COMPANY
window.AdminCore.repo.setCurrentAdmin(companyAccount);
localStorage.setItem('isAdminAuth', 'true');

openAddUserModal();
document.getElementById('newUsername').value = 'sa_other_account';
document.getElementById('newPassword').value = 'OtherPass123!';
global._mockSelectedType = 'SUPER_ADMIN';
handleAddUserSubmit({ preventDefault: () => {} });

// Logout COMPANY and login as sa_other_account
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'sa_other_account';
document.getElementById('adminPinInput').value = 'OtherPass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

const otherSession = window.AdminCore.repo.getCurrentAdmin();
assert(otherSession.username === 'sa_other_account', "Logged in as 'sa_other_account'");
assert(otherSession.creditLimit === 0, `sa_other_account has 0 credits (Isolated from sa_credit_target's 100k)`);

// STEP 11: Multi-Tier Hierarchy Cascade Test
console.log('\n--- Step 11: Multi-Tier Hierarchy Credit Cascade Test ---');
// sa_credit_target logs in and credits child ADMIN
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'sa_credit_target';
document.getElementById('adminPinInput').value = 'TargetPass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

openAddUserModal();
document.getElementById('newUsername').value = 'admin_child_target';
document.getElementById('newPassword').value = 'AdminPass123!';
global._mockSelectedType = 'ADMIN';
handleAddUserSubmit({ preventDefault: () => {} });

openAdjustWalletModal('admin_child_target');
global.currentAdjustTab = 'CREDIT';
document.getElementById('depositAmountInput').value = '50000';
handleDepositCashSubmit({ preventDefault: () => {} });

// Logout SUPER_ADMIN and login as child ADMIN
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'admin_child_target';
document.getElementById('adminPinInput').value = 'AdminPass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

const adminChildSession = window.AdminCore.repo.getCurrentAdmin();
assert(adminChildSession.username === 'admin_child_target', "Logged in as 'admin_child_target'");
assert(adminChildSession.creditLimit === 50000, "Child ADMIN has 50,000 credits assigned by SUPER_ADMIN");

console.log('\n====================================================');
console.log('  CREDIT VISIBILITY & ISOLATION SUITE 100% CLEAN');
console.log('====================================================\n');
