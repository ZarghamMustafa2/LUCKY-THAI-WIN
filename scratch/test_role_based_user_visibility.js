/**
 * test_role_based_user_visibility.js
 * Verification suite for Role-Based Downline Visibility Scoping.
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
console.log('  ROLE-BASED DOWNLINE VISIBILITY SCOPING SUITE');
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
        classList: {
          add: () => {},
          remove: () => {},
          contains: () => false
        }
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
global.showAdminToast = (msg, type) => { global._lastToast = { msg, type }; };
global.openModal = () => {};
global.closeModal = () => {};

eval(adminEngineJs);

global.ROLE_CREATION_PERMISSIONS = { 'COMPANY': ['SUPER_ADMIN', 'USER'], 'SUPER_ADMIN': ['ADMIN', 'USER'], 'ADMIN': ['SUPER_MASTER', 'USER'], 'SUPER_MASTER': ['MASTER', 'USER'], 'MASTER': ['USER'], 'USER': [] };
global.ROLE_DISPLAY_LABELS = { 'COMPANY': 'Company', 'SUPER_ADMIN': 'Super Admin', 'ADMIN': 'Admin', 'SUPER_MASTER': 'Super Master', 'MASTER': 'Master', 'USER': 'User' };

const roleConfigMatch = adminHtml.match(/function getNormalizedRole[\s\S]*?\n    \}/);
if (roleConfigMatch) eval(roleConfigMatch[0]);

// Seed Two Disjoint Branches (Branch A & Branch B)
const company = { id: 'COMP-01', username: 'company', name: 'Company HQ', role: 'COMPANY', status: 'Active' };

// Branch A
const superAdminA = { id: 'SA-A', username: 'SuperAdmin_A', name: 'Super Admin A', role: 'SUPER_ADMIN', createdUnder: 'company', uplineUsername: 'company', status: 'Active' };
const adminA = { id: 'AD-A', username: 'Admin_A', name: 'Admin A', role: 'ADMIN', createdUnder: 'SuperAdmin_A', uplineUsername: 'SuperAdmin_A', status: 'Active' };
const superMasterA = { id: 'SM-A', username: 'SuperMaster_A', name: 'Super Master A', role: 'SUPER_MASTER', createdUnder: 'Admin_A', uplineUsername: 'Admin_A', status: 'Active' };
const masterA = { id: 'MA-A', username: 'malik502x', name: 'Master A (malik502x)', role: 'MASTER', createdUnder: 'SuperMaster_A', uplineUsername: 'SuperMaster_A', status: 'Active' };
const userA1 = { id: 'USR-A1', username: 'User_A1', name: 'User A1', role: 'USER', createdUnder: 'malik502x', agentUsername: 'malik502x', status: 'Active' };
const userA2 = { id: 'USR-A2', username: 'User_A2', name: 'User A2', role: 'USER', createdUnder: 'malik502x', agentUsername: 'malik502x', status: 'Active' };

// Branch B (Unrelated Branch)
const superAdminB = { id: 'SA-B', username: 'SuperAdmin_B', name: 'Super Admin B', role: 'SUPER_ADMIN', createdUnder: 'company', uplineUsername: 'company', status: 'Active' };
const masterB = { id: 'MA-B', username: 'zaru50x', name: 'Master B (zaru50x)', role: 'MASTER', createdUnder: 'SuperAdmin_B', uplineUsername: 'SuperAdmin_B', status: 'Active' };
const userB1 = { id: 'USR-B1', username: 'malik250x', name: 'User B1 (malik250x)', role: 'USER', createdUnder: 'zaru50x', agentUsername: 'zaru50x', status: 'Active' };

AdminCore.repo.set('ADM_ADMINS', [company, superAdminA, adminA, superMasterA, masterA, superAdminB, masterB]);
AdminCore.repo.set('ADM_USERS', [userA1, userA2, userB1]);

function setAuth(acc) {
  localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(acc));
  localStorage.setItem('isAdminAuth', 'true');
}

// TEST 1: MASTER A (malik502x) Login
console.log('\n--- TEST 1: MASTER A (malik502x) Login ---');
setAuth(masterA);
const maDownlineUsers = AdminCore.repo.getDownlineUsernames('malik502x');
assert(maDownlineUsers.includes('User_A1') && maDownlineUsers.includes('User_A2'), "Master A downline includes User_A1 and User_A2");
assert(!maDownlineUsers.includes('malik250x'), "Master A downline MUST NOT include malik250x from Master B");

// TEST 2: SUPER MASTER A Login
console.log('\n--- TEST 2: SUPER MASTER A Login ---');
setAuth(superMasterA);
const smDownlineAdmins = AdminCore.repo.getDownlineAdmins('SuperMaster_A').map(a => a.username);
assert(smDownlineAdmins.includes('malik502x'), "Super Master A downline includes malik502x");
assert(!smDownlineAdmins.includes('zaru50x'), "Super Master A downline MUST NOT include zaru50x from Super Admin B");

// TEST 3: ADMIN A Login
console.log('\n--- TEST 3: ADMIN A Login ---');
setAuth(adminA);
const adDownlineAdmins = AdminCore.repo.getDownlineAdmins('Admin_A').map(a => a.username);
assert(adDownlineAdmins.includes('SuperMaster_A') && adDownlineAdmins.includes('malik502x'), "Admin A sees its own branch");
assert(!adDownlineAdmins.includes('SuperAdmin_B') && !adDownlineAdmins.includes('zaru50x'), "Admin A MUST NOT see SuperAdmin_B's branch");

// TEST 4: SUPER ADMIN A Login
console.log('\n--- TEST 4: SUPER ADMIN A Login ---');
setAuth(superAdminA);
const saDownlineAdmins = AdminCore.repo.getDownlineAdmins('SuperAdmin_A').map(a => a.username);
assert(saDownlineAdmins.includes('Admin_A') && saDownlineAdmins.includes('SuperMaster_A') && saDownlineAdmins.includes('malik502x'), "Super Admin A sees its own branch");
assert(!saDownlineAdmins.includes('SuperAdmin_B') && !saDownlineAdmins.includes('zaru50x'), "Super Admin A MUST NOT see SuperAdmin_B or Master B");

// TEST 5: COMPANY Login
console.log('\n--- TEST 5: COMPANY Login ---');
setAuth(company);
const compDownlineAdmins = AdminCore.repo.getDownlineAdmins('company').map(a => a.username);
assert(compDownlineAdmins.includes('SuperAdmin_A') && compDownlineAdmins.includes('SuperAdmin_B'), "Company sees all branches across platform");

// TEST 6: SEARCH Isolation
console.log('\n--- TEST 6: Search Isolation ---');
assert(!AdminCore.repo.isUserInDownline(masterA, userB1), "Search cannot find malik250x for malik502x (isUserInDownline is false)");

// TEST 7: DIRECT ACCESS Protection
console.log('\n--- TEST 7: Direct Access Protection ---');
assert(AdminCore.repo.isUserInDownline(masterA, userA1) === true, "malik502x can access User_A1");
assert(AdminCore.repo.isUserInDownline(masterA, masterB) === false, "malik502x CANNOT access Master B (zaru50x)");
assert(AdminCore.repo.isUserInDownline(masterA, superAdminB) === false, "malik502x CANNOT access SuperAdmin_B");

console.log('\n====================================================');
console.log('  ROLE-BASED DOWNLINE VISIBILITY VERIFIED 100% CLEAN');
console.log('====================================================\n');
