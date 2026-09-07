/**
 * test_commission_report_ui.js
 * Verification of Commission Report UI Recreation:
 * 1. Card Header: ☰ Commission Report
 * 2. Notice: "All Commission goes to As per share (Auto Commission)"
 * 3. Table Headers: User Name, Amount
 * 4. Total Green Summary Row: Total | 0
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
console.log('  COMMISSION REPORT RECREATION VERIFICATION');
console.log('====================================================');

// 1. Commission Report View Generation
console.log('\n--- Test 1: Commission Report Header & Notice ---');
assert(adminHtml.includes('commission_report'), 'Contains commission_report identifier');
assert(adminHtml.includes('fa-bars') && adminHtml.includes('Commission Report'), 'Contains hamburger icon and Commission Report header');
assert(adminHtml.includes('All Commission goes to As per share (Auto Commission)'), 'Contains exact notice text');

// 2. Table Headers and Total Green Row
console.log('\n--- Test 2: Table Columns & Green Total Row ---');
assert(adminHtml.includes('User Name') && adminHtml.includes('Amount'), 'Contains User Name and Amount column headers');
assert(adminHtml.includes('bg-[#00884F] text-white font-bold') && adminHtml.includes('Total'), 'Contains Green Total summary row');

console.log('\n====================================================');
console.log('  ALL COMMISSION REPORT CHECKS PASSED (100%)');
console.log('====================================================\n');
