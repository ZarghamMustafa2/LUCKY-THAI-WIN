/**
 * test_new_hierarchy_permissions.js
 * Verification test for strict immediate-next-level + USER account creation hierarchy.
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
console.log('  STRICT ACCOUNT CREATION HIERARCHY PERMISSION TEST');
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
        classList: { add: () => {}, remove: () => {} }
      };
    }
    return domElements[id];
  },
  querySelector: (sel) => {
    if (sel.includes('input[name="newUserType"]:checked')) {
      return { value: domElements['selectedUserType'] || 'USER' };
    }
    return { value: 'USER' };
  }
};

const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v)),
  removeItem: (k) => localStorageMap.delete(k)
};
global.window = global;

let lastToastMsg = '';
global.showAdminToast = (msg, type) => {
  lastToastMsg = msg;
  console.log(`  [Toast ${type.toUpperCase()}] ${msg}`);
};

global.openModal = (id) => console.log(`  [Modal] Opened ${id}`);
global.closeModal = (id) => console.log(`  [Modal] Closed ${id}`);
global.renderUsersTable = () => {};

eval(adminEngineJs);

const roleConfigMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS & DISPLAY CONFIGURATION ───[\s\S]*?window\.getNormalizedRole = getNormalizedRole;/);
assert(roleConfigMatch !== null, "Role config extracted");
eval(roleConfigMatch[0]);

const modalScriptMatch = adminHtml.match(/function openAddUserModal\(\) \{[\s\S]*?openModal\('addUserModal'\);\s*\}[\s\S]*?function handleAddUserSubmit\(e\) \{[\s\S]*?renderUsersTable\(\);\s*\}/);
assert(modalScriptMatch !== null, "Modal handler script extracted");
eval(modalScriptMatch[0]);

// 1. COMPANY Account Checks
console.log('\n--- Test 1: COMPANY Creation Scope ---');
const companyAccount = { id: 'COMP-ROOT-01', username: 'company', role: 'COMPANY' };
localStorage.setItem('isAdminAuth', 'true');
window.AdminCore.repo.setCurrentAdmin(companyAccount);
openAddUserModal();

const compOptions = domElements['newUserTypeContainer'].innerHTML;
assert(compOptions.includes('value="SUPER_ADMIN"'), "COMPANY option 1: Super Admin present");
assert(compOptions.includes('value="USER"'), "COMPANY option 2: User present");
assert(!compOptions.includes('value="ADMIN"'), "COMPANY cannot directly create Admin");
assert(!compOptions.includes('value="SUPER_MASTER"'), "COMPANY cannot directly create Super Master");
assert(!compOptions.includes('value="MASTER"'), "COMPANY cannot directly create Master");

// Backend check: COMPANY creating ADMIN -> Rejected
domElements['newUsername'].value = 'unauth_admin';
domElements['newPassword'].value = 'Pass123!';
domElements['selectedUserType'] = 'ADMIN';
lastToastMsg = '';
handleAddUserSubmit({ preventDefault: () => {} });
assert(lastToastMsg.includes('Access Denied'), "COMPANY rejected when attempting unauthorized ADMIN creation");

// 2. SUPER ADMIN Account Checks
console.log('\n--- Test 2: SUPER ADMIN Creation Scope ---');
const superAdminAccount = { id: 'ADM-SA-01', username: 'super_admin_test', role: 'SUPER_ADMIN' };
window.AdminCore.repo.setCurrentAdmin(superAdminAccount);
openAddUserModal();

const saOptions = domElements['newUserTypeContainer'].innerHTML;
assert(saOptions.includes('value="ADMIN"'), "SUPER ADMIN option 1: Admin present");
assert(saOptions.includes('value="USER"'), "SUPER ADMIN option 2: User present");
assert(!saOptions.includes('value="SUPER_ADMIN"'), "SUPER ADMIN cannot create Super Admin");
assert(!saOptions.includes('value="SUPER_MASTER"'), "SUPER ADMIN cannot directly create Super Master");
assert(!saOptions.includes('value="MASTER"'), "SUPER ADMIN cannot directly create Master");

// Backend check: SUPER ADMIN creating MASTER -> Rejected
domElements['newUsername'].value = 'unauth_master';
domElements['newPassword'].value = 'Pass123!';
domElements['selectedUserType'] = 'MASTER';
lastToastMsg = '';
handleAddUserSubmit({ preventDefault: () => {} });
assert(lastToastMsg.includes('Access Denied'), "SUPER ADMIN rejected when attempting unauthorized MASTER creation");

// 3. ADMIN Account Checks
console.log('\n--- Test 3: ADMIN Creation Scope ---');
const adminAccount = { id: 'ADM-A-01', username: 'admin_test', role: 'ADMIN' };
window.AdminCore.repo.setCurrentAdmin(adminAccount);
openAddUserModal();

const adminOptions = domElements['newUserTypeContainer'].innerHTML;
assert(adminOptions.includes('value="SUPER_MASTER"'), "ADMIN option 1: Super Master present");
assert(adminOptions.includes('value="USER"'), "ADMIN option 2: User present");
assert(!adminOptions.includes('value="MASTER"'), "ADMIN cannot directly create Master");

// Backend check: ADMIN creating MASTER -> Rejected
domElements['selectedUserType'] = 'MASTER';
lastToastMsg = '';
handleAddUserSubmit({ preventDefault: () => {} });
assert(lastToastMsg.includes('Access Denied'), "ADMIN rejected when attempting unauthorized MASTER creation");

// 4. SUPER MASTER Account Checks
console.log('\n--- Test 4: SUPER MASTER Creation Scope ---');
const smAccount = { id: 'ADM-SM-01', username: 'sm_test', role: 'SUPER_MASTER' };
window.AdminCore.repo.setCurrentAdmin(smAccount);
openAddUserModal();

const smOptions = domElements['newUserTypeContainer'].innerHTML;
assert(smOptions.includes('value="MASTER"'), "SUPER MASTER option 1: Master present");
assert(smOptions.includes('value="USER"'), "SUPER MASTER option 2: User present");
assert(!smOptions.includes('value="SUPER_MASTER"'), "SUPER MASTER cannot create Super Master");

// 5. MASTER Account Checks
console.log('\n--- Test 5: MASTER Creation Scope ---');
const masterAccount = { id: 'ADM-M-01', username: 'master_test', role: 'MASTER' };
window.AdminCore.repo.setCurrentAdmin(masterAccount);
openAddUserModal();

const masterOptions = domElements['newUserTypeContainer'].innerHTML;
assert(masterOptions.includes('value="USER"'), "MASTER option 1: User present");
assert(!masterOptions.includes('value="MASTER"'), "MASTER cannot create Master");

// 6. USER Account Checks
console.log('\n--- Test 6: USER Creation Restriction ---');
const userAccount = { id: 'USR-01', username: 'user_test', role: 'USER' };
window.AdminCore.repo.setCurrentAdmin(userAccount);
lastToastMsg = '';
openAddUserModal();
assert(lastToastMsg.includes('Access Denied'), "USER account blocked from opening creation modal");

console.log('\n====================================================');
console.log('  NEW CREATION HIERARCHY VERIFIED 100% SUCCESS');
console.log('====================================================\n');
