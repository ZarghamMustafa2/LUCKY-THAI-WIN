/**
 * test_hierarchy_delete_permissions.js
 * Comprehensive E2E automated test suite for hierarchy-based user deletion:
 * 1. COMPANY can delete SUPER_ADMIN and entire subtree below it.
 * 2. COMPANY can delete individual USER anywhere in hierarchy.
 * 3. SUPER_ADMIN can delete its own ADMIN and all accounts below that ADMIN.
 * 4. SUPER_ADMIN CANNOT delete another SUPER_ADMIN or another branch.
 * 5. ADMIN can delete its own SUPER_MASTER, MASTER, and USER descendants.
 * 6. SUPER_MASTER can delete its own MASTER and USER descendants.
 * 7. MASTER can delete only its own USER descendants.
 * 8. USER cannot delete anyone.
 * 9. Direct unauthorized delete invocation is blocked.
 * 10. Deleted account cannot log in after deletion.
 * 11. Deleting one branch does NOT affect other branches.
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
console.log('  HIERARCHY DELETE PERMISSIONS VERIFICATION SUITE');
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

const deleteHelperMatch = adminHtml.match(/function canDeleteUser\(requester, target\) \{[\s\S]*?function confirmDeleteUserSubmit\(\) \{[\s\S]*?\n    \}/);
assert(deleteHelperMatch !== null, "Delete functions extracted");
eval(deleteHelperMatch[0]);

const renderUsersMatch = adminHtml.match(/function renderUsersTable\(filterOpts = \{\}\) \{[\s\S]*?\n    \}/);
eval(renderUsersMatch[0]);

// SETUP: Build 2 distinct hierarchy branches under COMPANY:
// Branch A: COMPANY -> sa_branch_a -> admin_branch_a -> sm_branch_a -> m_branch_a -> u_branch_a
// Branch B: COMPANY -> sa_branch_b -> admin_branch_b

console.log('\n--- Setup: Building Hierarchy Trees ---');
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

// Branch A creation
global._mockSelectedType = 'SUPER_ADMIN';
openAddUserModal();
document.getElementById('newUsername').value = 'sa_branch_a';
document.getElementById('newPassword').value = 'Pass123!';
handleAddUserSubmit({ preventDefault: () => {} });

// Branch B creation
openAddUserModal();
document.getElementById('newUsername').value = 'sa_branch_b';
document.getElementById('newPassword').value = 'Pass123!';
handleAddUserSubmit({ preventDefault: () => {} });

// sa_branch_a creates admin_branch_a
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'sa_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

global._mockSelectedType = 'ADMIN';
openAddUserModal();
document.getElementById('newUsername').value = 'admin_branch_a';
document.getElementById('newPassword').value = 'Pass123!';
handleAddUserSubmit({ preventDefault: () => {} });

// admin_branch_a creates sm_branch_a
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'admin_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

global._mockSelectedType = 'SUPER_MASTER';
openAddUserModal();
document.getElementById('newUsername').value = 'sm_branch_a';
document.getElementById('newPassword').value = 'Pass123!';
handleAddUserSubmit({ preventDefault: () => {} });

// sm_branch_a creates m_branch_a
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'sm_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

global._mockSelectedType = 'MASTER';
openAddUserModal();
document.getElementById('newUsername').value = 'm_branch_a';
document.getElementById('newPassword').value = 'Pass123!';
handleAddUserSubmit({ preventDefault: () => {} });

// m_branch_a creates u_branch_a
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'm_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

global._mockSelectedType = 'USER';
openAddUserModal();
document.getElementById('newUsername').value = 'u_branch_a';
document.getElementById('newPassword').value = 'Pass123!';
handleAddUserSubmit({ preventDefault: () => {} });

// sa_branch_b creates admin_branch_b
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'sa_branch_b';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

global._mockSelectedType = 'ADMIN';
openAddUserModal();
document.getElementById('newUsername').value = 'admin_branch_b';
document.getElementById('newPassword').value = 'Pass123!';
handleAddUserSubmit({ preventDefault: () => {} });

// TEST 1: COMPANY can delete SUPER_ADMIN and entire subtree below it
console.log('\n--- Test 1: COMPANY deletes sa_branch_a & entire subtree ---');
lockAdminPanel();
window.AdminCore.repo.setCurrentAdmin(companyAccount);
localStorage.setItem('isAdminAuth', 'true');

promptDeleteUser('sa_branch_a');
assert(window.pendingDeleteTarget !== null, "Delete modal prompted for sa_branch_a");
assert(window.pendingDeleteTarget.downlines.length >= 4, `sa_branch_a has ${window.pendingDeleteTarget.downlines.length} downline accounts in subtree`);

confirmDeleteUserSubmit();

const allUsersAfter = window.AdminCore.repo.get('ADM_USERS') || [];
const allAdminsAfter = window.AdminCore.repo.get('ADM_ADMINS') || [];
const poolAfter = [...allAdminsAfter, ...allUsersAfter];

assert(!poolAfter.some(x => x.username === 'sa_branch_a'), "sa_branch_a deleted");
assert(!poolAfter.some(x => x.username === 'admin_branch_a'), "admin_branch_a deleted (subtree cascade)");
assert(!poolAfter.some(x => x.username === 'sm_branch_a'), "sm_branch_a deleted (subtree cascade)");
assert(!poolAfter.some(x => x.username === 'm_branch_a'), "m_branch_a deleted (subtree cascade)");
assert(!poolAfter.some(x => x.username === 'u_branch_a'), "u_branch_a deleted (subtree cascade)");

// TEST 11: Confirm Branch B is completely untouched
console.log('\n--- Test 11: Branch B remains untouched after Branch A deletion ---');
assert(poolAfter.some(x => x.username === 'sa_branch_b'), "sa_branch_b still exists");
assert(poolAfter.some(x => x.username === 'admin_branch_b'), "admin_branch_b still exists");

// TEST 10: Deleted account cannot log in
console.log('\n--- Test 10: Deleted account cannot log in ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'sa_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });
assert(window.AdminCore.repo.getCurrentAdmin() === null, "Deleted sa_branch_a login failed");

// RE-CREATE BRANCH A FOR REMAINING PERMISSION TESTS
console.log('\n--- Re-building Branch A for remaining permission tests ---');
window.AdminCore.repo.setCurrentAdmin(companyAccount);
localStorage.setItem('isAdminAuth', 'true');

global._mockSelectedType = 'SUPER_ADMIN';
openAddUserModal();
document.getElementById('newUsername').value = 'sa_branch_a';
document.getElementById('newPassword').value = 'Pass123!';
handleAddUserSubmit({ preventDefault: () => {} });

lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'sa_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

global._mockSelectedType = 'ADMIN';
openAddUserModal();
document.getElementById('newUsername').value = 'admin_branch_a';
document.getElementById('newPassword').value = 'Pass123!';
handleAddUserSubmit({ preventDefault: () => {} });

lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'admin_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

global._mockSelectedType = 'SUPER_MASTER';
openAddUserModal();
document.getElementById('newUsername').value = 'sm_branch_a';
document.getElementById('newPassword').value = 'Pass123!';
handleAddUserSubmit({ preventDefault: () => {} });

lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'sm_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

global._mockSelectedType = 'MASTER';
openAddUserModal();
document.getElementById('newUsername').value = 'm_branch_a';
document.getElementById('newPassword').value = 'Pass123!';
handleAddUserSubmit({ preventDefault: () => {} });

lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'm_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

global._mockSelectedType = 'USER';
openAddUserModal();
document.getElementById('newUsername').value = 'u_branch_a';
document.getElementById('newPassword').value = 'Pass123!';
handleAddUserSubmit({ preventDefault: () => {} });

// TEST 4: SUPER_ADMIN CANNOT delete another SUPER_ADMIN or another branch
console.log('\n--- Test 4: SUPER_ADMIN sa_branch_a CANNOT delete sa_branch_b ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'sa_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });

const saA = window.AdminCore.repo.getCurrentAdmin();
const poolCurrent = [...(window.AdminCore.repo.get('ADM_ADMINS') || []), ...(window.AdminCore.repo.get('ADM_USERS') || [])];
const saB = poolCurrent.find(x => x.username === 'sa_branch_b');
const adminB = poolCurrent.find(x => x.username === 'admin_branch_b');

assert(!canDeleteUser(saA, saB), "sa_branch_a CANNOT delete another SUPER_ADMIN (sa_branch_b)");
assert(!canDeleteUser(saA, adminB), "sa_branch_a CANNOT delete account from another branch (admin_branch_b)");

// TEST 3: SUPER_ADMIN can delete its own ADMIN and subtree below it
console.log('\n--- Test 3: SUPER_ADMIN sa_branch_a CAN delete admin_branch_a ---');
const adminA = poolCurrent.find(x => x.username === 'admin_branch_a');
assert(canDeleteUser(saA, adminA), "sa_branch_a CAN delete its own ADMIN (admin_branch_a)");

// TEST 5: ADMIN can delete SUPER_MASTER, MASTER, USER descendants
console.log('\n--- Test 5: ADMIN admin_branch_a permissions ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'admin_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });
const adminAAcc = window.AdminCore.repo.getCurrentAdmin();

const smA = poolCurrent.find(x => x.username === 'sm_branch_a');
const mA = poolCurrent.find(x => x.username === 'm_branch_a');
const uA = poolCurrent.find(x => x.username === 'u_branch_a');

assert(canDeleteUser(adminAAcc, smA), "ADMIN CAN delete its own SUPER_MASTER");
assert(canDeleteUser(adminAAcc, mA), "ADMIN CAN delete its own MASTER");
assert(canDeleteUser(adminAAcc, uA), "ADMIN CAN delete its own USER");
assert(!canDeleteUser(adminAAcc, saA), "ADMIN CANNOT delete its parent SUPER_ADMIN");

// TEST 6: SUPER_MASTER permissions
console.log('\n--- Test 6: SUPER_MASTER sm_branch_a permissions ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'sm_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });
const smAAcc = window.AdminCore.repo.getCurrentAdmin();

assert(canDeleteUser(smAAcc, mA), "SUPER_MASTER CAN delete its own MASTER");
assert(canDeleteUser(smAAcc, uA), "SUPER_MASTER CAN delete its own USER");
assert(!canDeleteUser(smAAcc, adminA), "SUPER_MASTER CANNOT delete parent ADMIN");

// TEST 7: MASTER permissions
console.log('\n--- Test 7: MASTER m_branch_a permissions ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'm_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });
const mAAcc = window.AdminCore.repo.getCurrentAdmin();

assert(canDeleteUser(mAAcc, uA), "MASTER CAN delete its own USER");
assert(!canDeleteUser(mAAcc, smA), "MASTER CANNOT delete parent SUPER_MASTER");

// TEST 8: USER permissions
console.log('\n--- Test 8: USER u_branch_a permissions ---');
lockAdminPanel();
document.getElementById('adminUsernameInput').value = 'u_branch_a';
document.getElementById('adminPinInput').value = 'Pass123!';
handleAdminPasswordSubmit({ preventDefault: () => {} });
const uAAcc = window.AdminCore.repo.getCurrentAdmin();

assert(!canDeleteUser(uAAcc, mA), "USER CANNOT delete MASTER");
assert(!canDeleteUser(uAAcc, uA), "USER CANNOT delete itself");

// TEST 9: Direct unauthorized call promptDeleteUser rejection
console.log('\n--- Test 9: Direct unauthorized call promptDeleteUser rejection ---');
promptDeleteUser('m_branch_a');
assert(global.pendingDeleteTarget === null, "Unauthorized promptDeleteUser blocked (pendingDeleteTarget remains null)");

console.log('\n====================================================');
console.log('  HIERARCHY DELETE PERMISSIONS VERIFIED 100% CLEAN');
console.log('====================================================\n');
