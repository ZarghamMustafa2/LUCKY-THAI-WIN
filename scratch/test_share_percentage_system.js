/**
 * test_share_percentage_system.js
 * Comprehensive automated verification for the Share Percentage System:
 * - Dynamic share calculations
 * - Parent capacity enforcement (0 <= childShare <= parentShare)
 * - Dual linked records (+GREEN downline, -RED upline)
 * - Multi-tier hierarchy cascade (COMPANY -> SUPER_ADMIN -> ADMIN -> SUPER_MASTER -> MASTER -> USER)
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
console.log('  SHARE PERCENTAGE SYSTEM VERIFICATION SUITE');
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
          add: () => {},
          remove: () => {},
          contains: () => false
        }
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
global.renderUsersTable = () => {};

eval(adminEngineJs);

const roleConfigMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS & DISPLAY CONFIGURATION ───[\s\S]*?window\.getNormalizedRole = getNormalizedRole;/);
assert(roleConfigMatch !== null, "Role config extracted");
eval(roleConfigMatch[0]);

const modalHandlersMatch = adminHtml.match(/function openAddUserModal\(\) \{[\s\S]*?\n    \}/);
assert(modalHandlersMatch !== null, "openAddUserModal extracted");
eval(modalHandlersMatch[0]);

const handleAddUserMatch = adminHtml.match(/function handleAddUserSubmit\(e\) \{[\s\S]*?\n    \}/);
assert(handleAddUserMatch !== null, "handleAddUserSubmit extracted");
eval(handleAddUserMatch[0]);

const shareCalcMatch = adminHtml.match(/\/\/ ─── SHARE PERCENTAGE ENGINE & ADJUSTMENT MODAL HANDLERS ───[\s\S]*?let currentEditingUser = null;/);
assert(shareCalcMatch !== null, "Share engine script extracted from admin.html");
eval(shareCalcMatch[0]);

// STEP 1: Login as COMPANY (100% Share capacity)
console.log('\n--- Step 1: Login as COMPANY (100% Capacity) ---');
const companyAccount = {
  id: 'COMP-ROOT-01',
  username: 'company',
  role: 'COMPANY',
  sharePercentage: 100
};
localStorage.setItem('isAdminAuth', 'true');
window.AdminCore.repo.setCurrentAdmin(companyAccount);

const companyAdmin = window.AdminCore.repo.getCurrentAdmin();
assert(companyAdmin.username === 'company', "Active account is 'company'");
assert(companyAdmin.sharePercentage === 100, "COMPANY share capacity is 100%");

// STEP 2 & 3: Assign 90% Share to SUPER_ADMIN
console.log('\n--- Step 2 & 3: Create SUPER_ADMIN with 90% Share ---');
openAddUserModal();

document.getElementById('newUsername').value = 'superadmin_test';
document.getElementById('newPassword').value = 'SuperPass123!';
document.getElementById('newUserShare').value = '90';
global._mockSelectedType = 'SUPER_ADMIN';

handleAddUserSubmit({ preventDefault: () => {} });

const users = window.AdminCore.repo.get('ADM_USERS') || [];
const createdSA = users.find(u => u.username === 'superadmin_test');
assert(createdSA !== undefined, "SUPER_ADMIN 'superadmin_test' created");
assert(createdSA.sharePercentage === 90, "SUPER_ADMIN assigned share is 90%");

// STEP 4: Calculate Share Difference for 100,000 Credit Amount
console.log('\n--- Step 4: Calculate Share Difference for 100,000 Amount ---');
const calcResult = calculateShareDifference(100000, createdSA.sharePercentage);

assert(calcResult.amount === 100000, "Original amount = 100,000");
assert(calcResult.childSharePercentage === 90, "Child share % = 90%");
assert(calcResult.uplineDifferencePercentage === 10, "Upline difference % = 10%");
assert(calcResult.differenceAmount === 10000, "Calculated difference amount = 10,000");

// STEP 5: Record Linked Dual-Entry Share Transaction
console.log('\n--- Step 5: Record Linked Dual-Entry Share Transaction ---');
const { downlineRecord, uplineRecord } = recordShareTransaction(companyAccount, createdSA, 100000);

assert(downlineRecord.transactionId === uplineRecord.transactionId, "Both records reference identical transactionId");
assert(downlineRecord.formattedAmount === '+10,000.00', "Downline record formattedAmount = '+10,000.00'");
assert(downlineRecord.displayColor === 'GREEN', "Downline entry is GREEN");
assert(downlineRecord.direction === 'DOWNLINE_POSITIVE', "Downline entry direction = DOWNLINE_POSITIVE");

assert(uplineRecord.formattedAmount === '-10,000.00', "Upline record formattedAmount = '-10,000.00'");
assert(uplineRecord.displayColor === 'RED', "Upline entry is RED");
assert(uplineRecord.direction === 'UPLINE_NEGATIVE', "Upline entry direction = UPLINE_NEGATIVE");

// STEP 6: Dynamic Calculations (Another % and Amount)
console.log('\n--- Step 6: Test Dynamic Calculation (85% Share, 200,000 Amount) ---');
const dynamicCalc = calculateShareDifference(200000, 85);
assert(dynamicCalc.uplineDifferencePercentage === 15, "200k at 85% gives 15% upline diff");
assert(dynamicCalc.differenceAmount === 30000, "200k * 15% = 30,000");

const dynamicRecords = recordShareTransaction(companyAccount, { username: 'admin_test', sharePercentage: 85 }, 200000);
assert(dynamicRecords.downlineRecord.formattedAmount === '+30,000.00', "Dynamic downline = +30,000.00 (GREEN)");
assert(dynamicRecords.uplineRecord.formattedAmount === '-30,000.00', "Dynamic upline = -30,000.00 (RED)");

// STEP 7: Hierarchy Cascade Validation
console.log('\n--- Step 7: Hierarchy Cascade Validation (SUPER_ADMIN 90% -> ADMIN max 90%) ---');
window.AdminCore.repo.setCurrentAdmin(createdSA); // Switch active session to SUPER_ADMIN (90% capacity)

// Try assigning 95% share to child ADMIN (Exceeds SUPER_ADMIN 90% capacity)
document.getElementById('newUsername').value = 'admin_invalid_share';
document.getElementById('newPassword').value = 'AdminPass123!';
document.getElementById('newUserShare').value = '95';
global._mockSelectedType = 'ADMIN';

handleAddUserSubmit({ preventDefault: () => {} });
const invalidAdmin = users.find(u => u.username === 'admin_invalid_share');
assert(invalidAdmin === undefined, "Child ADMIN share > 90% rejected by parent capacity rule");

// Assign valid 80% share to child ADMIN
document.getElementById('newUsername').value = 'admin_valid_share';
document.getElementById('newPassword').value = 'AdminPass123!';
document.getElementById('newUserShare').value = '80';
global._mockSelectedType = 'ADMIN';

handleAddUserSubmit({ preventDefault: () => {} });
const validAdmin = (window.AdminCore.repo.get('ADM_USERS') || []).find(u => u.username === 'admin_valid_share');
assert(validAdmin !== undefined, "Child ADMIN created with valid 80% share");
assert(validAdmin.sharePercentage === 80, "Child ADMIN share saved as 80%");

console.log('\n====================================================');
console.log('  SHARE PERCENTAGE SYSTEM VERIFIED 100% CLEAN');
console.log('====================================================\n');
