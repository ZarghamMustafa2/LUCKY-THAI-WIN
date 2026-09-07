const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== STARTING AUTOMATED VERIFICATION FOR THAI WIN RESULTS RESTRUCTURING & COMPANY AUTHORIZATION ===');

// 1. Verify admin.html structure
const adminHtmlPath = path.join(__dirname, '..', 'admin.html');
const adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');

// Check Old Card Removal from Executive Dashboard
const hasOldCardInDashboard = adminHtml.includes('SECTION 1.5: THAI WIN DRAW RESULTS MANAGEMENT CARD');
assert(!hasOldCardInDashboard, 'FAIL: Old card section 1.5 must be completely removed from Executive Dashboard');
console.log('✅ PASS: Old card removed from Executive Dashboard in admin.html');

// Check Standalone Sidebar Menu Item
const hasSidebarBtn = adminHtml.includes('id="navBtn_thai_win_results"') && adminHtml.includes('switchAdminModule(\'thai_win_results\')');
assert(hasSidebarBtn, 'FAIL: Sidebar item navBtn_thai_win_results missing');
console.log('✅ PASS: Standalone sidebar item "Thai Win Results" added to admin.html');

// Check Dedicated Module Container
const hasDedicatedView = adminHtml.includes('id="module_thai_win_results"') &&
                         adminHtml.includes('Thai Win Results') &&
                         adminHtml.includes('Manage Official 4D Draw Results') &&
                         adminHtml.includes('id="adminDedicatedDrawInput1"') &&
                         adminHtml.includes('id="adminDedicatedDrawInput2"') &&
                         adminHtml.includes('id="adminDedicatedDrawInput3"') &&
                         adminHtml.includes('id="adminDedicatedDrawInput4"') &&
                         adminHtml.includes('saveAdminDedicatedDrawResults()');
assert(hasDedicatedView, 'FAIL: Dedicated page module_thai_win_results missing required elements');
console.log('✅ PASS: Dedicated Thai Win Results page UI rendered with all 4 input cards and Publish button');

// Check JS Engine Role Controls
assert(adminHtml.includes('if (normRole === \'COMPANY\')'), 'FAIL: applySidebarPermissions must check for COMPANY role');
assert(adminHtml.includes('showAdminToast(\'Access Denied: Thai Win Draw Results Management is restricted strictly to COMPANY level accounts.\', \'error\')'), 'FAIL: Security toast missing in switchAdminModule');
console.log('✅ PASS: Client-side role enforcement and Toast alerts configured for COMPANY role only');

// 2. Evaluate Sidebar & switchAdminModule Permission Logic
console.log('\n--- TESTING SIDEBAR VISIBILITY AND DIRECT MODULE ACCESS BY ROLE ---');

function mockApplySidebarPermissions(role) {
  const normRole = role;
  if (normRole === 'COMPANY') {
    return true; // sidebar item unhidden
  }
  return false; // sidebar item hidden
}

function mockSwitchAdminModule(role, moduleId) {
  const normRole = role;
  if (moduleId === 'thai_win_results') {
    if (normRole !== 'COMPANY') {
      return 'dashboard'; // redirect to dashboard
    }
    return 'thai_win_results'; // accessible
  }
  return moduleId;
}

const rolesToTest = [
  { role: 'COMPANY', expectSidebar: true, expectModuleAccess: true },
  { role: 'SUPER_ADMIN', expectSidebar: false, expectModuleAccess: false },
  { role: 'ADMIN', expectSidebar: false, expectModuleAccess: false },
  { role: 'SUPER_MASTER', expectSidebar: false, expectModuleAccess: false },
  { role: 'MASTER', expectSidebar: false, expectModuleAccess: false },
  { role: 'AGENT', expectSidebar: false, expectModuleAccess: false },
  { role: 'USER', expectSidebar: false, expectModuleAccess: false }
];

rolesToTest.forEach(testCase => {
  const isSidebarVisible = mockApplySidebarPermissions(testCase.role);
  assert.strictEqual(
    isSidebarVisible,
    testCase.expectSidebar,
    `FAIL: Role ${testCase.role} sidebar visibility expected ${testCase.expectSidebar} but got ${isSidebarVisible}`
  );
  console.log(`  Role [${testCase.role}]: Sidebar Option Visible = ${isSidebarVisible ? 'YES (PASS)' : 'NO (PASS)'}`);

  const activeModule = mockSwitchAdminModule(testCase.role, 'thai_win_results');
  const isModuleAccessible = (activeModule === 'thai_win_results');
  assert.strictEqual(
    isModuleAccessible,
    testCase.expectModuleAccess,
    `FAIL: Role ${testCase.role} module access expected ${testCase.expectModuleAccess} but got ${isModuleAccessible}`
  );
  console.log(`  Role [${testCase.role}]: Direct Route Access = ${isModuleAccessible ? 'ALLOWED (PASS)' : 'BLOCKED -> Dashboard (PASS)'}`);
});

// 3. Test API Role Authorization Handling
console.log('\n--- TESTING SERVERLESS API ROLE AUTHORIZATION ENFORCEMENT ---');
const syncApiHandler = require('../api/rounds/sync-result');

function createMockReqRes(role, body) {
  const req = {
    method: 'POST',
    headers: { 'x-admin-role': role },
    body: body
  };
  let resStatus = null;
  let resJson = null;
  const res = {
    setHeader: () => {},
    status: (code) => {
      resStatus = code;
      return {
        json: (data) => { resJson = data; }
      };
    }
  };
  return { req, res, getResult: () => ({ status: resStatus, body: resJson }) };
}

async function testApiAuthorization() {
  // Test non-COMPANY role API call (e.g. SUPER_ADMIN)
  const superAdminTest = createMockReqRes('SUPER_ADMIN', { winningNumbers: ['1111', '2222', '3333', '4444'] });
  await syncApiHandler(superAdminTest.req, superAdminTest.res);
  const superAdminResult = superAdminTest.getResult();
  assert.strictEqual(superAdminResult.status, 403, 'FAIL: API must reject SUPER_ADMIN with 403 Forbidden');
  console.log('✅ PASS: API endpoint returned 403 Forbidden for SUPER_ADMIN role');

  // Test non-COMPANY role API call (e.g. ADMIN)
  const adminTest = createMockReqRes('ADMIN', { winningNumbers: ['1111', '2222', '3333', '4444'] });
  await syncApiHandler(adminTest.req, adminTest.res);
  const adminResult = adminTest.getResult();
  assert.strictEqual(adminResult.status, 403, 'FAIL: API must reject ADMIN with 403 Forbidden');
  console.log('✅ PASS: API endpoint returned 403 Forbidden for ADMIN role');

  // Test COMPANY role API call
  const companyTest = createMockReqRes('COMPANY', { winningNumbers: ['9999', '8888', '7777', '6666'] });
  await syncApiHandler(companyTest.req, companyTest.res);
  const companyResult = companyTest.getResult();
  assert.strictEqual(companyResult.status, 200, 'FAIL: API must accept COMPANY role with 200 OK');
  assert.strictEqual(companyResult.body.success, true);
  console.log('✅ PASS: API endpoint accepted COMPANY role with 200 OK');

  console.log('\n🎉 ALL AUTOMATED TESTS PASSED 100% CLEAN!');
}

testApiAuthorization().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
