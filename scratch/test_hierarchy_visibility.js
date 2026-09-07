/**
 * test_hierarchy_visibility.js
 * Verification test for recursive descendant account visibility across all hierarchy levels.
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
console.log('  RECURSIVE HIERARCHY VISIBILITY VERIFICATION TEST');
console.log('====================================================');

// Mock localStorage
const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v)),
  removeItem: (k) => localStorageMap.delete(k)
};
global.window = global;

// Load AdminEngine into node environment
eval(adminEngineJs);

const repo = window.AdminCore.repo;

// Define Test Hierarchy Tree (Branch A & Branch B)
const testAdmins = [
  { id: 'COMP-ROOT-01', username: 'company', role: 'COMPANY', parentId: null },
  { id: 'ADM-SA-A', username: 'sa_test_a', role: 'SUPER_ADMIN', parentId: 'COMP-ROOT-01' },
  { id: 'ADM-ADMIN-A', username: 'admin_test_a', role: 'ADMIN', parentId: 'sa_test_a' },
  { id: 'ADM-SM-A', username: 'sm_test_a', role: 'SUPER_MASTER', parentId: 'admin_test_a' },
  { id: 'ADM-MASTER-A', username: 'master_test_a', role: 'MASTER', parentId: 'sm_test_a' },
  
  // Branch B
  { id: 'ADM-SA-B', username: 'sa_test_b', role: 'SUPER_ADMIN', parentId: 'COMP-ROOT-01' },
  { id: 'ADM-ADMIN-B', username: 'admin_test_b', role: 'ADMIN', parentId: 'sa_test_b' },
];

const testUsers = [
  { id: 'USR-A', username: 'user_test_a', role: 'USER', userType: 'User', parentId: 'master_test_a' },
  { id: 'USR-B', username: 'user_test_b', role: 'USER', userType: 'User', parentId: 'admin_test_b' }
];

repo.set('ADM_ADMINS', testAdmins);
repo.set('ADM_USERS', testUsers);

// 1. COMPANY Account Visibility Test
console.log('\n--- Test 1: COMPANY Account Visibility ---');
const companyUser = testAdmins[0];
const companyVis = repo.getHierarchyUsers(companyUser);
const companyUsernames = companyVis.map(u => u.username);
console.log('COMPANY sees accounts:', companyUsernames);
assert(companyUsernames.includes('sa_test_a'), "COMPANY sees Super Admin A");
assert(companyUsernames.includes('admin_test_a'), "COMPANY sees Admin A");
assert(companyUsernames.includes('sm_test_a'), "COMPANY sees Super Master A");
assert(companyUsernames.includes('master_test_a'), "COMPANY sees Master A");
assert(companyUsernames.includes('user_test_a'), "COMPANY sees User A");
assert(companyUsernames.includes('sa_test_b'), "COMPANY sees Super Admin B");
assert(companyUsernames.includes('admin_test_b'), "COMPANY sees Admin B");
assert(companyUsernames.includes('user_test_b'), "COMPANY sees User B");

// 2. SUPER ADMIN A Account Visibility Test
console.log('\n--- Test 2: SUPER ADMIN A Account Visibility ---');
const saA = testAdmins[1];
const saAVis = repo.getHierarchyUsers(saA);
const saAUsernames = saAVis.map(u => u.username);
console.log('SUPER ADMIN A sees accounts:', saAUsernames);
assert(saAUsernames.includes('admin_test_a'), "Super Admin A sees Admin A");
assert(saAUsernames.includes('sm_test_a'), "Super Admin A sees Super Master A");
assert(saAUsernames.includes('master_test_a'), "Super Admin A sees Master A");
assert(saAUsernames.includes('user_test_a'), "Super Admin A sees User A");
assert(!saAUsernames.includes('sa_test_b'), "Super Admin A CANNOT see Super Admin B");
assert(!saAUsernames.includes('admin_test_b'), "Super Admin A CANNOT see Admin B");
assert(!saAUsernames.includes('user_test_b'), "Super Admin A CANNOT see User B");

// 3. ADMIN A Account Visibility Test
console.log('\n--- Test 3: ADMIN A Account Visibility ---');
const adminA = testAdmins[2];
const adminAVis = repo.getHierarchyUsers(adminA);
const adminAUsernames = adminAVis.map(u => u.username);
console.log('ADMIN A sees accounts:', adminAUsernames);
assert(adminAUsernames.includes('sm_test_a'), "Admin A sees Super Master A");
assert(adminAUsernames.includes('master_test_a'), "Admin A sees Master A");
assert(adminAUsernames.includes('user_test_a'), "Admin A sees User A");
assert(!adminAUsernames.includes('sa_test_a'), "Admin A CANNOT see parent Super Admin A");

// 4. SUPER MASTER A Account Visibility Test
console.log('\n--- Test 4: SUPER MASTER A Account Visibility ---');
const smA = testAdmins[3];
const smAVis = repo.getHierarchyUsers(smA);
const smAUsernames = smAVis.map(u => u.username);
console.log('SUPER MASTER A sees accounts:', smAUsernames);
assert(smAUsernames.includes('master_test_a'), "Super Master A sees Master A");
assert(smAUsernames.includes('user_test_a'), "Super Master A sees User A");
assert(!smAUsernames.includes('admin_test_a'), "Super Master A CANNOT see parent Admin A");

// 5. MASTER A Account Visibility Test
console.log('\n--- Test 5: MASTER A Account Visibility ---');
const masterA = testAdmins[4];
const masterAVis = repo.getHierarchyUsers(masterA);
const masterAUsernames = masterAVis.map(u => u.username);
console.log('MASTER A sees accounts:', masterAUsernames);
assert(masterAUsernames.includes('user_test_a'), "Master A sees User A");
assert(masterAUsernames.length === 1, "Master A sees exactly 1 user");

// 6. USER A Account Visibility Test
console.log('\n--- Test 6: USER A Account Visibility ---');
const userA = testUsers[0];
const userAVis = repo.getHierarchyUsers(userA);
console.log('USER A sees accounts count:', userAVis.length);
assert(userAVis.length === 0, "USER A has 0 user visibility access");

console.log('\n====================================================');
console.log('  ALL RECURSIVE VISIBILITY CHECKS PASSED (100%)');
console.log('====================================================\n');
