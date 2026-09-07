/**
 * test_supermaster_dropdown_ui.js
 * Verification of SuperMaster dropdown menu recreation:
 * 1. Button: Ahmad5050x (SuperMaster) ▾
 * 2. Dropdown Menu with:
 *    - Profile (with fa-user icon)
 *    - Logout
 * 3. Profile Modal for active admin session details
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
console.log('  SUPERMASTER DROPDOWN RECREATION VERIFICATION');
console.log('====================================================');

// 1. Dropdown Button
console.log('\n--- Test 1: Dropdown Button & Trigger ---');
assert(adminHtml.includes('id="topBarAdminName"') && adminHtml.includes('id="topBarAdminRole"'), 'Contains topBarAdminName and topBarAdminRole');
assert(adminHtml.includes('toggleAdminAccountDropdown()'), 'Contains toggleAdminAccountDropdown trigger');

// 2. Dropdown Menu Items
console.log('\n--- Test 2: Dropdown Menu Items ---');
assert(adminHtml.includes('id="adminAccountDropdownMenu"'), 'Contains adminAccountDropdownMenu');
assert(adminHtml.includes('fa-user') && adminHtml.includes('Profile'), 'Contains Profile item with user icon');
assert(adminHtml.includes('Logout') && adminHtml.includes('lockAdminPanel()'), 'Contains Logout item triggering lock/logout');

// 3. Profile Modal
console.log('\n--- Test 3: Profile Modal Container ---');
assert(adminHtml.includes('id="adminProfileModal"'), 'Contains adminProfileModal');
assert(adminHtml.includes('openCurrentAdminProfileModal()'), 'Contains openCurrentAdminProfileModal function');

console.log('\n====================================================');
console.log('  ALL SUPERMASTER DROPDOWN CHECKS PASSED (100%)');
console.log('====================================================\n');
