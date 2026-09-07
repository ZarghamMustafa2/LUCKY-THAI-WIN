/**
 * test_account_visibility_and_color_logic.js
 * Verification suite for Account Visibility & Green/Black Color Logic:
 * 1. Company login shows ONLY directly created accounts (Super Admin A, Super Admin B, User C).
 * 2. Super Admin A login shows ONLY directly created accounts (Admin A1, User A2).
 * 3. Admin A1 login shows ONLY directly created accounts (User A1).
 * 4. Company -> View Downline -> Super Admin A shows authorized complete hierarchy under Super Admin A.
 * 5. Company -> View Downline -> Super Admin B shows authorized complete hierarchy under Super Admin B (no Super Admin A branch items).
 * 6. Color rules: Next-level direct child is Green (#00884F), direct User (end bettor) is Black (#111827).
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
console.log('  ACCOUNT VISIBILITY & COLOR LOGIC TEST SUITE');
console.log('====================================================');

// Mock DOM
const domElements = {};
const moduleVisibilities = {};

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
          add: (...cls) => {
            if (cls.includes('hidden')) moduleVisibilities[id] = false;
          },
          remove: (...cls) => {
            if (cls.includes('hidden')) moduleVisibilities[id] = true;
          },
          contains: (c) => (c === 'hidden' ? !moduleVisibilities[id] : false)
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

eval(adminEngineJs);

const roleConfigMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS & DISPLAY CONFIGURATION ───[\s\S]*?window\.getNormalizedRole = getNormalizedRole;/);
eval(roleConfigMatch[0]);

const colorMatch = adminHtml.match(/function getHierarchyAccountColorClass\(authenticatedUser, targetAccount\) \{[\s\S]*?function getHierarchyAccountColorHex\(authenticatedUser, targetAccount\) \{[\s\S]*?\n    \}/);
eval(colorMatch[0]);

// Seed standard hierarchy dataset
const sampleAccounts = [
  { id: 'SA-A', username: 'SuperAdmin_A', role: 'SUPER_ADMIN', createdUnder: 'company', agentId: 'company' },
  { id: 'SA-B', username: 'SuperAdmin_B', role: 'SUPER_ADMIN', createdUnder: 'company', agentId: 'company' },
  { id: 'USR-C', username: 'User_C', role: 'USER', createdUnder: 'company', agentId: 'company' },

  { id: 'ADM-A1', username: 'Admin_A1', role: 'ADMIN', createdUnder: 'SuperAdmin_A', agentId: 'SuperAdmin_A' },
  { id: 'USR-A2', username: 'User_A2', role: 'USER', createdUnder: 'SuperAdmin_A', agentId: 'SuperAdmin_A' },

  { id: 'USR-A1', username: 'User_A1', role: 'USER', createdUnder: 'Admin_A1', agentId: 'Admin_A1' },

  { id: 'ADM-B1', username: 'Admin_B1', role: 'ADMIN', createdUnder: 'SuperAdmin_B', agentId: 'SuperAdmin_B' }
];

AdminCore.repo.set('ADM_USERS', sampleAccounts);

const companyUser = { id: 'COMP-01', username: 'company', role: 'COMPANY' };
const superAdminAUser = { id: 'SA-A', username: 'SuperAdmin_A', role: 'SUPER_ADMIN' };
const adminA1User = { id: 'ADM-A1', username: 'Admin_A1', role: 'ADMIN' };

// TEST 1 — COMPANY LOGIN DIRECT LIST
console.log('\n--- TEST 1: COMPANY LOGIN DIRECT LIST ---');
const companyDirect = AdminCore.repo.getDirectChildren(companyUser);
const companyDirectUsernames = companyDirect.map(x => x.username);

assert(companyDirectUsernames.includes('SuperAdmin_A'), "Company direct list includes SuperAdmin_A");
assert(companyDirectUsernames.includes('SuperAdmin_B'), "Company direct list includes SuperAdmin_B");
assert(companyDirectUsernames.includes('User_C'), "Company direct list includes User_C");

assert(companyDirectUsernames.includes('Admin_A1') === false, "Company direct list MUST NOT include Admin_A1");
assert(companyDirectUsernames.includes('User_A1') === false, "Company direct list MUST NOT include User_A1");
assert(companyDirectUsernames.includes('User_A2') === false, "Company direct list MUST NOT include User_A2");
assert(companyDirectUsernames.includes('Admin_B1') === false, "Company direct list MUST NOT include Admin_B1");

// Color verification for Company view
const saAColor = getHierarchyAccountColorHex(companyUser, sampleAccounts.find(x => x.username === 'SuperAdmin_A'));
const userCColor = getHierarchyAccountColorHex(companyUser, sampleAccounts.find(x => x.username === 'User_C'));

assert(saAColor === '#00884F', "Company -> SuperAdmin_A color is GREEN (#00884F)");
assert(userCColor === '#111827', "Company -> User_C color is BLACK (#111827)");

// TEST 2 — SUPER ADMIN A LOGIN DIRECT LIST
console.log('\n--- TEST 2: SUPER ADMIN A LOGIN DIRECT LIST ---');
const saADirect = AdminCore.repo.getDirectChildren(superAdminAUser);
const saADirectUsernames = saADirect.map(x => x.username);

assert(saADirectUsernames.includes('Admin_A1'), "Super Admin A direct list includes Admin_A1");
assert(saADirectUsernames.includes('User_A2'), "Super Admin A direct list includes User_A2");

assert(saADirectUsernames.includes('SuperAdmin_B') === false, "Super Admin A direct list MUST NOT include SuperAdmin_B");
assert(saADirectUsernames.includes('Admin_B1') === false, "Super Admin A direct list MUST NOT include Admin_B1");
assert(saADirectUsernames.includes('User_C') === false, "Super Admin A direct list MUST NOT include User_C");
assert(saADirectUsernames.includes('User_A1') === false, "Super Admin A direct list MUST NOT include User_A1");

// Color verification for Super Admin A view
const admA1Color = getHierarchyAccountColorHex(superAdminAUser, sampleAccounts.find(x => x.username === 'Admin_A1'));
const userA2Color = getHierarchyAccountColorHex(superAdminAUser, sampleAccounts.find(x => x.username === 'User_A2'));

assert(admA1Color === '#00884F', "Super Admin A -> Admin_A1 color is GREEN (#00884F)");
assert(userA2Color === '#111827', "Super Admin A -> User_A2 color is BLACK (#111827)");

// TEST 3 — ADMIN A1 LOGIN DIRECT LIST
console.log('\n--- TEST 3: ADMIN A1 LOGIN DIRECT LIST ---');
const adminA1Direct = AdminCore.repo.getDirectChildren(adminA1User);
const adminA1DirectUsernames = adminA1Direct.map(x => x.username);

assert(adminA1DirectUsernames.length === 1 && adminA1DirectUsernames[0] === 'User_A1', "Admin A1 direct list includes ONLY User_A1");

const userA1Color = getHierarchyAccountColorHex(adminA1User, sampleAccounts.find(x => x.username === 'User_A1'));
assert(userA1Color === '#111827', "Admin A1 -> User_A1 color is BLACK (#111827)");

// TEST 4 — COMPANY -> VIEW DOWNLINE -> SUPER ADMIN A
console.log('\n--- TEST 4: COMPANY -> VIEW DOWNLINE -> SUPER ADMIN A ---');
const saADownline = AdminCore.repo.getHierarchyUsers(superAdminAUser, 'DOWNLINE');
const saADownlineUsernames = saADownline.map(x => x.username);

assert(saADownlineUsernames.includes('Admin_A1'), "Super Admin A downline includes Admin_A1");
assert(saADownlineUsernames.includes('User_A2'), "Super Admin A downline includes User_A2");
assert(saADownlineUsernames.includes('User_A1'), "Super Admin A downline includes User_A1");
assert(saADownlineUsernames.includes('Admin_B1') === false, "Super Admin A downline MUST NOT include Admin_B1");

// TEST 5 — COMPANY -> VIEW DOWNLINE -> SUPER ADMIN B
console.log('\n--- TEST 5: COMPANY -> VIEW DOWNLINE -> SUPER ADMIN B ---');
const superAdminBUser = { id: 'SA-B', username: 'SuperAdmin_B', role: 'SUPER_ADMIN' };
const saBDownline = AdminCore.repo.getHierarchyUsers(superAdminBUser, 'DOWNLINE');
const saBDownlineUsernames = saBDownline.map(x => x.username);

assert(saBDownlineUsernames.includes('Admin_B1'), "Super Admin B downline includes Admin_B1");
assert(saBDownlineUsernames.includes('Admin_A1') === false, "Super Admin B downline MUST NOT include Admin_A1");

console.log('\n====================================================');
console.log('  ACCOUNT VISIBILITY & COLOR LOGIC VERIFIED 100% CLEAN');
console.log('====================================================\n');
