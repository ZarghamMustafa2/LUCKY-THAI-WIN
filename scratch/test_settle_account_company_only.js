/**
 * test_settle_account_company_only.js
 * Verification suite for S (Settle Account) button COMPANY-only visibility & security restrictions.
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
console.log('  S (SETTLE ACCOUNT) BUTTON COMPANY-ONLY VISIBILITY SUITE');
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

const handleSettleMatch = adminHtml.match(/function handleSettleAccount\(username\) \{[\s\S]*?\n    \}/);
if (handleSettleMatch) eval(handleSettleMatch[0]);

// Seed Accounts with downline chain: Company -> SuperAdmin1 -> Admin1 -> SuperMaster1 -> Master1 -> User1
const company = { id: 'COMP-ROOT-01', username: 'company', name: 'Company HQ', role: 'COMPANY', status: 'Active' };
const superAdmin = { id: 'SA-1', username: 'SuperAdmin1', name: 'SuperAdmin1', role: 'SUPER_ADMIN', status: 'Active', createdUnder: 'company', uplineUsername: 'company' };
const adminAcc = { id: 'AD-1', username: 'Admin1', name: 'Admin1', role: 'ADMIN', status: 'Active', createdUnder: 'SuperAdmin1', uplineUsername: 'SuperAdmin1' };
const superMaster = { id: 'SM-1', username: 'SuperMaster1', name: 'SuperMaster1', role: 'SUPER_MASTER', status: 'Active', createdUnder: 'Admin1', uplineUsername: 'Admin1' };
const masterAcc = { id: 'MA-1', username: 'Master1', name: 'Master1', role: 'MASTER', status: 'Active', createdUnder: 'SuperMaster1', uplineUsername: 'SuperMaster1' };
const userAcc = { id: 'USR-1', username: 'User1', name: 'User1', role: 'USER', status: 'Active', createdUnder: 'Master1', agentUsername: 'Master1' };

AdminCore.repo.set('ADM_ADMINS', [company, superAdmin, adminAcc, superMaster, masterAcc]);
AdminCore.repo.set('ADM_USERS', [userAcc]);

function setAuth(acc) {
  localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(acc));
  localStorage.setItem('isAdminAuth', 'true');
}

// TEST 1: COMPANY LOGIN
console.log('\n--- TEST 1: COMPANY Login ---');
setAuth(company);
renderUsersTable();
let htmlOutput = document.getElementById('usersTableList').innerHTML;
let rowBlocks = htmlOutput.split('</tr>');
let saBlock = rowBlocks.find(b => b.includes('SuperAdmin1') && !b.includes('expanded_row'));
assert(saBlock.includes('handleSettleAccount'), "COMPANY sees S (Settle Account) button");

// TEST 2: SUPER ADMIN LOGIN
console.log('\n--- TEST 2: SUPER ADMIN Login ---');
setAuth(superAdmin);
renderUsersTable();
htmlOutput = document.getElementById('usersTableList').innerHTML;
rowBlocks = htmlOutput.split('</tr>');
let adBlock = rowBlocks.find(b => b.includes('Admin1') && !b.includes('expanded_row'));
assert(!adBlock.includes('handleSettleAccount'), "SUPER ADMIN MUST NOT see S button");

// TEST 3: ADMIN LOGIN
console.log('\n--- TEST 3: ADMIN Login ---');
setAuth(adminAcc);
renderUsersTable();
htmlOutput = document.getElementById('usersTableList').innerHTML;
rowBlocks = htmlOutput.split('</tr>');
let smBlock = rowBlocks.find(b => b.includes('SuperMaster1') && !b.includes('expanded_row'));
assert(!smBlock.includes('handleSettleAccount'), "ADMIN MUST NOT see S button");

// TEST 4: SUPER MASTER LOGIN
console.log('\n--- TEST 4: SUPER MASTER Login ---');
setAuth(superMaster);
renderUsersTable();
htmlOutput = document.getElementById('usersTableList').innerHTML;
rowBlocks = htmlOutput.split('</tr>');
let maBlock = rowBlocks.find(b => b.includes('Master1') && !b.includes('expanded_row'));
assert(!maBlock.includes('handleSettleAccount'), "SUPER MASTER MUST NOT see S button");

// TEST 5: MASTER LOGIN
console.log('\n--- TEST 5: MASTER Login ---');
setAuth(masterAcc);
renderUsersTable();
htmlOutput = document.getElementById('usersTableList').innerHTML;
rowBlocks = htmlOutput.split('</tr>');
let usrBlock = rowBlocks.find(b => b.includes('User1') && !b.includes('expanded_row'));
assert(!usrBlock.includes('handleSettleAccount'), "MASTER MUST NOT see S button");

// TEST 6: SECURITY / DIRECT ACTION AUTHORIZATION
console.log('\n--- TEST 6: Direct Action Permission Protection ---');
setAuth(superAdmin);
global._lastToast = null;
handleSettleAccount('Admin1');
assert(global._lastToast && global._lastToast.msg.includes("Access Denied"), "Direct call to handleSettleAccount rejected for Super Admin");

console.log('\n====================================================');
console.log('  S BUTTON COMPANY-ONLY VERIFIED 100% CLEAN');
console.log('====================================================\n');
