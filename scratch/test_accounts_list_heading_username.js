/**
 * test_accounts_list_heading_username.js
 * Verification suite for Dynamic Accounts List Heading Username:
 * 1. malik209x (Super Master) -> "malik209x - Accounts List"
 * 2. admin123 (Admin) -> "admin123 - Accounts List"
 * 3. company (Company) -> "company - Accounts List"
 * 4. sa_alpha (Super Admin) -> "sa_alpha - Accounts List"
 * 5. Top-right header username and Accounts List heading are 100% matched
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
console.log('  ACCOUNTS LIST HEADING USERNAME SUITE');
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

// BUILD TEST ACCOUNTS
const company = { id: 'COMP-ROOT-01', username: 'company', role: 'COMPANY' };
const sa = { id: 'ADM-101', username: 'sa_alpha', role: 'SUPER_ADMIN', parentId: 'company' };
const adminAcc = { id: 'ADM-201', username: 'admin123', role: 'ADMIN', parentId: 'sa_alpha' };
const malik = { id: 'ADM-301', username: 'malik209x', role: 'SUPER_MASTER', parentId: 'admin123' };

window.AdminCore.repo.set('ADM_ADMINS', [company, sa, adminAcc, malik]);
window.AdminCore.repo.set('ADM_USERS', [company, sa, adminAcc, malik]);

function verifyHeadingMatch(accountObj, expectedTitle) {
  console.log(`\n--- Test Account: ${accountObj.username} (${accountObj.role}) ---`);
  localStorage.setItem('isAdminAuth', 'true');
  initializeCentralizedSession(accountObj);

  const headerUsername = document.getElementById('topBarAdminName').innerText;
  const headingText = document.getElementById('usersClientsListTitle').innerText;

  console.log(`  Top-Right Header Username: "${headerUsername}"`);
  console.log(`  Accounts List Heading:    "${headingText}"`);

  assert(headerUsername === accountObj.username, `Top header shows exact username: ${accountObj.username}`);
  assert(headingText === expectedTitle, `Heading shows exact title: "${expectedTitle}"`);
  assert(!headingText.includes('Ahmad5050x'), "Heading does NOT contain hardcoded/stale Ahmad5050x");
}

verifyHeadingMatch(malik, 'malik209x - Accounts List');
verifyHeadingMatch(adminAcc, 'admin123 - Accounts List');
verifyHeadingMatch(company, 'company - Accounts List');
verifyHeadingMatch(sa, 'sa_alpha - Accounts List');

console.log('\n====================================================');
console.log('  ACCOUNTS LIST HEADING USERNAME VERIFIED 100% CLEAN');
console.log('====================================================\n');
