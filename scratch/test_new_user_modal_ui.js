/**
 * test_new_user_modal_ui.js
 * Verification of Create New User Modal Fields:
 * 1. Title: Create New User under Ahmad5050x
 * 2. Field: Username
 * 3. Field: Password
 * 4. Field: Type (Master / Bettor radio buttons)
 * 5. Field: IsActive (checkbox)
 * 6. Field: Phone
 * 7. Field: Reference
 * 8. Field: Notes (textarea)
 * 9. Button: Submit
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
console.log('  CREATE NEW USER MODAL VERIFICATION');
console.log('====================================================');

// 1. Modal Title & Dynamic Agent Container
console.log('\n--- Test 1: Modal Header ---');
assert(adminHtml.includes('Create New User under') && adminHtml.includes('createUnderAgentName'), 'Contains "Create New User under" dynamic header');

// 2. Form Fields
console.log('\n--- Test 2: Form Fields Structure ---');
assert(adminHtml.includes('id="newUsername"'), 'Contains Username field (newUsername)');
assert(adminHtml.includes('id="newPassword"'), 'Contains Password field (newPassword)');
assert(adminHtml.includes('name="newUserType"') && adminHtml.includes('value="Master"') && adminHtml.includes('value="Bettor"'), 'Contains Type radio buttons (Master / Bettor)');
assert(adminHtml.includes('id="newUserIsActive"'), 'Contains IsActive checkbox (newUserIsActive)');
assert(adminHtml.includes('id="newUserPhone"'), 'Contains Phone field (newUserPhone)');
assert(adminHtml.includes('id="newUserReference"'), 'Contains Reference field (newUserReference)');
assert(adminHtml.includes('id="newUserNotes"'), 'Contains Notes textarea (newUserNotes)');

// 3. Submit Action & Handler
console.log('\n--- Test 3: Submit Action ---');
assert(adminHtml.includes('handleAddUserSubmit(event)'), 'Form connected to handleAddUserSubmit(event)');
assert(adminHtml.includes('Submit') && adminHtml.includes('type="submit"'), 'Contains Submit button');

console.log('\n====================================================');
console.log('  ALL NEW USER MODAL CHECKS PASSED (100%)');
console.log('====================================================\n');
