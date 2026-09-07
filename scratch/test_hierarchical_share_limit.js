/**
 * test_hierarchical_share_limit.js
 * Comprehensive acceptance test suite for Hierarchical Share Limit (childShare < parentShare)
 * and Role-Based Share UI (Show for admin sub-roles, Hide for User role).
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
console.log('  HIERARCHICAL SHARE LIMIT & ROLE-BASED UI SUITE');
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
          classes: new Set(),
          add: function(c) { this.classes.add(c); },
          remove: function(c) { this.classes.delete(c); },
          contains: function(c) { return this.classes.has(c); }
        }
      };
    }
    return domElements[id];
  },
  querySelectorAll: (selector) => {
    if (selector === 'input[name="newUserType"]:checked') {
      return [global._mockCheckedRadio || { value: 'SUPER_ADMIN' }];
    }
    return [];
  },
  querySelector: (selector) => {
    if (selector === 'input[name="newUserType"]:checked') {
      return global._mockCheckedRadio || { value: 'SUPER_ADMIN' };
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

global.window = global;
global.window.innerWidth = 375;
global.showAdminToast = (msg, type) => { global._lastToast = { msg, type }; };
global.openModal = () => {};
global.closeModal = () => {};
global.renderUsersTable = () => {};

eval(adminEngineJs);

global.ROLE_CREATION_PERMISSIONS = {
  'COMPANY': ['SUPER_ADMIN', 'USER'],
  'SUPER_ADMIN': ['ADMIN', 'USER'],
  'ADMIN': ['SUPER_MASTER', 'USER'],
  'SUPER_MASTER': ['MASTER', 'USER'],
  'MASTER': ['USER'],
  'USER': []
};
global.ROLE_DISPLAY_LABELS = {
  'COMPANY': 'Company',
  'SUPER_ADMIN': 'Super Admin',
  'ADMIN': 'Admin',
  'SUPER_MASTER': 'Super Master',
  'MASTER': 'Master',
  'USER': 'User'
};

const roleConfigMatch = adminHtml.match(/function getNormalizedRole[\s\S]*?\n    \}/);
if (roleConfigMatch) eval(roleConfigMatch[0]);

const shareFnsMatch = adminHtml.match(/function updateShareFieldVisibility\(\) \{[\s\S]*?renderUsersTable\(\);\s*\}/);
if (shareFnsMatch) eval(shareFnsMatch[0]);

// Seed Accounts Hierarchy
const company = { id: 'COMP-01', username: 'company', name: 'Company HQ', role: 'COMPANY', sharePercentage: 100, status: 'Active' };
const superAdminA = { id: 'ADM-SA-A', username: 'SuperAdmin_A', name: 'Super Admin A', role: 'SUPER_ADMIN', sharePercentage: 90, createdUnder: 'company', agentId: 'company', status: 'Active' };
const adminA = { id: 'ADM-AD-A', username: 'Admin_A', name: 'Admin A', role: 'ADMIN', sharePercentage: 89, createdUnder: 'SuperAdmin_A', agentId: 'SuperAdmin_A', status: 'Active' };
const superMasterA = { id: 'ADM-SM-A', username: 'SuperMaster_A', name: 'Super Master A', role: 'SUPER_MASTER', sharePercentage: 88, createdUnder: 'Admin_A', agentId: 'Admin_A', status: 'Active' };

AdminCore.repo.set('ADM_ADMINS', [company, superAdminA, adminA, superMasterA]);
AdminCore.repo.set('ADM_USERS', []);

function setAdmin(acc) {
  localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(acc));
  localStorage.setItem('isAdminAuth', 'true');
}

// TEST 1: Company creates Super Admin -> Share field appears
console.log('\n--- TEST 1: Company selects Super Admin -> Share field VISIBLE ---');
setAdmin(company);
global._mockCheckedRadio = { value: 'SUPER_ADMIN' };
openAddUserModal();
const shareContainer = document.getElementById('newUserShareContainer');
assert(!shareContainer.classList.contains('hidden'), "Share field container is VISIBLE when SUPER_ADMIN selected");

// TEST 2: Company selects User -> Share field disappears completely
console.log('\n--- TEST 2: Company selects User -> Share field HIDDEN ---');
global._mockCheckedRadio = { value: 'USER' };
updateShareFieldVisibility();
assert(shareContainer.classList.contains('hidden'), "Share field container is HIDDEN when USER selected");

// TEST 3: Company creates Super Admin with 90% -> ALLOWED
console.log('\n--- TEST 3: Company creates Super Admin with 90% -> ALLOWED ---');
setAdmin(company);
global._mockCheckedRadio = { value: 'SUPER_ADMIN' };
document.getElementById('newUsername').value = 'Test_SuperAdmin_90';
document.getElementById('newPassword').value = 'pass123';
document.getElementById('newUserShare').value = '90';
handleAddUserSubmit({ preventDefault: () => {} });
const createdUsers = AdminCore.repo.get('ADM_USERS');
const saRecord = createdUsers.find(u => u.username === 'Test_SuperAdmin_90');
assert(saRecord && saRecord.sharePercentage === 90, "Super Admin created with 90% share");

// TEST 4: Login as Super Admin A (Share = 90%) -> Create Admin -> Try 90% -> REJECTED
console.log('\n--- TEST 4: Parent Share = 90% -> Try Child Share = 90% -> REJECTED ---');
setAdmin(superAdminA);
document.getElementById('newUsername').value = 'Test_Admin_90';
document.getElementById('newPassword').value = 'pass123';
document.getElementById('newUserShare').value = '90';
global._mockCheckedRadio = { value: 'ADMIN' };
global._lastToast = null;
handleAddUserSubmit({ preventDefault: () => {} });
assert(global._lastToast && global._lastToast.type === 'error' && global._lastToast.msg.includes('strictly lower'), "REJECTED 90% share when parent share is 90%");

// TEST 5: Try 91% -> REJECTED
console.log('\n--- TEST 5: Parent Share = 90% -> Try Child Share = 91% -> REJECTED ---');
document.getElementById('newUserShare').value = '91';
global._lastToast = null;
handleAddUserSubmit({ preventDefault: () => {} });
assert(global._lastToast && global._lastToast.type === 'error' && global._lastToast.msg.includes('strictly lower'), "REJECTED 91% share when parent share is 90%");

// TEST 6: Try 89% -> ALLOWED
console.log('\n--- TEST 6: Parent Share = 90% -> Try Child Share = 89% -> ALLOWED ---');
document.getElementById('newUsername').value = 'Test_Admin_89';
document.getElementById('newUserShare').value = '89';
handleAddUserSubmit({ preventDefault: () => {} });
const adminRecord = AdminCore.repo.get('ADM_USERS').find(u => u.username === 'Test_Admin_89');
assert(adminRecord && adminRecord.sharePercentage === 89, "Admin created with 89% share");

// TEST 7: Admin A (Share = 89%) creates Super Master -> Try 89% (REJECTED) -> Try 88% (ALLOWED)
console.log('\n--- TEST 7: Parent Share = 89% -> Try 89% (REJECTED), Try 88% (ALLOWED) ---');
setAdmin(adminA);
global._mockCheckedRadio = { value: 'SUPER_MASTER' };

// Try 89%
document.getElementById('newUsername').value = 'Test_SM_89';
document.getElementById('newUserShare').value = '89';
global._lastToast = null;
handleAddUserSubmit({ preventDefault: () => {} });
assert(global._lastToast && global._lastToast.type === 'error' && global._lastToast.msg.includes('strictly lower'), "REJECTED 89% when parent share is 89%");

// Try 88%
document.getElementById('newUsername').value = 'Test_SM_88';
document.getElementById('newUserShare').value = '88';
handleAddUserSubmit({ preventDefault: () => {} });
const smRecord = AdminCore.repo.get('ADM_USERS').find(u => u.username === 'Test_SM_88');
assert(smRecord && smRecord.sharePercentage === 88, "Super Master created with 88% share");

// TEST 8: Role Switching Dynamics
console.log('\n--- TEST 8: Role Switching (Super Admin -> User -> Super Admin) ---');
global._mockCheckedRadio = { value: 'SUPER_ADMIN' };
updateShareFieldVisibility();
assert(!shareContainer.classList.contains('hidden'), "Super Admin -> Share VISIBLE");

global._mockCheckedRadio = { value: 'USER' };
updateShareFieldVisibility();
assert(shareContainer.classList.contains('hidden'), "User -> Share HIDDEN");

global._mockCheckedRadio = { value: 'SUPER_ADMIN' };
updateShareFieldVisibility();
assert(!shareContainer.classList.contains('hidden'), "Super Admin again -> Share VISIBLE again");

console.log('\n====================================================');
console.log('  HIERARCHICAL SHARE LIMIT & ROLE-BASED UI VERIFIED 100% CLEAN');
console.log('====================================================\n');
