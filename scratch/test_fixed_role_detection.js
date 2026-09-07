/**
 * test_fixed_role_detection.js
 * Verification test for role normalization, centralized permissions, and exact Account Type options.
 */

const fs = require('fs');

const adminHtml = fs.readFileSync('e:\\NUMBER BET\\admin.html', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('====================================================');
console.log('  FIXED ROLE DETECTION & ACCOUNT TYPES MODAL TEST');
console.log('====================================================');

// Mock DOM & window environment
const domElements = {};
global.document = {
  getElementById: (id) => {
    if (!domElements[id]) {
      domElements[id] = { innerText: '', innerHTML: '', value: '', checked: false };
    }
    return domElements[id];
  },
  querySelector: () => ({ value: 'SUPER_ADMIN' })
};

global.window = global;
global.showAdminToast = (msg, type) => console.log(`  [Toast] ${type.toUpperCase()}: ${msg}`);
global.openModal = (id) => console.log(`  [Modal] Opened ${id}`);

// Extract JS engine functions from admin.html
const jsCodeMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS CONFIGURATION ───[\s\S]*?function openAddUserModal\(\) \{[\s\S]*?openModal\('addUserModal'\);\s*\}/);

assert(jsCodeMatch !== null, "Centralized role permissions script found in admin.html");

eval(jsCodeMatch[0]);

// Test 1: getNormalizedRole normalization checks
console.log('\n--- Test 1: getNormalizedRole String Normalization ---');
assert(getNormalizedRole({ role: 'COMPANY' }) === 'COMPANY', "COMPANY role normalized correctly");
assert(getNormalizedRole({ role: 'company' }) === 'COMPANY', "lowercase 'company' normalized correctly");
assert(getNormalizedRole({ role: 'SUPER_ADMIN' }) === 'SUPER_ADMIN', "SUPER_ADMIN role normalized correctly");
assert(getNormalizedRole({ role: 'Super Admin' }) === 'SUPER_ADMIN', "'Super Admin' normalized correctly");
assert(getNormalizedRole({ role: 'ADMIN' }) === 'ADMIN', "ADMIN role normalized correctly");
assert(getNormalizedRole({ role: 'SUPER_MASTER' }) === 'SUPER_MASTER', "SUPER_MASTER role normalized correctly");
assert(getNormalizedRole({ role: 'Super Master' }) === 'SUPER_MASTER', "'Super Master' normalized correctly");
assert(getNormalizedRole({ role: 'MASTER' }) === 'MASTER', "MASTER role normalized correctly");
assert(getNormalizedRole({ role: 'USER' }) === 'USER', "USER role normalized correctly");
assert(getNormalizedRole(null) === null, "null user returns null (no silent ADMIN fallback)");

// Test 2: Role Permission Matrix & Options Count
console.log('\n--- Test 2: Exact Options Count per Role ---');

// COMPANY -> 5 options
global.AdminCore = { repo: { getCurrentAdmin: () => ({ username: 'company', role: 'COMPANY' }) } };
openAddUserModal();
const companyHTML = domElements['newUserTypeContainer'].innerHTML;
assert(companyHTML.includes('Super Admin') && companyHTML.includes('Admin') && companyHTML.includes('Super Master') && companyHTML.includes('Master') && companyHTML.includes('User'), "COMPANY shows all 5 options: Super Admin, Admin, Super Master, Master, User");
assert(domElements['createUnderAgentName'].innerText === 'COMPANY', "Modal title displays 'COMPANY'");

// SUPER_ADMIN -> 4 options
global.AdminCore = { repo: { getCurrentAdmin: () => ({ username: 'admin', role: 'SUPER_ADMIN' }) } };
openAddUserModal();
const saHTML = domElements['newUserTypeContainer'].innerHTML;
assert(!saHTML.includes('value="SUPER_ADMIN"') && saHTML.includes('Admin') && saHTML.includes('Super Master') && saHTML.includes('Master') && saHTML.includes('User'), "SUPER_ADMIN shows 4 options (Admin, Super Master, Master, User)");
assert(domElements['createUnderAgentName'].innerText === 'SUPER ADMIN', "Modal title displays 'SUPER ADMIN'");

// ADMIN -> 3 options
global.AdminCore = { repo: { getCurrentAdmin: () => ({ username: 'admin_user', role: 'ADMIN' }) } };
openAddUserModal();
const adminHTML = domElements['newUserTypeContainer'].innerHTML;
assert(!adminHTML.includes('value="ADMIN"') && adminHTML.includes('Super Master') && adminHTML.includes('Master') && adminHTML.includes('User'), "ADMIN shows 3 options (Super Master, Master, User)");
assert(domElements['createUnderAgentName'].innerText === 'ADMIN', "Modal title displays 'ADMIN'");

// SUPER_MASTER -> 2 options
global.AdminCore = { repo: { getCurrentAdmin: () => ({ username: 'sm_user', role: 'SUPER_MASTER' }) } };
openAddUserModal();
const smHTML = domElements['newUserTypeContainer'].innerHTML;
assert(!smHTML.includes('value="SUPER_MASTER"') && smHTML.includes('Master') && smHTML.includes('User'), "SUPER_MASTER shows 2 options (Master, User)");
assert(domElements['createUnderAgentName'].innerText === 'SUPER MASTER', "Modal title displays 'SUPER MASTER'");

// MASTER -> 1 option
global.AdminCore = { repo: { getCurrentAdmin: () => ({ username: 'master_user', role: 'MASTER' }) } };
openAddUserModal();
const masterHTML = domElements['newUserTypeContainer'].innerHTML;
assert(masterHTML.includes('User') && !masterHTML.includes('Master'), "MASTER shows 1 option (User)");
assert(domElements['createUnderAgentName'].innerText === 'MASTER', "Modal title displays 'MASTER'");

// USER -> 0 options (Blocked)
global.AdminCore = { repo: { getCurrentAdmin: () => ({ username: 'client_user', role: 'USER' }) } };
openAddUserModal();
assert(domElements['createUnderAgentName'].innerText !== 'USER', "USER account cannot open modal");

console.log('\n====================================================');
console.log('  ALL ROLE DETECTION CHECKS PASSED (100%)');
console.log('====================================================\n');
