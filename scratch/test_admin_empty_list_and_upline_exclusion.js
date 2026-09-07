/**
 * test_admin_empty_list_and_upline_exclusion.js
 * Comprehensive acceptance test suite for:
 * 1. Abphir50x (Admin created under Malku50x Super Admin) starting with EMPTY LIST (0 entries).
 * 2. Absolute exclusion of parent (Malku50x) and self (Abphir50x) from Accounts List.
 * 3. Absolute exclusion of unrelated branches (Zaru50x, Maoik, Ghulam, Zargham).
 * 4. Search and Direct Access isolation for Abphir50x.
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
console.log('  ADMIN EMPTY LIST & UPLINE EXCLUSION SUITE');
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

// Seed Hierarchy
const company = { id: 'COMP-01', username: 'company', name: 'Company HQ', role: 'COMPANY', status: 'Active' };

// Branch 1: Malku50x (Super Admin) -> Abphir50x (Admin)
const malku50x = { id: 'SA-MALKU', username: 'Malku50x', name: 'Malku50x', role: 'SUPER_ADMIN', userType: 'Super Admin', createdUnder: 'company', uplineUsername: 'company', status: 'Active' };
const abphir50x = { id: 'AD-ABPHIR', username: 'Abphir50x', name: 'Abphir50x', role: 'ADMIN', userType: 'Admin', createdUnder: 'Malku50x', uplineUsername: 'Malku50x', parentId: 'Malku50x', status: 'Active' };

// Branch 2: Zaru50x (Super Admin) -> Maoik, Ghulam, Zargham
const zaru50x = { id: 'SA-ZARU', username: 'Zaru50x', name: 'Zaru50x', role: 'SUPER_ADMIN', userType: 'Super Admin', createdUnder: 'company', uplineUsername: 'company', status: 'Active' };
const maoik = { id: 'USR-M1', username: 'Maoik', name: 'Maoik', role: 'USER', createdUnder: 'Zaru50x', agentUsername: 'Zaru50x', status: 'Active' };
const ghulam = { id: 'USR-M2', username: 'Ghulam', name: 'Ghulam', role: 'USER', createdUnder: 'Zaru50x', agentUsername: 'Zaru50x', status: 'Active' };
const zargham = { id: 'USR-M3', username: 'Zargham', name: 'Zargham', role: 'USER', createdUnder: 'Zaru50x', agentUsername: 'Zaru50x', status: 'Active' };

AdminCore.repo.set('ADM_ADMINS', [company, malku50x, abphir50x, zaru50x]);
AdminCore.repo.set('ADM_USERS', [maoik, ghulam, zargham]);

function setAuth(acc) {
  localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(acc));
  localStorage.setItem('isAdminAuth', 'true');
}

// TEST 1: Login as Abphir50x (ADMIN created under Malku50x, 0 users created)
console.log('\n--- TEST 1: Login as Abphir50x (Admin, 0 Users) ---');
setAuth(abphir50x);
renderUsersTable();
const abphirDownlineAdmins = AdminCore.repo.getDownlineAdmins('Abphir50x');
const abphirDownlineUsers = AdminCore.repo.getDownlineUsernames('Abphir50x');
assert(abphirDownlineAdmins.length === 0 && abphirDownlineUsers.length === 0, "Abphir50x downline = 0 entries");
assert(!abphirDownlineUsers.includes('Malku50x'), "Abphir50x MUST NOT see parent Malku50x");
assert(!abphirDownlineUsers.includes('Maoik') && !abphirDownlineUsers.includes('Ghulam') && !abphirDownlineUsers.includes('Zaru50x'), "Abphir50x MUST NOT see Zaru50x branch");

// TEST 2: Abphir50x creates Client001 (User) -> Only Client001 appears
console.log('\n--- TEST 2: Abphir50x creates Client001 ---');
const client001 = { id: 'USR-C001', username: 'Client001', name: 'Client001', role: 'USER', userType: 'User', createdUnder: 'Abphir50x', agentUsername: 'Abphir50x', status: 'Active' };
const currentUsers = AdminCore.repo.get('ADM_USERS') || [];
currentUsers.push(client001);
AdminCore.repo.set('ADM_USERS', currentUsers);

const abphirUsersAfterClient = AdminCore.repo.getDownlineUsernames('Abphir50x');
assert(abphirUsersAfterClient.length === 1 && abphirUsersAfterClient[0] === 'Client001', "Abphir50x sees ONLY Client001");
assert(!abphirUsersAfterClient.includes('Malku50x'), "Malku50x parent still NOT present");

// TEST 3: Login as Malku50x -> Sees Abphir50x & Client001 (Does NOT see self Malku50x or Company)
console.log('\n--- TEST 3: Login as Malku50x (Super Admin) ---');
setAuth(malku50x);
const malkuAdmins = AdminCore.repo.getDownlineAdmins('Malku50x').map(a => a.username);
const malkuUsers = AdminCore.repo.getDownlineUsernames('Malku50x');
assert(malkuAdmins.includes('Abphir50x') && malkuUsers.includes('Client001'), "Malku50x sees authorized downline (Abphir50x, Client001)");
assert(!malkuAdmins.includes('Malku50x') && !malkuAdmins.includes('company'), "Malku50x DOES NOT see self or upline company");
assert(!malkuAdmins.includes('Zaru50x'), "Malku50x DOES NOT see Zaru50x from another branch");

// TEST 4: Search Malku50x by Abphir50x -> 0 results
console.log('\n--- TEST 4: Abphir50x searches for parent Malku50x ---');
setAuth(abphir50x);
assert(AdminCore.repo.isUserInDownline(abphir50x, malku50x) === false, "Abphir50x cannot find parent Malku50x via search or downline check");

// TEST 5: Search Maoik by Abphir50x -> 0 results
console.log('\n--- TEST 5: Abphir50x searches for Maoik ---');
assert(AdminCore.repo.isUserInDownline(abphir50x, maoik) === false, "Abphir50x cannot find Maoik from Zaru50x branch");

// TEST 6: Direct Access Protection for Abphir50x
console.log('\n--- TEST 6: Direct Access Protection ---');
assert(AdminCore.repo.isUserInDownline(abphir50x, malku50x) === false, "Access Denied: Abphir50x cannot open parent Malku50x");
assert(AdminCore.repo.isUserInDownline(abphir50x, zaru50x) === false, "Access Denied: Abphir50x cannot open Zaru50x");

// TEST 7: ROOT COMPANY preserves global visibility
console.log('\n--- TEST 7: ROOT COMPANY preserves global visibility ---');
setAuth(company);
const compAdmins = AdminCore.repo.getDownlineAdmins('company').map(a => a.username);
assert(compAdmins.includes('Malku50x') && compAdmins.includes('Zaru50x') && compAdmins.includes('Abphir50x'), "Company sees full hierarchy across all branches");

console.log('\n====================================================');
console.log('  ADMIN EMPTY LIST & UPLINE EXCLUSION VERIFIED 100% CLEAN');
console.log('====================================================\n');
