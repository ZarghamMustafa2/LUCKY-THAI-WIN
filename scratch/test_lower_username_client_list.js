/**
 * test_lower_username_client_list.js
 * Verification suite for Lower Username click -> opens that Super Master's own Client List.
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
console.log('  LOWER USERNAME -> CLIENT LIST WORKFLOW SUITE');
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
global.window.history = { replaceState: () => {} };
global.window.innerWidth = 1024;
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

const viewScopedMatch = adminHtml.match(/function viewScopedAccountClients\(targetUsername\) \{[\s\S]*?\n    \}/);
if (viewScopedMatch) eval(viewScopedMatch[0]);

const popNavMatch = adminHtml.match(/function popAccountNavHistory\(\) \{[\s\S]*?\n    \}/);
if (popNavMatch) eval(popNavMatch[0]);

// Seed Scenario: adil50x (Super Master) with Clients A, B, C
const company = { id: 'COMP-01', username: 'company', role: 'COMPANY', status: 'Active' };
const adil50x = { id: 'ADM-ADIL50X', username: 'adil50x', name: 'adil50x', role: 'SUPER_ADMIN', createdUnder: 'company', agentId: 'company', status: 'Active' };
const clientA = { id: 'USR-CLIENT-A', username: 'Client_A', name: 'Client A', role: 'USER', createdUnder: 'adil50x', agentId: 'adil50x', status: 'Active' };
const clientB = { id: 'USR-CLIENT-B', username: 'Client_B', name: 'Client B', role: 'USER', createdUnder: 'adil50x', agentId: 'adil50x', status: 'Active' };
const clientC = { id: 'USR-CLIENT-C', username: 'Client_C', name: 'Client C', role: 'USER', createdUnder: 'adil50x', agentId: 'adil50x', status: 'Active' };
const otherBranchUser = { id: 'USR-OTHER', username: 'Other_Branch_User', name: 'Other User', role: 'USER', createdUnder: 'Other_HQ', agentId: 'Other_HQ', status: 'Active' };

AdminCore.repo.set('ADM_ADMINS', [company, adil50x]);
AdminCore.repo.set('ADM_USERS', [clientA, clientB, clientC, otherBranchUser]);
localStorage.setItem('isAdminAuth', 'true');
localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(company));

// TEST 1: Click lower adil50x -> viewScopedAccountClients('adil50x')
console.log('\n--- TEST 1: Click lower adil50x username ---');
viewScopedAccountClients('adil50x');

assert(window.activeScopedAdmin && window.activeScopedAdmin.username === 'adil50x', "activeScopedAdmin set to adil50x");

// TEST 2: Scoped Accounts Verification
console.log('\n--- TEST 2: Scoped Accounts Verification ---');
const adilClients = AdminCore.repo.getHierarchyUsers(window.activeScopedAdmin);
assert(adilClients.some(u => u.username === 'Client_A'), "Client List includes Client_A");
assert(adilClients.some(u => u.username === 'Client_B'), "Client List includes Client_B");
assert(adilClients.some(u => u.username === 'Client_C'), "Client List includes Client_C");
assert(!adilClients.some(u => u.username === 'Other_Branch_User'), "Client List DOES NOT include Other_Branch_User");

// TEST 3: Back Button Navigation
console.log('\n--- TEST 3: Back Button Navigation ---');
popAccountNavHistory();
assert(window.activeScopedAdmin === null, "Back clears activeScopedAdmin and returns to parent list");

console.log('\n====================================================');
console.log('  LOWER USERNAME -> CLIENT LIST WORKFLOW VERIFIED 100% CLEAN');
console.log('====================================================\n');
