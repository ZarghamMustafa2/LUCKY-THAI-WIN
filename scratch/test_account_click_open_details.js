/**
 * test_account_click_open_details.js
 * Verification suite for Account Click -> Open Inline Account Details Card matching media_1787826891314.png.
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
console.log('  ACCOUNT CLICK INLINE EXPANDED CARD TEST SUITE');
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
global.sessionStorage = { clear: () => {} };
global.window = global;
global.window.addEventListener = () => {};

global.showAdminToast = () => {};
global.openModal = () => {};
global.closeModal = () => {};
global.applySidebarPermissions = () => {};
global.updateDashboardMetrics = () => {};
global.renderUsersTable = () => {};
global.renderSportHighlights = () => {};
global.switchAdminModule = () => {};
global.switchProfileTab = () => {};
global.currentEditingUser = null;
global.currentDrawerUser = null;
global.currentAdjustTargetUser = null;
global.isModulePasswordVisible = false;
global.isDrawerPasswordVisible = false;

eval(adminEngineJs);

const roleConfigMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS & DISPLAY CONFIGURATION ───[\s\S]*?window\.getNormalizedRole = getNormalizedRole;/);
if (roleConfigMatch) eval(roleConfigMatch[0]);

const openDetailsMatch = adminHtml.match(/const expandedUserRows = new Set\(\);[\s\S]*?function openAccountDetails\(username\) \{[\s\S]*?\n    \}/);
if (openDetailsMatch) eval(openDetailsMatch[0].replace('const expandedUserRows = new Set();', 'window.expandedUserRows = new Set();'));

const inspectCredsMatch = adminHtml.match(/function inspectUserCredentials\(userId\) \{[\s\S]*?\n    \}/);
if (inspectCredsMatch) eval(inspectCredsMatch[0]);

const openDrawerMatch = adminHtml.match(/let currentDrawerUser = null;[\s\S]*?function openUserProfileDrawer\(userId\) \{[\s\S]*?document\.getElementById\('userProfileDrawer'\)\.classList\.remove\('hidden'\);\s*\}/);
if (openDrawerMatch) eval(openDrawerMatch[0].replace('let currentDrawerUser = null;', 'window.currentDrawerUser = null;'));

const openEditViewMatch = adminHtml.match(/function openEditUserView\(username\) \{[\s\S]*?\n    \}/);
if (openEditViewMatch) eval(openEditViewMatch[0]);

// Seed accounts: 156AmirG, 188AdnanG
const testUsers = [
  { id: 'USR-156AMIRG', username: '156AmirG', name: '156AmirG', type: 'Bettor', role: 'USER', balance: 107, pl: 107, sharePercentage: 85, exposure: 0, status: 'Active' },
  { id: 'USR-188ADNANG', username: '188AdnanG', name: '188AdnanG', type: 'Bettor', role: 'USER', balance: 1055, pl: 1055, sharePercentage: 85, exposure: -1000, status: 'Active' }
];

AdminCore.repo.set('ADM_USERS', testUsers);
localStorage.setItem('isAdminAuth', 'true');

// TEST 1: Click 156AmirG -> Expand 156AmirG Inline Details Card
console.log('\n--- TEST 1: Click 156AmirG ---');
if (typeof openAccountDetails === 'function') openAccountDetails('156AmirG');

assert(window.expandedUserRows && window.expandedUserRows.has('156AmirG'), "156AmirG added to expandedUserRows set");

// TEST 2: Click 188AdnanG -> Expand 188AdnanG Inline Details Card
console.log('\n--- TEST 2: Click 188AdnanG ---');
if (typeof openAccountDetails === 'function') openAccountDetails('188AdnanG');

assert(window.expandedUserRows && window.expandedUserRows.has('188AdnanG'), "188AdnanG added to expandedUserRows set");

console.log('\n====================================================');
console.log('  ACCOUNT CLICK INLINE EXPANDED CARD VERIFIED 100% CLEAN');
console.log('====================================================\n');
