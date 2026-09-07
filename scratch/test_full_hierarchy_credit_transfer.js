/**
 * test_full_hierarchy_credit_transfer.js
 * Comprehensive automated verification for full-hierarchy credit transfers:
 * 1. COMPANY (100k) -> SUPER_ADMIN (20k)  => Company=80k, SuperAdmin=20k
 * 2. SUPER_ADMIN (20k) -> ADMIN (5k)       => SuperAdmin=15k, Admin=5k
 * 3. ADMIN (5k) -> SUPER_MASTER (2k)       => Admin=3k, SuperMaster=2k
 * 4. SUPER_MASTER (2k) -> MASTER (1k)      => SuperMaster=1k, Master=1k
 * 5. MASTER (1k) -> USER (500)             => Master=500, User=500
 * 6. Insufficient Balance Validation       => Blocked when transfer > balance
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
console.log('  FULL HIERARCHY CREDIT TRANSFER VERIFICATION SUITE');
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

// STEP 1: Login as COMPANY (100,000 initial balance)
console.log('\n--- Level 1: COMPANY (100,000) -> SUPER_ADMIN (20,000) ---');
const companyAccount = {
  id: 'COMP-ROOT-01',
  username: 'company',
  role: 'COMPANY',
  sharePercentage: 100,
  balance: 100000,
  creditLimit: 100000
};
localStorage.setItem('isAdminAuth', 'true');
window.AdminCore.repo.setCurrentAdmin(companyAccount);

// Save initial Company in ADM_ADMINS & ADM_USERS
window.AdminCore.repo.set('ADM_ADMINS', [companyAccount]);
window.AdminCore.repo.set('ADM_USERS', [companyAccount]);

// Create SUPER_ADMIN sa_tier1
openAddUserModal();
document.getElementById('newUsername').value = 'sa_tier1';
document.getElementById('newPassword').value = 'SaPass123!';
document.getElementById('newUserShare').value = '90';
global._mockSelectedType = 'SUPER_ADMIN';
handleAddUserSubmit({ preventDefault: () => {} });

// Transfer 20,000 from COMPANY to sa_tier1
openAdjustWalletModal('sa_tier1');
global.currentAdjustTab = 'CASH';
document.getElementById('depositAmountInput').value = '20000';
document.getElementById('depositDescriptionInput').value = 'Company to SuperAdmin Transfer';
handleDepositCashSubmit({ preventDefault: () => {} });

// Verify Company = 80,000
updateAdminHeaderInfo();
renderUsersTable();
assert(document.getElementById('topBarBalance').innerText === '80,000', "Company balance decreased to 80,000");
assert(document.getElementById('clientsCash').innerText === '80,000', "Company Accounts cash = 80,000");
assert(document.getElementById('clientsCreditRemaining').innerText === '80,000', "Company Credit Remaining = 80,000");

// STEP 2: SUPER_ADMIN (20,000) -> ADMIN (5,000)
console.log('\n--- Level 2: SUPER_ADMIN (20,000) -> ADMIN (5,000) ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'sa_tier1';
document.getElementById('adminPinInput').value = 'SaPass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

let currentSa = window.AdminCore.repo.getCurrentAdmin();
assert(currentSa.balance === 20000, `SUPER_ADMIN sa_tier1 initial balance = 20,000 (Loaded: ${currentSa.balance})`);

// Create ADMIN admin_tier2
openAddUserModal();
document.getElementById('newUsername').value = 'admin_tier2';
document.getElementById('newPassword').value = 'AdminPass123!';
document.getElementById('newUserShare').value = '80';
global._mockSelectedType = 'ADMIN';
handleAddUserSubmit({ preventDefault: () => {} });

// Transfer 5,000 from sa_tier1 to admin_tier2
openAdjustWalletModal('admin_tier2');
global.currentAdjustTab = 'CASH';
document.getElementById('depositAmountInput').value = '5000';
document.getElementById('depositDescriptionInput').value = 'SuperAdmin to Admin Transfer';
handleDepositCashSubmit({ preventDefault: () => {} });

// Verify sa_tier1 = 15,000
updateAdminHeaderInfo();
renderUsersTable();
assert(document.getElementById('topBarBalance').innerText === '15,000', "SUPER_ADMIN balance decreased to 15,000");

// STEP 3: ADMIN (5,000) -> SUPER_MASTER (2,000)
console.log('\n--- Level 3: ADMIN (5,000) -> SUPER_MASTER (2,000) ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'admin_tier2';
document.getElementById('adminPinInput').value = 'AdminPass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

let currentAdminAcc = window.AdminCore.repo.getCurrentAdmin();
assert(currentAdminAcc.balance === 5000, `ADMIN admin_tier2 initial balance = 5,000 (Loaded: ${currentAdminAcc.balance})`);

// Create SUPER_MASTER sm_tier3
openAddUserModal();
document.getElementById('newUsername').value = 'sm_tier3';
document.getElementById('newPassword').value = 'SmPass123!';
document.getElementById('newUserShare').value = '70';
global._mockSelectedType = 'SUPER_MASTER';
handleAddUserSubmit({ preventDefault: () => {} });

// Transfer 2,000 from admin_tier2 to sm_tier3
openAdjustWalletModal('sm_tier3');
global.currentAdjustTab = 'CASH';
document.getElementById('depositAmountInput').value = '2000';
document.getElementById('depositDescriptionInput').value = 'Admin to SuperMaster Transfer';
handleDepositCashSubmit({ preventDefault: () => {} });

// Verify admin_tier2 = 3,000
updateAdminHeaderInfo();
assert(document.getElementById('topBarBalance').innerText === '3,000', "ADMIN balance decreased to 3,000");

// STEP 4: SUPER_MASTER (2,000) -> MASTER (1,000)
console.log('\n--- Level 4: SUPER_MASTER (2,000) -> MASTER (1,000) ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'sm_tier3';
document.getElementById('adminPinInput').value = 'SmPass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

let currentSm = window.AdminCore.repo.getCurrentAdmin();
assert(currentSm.balance === 2000, `SUPER_MASTER sm_tier3 initial balance = 2,000 (Loaded: ${currentSm.balance})`);

// Create MASTER m_tier4
openAddUserModal();
document.getElementById('newUsername').value = 'm_tier4';
document.getElementById('newPassword').value = 'MasterPass123!';
document.getElementById('newUserShare').value = '60';
global._mockSelectedType = 'MASTER';
handleAddUserSubmit({ preventDefault: () => {} });

// Transfer 1,000 from sm_tier3 to m_tier4
openAdjustWalletModal('m_tier4');
global.currentAdjustTab = 'CASH';
document.getElementById('depositAmountInput').value = '1000';
document.getElementById('depositDescriptionInput').value = 'SuperMaster to Master Transfer';
handleDepositCashSubmit({ preventDefault: () => {} });

// Verify sm_tier3 = 1,000
updateAdminHeaderInfo();
assert(document.getElementById('topBarBalance').innerText === '1,000', "SUPER_MASTER balance decreased to 1,000");

// STEP 5: MASTER (1,000) -> USER (500)
console.log('\n--- Level 5: MASTER (1,000) -> USER (500) ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'm_tier4';
document.getElementById('adminPinInput').value = 'MasterPass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

let currentM = window.AdminCore.repo.getCurrentAdmin();
assert(currentM.balance === 1000, `MASTER m_tier4 initial balance = 1,000 (Loaded: ${currentM.balance})`);

// Create USER u_tier5
openAddUserModal();
document.getElementById('newUsername').value = 'u_tier5';
document.getElementById('newPassword').value = 'UserPass123!';
document.getElementById('newUserShare').value = '50';
global._mockSelectedType = 'USER';
handleAddUserSubmit({ preventDefault: () => {} });

// Transfer 500 from m_tier4 to u_tier5
openAdjustWalletModal('u_tier5');
global.currentAdjustTab = 'CASH';
document.getElementById('depositAmountInput').value = '500';
document.getElementById('depositDescriptionInput').value = 'Master to User Transfer';
handleDepositCashSubmit({ preventDefault: () => {} });

// Verify m_tier4 = 500
updateAdminHeaderInfo();
renderUsersTable();
assert(document.getElementById('topBarBalance').innerText === '500', "MASTER balance decreased to 500");
assert(document.getElementById('clientsCreditRemaining').innerText === '500', "MASTER Credit Remaining = 500");

// STEP 6: Insufficient Balance Rejection Test
console.log('\n--- Step 6: Insufficient Balance Rejection Test (Attempting 600 from 500 available) ---');
openAdjustWalletModal('u_tier5');
global.currentAdjustTab = 'CASH';
document.getElementById('depositAmountInput').value = '600';
handleDepositCashSubmit({ preventDefault: () => {} });

// Verify m_tier4 balance remains 500
updateAdminHeaderInfo();
assert(document.getElementById('topBarBalance').innerText === '500', "MASTER balance remains 500 after rejected transfer");

// STEP 7: Verify Receiver Balance for USER u_tier5 (500)
console.log('\n--- Step 7: Verify Receiver USER Balance (500) ---');
const usersList = window.AdminCore.repo.get('ADM_USERS') || [];
const uRec = usersList.find(u => u.username === 'u_tier5');
assert(uRec !== undefined, "USER u_tier5 record exists");
assert(uRec.balance === 500, `USER u_tier5 balance is 500 (Loaded: ${uRec.balance})`);

console.log('\n====================================================');
console.log('  FULL HIERARCHY CREDIT TRANSFER VERIFIED 100% CLEAN');
console.log('====================================================\n');
