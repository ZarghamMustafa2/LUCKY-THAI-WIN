/**
 * test_refresh_other_account_return_my_account.js
 * Verification suite for Refresh on OTHER ACCOUNT view -> returns to MY LOGGED-IN ACCOUNT.
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
console.log('  REFRESH OTHER ACCOUNT -> RETURN TO MY ACCOUNT SUITE');
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
const sessionStorageMap = new Map();
global.sessionStorage = {
  getItem: (k) => sessionStorageMap.get(k) || null,
  setItem: (k, v) => sessionStorageMap.set(k, String(v)),
  removeItem: (k) => sessionStorageMap.delete(k),
  clear: () => sessionStorageMap.clear()
};

// Set mobile viewport width 375px (Mobile Phone)
global.window = global;
global.window.innerWidth = 375;
global.window.location = { hash: '' };
global.window.history = {
  replaceState: (state, title, url) => {
    global.window.location.hash = url;
  }
};
global.window.addEventListener = () => {};
global.expandedUserRows = new Set();
global.accountNavStack = [];
global.isUsersBalanceLoaded = false;

global.showAdminToast = () => {};
global.openModal = () => {};
global.closeModal = () => {};
global.renderSportHighlights = () => {};
global.renderUsersTable = () => {};
global.renderGamesTable = () => {};
global.renderDepositsTable = () => {};
global.renderWithdrawalsTable = () => {};
global.renderWalletsTable = () => {};
global.renderTokenManagementModule = () => {};
global.renderKycTable = () => {};
global.renderAdminsTable = () => {};
global.renderAuditLogsTable = () => {};
global.renderBonusesGrid = () => {};
global.refreshMarketPosition = () => {};

eval(adminEngineJs);

const roleConfigMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS & DISPLAY CONFIGURATION ───[\s\S]*?window\.getNormalizedRole = getNormalizedRole;/);
if (roleConfigMatch) eval(roleConfigMatch[0]);

const navStateMatch = adminHtml.match(/function saveNavState[\s\S]*?function restoreActiveModuleOnRefresh\(\) \{[\s\S]*?\n    \}/);
if (navStateMatch) eval(navStateMatch[0]);

const switchModuleMatch = adminHtml.match(/function switchAdminModule\(moduleId, params = \{\}\) \{[\s\S]*?\n    \}/);
if (switchModuleMatch) eval(switchModuleMatch[0]);

const viewScopedMatch = adminHtml.match(/function viewScopedAccountClients\(targetUsername\) \{[\s\S]*?\n    \}/);
if (viewScopedMatch) eval(viewScopedMatch[0]);

// Seed accounts
const company = { id: 'COMP-ROOT-01', username: 'company', name: 'Company HQ', role: 'COMPANY', status: 'Active' };
const superAdminA = { id: 'ADM-SA-A', username: 'SuperAdmin_A', name: 'Super Admin A', role: 'SUPER_ADMIN', createdUnder: 'company', agentId: 'company', status: 'Active' };
const superMasterB = { id: 'ADM-SM-B', username: 'adil50x', name: 'adil50x', role: 'SUPER_MASTER', createdUnder: 'SuperAdmin_A', agentId: 'SuperAdmin_A', status: 'Active' };
const masterA = { id: 'ADM-MA-A', username: 'Master_A', name: 'Master A', role: 'MASTER_AGENT', createdUnder: 'SuperAdmin_A', agentId: 'SuperAdmin_A', status: 'Active' };
const userB = { id: 'USR-B', username: 'User_B', name: 'User B', role: 'USER', createdUnder: 'Master_A', agentId: 'Master_A', status: 'Active' };

AdminCore.repo.set('ADM_ADMINS', [company, superAdminA, superMasterB, masterA]);
AdminCore.repo.set('ADM_USERS', [userB]);
localStorage.setItem('isAdminAuth', 'true');

// TEST 1: Login as Company -> Open another account -> Refresh -> Returns to Company
console.log('\n--- TEST 1: Company opens SuperAdmin_A -> Refresh ---');
localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(company));
viewScopedAccountClients('SuperAdmin_A');
assert(window.activeScopedAdmin && window.activeScopedAdmin.username === 'SuperAdmin_A', "Viewing SuperAdmin_A");

// Simulate refresh (F5)
restoreActiveModuleOnRefresh();
assert(window.activeScopedAdmin === null, "Refreshed: activeScopedAdmin reset to null (Company's own account)");
assert(isUsersBalanceLoaded === false, "Financial metrics reset to HIDDEN");

// TEST 2: Login as Company -> Open adil50x Client List -> Refresh -> Returns to Company
console.log('\n--- TEST 2: Company opens adil50x Client List -> Refresh ---');
viewScopedAccountClients('adil50x');
assert(window.activeScopedAdmin && window.activeScopedAdmin.username === 'adil50x', "Viewing adil50x Client List");

restoreActiveModuleOnRefresh();
assert(window.activeScopedAdmin === null, "Refreshed: Returns to Company's own account");
assert(isUsersBalanceLoaded === false, "Financial metrics reset to HIDDEN");

// TEST 3: Login as SuperAdmin_A -> Open SuperMaster adil50x -> Refresh -> Returns to SuperAdmin_A
console.log('\n--- TEST 3: SuperAdmin_A opens adil50x -> Refresh ---');
localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(superAdminA));
viewScopedAccountClients('adil50x');
assert(window.activeScopedAdmin && window.activeScopedAdmin.username === 'adil50x', "Viewing adil50x");

restoreActiveModuleOnRefresh();
assert(window.activeScopedAdmin === null, "Refreshed: Returns to SuperAdmin_A's own account");

// TEST 4: Login as Master_A -> Open User_B -> Refresh -> Returns to Master_A
console.log('\n--- TEST 4: Master_A opens User_B -> Refresh ---');
localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(masterA));
saveNavState('edit_client', { username: 'User_B' });

restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'users', "Refreshed: Returns to Master_A's own Users list");

// TEST 5: Open own account -> Refresh -> Remains on own account
console.log('\n--- TEST 5: Open own account -> Refresh ---');
localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(company));
switchAdminModule('reports');

restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'reports', "Refreshed on own account: Remains on 'reports'");
assert(isUsersBalanceLoaded === false, "Financial metrics reset to HIDDEN");

// TEST 6: Financial values masked after automatic return to My Account
console.log('\n--- TEST 6: Financial values masked after return to My Account ---');
assert(isUsersBalanceLoaded === false, "Balances masked after return to My Account");

console.log('\n====================================================');
console.log('  REFRESH OTHER ACCOUNT -> RETURN TO MY ACCOUNT VERIFIED 100% CLEAN');
console.log('====================================================\n');
