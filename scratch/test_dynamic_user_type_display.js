/**
 * test_dynamic_user_type_display.js
 * Verification script for dynamic account role/type column rendering in users table.
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
console.log('  DYNAMIC USERS TABLE TYPE COLUMN VERIFICATION');
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
        classList: { add: () => {}, remove: () => {} }
      };
    }
    return domElements[id];
  }
};

const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v)),
  removeItem: (k) => localStorageMap.delete(k)
};
global.window = global;
global.isUsersBalanceLoaded = true;
global.isUsersBalanceLoading = false;

// Evaluate Engine & Centralized Role Config
eval(adminEngineJs);

const roleConfigMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS & DISPLAY CONFIGURATION ───[\s\S]*?window\.getNormalizedRole = getNormalizedRole;/);
assert(roleConfigMatch !== null, "Role config extracted");
eval(roleConfigMatch[0]);

const renderTableMatch = adminHtml.match(/function renderUsersTable\(filterOpts = \{\}\) \{[\s\S]*?renderUsersTable/);
const renderTableBody = adminHtml.match(/function renderUsersTable\(filterOpts = \{\}\) \{[\s\S]*?tbody\.innerHTML = users\.map\(u => \{[\s\S]*?\n    \}/);
assert(renderTableBody !== null, "renderUsersTable function extracted");
eval(renderTableBody[0]);

// Seed COMPANY admin session
const companyAdmin = { id: 'COMP-ROOT-01', username: 'company', role: 'COMPANY', companyId: 'COMP-01' };
window.AdminCore.repo.setCurrentAdmin(companyAdmin);

// Seed test users: malik (Admin), sa_user (Super Admin), sm_user (Super Master), ma_user (Master), bet_user (User)
const testUsers = [
  { id: 'USR-MALIK', username: 'malik', role: 'ADMIN', userType: 'Admin', agentId: 'COMP-ROOT-01' },
  { id: 'USR-SA', username: 'sa_user', role: 'SUPER_ADMIN', userType: 'Super Admin', agentId: 'COMP-ROOT-01' },
  { id: 'USR-SM', username: 'sm_user', role: 'SUPER_MASTER', userType: 'Super Master', agentId: 'COMP-ROOT-01' },
  { id: 'USR-MA', username: 'ma_user', role: 'MASTER', userType: 'Master', agentId: 'COMP-ROOT-01' },
  { id: 'USR-USR', username: 'bet_user', role: 'USER', userType: 'User', agentId: 'COMP-ROOT-01' }
];

window.AdminCore.repo.set('ADM_USERS', testUsers);

renderUsersTable();

const tableHtml = domElements['usersTableList'].innerHTML;

assert(tableHtml.includes('malik') && tableHtml.includes('Admin'), "User 'malik' displays Type 'Admin' (Not hardcoded 'Client')");
assert(tableHtml.includes('sa_user') && tableHtml.includes('Super Admin'), "User 'sa_user' displays Type 'Super Admin'");
assert(tableHtml.includes('sm_user') && tableHtml.includes('Super Master'), "User 'sm_user' displays Type 'Super Master'");
assert(tableHtml.includes('ma_user') && tableHtml.includes('Master'), "User 'ma_user' displays Type 'Master'");
assert(tableHtml.includes('bet_user') && tableHtml.includes('User'), "User 'bet_user' displays Type 'User'");

console.log('\n====================================================');
console.log('  DYNAMIC TYPE COLUMN VERIFIED 100% SUCCESS');
console.log('====================================================\n');
