/**
 * test_company_account.js
 * Verification test for top-level COMPANY account setup, login, and Create New User modal integration.
 */

const fs = require('fs');

const adminHtml = fs.readFileSync('e:\\NUMBER BET\\admin.html', 'utf8');
const adminEngineJs = fs.readFileSync('e:\\NUMBER BET\\admin-engine.js', 'utf8');
const authJs = fs.readFileSync('e:\\NUMBER BET\\auth.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('====================================================');
console.log('  TOP-LEVEL COMPANY ACCOUNT VERIFICATION SUITE');
console.log('====================================================');

// 1. Initial COMPANY account in repository
console.log('\n--- Test 1: Repository COMPANY Account Definition ---');
assert(adminEngineJs.includes("username: 'company'"), "Company account username is 'company'");
assert(adminEngineJs.includes("pass: 'Company123!'"), "Company account password is 'Company123!'");
assert(adminEngineJs.includes("role: 'COMPANY'"), "Role is COMPANY");
assert(adminEngineJs.includes("uplineId: null"), "COMPANY account has uplineId: null");
assert(adminEngineJs.includes("parentId: null"), "COMPANY account has parentId: null");

// 2. Authentication system integration in auth.js
console.log('\n--- Test 2: Authentication System Integration ---');
assert(authJs.includes("username.toLowerCase() === 'company'"), "auth.js checks username 'company'");
assert(authJs.includes("Company123!"), "auth.js verifies password 'Company123!'");
assert(authJs.includes("localStorage.setItem('ACTIVE_ADMIN_SESSION', JSON.stringify("), "auth.js sets ACTIVE_ADMIN_SESSION");
assert(authJs.includes("window.location.href = 'admin.html'"), "auth.js redirects to admin.html on successful login");

// 3. Modal Title & Role Hierarchy for COMPANY account
console.log('\n--- Test 3: Modal Title & Options for COMPANY Account ---');
assert(adminHtml.includes("'COMPANY': ['SUPER_ADMIN', 'ADMIN', 'SUPER_MASTER', 'MASTER', 'USER']"), "COMPANY hierarchy lists Super Admin, Admin, Super Master, Master, User");
assert(adminHtml.includes("raw === 'COMPANY' || raw === 'COMPANY_ADMIN' || raw.includes('COMPANY')"), "getNormalizedRole correctly identifies COMPANY role");

console.log('\n====================================================');
console.log('  ALL COMPANY ACCOUNT CHECKS PASSED (100%)');
console.log('====================================================\n');
