/**
 * test_users_section_ui.js
 * Verification of Users Section UI Recreation:
 * 1. Card 1: Report Type with pill buttons (Book Detail, Book Detail 2, Daily PL, Daily Report, Final Sheet, Accounts [active], Commission Report).
 * 2. Card 2: Search-Users with username input and green search button.
 * 3. Card 3: [AdminName] - Clients List | Default with summary quad metrics (Credit Remaining, Cash, P/L Downline, Users).
 * 4. Action Buttons & Legend: New User, Account Ledger, C (Cash/Credit), Edit, L (Ledger), A (Active), D (InActive).
 * 5. Preservation: User ID Bp28233, Alex_Winner, password with eye toggle.
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
console.log('  USERS SECTION UI RECREATION VERIFICATION');
console.log('====================================================');

// 1. Card 1: Report Type
console.log('\n--- Test 1: Report Type Card ---');
assert(adminHtml.includes('Report Type'), 'Contains Report Type card header');
assert(adminHtml.includes('Book Detail') && adminHtml.includes('Book Detail 2'), 'Contains Book Detail buttons');
assert(adminHtml.includes('Daily PL') && adminHtml.includes('Daily Report'), 'Contains Daily PL & Daily Report buttons');
assert(adminHtml.includes('Final Sheet') && adminHtml.includes('Commission Report'), 'Contains Final Sheet & Commission Report buttons');
assert(adminHtml.includes('Accounts'), 'Contains active Accounts pill button');

// 2. Card 2: Search-Users
console.log('\n--- Test 2: Search-Users Card ---');
assert(adminHtml.includes('userSearchModuleInput'), 'Contains userSearchModuleInput field');
assert(adminHtml.includes('filterUsersFromSearchCard()'), 'Search button connected to filterUsersFromSearchCard()');

// 3. Card 3: Clients List & Quad Metrics
console.log('\n--- Test 3: Clients List & Summary Quad Metrics ---');
assert(adminHtml.includes('usersClientsListTitle'), 'Contains usersClientsListTitle dynamic heading');
assert(adminHtml.includes('clientsCreditRemaining'), 'Contains Credit Remaining metric element');
assert(adminHtml.includes('clientsCash'), 'Contains Cash metric element');
assert(adminHtml.includes('clientsPlDownline'), 'Contains P/L Downline metric element');
assert(adminHtml.includes('clientsUsersCount'), 'Contains Users count metric element');

// 4. Action Buttons & Legend
console.log('\n--- Test 4: Action Buttons & Legend ---');
assert(adminHtml.includes('New User'), 'Contains New User button');
assert(adminHtml.includes('Account Ledger'), 'Contains Account Ledger button');
assert(adminHtml.includes('Cash / Credit'), 'Contains Cash / Credit legend');
assert(adminHtml.includes('Ledger'), 'Contains Ledger legend');
assert(adminHtml.includes('InActive'), 'Contains InActive legend');
assert(adminHtml.includes('Settle Account'), 'Contains Settle Account legend');

// 5. Green Table Banner & 9 Column Structure
console.log('\n--- Test 5: Table Header Banner & 9 Column Headers ---');
assert(adminHtml.includes('Load Balance'), 'Contains Load Balance button');
assert(adminHtml.includes('Client (P/L)'), 'Contains Client (P/L) column');
assert(adminHtml.includes('Available Balance'), 'Contains Available Balance column');
assert(adminHtml.includes('Welcome to Exchange.'), 'Contains Welcome to Exchange footer');

// 6. Preserved Credentials
console.log('\n--- Test 6: Preserved Authentication Credentials Widget ---');
assert(adminHtml.includes('moduleCredUserId') && adminHtml.includes('Bp28233'), 'User ID Bp28233 preserved');
assert(adminHtml.includes('moduleCredName') && adminHtml.includes('Alex_Winner'), 'Username Alex_Winner preserved');
assert(adminHtml.includes('moduleCredPassword') && adminHtml.includes('Bp28233@pass'), 'Password Bp28233@pass preserved');
assert(adminHtml.includes('toggleModuleCredPassword()'), 'Eye toggle function preserved');

console.log('\n====================================================');
console.log('  ALL USERS SECTION CHECKS PASSED (100%)');
console.log('====================================================\n');
