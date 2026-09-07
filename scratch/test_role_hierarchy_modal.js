/**
 * test_role_hierarchy_modal.js
 * Verification test for dynamic Role Hierarchy integration inside existing addUserModal.
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
console.log('  ROLE HIERARCHY MODAL INTEGRATION TEST');
console.log('====================================================');

// 1. Check existing modal markup preserved with new container
console.log('\n--- Test 1: Modal Layout & Field Preservation ---');
assert(adminHtml.includes('id="addUserModal"'), "addUserModal container exists");
assert(adminHtml.includes('id="newUsername"'), "Username field exists");
assert(adminHtml.includes('id="newPassword"'), "Password field exists");
assert(adminHtml.includes('Account Type / Role'), "Label updated to Account Type / Role");
assert(adminHtml.includes('id="newUserTypeContainer"'), "newUserTypeContainer dynamic container exists");
assert(adminHtml.includes('id="newUserIsActive"'), "IsActive checkbox exists");
assert(adminHtml.includes('id="newUserPhone"'), "Phone input exists");
assert(adminHtml.includes('id="newUserReference"'), "Reference input exists");
assert(adminHtml.includes('id="newUserNotes"'), "Notes input exists");
assert(adminHtml.includes('Submit'), "Submit button preserved");

// 2. Check Role Hierarchy Matrix
console.log('\n--- Test 2: Role Hierarchy Matrix Definitions ---');
assert(adminHtml.includes("'COMPANY': ['SUPER_ADMIN', 'ADMIN', 'SUPER_MASTER', 'MASTER', 'USER']"), "COMPANY hierarchy options verified");
assert(adminHtml.includes("'SUPER_ADMIN': ['ADMIN', 'SUPER_MASTER', 'MASTER', 'USER']"), "SUPER ADMIN hierarchy options verified");
assert(adminHtml.includes("'ADMIN': ['SUPER_MASTER', 'MASTER', 'USER']"), "ADMIN hierarchy options verified");
assert(adminHtml.includes("'SUPER_MASTER': ['MASTER', 'USER']"), "SUPER MASTER hierarchy options verified");
assert(adminHtml.includes("'MASTER': ['USER']"), "MASTER hierarchy options verified");
assert(adminHtml.includes("'USER': []"), "USER hierarchy options verified empty");

// 3. Check Backend / Server-side validation
console.log('\n--- Test 3: Backend Hierarchy Validation & Parent Linking ---');
assert(adminHtml.includes('!allowedRoles.includes(selectedRoleKey)'), "Backend authorization validation check exists");
assert(adminHtml.includes('Access Denied:'), "Access denied response for unauthorized creation exists");
assert(adminHtml.includes('parentId: parentId'), "parentId linked to creating account");
assert(adminHtml.includes('createdBy: parentName'), "createdBy linked to creating account");
assert(adminHtml.includes('createdUnder: parentName'), "createdUnder linked to creating account");

console.log('\n====================================================');
console.log('  ALL ROLE HIERARCHY MODAL CHECKS PASSED (100%)');
console.log('====================================================\n');
