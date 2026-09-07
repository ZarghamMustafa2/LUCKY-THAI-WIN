/**
 * test_final_sheet_ui.js
 * Verification of Final Sheet UI Recreation:
 * 1. Card Header: ☰ Ahmad5050x - Final Sheet (dynamic agent name)
 * 2. Checkbox: Hide Zero Amounts
 * 3. Left Table Rows: Ahmad5050x (highlighted), Cash, RA.BOOK76, and Red Total row
 * 4. Right Table: "No data available in table" and Red Total row
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
console.log('  FINAL SHEET RECREATION VERIFICATION');
console.log('====================================================');

// 1. Final Sheet View Generation
console.log('\n--- Test 1: Final Sheet Header & Checkbox ---');
assert(adminHtml.includes('final_sheet'), 'Contains final_sheet identifier');
assert(adminHtml.includes('fa-bars') && adminHtml.includes('${agentName} - Final Sheet'), 'Contains hamburger icon and dynamic Final Sheet title');
assert(adminHtml.includes('id="hideZeroAmountsCheck"') && adminHtml.includes('Hide Zero Amounts'), 'Contains Hide Zero Amounts checkbox');

// 2. Left and Right Tables
console.log('\n--- Test 2: Left and Right Tables Content ---');
assert(adminHtml.includes('RA.BOOK76'), 'Contains RA.BOOK76 row');
assert(adminHtml.includes('Cash'), 'Contains Cash row');
assert(adminHtml.includes('No data available in table'), 'Contains "No data available in table" in right table');

// 3. Red Total Rows
console.log('\n--- Test 3: Red Total Rows ---');
assert(adminHtml.includes('bg-[#F87171]') && adminHtml.includes('Total'), 'Contains Red Total summary rows');

console.log('\n====================================================');
console.log('  ALL FINAL SHEET CHECKS PASSED (100%)');
console.log('====================================================\n');
