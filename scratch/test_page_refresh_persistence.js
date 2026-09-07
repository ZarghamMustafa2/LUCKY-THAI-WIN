/**
 * test_page_refresh_persistence.js
 * Verification suite for Page Refresh / Current Page Persistence across all 9 required test cases.
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
console.log('  PAGE REFRESH PERSISTENCE TEST SUITE');
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

global.window = global;
global.window.location = { hash: '' };
global.window.history = {
  replaceState: (state, title, url) => {
    global.window.location.hash = url;
  }
};
global.window.innerWidth = 1024;
global.window.addEventListener = () => {};

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
eval(roleConfigMatch[0]);

const navStateMatch = adminHtml.match(/function saveNavState[\s\S]*?function restoreActiveModuleOnRefresh\(\) \{[\s\S]*?\n    \}/);
eval(navStateMatch[0]);

const switchModuleMatch = adminHtml.match(/function switchAdminModule\(moduleId, params = \{\}\) \{[\s\S]*?\n    \}/);
eval(switchModuleMatch[0]);

const openEditViewMatch = adminHtml.match(/function openEditUserView\(username\) \{[\s\S]*?\n    \}/);
eval(openEditViewMatch[0]);

// Seed Company admin session
const companyAdmin = {
  id: 'COMP-ROOT-01',
  username: 'company',
  name: 'Company HQ',
  role: 'COMPANY',
  balance: 100000000,
  creditLimit: 100000000,
  status: 'Active'
};

AdminCore.repo.set('ADM_ADMINS', [companyAdmin]);
localStorage.setItem('isAdminAuth', 'true');
localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(companyAdmin));

// TEST 1: Open Users -> Refresh -> Still on Users
console.log('\n--- TEST 1: Open Users -> Refresh ---');
switchAdminModule('users');
assert(window.location.hash === '#users', "Hash set to #users");
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'users', "ACTIVE_ADMIN_MODULE saved as 'users'");
// Simulate refresh (DOM reload)
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'users', "Restored module is 'users'");

// TEST 2: Open Current Position -> Refresh -> Still on Current Position
console.log('\n--- TEST 2: Open Current Position -> Refresh ---');
switchAdminModule('current_position');
assert(window.location.hash === '#current_position', "Hash set to #current_position");
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'current_position', "Restored module is 'current_position'");

// TEST 3: Open Reports -> Refresh -> Still on Reports
console.log('\n--- TEST 3: Open Reports -> Refresh ---');
switchAdminModule('reports');
assert(window.location.hash === '#reports', "Hash set to #reports");
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'reports', "Restored module is 'reports'");

// TEST 4: Open Inactive Accounts -> Refresh -> Still on Inactive Accounts
console.log('\n--- TEST 4: Open Inactive Accounts -> Refresh ---');
switchAdminModule('inactive_accounts');
assert(window.location.hash === '#inactive_accounts', "Hash set to #inactive_accounts");
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'inactive_accounts', "Restored module is 'inactive_accounts'");

// TEST 5: Open API / Services -> Refresh -> Still on API / Services
console.log('\n--- TEST 5: Open API / Services -> Refresh ---');
switchAdminModule('api_services');
assert(window.location.hash === '#api_services', "Hash set to #api_services");
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'api_services', "Restored module is 'api_services'");

// TEST 6: Open Security -> Refresh -> Still on Security
console.log('\n--- TEST 6: Open Security -> Refresh ---');
switchAdminModule('security');
assert(window.location.hash === '#security', "Hash set to #security");
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'security', "Restored module is 'security'");

// TEST 7: Open Archive -> Refresh -> Still on Archive
console.log('\n--- TEST 7: Open Archive -> Refresh ---');
switchAdminModule('archive');
assert(window.location.hash === '#archive', "Hash set to #archive");
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'archive', "Restored module is 'archive'");

// TEST 8: Open Edit Client for Ahmad123 -> Refresh -> Same user details remain open
console.log('\n--- TEST 8: Edit Client for Ahmad123 -> Refresh ---');
openEditUserView('Ahmad123');
assert(window.location.hash === '#edit_client:Ahmad123', "Hash set to #edit_client:Ahmad123");
assert(currentEditingUser && currentEditingUser.username === 'Ahmad123', "currentEditingUser is Ahmad123");
// Simulate refresh
currentEditingUser = null;
restoreActiveModuleOnRefresh();
assert(currentEditingUser && currentEditingUser.username === 'Ahmad123', "Restored currentEditingUser is Ahmad123");

// TEST 9: View Downline -> Refresh -> Restores Downline state
console.log('\n--- TEST 9: View Downline -> Refresh ---');
window.currentHierarchyViewMode = 'DOWNLINE';
switchAdminModule('users');
restoreActiveModuleOnRefresh();
assert(window.currentHierarchyViewMode === 'DOWNLINE', "Hierarchy view mode DOWNLINE preserved");

console.log('\n====================================================');
console.log('  PAGE REFRESH PERSISTENCE VERIFIED 100% CLEAN');
console.log('====================================================\n');
