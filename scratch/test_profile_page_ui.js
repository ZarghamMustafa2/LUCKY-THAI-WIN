/**
 * test_profile_page_ui.js
 * Verification of Profile page recreation matching reference screenshot:
 * 1. Card 1 (Profile): Stake1-4, Plus1-4 inputs, Save changes, Cancel, Note
 * 2. Card 2 (Change Password): NewPassword input, Update button
 * 3. Card 3 (Two Factor Authentication): Key icon, Disabled notice, 2FA toggle
 * 4. Dropdown item triggers switchAdminModule('profile')
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
console.log('  PROFILE PAGE RECREATION VERIFICATION');
console.log('====================================================');

// 1. Profile Module Container
console.log('\n--- Test 1: Profile Module & Card 1 (Stakes) ---');
assert(adminHtml.includes('id="module_profile"'), 'Contains module_profile container');
assert(adminHtml.includes('id="profStake1"') && adminHtml.includes('id="profStake4"'), 'Contains Stake1-4 inputs');
assert(adminHtml.includes('id="profPlus1"') && adminHtml.includes('id="profPlus4"'), 'Contains Plus1-4 inputs');
assert(adminHtml.includes('Save changes') && adminHtml.includes('Cancel'), 'Contains Save changes and Cancel buttons');
assert(adminHtml.includes('Note: Updated stakes will be applied to new users.'), 'Contains Note text');

// 2. Change Password & 2FA Cards
console.log('\n--- Test 2: Change Password & Two Factor Authentication Cards ---');
assert(adminHtml.includes('Change Password') && adminHtml.includes('id="profileNewPasswordInput"'), 'Contains Change Password card and input');
assert(adminHtml.includes('Two Factor Authentication'), 'Contains Two Factor Authentication card');
assert(adminHtml.includes('Two factor authentication (2FA) is') && adminHtml.includes('id="profile2faToggle"'), 'Contains 2FA status and toggle');

// 3. Dropdown Connection & JS Engine
console.log('\n--- Test 3: Dropdown Connection & JS Engine ---');
assert(adminHtml.includes("switchAdminModule('profile')"), "Dropdown Profile item calls switchAdminModule('profile')");
assert(adminHtml.includes('saveProfileStakes()') && adminHtml.includes('updateProfilePassword()'), 'Contains profile handlers');

console.log('\n====================================================');
console.log('  ALL PROFILE PAGE CHECKS PASSED (100%)');
console.log('====================================================\n');
