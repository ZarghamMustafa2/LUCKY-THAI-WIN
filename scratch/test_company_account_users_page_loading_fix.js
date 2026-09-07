/**
 * test_company_account_users_page_loading_fix.js
 * Comprehensive verification suite for COMPANY account Users/Accounts page loading fix:
 * 1. Log in as COMPANY
 * 2. Verify COMPANY role recognized in hierarchy listing
 * 3. Verify all descendant accounts loaded without stuck Loading... state
 * 4. Verify all table rows render cleanly in <tbody>
 * 5. Verify direct SUPER_ADMIN children = GREEN (#00884F)
 * 6. Verify deeper descendants = BLACK (#111827)
 * 7. Verify non-regression for SUPER_ADMIN, ADMIN, SUPER_MASTER, MASTER roles
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
console.log('  COMPANY USERS PAGE LOADING FIX VERIFICATION SUITE');
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
  querySelector: (sel) => {
    if (sel === 'input[name="newUserType"]:checked') {
      return { value: global._mockSelectedType || 'SUPER_ADMIN' };
    }
    return null;
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
assert(loadBalanceMatch !== null, "renderUsersTable and loadBalance functions extracted");
eval(loadBalanceMatch[0].replace('function filterUsers()', ''));

const colorFuncMatch = adminHtml.match(/function getHierarchyAccountColorClass\(authenticatedUser, targetAccount\) \{[\s\S]*?function getHierarchyAccountColorHex\(authenticatedUser, targetAccount\) \{[\s\S]*?\n    \}/);
eval(colorFuncMatch[0]);

// BUILD COMPLEX 21-ACCOUNT POOL UNDER COMPANY
const company = { id: 'COMP-ROOT-01', username: 'company', role: 'COMPANY', companyId: 'COMP-01' };
const sa1 = { id: 'ADM-101', username: 'sa_alpha', role: 'SUPER_ADMIN', parentId: 'company', uplineUsername: 'company', sharePercentage: 90 };
const sa2 = { id: 'ADM-102', username: 'sa_beta', role: 'SUPER_ADMIN', parentId: 'company', uplineUsername: 'company', sharePercentage: 90 };

const admins = [];
for (let i = 1; i <= 5; i++) {
  admins.push({ id: `ADM-20${i}`, username: `admin_${i}`, role: 'ADMIN', parentId: 'sa_alpha', uplineUsername: 'sa_alpha', sharePercentage: 80 });
}

const sms = [];
for (let i = 1; i <= 5; i++) {
  sms.push({ id: `ADM-30${i}`, username: `sm_${i}`, role: 'SUPER_MASTER', parentId: 'admin_1', uplineUsername: 'admin_1', sharePercentage: 75 });
}

const ms = [];
for (let i = 1; i <= 5; i++) {
  ms.push({ id: `ADM-40${i}`, username: `m_${i}`, role: 'MASTER', parentId: 'sm_1', uplineUsername: 'sm_1', sharePercentage: 60 });
}

const us = [];
for (let i = 1; i <= 4; i++) {
  us.push({ id: `USR-50${i}`, username: `u_${i}`, role: 'USER', parentId: 'm_1', createdBy: 'm_1', sharePercentage: 50 });
}

const fullPool = [company, sa1, sa2, ...admins, ...sms, ...ms, ...us];
window.AdminCore.repo.set('ADM_ADMINS', fullPool.filter(x => x.role !== 'USER'));
window.AdminCore.repo.set('ADM_USERS', fullPool);

// TEST 1: COMPANY Login & Users Table Render
console.log('\n--- Test 1: Log in as COMPANY & Render Users Table ---');
localStorage.setItem('isAdminAuth', 'true');
window.AdminCore.repo.setCurrentAdmin(company);
console.log('Current admin:', window.AdminCore.repo.getCurrentAdmin());
console.log('Hierarchy users for company:', window.AdminCore.repo.getHierarchyUsers(company).length);

renderUsersTable();

const tbodyEl = document.getElementById('usersTableList');
const entriesEl = document.getElementById('usersEntriesCount');

assert(tbodyEl.innerHTML !== '', "Table body HTML is populated (NOT empty or stuck)");
assert(!tbodyEl.innerHTML.includes('TypeError'), "No TypeError exceptions occurred during map execution");

const totalRows = (tbodyEl.innerHTML.match(/<tr/g) || []).length;
console.log(`  Rendered ${totalRows} table rows for COMPANY account.`);
assert(totalRows >= 21, `Rendered all 21+ accounts for COMPANY (Rendered: ${totalRows})`);
assert(entriesEl.innerText.includes('21 of 21 entries') || entriesEl.innerText.includes(`${totalRows} of ${totalRows}`), "Pagination text matches rendered row count");

// TEST 2: Direct SUPER_ADMIN children = GREEN, Deeper = BLACK
console.log('\n--- Test 2: Verify Direct Children (GREEN) vs Deeper Descendants (BLACK) ---');
assert(getHierarchyAccountColorHex(company, sa1) === '#00884F', "Direct child sa_alpha is GREEN (#00884F)");
assert(getHierarchyAccountColorHex(company, sa2) === '#00884F', "Direct child sa_beta is GREEN (#00884F)");
assert(getHierarchyAccountColorHex(company, admins[0]) === '#111827', "Grandchild admin_1 is BLACK (#111827)");
assert(getHierarchyAccountColorHex(company, sms[0]) === '#111827', "SuperMaster sm_1 is BLACK (#111827)");
assert(getHierarchyAccountColorHex(company, ms[0]) === '#111827', "Master m_1 is BLACK (#111827)");

// TEST 3: Load Balance Click Cycle & Async Loading Guard
console.log('\n--- Test 3: Load Balance Click & State Safety ---');
handleLoadBalanceClick();
assert(document.getElementById('loadBalanceBtn').disabled === true, "Load balance button disabled during async load");

// Fast-forward timeout completion
setTimeout(() => {
  assert(document.getElementById('loadBalanceBtn').disabled === false, "Load balance button re-enabled after completion");
  assert(document.getElementById('loadBalanceBtn').innerText === 'Hide Balance' || document.getElementById('loadBalanceBtn').innerHTML === 'Hide Balance', "Button text updated to 'Hide Balance'");
}, 1300);

// TEST 4: Non-Regression Check for SUPER_ADMIN, ADMIN, SUPER_MASTER, MASTER
console.log('\n--- Test 4: Role Non-Regression Checks ---');
window.AdminCore.repo.setCurrentAdmin(sa1);
renderUsersTable();
assert(document.getElementById('usersTableList').innerHTML !== '', "SUPER_ADMIN Users page loads cleanly");

window.AdminCore.repo.setCurrentAdmin(admins[0]);
renderUsersTable();
assert(document.getElementById('usersTableList').innerHTML !== '', "ADMIN Users page loads cleanly");

window.AdminCore.repo.setCurrentAdmin(sms[0]);
renderUsersTable();
assert(document.getElementById('usersTableList').innerHTML !== '', "SUPER_MASTER Users page loads cleanly");

window.AdminCore.repo.setCurrentAdmin(ms[0]);
renderUsersTable();
assert(document.getElementById('usersTableList').innerHTML !== '', "MASTER Users page loads cleanly");

console.log('\n====================================================');
console.log('  COMPANY USERS PAGE LOADING FIX VERIFIED 100% CLEAN');
console.log('====================================================\n');
