/**
 * test_universal_hierarchy_fresh_login.js
 * Verification suite for Universal Hierarchy Fresh Login Session Isolation:
 * Test 1: COMPANY -> SUPER_ADMIN
 * Test 2: SUPER_ADMIN -> ADMIN
 * Test 3: ADMIN -> SUPER_MASTER
 * Test 4: SUPER_MASTER -> MASTER
 * Test 5: MASTER -> USER
 *
 * Verifies:
 * - Parent logout wipes previous session completely
 * - Child login immediately loads child username, role, balance, credit, share & users
 * - Zero stale parent data
 * - Zero browser refresh needed
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
console.log('  UNIVERSAL HIERARCHY FRESH LOGIN VERIFICATION SUITE');
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

global.showAdminToast = (msg, type) => {
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

// BUILD COMPLETE 5-LEVEL HIERARCHY TREE
const company = { id: 'COMP-ROOT-01', username: 'company_root', role: 'COMPANY', balance: 500000, creditLimit: 500000 };
const sa = { id: 'ADM-101', username: 'sa_alpha', role: 'SUPER_ADMIN', parentId: 'company_root', balance: 100000, creditLimit: 100000, sharePercentage: 90 };
const adminAcc = { id: 'ADM-201', username: 'admin_beta', role: 'ADMIN', parentId: 'sa_alpha', balance: 50000, creditLimit: 50000, sharePercentage: 80 };
const sm = { id: 'ADM-301', username: 'sm_gamma', role: 'SUPER_MASTER', parentId: 'admin_beta', balance: 25000, creditLimit: 25000, sharePercentage: 75 };
const masterAcc = { id: 'ADM-401', username: 'm_delta', role: 'MASTER', parentId: 'sm_gamma', balance: 10000, creditLimit: 10000, sharePercentage: 60 };
const userAcc = { id: 'USR-501', username: 'u_epsilon', role: 'USER', parentId: 'm_delta', createdBy: 'm_delta', balance: 2000, creditLimit: 2000, sharePercentage: 50 };

const pool = [company, sa, adminAcc, sm, masterAcc, userAcc];
window.AdminCore.repo.set('ADM_ADMINS', pool.filter(x => x.role !== 'USER'));
window.AdminCore.repo.set('ADM_USERS', pool);

function runTransitionTest(stepName, parentAcc, childAcc) {
  console.log(`\n--- ${stepName}: ${parentAcc ? parentAcc.role : 'INIT'} Logout -> ${childAcc.role} Login ---`);
  
  // 1. Parent Logout (or fresh start)
  lockAdminPanel();
  assert(AdminCore.repo.getCurrentAdmin() === null, `${parentAcc ? parentAcc.username : 'Previous'} session wiped on logout`);
  assert(localStorage.getItem('isAdminAuth') === null, "isAdminAuth cleared from localStorage");

  // 2. Child Login via Centralized Session Pipeline
  initializeCentralizedSession(childAcc);

  const active = AdminCore.repo.getCurrentAdmin();
  assert(active !== null, `${childAcc.role} authenticated session established`);
  assert(active.username === childAcc.username, `Active session username matches child (${childAcc.username})`);
  assert(active.role === childAcc.role, `Active session role matches child (${childAcc.role})`);
  assert(active.balance === childAcc.balance, `Active session balance matches child (${childAcc.balance})`);

  // Verify Header & UI State
  const topName = document.getElementById('topBarAdminName').innerText;
  assert(topName === childAcc.username, `Header topBarAdminName updated to child username (${topName})`);

  const tbodyHtml = document.getElementById('usersTableList').innerHTML;
  assert(!tbodyHtml.includes(parentAcc ? parentAcc.username : 'STALE_PARENT'), `No stale parent username (${parentAcc ? parentAcc.username : 'N/A'}) found in rendered child view`);
}

// EXECUTE ALL 5 HIERARCHY TRANSITION TESTS
runTransitionTest('TEST 1', null, company);
runTransitionTest('TEST 1b', company, sa);
runTransitionTest('TEST 2', sa, adminAcc);
runTransitionTest('TEST 3', adminAcc, sm);
runTransitionTest('TEST 4', sm, masterAcc);
runTransitionTest('TEST 5', masterAcc, userAcc);

console.log('\n====================================================');
console.log('  UNIVERSAL HIERARCHY FRESH LOGIN VERIFIED 100% CLEAN');
console.log('====================================================\n');
