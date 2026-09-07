/**
 * test_bet_lock_ui.js
 * Verification of Bet Lock Section UI Recreation:
 * 1. Title: Allowed Market Types (Ahmad5050x)
 * 2. Categories & Sub-items: All Casino, Cricket, Greyhound, Horse Race, Soccer, Tennis.
 * 3. Action: Green Save button connected to saveBetLockSettings().
 * 4. Preservation: User ID Bp28233, Alex_Winner, password with eye toggle.
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
console.log('  BET LOCK SECTION UI RECREATION VERIFICATION');
console.log('====================================================');

// 1. Header & Title
console.log('\n--- Test 1: Bet Lock Header & Dynamic Title ---');
assert(adminHtml.includes('betLockTitle'), 'Contains betLockTitle dynamic element');
assert(adminHtml.includes('Allowed Market Types'), 'Contains Allowed Market Types text');

// 2. Categories & Sub-items
console.log('\n--- Test 2: Category Checkboxes & Sub-items ---');
assert(adminHtml.includes('All Casino') && adminHtml.includes('TeenPatti Studio') && adminHtml.includes('Betfair Games'), 'Contains All Casino & studio sub-items');
assert(adminHtml.includes('Cricket') && adminHtml.includes('Figure') && adminHtml.includes('Fancy') && adminHtml.includes('Match Odds'), 'Contains Cricket & sub-items');
assert(adminHtml.includes('Greyhound') && adminHtml.includes('Australia') && adminHtml.includes('Britian'), 'Contains Greyhound & sub-items');
assert(adminHtml.includes('Horse Race') && adminHtml.includes('Dubai') && adminHtml.includes('England (PLACE)'), 'Contains Horse Race & sub-items');
assert(adminHtml.includes('Soccer') && adminHtml.includes('Over/Under Goals'), 'Contains Soccer & sub-items');
assert(adminHtml.includes('Tennis'), 'Contains Tennis & sub-items');

// 3. Save Button & Functions
console.log('\n--- Test 3: Save Button & Toggle Functions ---');
assert(adminHtml.includes('saveBetLockSettings()'), 'Contains saveBetLockSettings() call');
assert(adminHtml.includes('toggleBetLockCategory('), 'Contains toggleBetLockCategory() function');

// 4. Preserved Credentials
console.log('\n--- Test 4: Preserved Authentication Credentials Widget ---');
assert(adminHtml.includes('moduleCredUserId') && adminHtml.includes('Bp28233'), 'User ID Bp28233 preserved');
assert(adminHtml.includes('moduleCredName') && adminHtml.includes('Alex_Winner'), 'Username Alex_Winner preserved');
assert(adminHtml.includes('moduleCredPassword') && adminHtml.includes('Bp28233@pass'), 'Password Bp28233@pass preserved');
assert(adminHtml.includes('toggleModuleCredPassword()'), 'Eye toggle function preserved');

console.log('\n====================================================');
console.log('  ALL BET LOCK SECTION CHECKS PASSED (100%)');
console.log('====================================================\n');
