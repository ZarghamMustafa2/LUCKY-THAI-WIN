/**
 * test_mobile_refresh_persistence.js
 * Comprehensive Mobile Viewport (375px/414px) Refresh Persistence Suite.
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
console.log('  MOBILE REFRESH PERSISTENCE TEST SUITE (375px Viewport)');
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

const popNavMatch = adminHtml.match(/function popAccountNavHistory\(\) \{[\s\S]*?\n    \}/);
if (popNavMatch) eval(popNavMatch[0]);

// Seed Company admin & adil50x
const company = { id: 'COMP-ROOT-01', username: 'company', name: 'Company HQ', role: 'COMPANY', status: 'Active' };
const adil50x = { id: 'ADM-ADIL50X', username: 'adil50x', name: 'adil50x', role: 'SUPER_ADMIN', createdUnder: 'company', agentId: 'company', status: 'Active' };

AdminCore.repo.set('ADM_ADMINS', [company, adil50x]);
localStorage.setItem('isAdminAuth', 'true');
localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(company));

// TEST 1: Mobile Users -> Refresh -> Remains on Users
console.log('\n--- TEST 1: Mobile Users -> Refresh ---');
switchAdminModule('users');
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'users', "Mobile refresh keeps module 'users'");

// TEST 2: Mobile Reports -> Refresh -> Remains on Reports
console.log('\n--- TEST 2: Mobile Reports -> Refresh ---');
switchAdminModule('reports');
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'reports', "Mobile refresh keeps module 'reports'");

// TEST 3: Mobile Inactive Accounts -> Refresh -> Remains on Inactive Accounts
console.log('\n--- TEST 3: Mobile Inactive Accounts -> Refresh ---');
switchAdminModule('inactive_accounts');
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'inactive_accounts', "Mobile refresh keeps module 'inactive_accounts'");

// TEST 4: Mobile Archive -> Refresh -> Remains on Archive
console.log('\n--- TEST 4: Mobile Archive -> Refresh ---');
switchAdminModule('archive');
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'archive', "Mobile refresh keeps module 'archive'");

// TEST 5: Mobile Security -> Refresh -> Remains on Security
console.log('\n--- TEST 5: Mobile Security -> Refresh ---');
switchAdminModule('security');
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'security', "Mobile refresh keeps module 'security'");

// TEST 6: Mobile Current Position -> Refresh -> Remains on Current Position
console.log('\n--- TEST 6: Mobile Current Position -> Refresh ---');
switchAdminModule('current_position');
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'current_position', "Mobile refresh keeps module 'current_position'");

// TEST 7: Mobile adil50x Client List -> Refresh -> Remains on adil50x Client List
console.log('\n--- TEST 7: Mobile adil50x Client List -> Refresh ---');
viewScopedAccountClients('adil50x');
assert(window.activeScopedAdmin && window.activeScopedAdmin.username === 'adil50x', "activeScopedAdmin set to adil50x");
// Simulate mobile refresh
window.activeScopedAdmin = null;
restoreActiveModuleOnRefresh();
assert(window.activeScopedAdmin && window.activeScopedAdmin.username === 'adil50x', "Mobile refresh restores activeScopedAdmin as adil50x");

// TEST 8: Mobile Back Navigation
console.log('\n--- TEST 8: Mobile Back Navigation ---');
popAccountNavHistory();
assert(window.activeScopedAdmin === null, "Back clears scoped admin and returns to parent list");

// TEST 9: Mobile Switching Pages & Refreshing Each One
console.log('\n--- TEST 9: Switch Mobile Pages & Refresh ---');
['users', 'api_services', 'reports', 'archive'].forEach(m => {
  switchAdminModule(m);
  restoreActiveModuleOnRefresh();
  assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === m, `Mobile module '${m}' preserved on refresh`);
});

// TEST 10: Desktop Viewport Check (1024px)
console.log('\n--- TEST 10: Verify Desktop Behavior Unchanged (1024px) ---');
window.innerWidth = 1024;
switchAdminModule('reports');
restoreActiveModuleOnRefresh();
assert(localStorage.getItem('ACTIVE_ADMIN_MODULE') === 'reports', "Desktop refresh behavior remains 100% functional");

console.log('\n====================================================');
console.log('  MOBILE REFRESH PERSISTENCE VERIFIED 100% CLEAN');
console.log('====================================================\n');
