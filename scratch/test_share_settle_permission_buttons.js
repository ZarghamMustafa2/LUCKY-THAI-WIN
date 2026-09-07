/**
 * test_share_settle_permission_buttons.js
 * Verification suite for % (Share) and S (Settle Account) button role-based visibility.
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
console.log('  % AND S BUTTON ROLE-BASED VISIBILITY SUITE');
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
global.isUsersBalanceLoading = false;
global.expandedUserRows = new Set();
global.currentSelectedRoleFilter = 'ALL';
global.showAdminToast = (msg, type) => {};
global.openModal = () => {};
global.closeModal = () => {};

eval(adminEngineJs);

global.ROLE_CREATION_PERMISSIONS = { 'COMPANY': ['SUPER_ADMIN', 'USER'], 'SUPER_ADMIN': ['ADMIN', 'USER'], 'ADMIN': ['SUPER_MASTER', 'USER'], 'SUPER_MASTER': ['MASTER', 'USER'], 'MASTER': ['USER'], 'USER': [] };
global.ROLE_DISPLAY_LABELS = { 'COMPANY': 'Company', 'SUPER_ADMIN': 'Super Admin', 'ADMIN': 'Admin', 'SUPER_MASTER': 'Super Master', 'MASTER': 'Master', 'USER': 'User' };

const roleConfigMatch = adminHtml.match(/function getNormalizedRole[\s\S]*?\n    \}/);
if (roleConfigMatch) eval(roleConfigMatch[0]);

const renderTableMatch = adminHtml.match(/function renderUsersTable\(filterOpts = \{\}\) \{[\s\S]*?\n    \}/);
if (renderTableMatch) eval(renderTableMatch[0]);

// Seed 5 Accounts of different roles
const company = { id: 'COMP-01', username: 'company', name: 'Company HQ', role: 'COMPANY', status: 'Active' };
const superAdmin = { id: 'SA-1', username: 'SuperAdmin1', name: 'SuperAdmin1', role: 'SUPER_ADMIN', status: 'Active', createdUnder: 'company' };
const adminAcc = { id: 'AD-1', username: 'Admin1', name: 'Admin1', role: 'ADMIN', status: 'Active', createdUnder: 'company' };
const superMaster = { id: 'SM-1', username: 'SuperMaster1', name: 'SuperMaster1', role: 'SUPER_MASTER', status: 'Active', createdUnder: 'company' };
const masterAcc = { id: 'MA-1', username: 'Master1', name: 'Master1', role: 'MASTER', status: 'Active', createdUnder: 'company' };
const userAcc = { id: 'USR-1', username: 'User1', name: 'User1', role: 'USER', status: 'Active', createdUnder: 'company' };

AdminCore.repo.set('ADM_ADMINS', [company, superAdmin, adminAcc, superMaster, masterAcc]);
AdminCore.repo.set('ADM_USERS', [userAcc]);

// Set authenticated session as Company to view all 5 test accounts
localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(company));
localStorage.setItem('isAdminAuth', 'true');

renderUsersTable();

const tbody = document.getElementById('usersTableList');
const htmlOutput = tbody ? tbody.innerHTML : '';

// Helper to inspect button presence for a username
function verifyRowButtons(username, expectedShareBtn, expectedSettleBtn) {
  const rowBlocks = htmlOutput.split('</tr>');
  const targetBlock = rowBlocks.find(b => b.includes(username) && !b.includes('expanded_row'));
  assert(targetBlock !== undefined, `Main row for ${username} found in table`);

  const hasShareBtn = targetBlock.includes("openAdjustShareModal");
  const hasSettleBtn = targetBlock.includes("handleSettleAccount");

  assert(hasShareBtn === expectedShareBtn, `${username} % (Share) button presence = ${expectedShareBtn}`);
  assert(hasSettleBtn === expectedSettleBtn, `${username} S (Settle Account) button presence = ${expectedSettleBtn}`);
}

console.log('\n--- TEST 1: SUPER ADMIN Row ---');
verifyRowButtons('SuperAdmin1', true, true);

console.log('\n--- TEST 2: ADMIN Row ---');
verifyRowButtons('Admin1', true, true);

console.log('\n--- TEST 3: SUPER MASTER Row ---');
verifyRowButtons('SuperMaster1', true, true);

console.log('\n--- TEST 4: MASTER Row ---');
verifyRowButtons('Master1', true, true);

console.log('\n--- TEST 5: USER Row ---');
verifyRowButtons('User1', false, false);

console.log('\n====================================================');
console.log('  % AND S BUTTON ROLE-BASED VISIBILITY VERIFIED 100% CLEAN');
console.log('====================================================\n');
