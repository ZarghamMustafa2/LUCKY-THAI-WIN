/**
 * test_remove_upline_downline_buttons.js
 * Verification suite for UI-only removal of Upline / Downline pill buttons:
 * 1. Buttons container removed from card header HTML
 * 2. Upline / Downline backend functions & calculations preserved 100%
 * 3. 6-Column Summary Table intact
 */

const fs = require('fs');

const adminHtml = fs.readFileSync('e:\\NUMBER BET\\admin.html', 'utf8');
const adminEngineJs = fs.readFileSync('e:\\NUMBER BET\\admin-engine.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('====================================================');
console.log('  REMOVE UPLINE / DOWNLINE BUTTONS SUITE');
console.log('====================================================');

// TEST 1: UI Removal Verification
console.log('\n--- Test 1: Verify Buttons Container Removed from UI ---');
assert(!adminHtml.includes('id="viewToggleUplineBtn"'), "viewToggleUplineBtn removed from UI HTML");
assert(!adminHtml.includes('id="viewToggleDownlineBtn"'), "viewToggleDownlineBtn removed from UI HTML");
assert(!adminHtml.includes("switchHierarchyViewMode('UPLINE')"), "Upline button click listener removed from UI HTML");

// TEST 2: Preservation of Underlying Logic & Calculations
console.log('\n--- Test 2: Verify Preservation of Logic & Functions ---');
assert(adminHtml.includes('function switchHierarchyViewMode'), "switchHierarchyViewMode JS function preserved");
assert(adminHtml.includes('function calculateHierarchySummaryMetrics'), "calculateHierarchySummaryMetrics JS function preserved");
assert(adminHtml.includes('P/L Downline'), "P/L Downline table column preserved");
assert(adminHtml.includes('Balance UpLine'), "Balance UpLine table column preserved");
assert(adminEngineJs.includes('getUplineAncestors'), "getUplineAncestors engine function preserved");

console.log('\n====================================================');
console.log('  UPLINE / DOWNLINE UI BUTTONS REMOVAL VERIFIED');
console.log('====================================================\n');
