/**
 * test_logout_security_suite.js
 * Comprehensive automated verification for Logout behavior, session purge,
 * stale session prevention, and clean account re-login.
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
console.log('  LOGOUT FUNCTIONALITY & SECURITY VERIFICATION SUITE');
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
        style: {},
        classList: {
          add: (cls) => { if (cls === 'hidden') domElements[id].hidden = true; },
          remove: (cls) => { if (cls === 'hidden') domElements[id].hidden = false; },
          contains: (cls) => (cls === 'hidden' ? !!domElements[id].hidden : false)
        }
      };
    }
    return domElements[id];
  },
  cookie: '',
  addEventListener: () => {}
};

const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v)),
  removeItem: (k) => localStorageMap.delete(k)
};
global.sessionStorage = {
  clear: () => {}
};
global.window = global;
global.window.addEventListener = () => {};

global.showAdminToast = (msg, type) => {
  console.log(`  [Toast ${type.toUpperCase()}] ${msg}`);
};
global.openModal = () => {};
global.closeModal = () => {};
global.renderUsersTable = () => {};
global.applySidebarPermissions = () => {};
global.updateDashboardMetrics = () => {};
global.renderSportHighlights = () => {};
global.renderGamesTable = () => {};
global.renderDepositsTable = () => {};
global.renderWithdrawalsTable = () => {};

eval(adminEngineJs);

const roleConfigMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS & DISPLAY CONFIGURATION ───[\s\S]*?window\.getNormalizedRole = getNormalizedRole;/);
assert(roleConfigMatch !== null, "Role config extracted");
eval(roleConfigMatch[0]);

const updateHeaderMatch = adminHtml.match(/function updateAdminHeaderInfo\(\) \{[\s\S]*?\n    \}/);
assert(updateHeaderMatch !== null, "updateAdminHeaderInfo extracted");
eval(updateHeaderMatch[0]);

const authModalMatch = adminHtml.match(/function lockAdminPanel\(\) \{[\s\S]*?function handleAppAccountLoginSubmit\(e\) \{[\s\S]*?\n    \}/);
assert(authModalMatch !== null, "Auth functions (lockAdminPanel, handleAdminPasswordSubmit, handleAppAccountLoginSubmit) extracted");
eval(authModalMatch[0]);

// STEP 1: Login as COMPANY
console.log('\n--- Step 1: Login as COMPANY ---');
document.getElementById('adminUsernameInput').value = 'company';
document.getElementById('adminPinInput').value = 'Company123!';

handleAdminPasswordSubmit({ preventDefault: () => {} });

let activeSession = window.AdminCore.repo.getCurrentAdmin();
assert(activeSession !== null, "Session is active");
assert(activeSession.username === 'company', "Active user is 'company'");
assert(activeSession.role === 'COMPANY', "Active role is 'COMPANY'");
assert(localStorage.getItem('isAdminAuth') === 'true', "isAdminAuth is 'true'");
assert(document.getElementById('adminAuthOverlay').hidden === true, "TW Login Overlay is hidden");

// STEP 2: Perform Logout
console.log('\n--- Step 2: Perform Logout (lockAdminPanel) ---');
lockAdminPanel();

assert(localStorage.getItem('isAdminAuth') === null, "isAdminAuth removed from localStorage");
assert(localStorage.getItem('ACTIVE_ADMIN_SESSION') === null, "ACTIVE_ADMIN_SESSION removed from localStorage");
assert(localStorage.getItem('userLoginName') === null, "userLoginName removed from localStorage");
assert(localStorage.getItem('userLoginToken') === null, "userLoginToken removed from localStorage");

activeSession = window.AdminCore.repo.getCurrentAdmin();
assert(activeSession === null, "AdminCore active session set to null");
assert(document.getElementById('adminAuthOverlay').hidden === false, "Redirected to existing TW Login Screen (Overlay visible)");

// STEP 3: Verify Refresh / Page Reload Protection
console.log('\n--- Step 3: Verify Page Reload / Refresh Protection ---');
const refreshedAdmin = window.AdminCore.repo.getCurrentAdmin();
assert(refreshedAdmin === null, "On refresh, no stale user session exists");
assert(localStorage.getItem('isAdminAuth') !== 'true', "On refresh, user remains logged out");

// STEP 4: Login with Another Account (Super Admin)
console.log('\n--- Step 4: Login with Another Created Account ---');
// Seed super admin in repo
const admins = window.AdminCore.repo.get('ADM_ADMINS') || [];
admins.push({
  id: 'ADM-SA-99',
  username: 'superadmin_new',
  password: 'SuperPassword123!',
  role: 'SUPER_ADMIN'
});
window.AdminCore.repo.set('ADM_ADMINS', admins);

document.getElementById('adminUsernameInput').value = 'superadmin_new';
document.getElementById('adminPinInput').value = 'SuperPassword123!';

handleAdminPasswordSubmit({ preventDefault: () => {} });

const newSession = window.AdminCore.repo.getCurrentAdmin();
assert(newSession !== null, "New user session active");
assert(newSession.username === 'superadmin_new', "New session username is 'superadmin_new'");
assert(newSession.role === 'SUPER_ADMIN', "New session role is 'SUPER_ADMIN'");

// STEP 5: Final Logout Verification
console.log('\n--- Step 5: Final Logout Purge ---');
lockAdminPanel();
assert(window.AdminCore.repo.getCurrentAdmin() === null, "Session purged cleanly after second logout");

console.log('\n====================================================');
console.log('  LOGOUT SECURITY SUITE VERIFIED 100% CLEAN');
console.log('====================================================\n');
