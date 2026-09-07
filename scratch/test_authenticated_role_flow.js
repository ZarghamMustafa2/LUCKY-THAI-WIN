/**
 * test_authenticated_role_flow.js
 * Verification test for real authenticated role flow, dashboard header update, and creation authorization.
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
console.log('  AUTHENTICATED ACCOUNT ROLE FLOW & HEADER TEST');
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
        classList: {
          add: () => {},
          remove: () => {},
          contains: () => false
        }
      };
    }
    return domElements[id];
  },
  querySelector: () => ({ value: 'SUPER_ADMIN' })
};

const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v)),
  removeItem: (k) => localStorageMap.delete(k)
};
global.window = global;

let lastToastMsg = '';
let lastToastType = '';
global.showAdminToast = (msg, type) => {
  lastToastMsg = msg;
  lastToastType = type;
  console.log(`  [Toast] ${type.toUpperCase()}: ${msg}`);
};
global.openModal = (id) => console.log(`  [Modal] Opened ${id}`);
global.closeModal = (id) => console.log(`  [Modal] Closed ${id}`);
global.renderUsersTable = () => {};
global.applySidebarPermissions = () => {};
global.updateDashboardMetrics = () => {};

// Evaluate AdminEngine & AdminScript
eval(adminEngineJs);

const roleConfigMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS & DISPLAY CONFIGURATION ───[\s\S]*?window\.getNormalizedRole = getNormalizedRole;/);
assert(roleConfigMatch !== null, "Centralized role permissions script found");
eval(roleConfigMatch[0]);

const modalScriptMatch = adminHtml.match(/function openAddUserModal\(\) \{[\s\S]*?openModal\('addUserModal'\);\s*\}[\s\S]*?function handleAddUserSubmit\(e\) \{[\s\S]*?renderUsersTable\(\);\s*\}/);
assert(modalScriptMatch !== null, "Modal handler script found");
eval(modalScriptMatch[0]);

const updateHeaderMatch = adminHtml.match(/function updateAdminHeaderInfo\(\) \{[\s\S]*?\n    \}/);
assert(updateHeaderMatch !== null, "updateAdminHeaderInfo found");
eval(updateHeaderMatch[0]);

// 1. Database check for COMPANY
console.log('\n--- Test 1: COMPANY Account Record in Data Store ---');
const admins = window.AdminCore.repo.get('ADM_ADMINS');
const companyRecord = admins.find(a => a.username === 'company');
assert(companyRecord !== undefined, "COMPANY account exists in ADM_ADMINS");
assert(companyRecord.role === 'COMPANY', "COMPANY record role is 'COMPANY'");

// 2. Set Session as COMPANY and Verify Header
console.log('\n--- Test 2: COMPANY Login & Dashboard Header Display ---');
window.AdminCore.repo.setCurrentAdmin(companyRecord);

const activeSession = window.AdminCore.repo.getCurrentAdmin();
assert(activeSession.username === 'company', "Active session username is 'company'");
assert(activeSession.role === 'COMPANY', "Active session role is 'COMPANY'");

updateAdminHeaderInfo();
assert(domElements['topBarAdminName'].innerText === 'company', "Header name displays 'company'");
assert(domElements['topBarAdminRole'].innerText === '(Company)', "Header role displays '(Company)'");

// 3. Open Create New User Modal as COMPANY
console.log('\n--- Test 3: Create User Modal as COMPANY ---');
openAddUserModal();
assert(domElements['createUnderAgentName'].innerText === 'COMPANY', "Modal title displays 'Create New User under COMPANY'");
const compHTML = domElements['newUserTypeContainer'].innerHTML;
assert(compHTML.includes('Super Admin') && compHTML.includes('Admin') && compHTML.includes('Super Master') && compHTML.includes('Master') && compHTML.includes('User'), "All 5 creation options appear for COMPANY");

// 4. Create Sub-Account as COMPANY
console.log('\n--- Test 4: Creating Sub-Account under COMPANY ---');
domElements['newUsername'].value = 'test_sa_created';
domElements['newPassword'].value = 'Pass123!';

const mockEvent = { preventDefault: () => {} };
handleAddUserSubmit(mockEvent);

const updatedUsers = window.AdminCore.repo.get('ADM_USERS');
const createdUser = updatedUsers.find(u => u.username === 'test_sa_created');
assert(createdUser !== undefined, "New account created under COMPANY");
assert(createdUser.parentId === 'COMP-ROOT-01' || createdUser.createdBy === 'company', "New account correctly linked under COMPANY");

// 5. Test Legacy AGENT Account Isolation
console.log('\n--- Test 5: Legacy AGENT Account Isolation ---');
const agentRecord = admins.find(a => a.role === 'AGENT') || { id: 'ADM-AG-01', username: 'Apex_Agent', role: 'AGENT' };
window.AdminCore.repo.setCurrentAdmin(agentRecord);

updateAdminHeaderInfo();
assert(domElements['topBarAdminName'].innerText === 'Apex_Agent', "Header name displays 'Apex_Agent'");
assert(domElements['topBarAdminRole'].innerText === '(Agent)', "Header role displays '(Agent)'");

lastToastMsg = '';
openAddUserModal();
assert(lastToastMsg.includes('Access Denied'), "AGENT account is blocked with Access Denied toast when attempting creation");

console.log('\n====================================================');
console.log('  AUTHENTICATED ROLE FLOW FULLY VERIFIED (100%)');
console.log('====================================================\n');
