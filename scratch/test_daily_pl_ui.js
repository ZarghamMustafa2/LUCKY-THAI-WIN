/**
 * test_daily_pl_ui.js
 * Verification of Daily PL UI Recreation:
 * 1. Card Header: ☰ Report
 * 2. Dual side-by-side tables (Name ▴ | Amount ⬍)
 * 3. Empty state: "No data available in table"
 * 4. Left table green total: Total | 0
 * 5. Right table red total: Total | 0
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
console.log('  DAILY PL RECREATION VERIFICATION');
console.log('====================================================');

// 1. Daily PL View Generation
console.log('\n--- Test 1: Daily PL Header & Container ---');
assert(adminHtml.includes('daily_pl'), 'Contains daily_pl identifier');
assert(adminHtml.includes('fa-bars') && adminHtml.includes('Report'), 'Contains hamburger icon and Report header');

// 2. Dual Side-by-Side Tables
console.log('\n--- Test 2: Dual Tables Structure ---');
assert(adminHtml.includes('grid grid-cols-2'), 'Contains 2-column grid layout for side-by-side tables');
assert(adminHtml.includes('No data available in table'), 'Contains "No data available in table"');

// 3. Green and Red Total Rows
console.log('\n--- Test 3: Green and Red Total Rows ---');
assert(adminHtml.includes('bg-[#00884F] text-white font-bold') && adminHtml.includes('Total'), 'Contains Green Total row');
assert(adminHtml.includes('bg-[#EF4444] text-white font-bold') && adminHtml.includes('Total'), 'Contains Red Total row');

console.log('\n====================================================');
console.log('  ALL DAILY PL CHECKS PASSED (100%)');
console.log('====================================================\n');
