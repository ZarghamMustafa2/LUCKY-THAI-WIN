/**
 * test_new_super_admin_empty_list.js
 * Verification suite for New Super Admin starting with Empty List (0 entries)
 * and branch-isolated account creation / downline resolution.
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
console.log('  NEW SUPER ADMIN EMPTY LIST & ISOLATION SUITE');
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
  querySelectorAll: () => [],
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

global.window = global;
global.window.innerWidth = 375;
global.isUsersBalanceLoaded = false;
global.currentSelectedRoleFilter = 'ALL';
global.showAdminToast = (msg, type) => { global._lastToast = { msg, type }; };
global.openModal = () => {};
global.closeModal = () => {};

eval(adminEngineJs);

global.ROLE_CREATION_PERMISSIONS = { 'COMPANY': ['SUPER_ADMIN', 'USER'], 'SUPER_ADMIN': ['ADMIN', 'USER'], 'ADMIN': ['SUPER_MASTER', 'USER'], 'SUPER_MASTER': ['MASTER', 'USER'], 'MASTER': ['USER'], 'USER': [] };
global.ROLE_DISPLAY_LABELS = { 'COMPANY': 'Company', 'SUPER_ADMIN': 'Super Admin', 'ADMIN': 'Admin', 'SUPER_MASTER': 'Super Master', 'MASTER': 'Master', 'USER': 'User' };

const roleConfigMatch = adminHtml.match(/function getNormalizedRole[\s\S]*?\n    \}/);
if (roleConfigMatch) eval(roleConfigMatch[0]);

const renderTableMatch = adminHtml.match(/function renderUsersTable\(filterOpts = \{\}\) \{[\s\S]*?\n    \}/);
if (renderTableMatch) eval(renderTableMatch[0]);

// Seed Existing Database Accounts
const company = { id: 'COMP-01', username: 'company', name: 'Company HQ', role: 'COMPANY', status: 'Active' };

// Other Branch (Super Admin Zaru50x & Users Maoik, Ghulam, Zargham)
const zaru50x = { id: 'SA-ZARU', username: 'Zaru50x', name: 'Zaru50x', role: 'SUPER_ADMIN', createdUnder: 'company', uplineUsername: 'company', status: 'Active' };
const maoik = { id: 'USR-M1', username: 'Maoik', name: 'Maoik', role: 'USER', createdUnder: 'Zaru50x', agentUsername: 'Zaru50x', status: 'Active' };
const ghulam = { id: 'USR-M2', username: 'Ghulam', name: 'Ghulam', role: 'USER', createdUnder: 'Zaru50x', agentUsername: 'Zaru50x', status: 'Active' };
const zargham = { id: 'USR-M3', username: 'Zargham', name: 'Zargham', role: 'USER', createdUnder: 'Zaru50x', agentUsername: 'Zaru50x', status: 'Active' };

// NEW Super Admin (Malku50x)
const malku50x = { id: 'SA-MALKU', username: 'Malku50x', name: 'Malku50x', role: 'SUPER_ADMIN', userType: 'Super Admin', createdUnder: 'company', uplineUsername: 'company', status: 'Active' };

AdminCore.repo.set('ADM_ADMINS', [company, zaru50x, malku50x]);
AdminCore.repo.set('ADM_USERS', [maoik, ghulam, zargham]);

function setAuth(acc) {
  localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(acc));
  localStorage.setItem('isAdminAuth', 'true');
}

// TEST 1: Login as NEW Super Admin (Malku50x) -> 0 ACCOUNTS
console.log('\n--- TEST 1: Login as New Super Admin Malku50x (No Children) ---');
setAuth(malku50x);
renderUsersTable();
const malkuDownlineAdmins = AdminCore.repo.getDownlineAdmins('Malku50x');
const malkuDownlineUsers = AdminCore.repo.getDownlineUsernames('Malku50x');
assert(malkuDownlineAdmins.length === 0, "Malku50x downline admins = 0");
assert(malkuDownlineUsers.length === 0, "Malku50x downline users = 0");
assert(!malkuDownlineUsers.includes('Maoik') && !malkuDownlineUsers.includes('Ghulam') && !malkuDownlineUsers.includes('Zargham'), "Malku50x MUST NOT see Maoik, Ghulam, Zargham from Zaru50x branch");

// TEST 2: Malku50x creates Admin A -> Only Admin A appears
console.log('\n--- TEST 2: Malku50x creates Admin A ---');
const adminA = { id: 'AD-A1', username: 'Admin_A', name: 'Admin A', role: 'ADMIN', userType: 'Admin', createdUnder: 'Malku50x', uplineUsername: 'Malku50x', status: 'Active' };
const adminsList = AdminCore.repo.get('ADM_ADMINS');
adminsList.push(adminA);
AdminCore.repo.set('ADM_ADMINS', adminsList);

const malkuNewAdmins = AdminCore.repo.getDownlineAdmins('Malku50x').map(a => a.username);
assert(malkuNewAdmins.length === 1 && malkuNewAdmins[0] === 'Admin_A', "Malku50x sees ONLY Admin_A");

// TEST 3: Malku50x creates User B -> Admin A & User B appear
console.log('\n--- TEST 3: Malku50x creates User B ---');
const userB = { id: 'USR-B', username: 'User_B', name: 'User B', role: 'USER', userType: 'User', createdUnder: 'Malku50x', agentUsername: 'Malku50x', status: 'Active' };
const usersList = AdminCore.repo.get('ADM_USERS');
usersList.push(userB);
AdminCore.repo.set('ADM_USERS', usersList);

const malkuUpdatedUsers = AdminCore.repo.getDownlineUsernames('Malku50x');
assert(malkuUpdatedUsers.length === 1 && malkuUpdatedUsers[0] === 'User_B', "Malku50x sees ONLY User_B");

// TEST 4: Another Super Admin C with User C1 -> Malku50x cannot see User C1
console.log('\n--- TEST 4: Other Super Admin C with User C1 ---');
const saC = { id: 'SA-C', username: 'SuperAdmin_C', name: 'Super Admin C', role: 'SUPER_ADMIN', createdUnder: 'company', uplineUsername: 'company', status: 'Active' };
const userC1 = { id: 'USR-C1', username: 'User_C1', name: 'User C1', role: 'USER', createdUnder: 'SuperAdmin_C', agentUsername: 'SuperAdmin_C', status: 'Active' };
AdminCore.repo.get('ADM_ADMINS').push(saC);
AdminCore.repo.get('ADM_USERS').push(userC1);

const malkuScopeCheck = AdminCore.repo.getDownlineUsernames('Malku50x');
assert(!malkuScopeCheck.includes('User_C1'), "Malku50x CANNOT see User_C1 from SuperAdmin_C");

// TEST 5: Search Isolation
console.log('\n--- TEST 5: Search Isolation for Malku50x ---');
assert(AdminCore.repo.isUserInDownline(malku50x, userC1) === false, "Search cannot find User_C1 for Malku50x");

// TEST 6: Direct Access Protection for Malku50x
console.log('\n--- TEST 6: Direct Access Protection ---');
assert(AdminCore.repo.isUserInDownline(malku50x, maoik) === false, "Access Denied: Malku50x cannot open Maoik");
assert(AdminCore.repo.isUserInDownline(malku50x, zaru50x) === false, "Access Denied: Malku50x cannot open Zaru50x");

// TEST 7: COMPANY preserves root visibility
console.log('\n--- TEST 7: ROOT COMPANY preserves global visibility ---');
setAuth(company);
const companyDownlineAdmins = AdminCore.repo.getDownlineAdmins('company');
assert(companyDownlineAdmins.length >= 3, "Company sees all Super Admins across platform");

console.log('\n====================================================');
console.log('  NEW SUPER ADMIN EMPTY LIST & ISOLATION VERIFIED 100% CLEAN');
console.log('====================================================\n');
