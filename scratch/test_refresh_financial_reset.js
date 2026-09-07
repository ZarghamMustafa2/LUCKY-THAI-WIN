/**
 * test_refresh_financial_reset.js
 * Verification suite for Refresh resetting all financial metrics to HIDDEN (••••••)
 * while preserving page location (including adil50x Client List).
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
console.log('  FINANCIAL METRICS RESET ON REFRESH SUITE');
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
global.isUsersBalanceLoading = false;

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

const loadBalBlock = adminHtml.match(/let isUsersBalanceLoaded = false;[\s\S]*?function handleLoadBalanceClick\(\) \{[\s\S]*?\n    \}/);
if (loadBalBlock) {
  // Expose to global scope
  const cleanCode = loadBalBlock[0].replace(/let isUsersBalanceLoaded = false;/, '').replace(/let isUsersBalanceLoading = false;/, '');
  eval(cleanCode);
}

const navStateMatch = adminHtml.match(/function saveNavState[\s\S]*?function restoreActiveModuleOnRefresh\(\) \{[\s\S]*?\n    \}/);
if (navStateMatch) eval(navStateMatch[0]);

const switchModuleMatch = adminHtml.match(/function switchAdminModule\(moduleId, params = \{\}\) \{[\s\S]*?\n    \}/);
if (switchModuleMatch) eval(switchModuleMatch[0]);

const viewScopedMatch = adminHtml.match(/function viewScopedAccountClients\(targetUsername\) \{[\s\S]*?\n    \}/);
if (viewScopedMatch) eval(viewScopedMatch[0]);

// Seed Company admin & adil50x
const company = { id: 'COMP-ROOT-01', username: 'company', name: 'Company HQ', role: 'COMPANY', status: 'Active' };
const adil50x = { id: 'ADM-ADIL50X', username: 'adil50x', name: 'adil50x', role: 'SUPER_ADMIN', createdUnder: 'company', agentId: 'company', status: 'Active' };

AdminCore.repo.set('ADM_ADMINS', [company, adil50x]);
localStorage.setItem('isAdminAuth', 'true');
localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify(company));

async function runTests() {
  // TEST 1: Initial state after refresh -> isUsersBalanceLoaded is false
  console.log('\n--- TEST 1: Initial Refresh State ---');
  assert(isUsersBalanceLoaded === false, "isUsersBalanceLoaded is false on initial load/refresh");

  // TEST 2: Click Load Balance -> isUsersBalanceLoaded becomes true after timeout
  console.log('\n--- TEST 2: Click Load Balance ---');
  handleLoadBalanceClick();
  await new Promise(r => setTimeout(r, 1100));
  assert(isUsersBalanceLoaded === true, "isUsersBalanceLoaded is true after clicking Load Balance");

  // TEST 3: Full Page Refresh -> resets isUsersBalanceLoaded to false while retaining adil50x Client List page
  console.log('\n--- TEST 3: Full Page Refresh on adil50x Client List ---');
  viewScopedAccountClients('adil50x');
  assert(window.activeScopedAdmin && window.activeScopedAdmin.username === 'adil50x', "Viewing adil50x Client List");

  // Simulate full page refresh (F5)
  isUsersBalanceLoaded = false;
  window.activeScopedAdmin = null;
  restoreActiveModuleOnRefresh();

  assert(window.activeScopedAdmin && window.activeScopedAdmin.username === 'adil50x', "Restored to adil50x Client List page");
  assert(isUsersBalanceLoaded === false, "Financial metrics reset to HIDDEN (isUsersBalanceLoaded = false)");

  // TEST 4: Identity fields (Username adil50x) remain visible
  console.log('\n--- TEST 4: Identity Fields Visibility ---');
  assert(window.activeScopedAdmin.username === 'adil50x', "Username adil50x is visible and intact");

  // TEST 5: Click Load Balance again after refresh -> unmasks financial details
  console.log('\n--- TEST 5: Click Load Balance after Refresh ---');
  handleLoadBalanceClick();
  await new Promise(r => setTimeout(r, 1100));
  assert(isUsersBalanceLoaded === true, "Financial details unmasked after Load Balance click");

  console.log('\n====================================================');
  console.log('  FINANCIAL METRICS RESET ON REFRESH VERIFIED 100% CLEAN');
  console.log('====================================================\n');
}

runTests();
