/**
 * test_create_user_modal_ui.js
 * Verification suite for Create New User modal UI updates.
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
console.log('  CREATE NEW USER MODAL UI VERIFICATION SUITE');
console.log('====================================================');

// TEST 1: Check Close Button [X] in Modal Header
console.log('\n--- TEST 1: Header Close Icon [X] ---');
const hasCloseBtn = adminHtml.includes('closeModal(\'addUserModal\')') && adminHtml.includes('fa-xmark');
assert(hasCloseBtn, "Header includes touch-friendly [X] close button calling closeModal('addUserModal')");

// TEST 2: Check Compact & Scrollable Container
console.log('\n--- TEST 2: Compact & Scrollable Container ---');
const hasScrollableClass = adminHtml.includes('max-h-[90vh] overflow-y-auto');
assert(hasScrollableClass, "Modal container has max-h-[90vh] overflow-y-auto for mobile scrollability");

// TEST 3: Check Helper Text Positioning Under Share Input
console.log('\n--- TEST 3: Max allowed text UNDER Share input ---');
const shareSectionMatch = adminHtml.match(/<!-- Field 3B: Share Percentage -->[\s\S]*?<\/div>\s*<\/div>/);
assert(shareSectionMatch !== null, "Share section located");
if (shareSectionMatch) {
  const code = shareSectionMatch[0];
  assert(code.includes('maxShareCapacityHint') && code.includes('mt-0.5'), "maxShareCapacityHint is positioned under Share input container");
  assert(!code.includes('(Max allowed: 100%)'), "Parentheses removed from default HTML hint");
}

// TEST 4: Check JS maxShareCapacityHint formatting
console.log('\n--- TEST 4: JS Hint Formatting ---');
assert(adminHtml.includes('Max allowed: ${parentShareCapacity}%'), "JS sets hint to 'Max allowed: X%' without parentheses");

console.log('\n====================================================');
console.log('  CREATE NEW USER MODAL UI VERIFIED 100% CLEAN');
console.log('====================================================\n');
