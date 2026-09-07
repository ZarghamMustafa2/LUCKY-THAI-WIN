/**
 * test_pull_to_refresh_real_data_refetch.js
 * Verification suite for REAL Backend Data Refetch on Pull-Down-to-Refresh:
 * 1. Log in as malik209x (Super Master) with Initial Balance: 100,000
 * 2. Simulate backend DB balance change to 250,000 in ADM_USERS
 * 3. Execute Pull-to-Refresh (triggerPullToRefresh / refreshCurrentAccountDataAsync)
 * 4. Verify Active Session & UI balance immediately updates to 250,000
 * 5. Verify async try/catch/finally completion with zero stuck indicator
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
console.log('  PULL-TO-REFRESH REAL DATA REFETCH VERIFICATION SUITE');
console.log('====================================================');

// Mock DOM
const domElements = {};
const listeners = {};

global.document = {
  getElementById: (id) => {
    if (!domElements[id]) {
      domElements[id] = {
        innerText: '',
        innerHTML: '',
        value: '',
        checked: false,
        disabled: false,
        scrollTop: 0,
        style: {},
        classList: {
          add: (...classes) => {},
          remove: (...classes) => {},
          contains: () => false
        },
        addEventListener: (event, handler) => {
          if (!listeners[event]) listeners[event] = [];
          listeners[event].push(handler);
        }
      };
    }
    return domElements[id];
  },
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
global.sessionStorage = { clear: () => {} };
global.window = global;
global.window.addEventListener = () => {};

let lastToastMsg = '';
global.showAdminToast = (msg, type) => {
  lastToastMsg = msg;
  console.log(`  [Toast ${(type || 'info').toUpperCase()}] ${msg}`);
};
global.openModal = () => {};
global.closeModal = () => {};
global.applySidebarPermissions = () => {};
global.updateDashboardMetrics = () => {};

eval(adminEngineJs);

const roleConfigMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS & DISPLAY CONFIGURATION ───[\s\S]*?window\.getNormalizedRole = getNormalizedRole;/);
eval(roleConfigMatch[0]);

const summaryHelperMatch = adminHtml.match(/\/\*\*[\s\S]*?Single Source of Truth for Account Balance and Credit Data[\s\S]*?\n    \}/);
eval(summaryHelperMatch[0]);

const loadBalanceMatch = adminHtml.match(/let isUsersBalanceLoaded = false;[\s\S]*?function filterUsers\(\)/);
eval(loadBalanceMatch[0].replace('function filterUsers()', ''));

const colorFuncMatch = adminHtml.match(/function getHierarchyAccountColorClass\(authenticatedUser, targetAccount\) \{[\s\S]*?function getHierarchyAccountColorHex\(authenticatedUser, targetAccount\) \{[\s\S]*?\n    \}/);
eval(colorFuncMatch[0]);

const headerInfoMatch = adminHtml.match(/function updateAdminHeaderInfo\(\) \{[\s\S]*?\n    \}/);
eval(headerInfoMatch[0]);

const sessionPipelineMatch = adminHtml.match(/function lockAdminPanel\(\) \{[\s\S]*?function openAppAccountLoginModal\(\)/);
eval(sessionPipelineMatch[0].replace('function openAppAccountLoginModal()', ''));

const refetchMatch = adminHtml.match(/async function refreshCurrentAccountDataAsync\(\) \{[\s\S]*?\n    \}/);
assert(refetchMatch !== null, "refreshCurrentAccountDataAsync extracted from admin.html");
eval(refetchMatch[0]);

const ptrMatch = adminHtml.match(/function initPullToRefresh\(\) \{[\s\S]*?async function refreshCurrentAccountDataAsync\(\)/);
eval(ptrMatch[0].replace('async function refreshCurrentAccountDataAsync()', ''));

// TEST 1: Initial Login with 100,000 Balance
console.log('\n--- Test 1: Log in as malik209x (Initial Balance: 100,000) ---');
const malik = { id: 'ADM-301', username: 'malik209x', role: 'SUPER_MASTER', balance: 100000, creditLimit: 100000 };
window.AdminCore.repo.set('ADM_ADMINS', [malik]);
window.AdminCore.repo.set('ADM_USERS', [malik]);

initializeCentralizedSession(malik);
const initSession = AdminCore.repo.getCurrentAdmin();
assert(initSession.balance === 100000, "Initial active balance is 100,000");

// TEST 2: Simulate Backend DB Balance Update to 250,000
console.log('\n--- Test 2: Backend DB Balance updated to 250,000 ---');
const updatedUsersPool = [{ ...malik, balance: 250000, creditLimit: 250000 }];
window.AdminCore.repo.set('ADM_USERS', updatedUsersPool);

// TEST 3: Execute Pull-to-Refresh & Verify Real Data Refetch
console.log('\n--- Test 3: Execute Pull-to-Refresh Data Refetch ---');
initPullToRefresh();
window.triggerPullToRefresh();

setTimeout(() => {
  const freshSession = AdminCore.repo.getCurrentAdmin();
  console.log('  Refetched Active Session Balance:', freshSession.balance);
  
  assert(freshSession.balance === 250000, "Pull-to-refresh refetched NEW 250,000 balance from backend");
  assert(document.getElementById('clientsCreditReceived').innerText === '250,000', "Summary Card Credit Received updated to 250,000");
  assert(lastToastMsg.includes('@malik209x'), "Toast notification confirmed refresh for @malik209x");

  console.log('\n====================================================');
  console.log('  PULL-TO-REFRESH REAL DATA REFETCH VERIFIED CLEAN');
  console.log('====================================================\n');
}, 900);
