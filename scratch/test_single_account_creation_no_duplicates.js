/**
 * test_single_account_creation_no_duplicates.js
 * Verification suite for single account identity & duplicate prevention:
 * - COMPANY creates SUPER_ADMIN => Exactly 1 account, 1 visible ID
 * - SUPER_ADMIN creates ADMIN => Exactly 1 account, 1 visible ID
 * - ADMIN creates SUPER_MASTER => Exactly 1 account, 1 visible ID
 * - SUPER_MASTER creates MASTER => Exactly 1 account, 1 visible ID
 * - MASTER creates USER => Exactly 1 account, 1 visible ID
 * - Duplicate username rejection test
 * - Double-click submit re-entrancy lock test
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
console.log('  SINGLE ACCOUNT CREATION & NO-DUPLICATE SUITE');
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
    if (sel === '#addUserModal button[type="submit"]') {
      return { disabled: false, innerText: 'Submit' };
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

const deleteHelperMatch = adminHtml.match(/function canDeleteUser\(requester, target\) \{[\s\S]*?function confirmDeleteUserSubmit\(\) \{[\s\S]*?\n    \}/);
eval(deleteHelperMatch[0]);

const renderUsersMatch = adminHtml.match(/function renderUsersTable\(filterOpts = \{\}\) \{[\s\S]*?\n    \}/);
eval(renderUsersMatch[0]);

// STEP 1: Login as COMPANY
console.log('\n--- Test 1: COMPANY creates SUPER_ADMIN (unique_sa_01) ---');
const companyAccount = {
  id: 'COMP-ROOT-01',
  username: 'company',
  role: 'COMPANY',
  companyId: 'COMP-01'
};
localStorage.setItem('isAdminAuth', 'true');
window.AdminCore.repo.setCurrentAdmin(companyAccount);
window.AdminCore.repo.set('ADM_ADMINS', [companyAccount]);
window.AdminCore.repo.set('ADM_USERS', [companyAccount]);

openAddUserModal();
document.getElementById('newUsername').value = 'unique_sa_01';
document.getElementById('newPassword').value = 'Pass123!';
global._mockSelectedType = 'SUPER_ADMIN';

handleAddUserSubmit({ preventDefault: () => {} });

const hierarchyUsers1 = window.AdminCore.repo.getHierarchyUsers(companyAccount);
const saMatches1 = hierarchyUsers1.filter(u => u.username === 'unique_sa_01');

assert(saMatches1.length === 1, `Exactly 1 visible account returned for unique_sa_01 (Count: ${saMatches1.length})`);

// STEP 2: SUPER_ADMIN creates ADMIN (unique_admin_02)
console.log('\n--- Test 2: SUPER_ADMIN creates ADMIN (unique_admin_02) ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'unique_sa_01';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

openAddUserModal();
document.getElementById('newUsername').value = 'unique_admin_02';
document.getElementById('newPassword').value = 'Pass123!';
global._mockSelectedType = 'ADMIN';

handleAddUserSubmit({ preventDefault: () => {} });

const saSession = window.AdminCore.repo.getCurrentAdmin();
const hierarchyUsers2 = window.AdminCore.repo.getHierarchyUsers(saSession);
const adminMatches2 = hierarchyUsers2.filter(u => u.username === 'unique_admin_02');

assert(adminMatches2.length === 1, `Exactly 1 visible account returned for unique_admin_02 (Count: ${adminMatches2.length})`);

// STEP 3: ADMIN creates SUPER_MASTER (unique_sm_03)
console.log('\n--- Test 3: ADMIN creates SUPER_MASTER (unique_sm_03) ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'unique_admin_02';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

openAddUserModal();
document.getElementById('newUsername').value = 'unique_sm_03';
document.getElementById('newPassword').value = 'Pass123!';
global._mockSelectedType = 'SUPER_MASTER';

handleAddUserSubmit({ preventDefault: () => {} });

const adminSession = window.AdminCore.repo.getCurrentAdmin();
const hierarchyUsers3 = window.AdminCore.repo.getHierarchyUsers(adminSession);
const smMatches3 = hierarchyUsers3.filter(u => u.username === 'unique_sm_03');

assert(smMatches3.length === 1, `Exactly 1 visible account returned for unique_sm_03 (Count: ${smMatches3.length})`);

// STEP 4: SUPER_MASTER creates MASTER (unique_m_04)
console.log('\n--- Test 4: SUPER_MASTER creates MASTER (unique_m_04) ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'unique_sm_03';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

openAddUserModal();
document.getElementById('newUsername').value = 'unique_m_04';
document.getElementById('newPassword').value = 'Pass123!';
global._mockSelectedType = 'MASTER';

handleAddUserSubmit({ preventDefault: () => {} });

const smSession = window.AdminCore.repo.getCurrentAdmin();
const hierarchyUsers4 = window.AdminCore.repo.getHierarchyUsers(smSession);
const mMatches4 = hierarchyUsers4.filter(u => u.username === 'unique_m_04');

assert(mMatches4.length === 1, `Exactly 1 visible account returned for unique_m_04 (Count: ${mMatches4.length})`);

// STEP 5: MASTER creates USER (unique_u_05)
console.log('\n--- Test 5: MASTER creates USER (unique_u_05) ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'unique_m_04';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

openAddUserModal();
document.getElementById('newUsername').value = 'unique_u_05';
document.getElementById('newPassword').value = 'Pass123!';
global._mockSelectedType = 'USER';

handleAddUserSubmit({ preventDefault: () => {} });

const mSession = window.AdminCore.repo.getCurrentAdmin();
const hierarchyUsers5 = window.AdminCore.repo.getHierarchyUsers(mSession);
const uMatches5 = hierarchyUsers5.filter(u => u.username === 'unique_u_05');

assert(uMatches5.length === 1, `Exactly 1 visible account returned for unique_u_05 (Count: ${uMatches5.length})`);

// STEP 6: Duplicate Username Rejection Test
console.log('\n--- Test 6: Duplicate Username Rejection Test ---');
openAddUserModal();
document.getElementById('newUsername').value = 'unique_sa_01';
document.getElementById('newPassword').value = 'Pass123!';
global._mockSelectedType = 'USER';

handleAddUserSubmit({ preventDefault: () => {} });

const allUsersEnd = window.AdminCore.repo.get('ADM_USERS') || [];
const totalDupCheck = allUsersEnd.filter(u => u.username === 'unique_sa_01');
assert(totalDupCheck.length === 1, "Duplicate creation blocked; unique_sa_01 appears only once");

// STEP 7: Double-Click Re-entrancy Lock Test
console.log('\n--- Test 7: Double-Click Re-entrancy Lock Test ---');
window._isCreatingUser = true;
openAddUserModal();
document.getElementById('newUsername').value = 'reentrancy_test_user';
document.getElementById('newPassword').value = 'Pass123!';

handleAddUserSubmit({ preventDefault: () => {} });

const allUsersLock = window.AdminCore.repo.get('ADM_USERS') || [];
assert(!allUsersLock.some(u => u.username === 'reentrancy_test_user'), "Re-entrancy blocked while submission is in progress");
window._isCreatingUser = false;

console.log('\n====================================================');
console.log('  SINGLE ACCOUNT CREATION VERIFIED 100% CLEAN');
console.log('====================================================\n');
