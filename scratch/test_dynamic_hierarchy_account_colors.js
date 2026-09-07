/**
 * test_dynamic_hierarchy_account_colors.js
 * Verification suite for Contextual Dynamic Hierarchy Account Color Classification:
 * - Direct child of currently logged-in account => GREEN (#00884F)
 * - Deeper descendants / grandparents / non-direct => BLACK (#111827)
 * - Dynamic recalculation depending on viewing context
 * - No static DB color storage
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
console.log('  DYNAMIC HIERARCHY ACCOUNT COLOR CODING SUITE');
console.log('====================================================');

const colorFuncMatch = adminHtml.match(/function getHierarchyAccountColorHex\(authenticatedUser, targetAccount\) \{[\s\S]*?\n    \}/);
assert(colorFuncMatch !== null, "Color calculation functions extracted");
eval(colorFuncMatch[0]);

// BUILD COMPLETE MULTI-TIER HIERARCHY TREE
const company = { id: 'COMP-ROOT-01', username: 'company', role: 'COMPANY' };
const sa1 = { id: 'ADM-101', username: 'sa1', role: 'SUPER_ADMIN', parentId: 'company' };
const sa2 = { id: 'ADM-102', username: 'sa2', role: 'SUPER_ADMIN', parentId: 'company' };
const admin1 = { id: 'ADM-103', username: 'admin1', role: 'ADMIN', parentId: 'sa1' };
const admin2 = { id: 'ADM-104', username: 'admin2', role: 'ADMIN', parentId: 'sa1' };
const sm1 = { id: 'ADM-105', username: 'sm1', role: 'SUPER_MASTER', parentId: 'admin1' };
const m1 = { id: 'ADM-106', username: 'm1', role: 'MASTER', parentId: 'sm1' };
const u1 = { id: 'USR-107', username: 'u1', role: 'USER', parentId: 'm1', createdBy: 'm1' };

// TEST 1: WHEN COMPANY LOGS IN
console.log('\n--- Test 1: COMPANY Viewing Perspective ---');
assert(getHierarchyAccountColorHex(company, sa1) === '#00884F', "SUPER_ADMIN 1 is GREEN for COMPANY");
assert(getHierarchyAccountColorHex(company, sa2) === '#00884F', "SUPER_ADMIN 2 is GREEN for COMPANY");
assert(getHierarchyAccountColorHex(company, admin1) === '#111827', "ADMIN 1 (grandchild) is BLACK for COMPANY");
assert(getHierarchyAccountColorHex(company, admin2) === '#111827', "ADMIN 2 (grandchild) is BLACK for COMPANY");
assert(getHierarchyAccountColorHex(company, sm1) === '#111827', "SUPER_MASTER 1 is BLACK for COMPANY");
assert(getHierarchyAccountColorHex(company, m1) === '#111827', "MASTER 1 is BLACK for COMPANY");
assert(getHierarchyAccountColorHex(company, u1) === '#111827', "USER 1 is BLACK for COMPANY");

// TEST 2: WHEN SUPER_ADMIN 1 LOGS IN
console.log('\n--- Test 2: SUPER_ADMIN 1 Viewing Perspective ---');
assert(getHierarchyAccountColorHex(sa1, admin1) === '#00884F', "ADMIN 1 (direct child) is GREEN for SUPER_ADMIN 1");
assert(getHierarchyAccountColorHex(sa1, admin2) === '#00884F', "ADMIN 2 (direct child) is GREEN for SUPER_ADMIN 1");
assert(getHierarchyAccountColorHex(sa1, sm1) === '#111827', "SUPER_MASTER 1 (grandchild) is BLACK for SUPER_ADMIN 1");
assert(getHierarchyAccountColorHex(sa1, m1) === '#111827', "MASTER 1 is BLACK for SUPER_ADMIN 1");
assert(getHierarchyAccountColorHex(sa1, u1) === '#111827', "USER 1 is BLACK for SUPER_ADMIN 1");

// TEST 3: WHEN ADMIN 1 LOGS IN
console.log('\n--- Test 3: ADMIN 1 Viewing Perspective ---');
assert(getHierarchyAccountColorHex(admin1, sm1) === '#00884F', "SUPER_MASTER 1 (direct child) is GREEN for ADMIN 1");
assert(getHierarchyAccountColorHex(admin1, m1) === '#111827', "MASTER 1 (grandchild) is BLACK for ADMIN 1");
assert(getHierarchyAccountColorHex(admin1, u1) === '#111827', "USER 1 is BLACK for ADMIN 1");

// TEST 4: WHEN SUPER_MASTER 1 LOGS IN
console.log('\n--- Test 4: SUPER_MASTER 1 Viewing Perspective ---');
assert(getHierarchyAccountColorHex(sm1, m1) === '#00884F', "MASTER 1 (direct child) is GREEN for SUPER_MASTER 1");
assert(getHierarchyAccountColorHex(sm1, u1) === '#111827', "USER 1 (grandchild) is BLACK for SUPER_MASTER 1");

// TEST 5: WHEN MASTER 1 LOGS IN
console.log('\n--- Test 5: MASTER 1 Viewing Perspective ---');
assert(getHierarchyAccountColorHex(m1, u1) === '#00884F', "USER 1 (direct child) is GREEN for MASTER 1");

// TEST 6: Contextual Recalculation Verification
console.log('\n--- Test 6: Verify Contextual Dynamic Color Shift ---');
const colorFromCompany = getHierarchyAccountColorHex(company, admin1);
const colorFromSA1 = getHierarchyAccountColorHex(sa1, admin1);

assert(colorFromCompany === '#111827', "ADMIN 1 is BLACK when viewed by COMPANY");
assert(colorFromSA1 === '#00884F', "ADMIN 1 shifts to GREEN when viewed by its direct parent SUPER_ADMIN 1");
assert(admin1.color === undefined, "No color property stored statically on target account object");

console.log('\n====================================================');
console.log('  DYNAMIC ACCOUNT COLORS VERIFIED 100% CLEAN');
console.log('====================================================\n');
