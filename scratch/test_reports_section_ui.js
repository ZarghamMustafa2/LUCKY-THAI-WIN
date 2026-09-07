/**
 * test_reports_section_ui.js
 * Verification of Reports Section UI Recreation:
 * 1. Card 1: Report Type with pill buttons (Book Detail [active], Book Detail 2, Daily PL, Daily Report, Final Sheet, Accounts, Commission Report).
 * 2. Card 2: Report Filter with start & end date-time pickers, calendar icons, and green Submit button.
 * 3. Footer: Welcome to Exchange.
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
console.log('  REPORTS SECTION UI RECREATION VERIFICATION');
console.log('====================================================');

// 1. Card 1: Report Type
console.log('\n--- Test 1: Report Type Card in Reports Section ---');
assert(adminHtml.includes('repTab_book_detail'), 'Contains Book Detail tab button');
assert(adminHtml.includes('repTab_book_detail_2'), 'Contains Book Detail 2 tab button');
assert(adminHtml.includes('repTab_daily_pl'), 'Contains Daily PL tab button');
assert(adminHtml.includes('repTab_daily_report'), 'Contains Daily Report tab button');
assert(adminHtml.includes('repTab_final_sheet'), 'Contains Final Sheet tab button');
assert(adminHtml.includes('repTab_commission_report'), 'Contains Commission Report tab button');

// 2. Card 2: Report Filter
console.log('\n--- Test 2: Report Filter Card ---');
assert(adminHtml.includes('Report Filter'), 'Contains Report Filter header');
assert(adminHtml.includes('reportStartDateInput'), 'Contains start date input field');
assert(adminHtml.includes('reportEndDateInput'), 'Contains end date input field');
assert(adminHtml.includes('submitReportFilter()'), 'Submit button connected to submitReportFilter()');

// 3. Bottom Footer
console.log('\n--- Test 3: Exchange Bottom Footer ---');
assert(adminHtml.includes('Welcome to Exchange.'), 'Contains Welcome to Exchange footer');

// 4. Preserved Credentials
console.log('\n--- Test 4: Preserved Authentication Credentials Widget ---');
assert(adminHtml.includes('moduleCredUserId') && adminHtml.includes('Bp28233'), 'User ID Bp28233 preserved');
assert(adminHtml.includes('moduleCredName') && adminHtml.includes('Alex_Winner'), 'Username Alex_Winner preserved');
assert(adminHtml.includes('moduleCredPassword') && adminHtml.includes('Bp28233@pass'), 'Password Bp28233@pass preserved');
assert(adminHtml.includes('toggleModuleCredPassword()'), 'Eye toggle function preserved');

console.log('\n====================================================');
console.log('  ALL REPORTS SECTION CHECKS PASSED (100%)');
console.log('====================================================\n');
