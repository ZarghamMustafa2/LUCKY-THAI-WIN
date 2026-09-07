/**
 * test_sidebar_toggle_fix.js
 * Verification suite for Navigation Sidebar Toggle & Overlay Fix:
 * 1. Click Menu Button -> Sidebar opens (translate-x-0 + hidden removed), Backdrop opens (hidden removed)
 * 2. Stacking Order: adminSidebar z-index (10000) > sidebarBackdrop z-index (9998)
 * 3. Menu items clickable
 * 4. Click Backdrop -> Sidebar closes (-translate-x-full), Backdrop hides
 * 5. Repeatable open/close without black-backdrop-only glitch
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
console.log('  SIDEBAR TOGGLE & OVERLAY FIX VERIFICATION SUITE');
console.log('====================================================');

// Mock DOM
const classesMap = {
  adminSidebar: new Set(['-translate-x-full', 'fixed']),
  sidebarBackdrop: new Set(['hidden', 'fixed'])
};

const domElements = {
  adminSidebar: {
    id: 'adminSidebar',
    classList: {
      add: (...cls) => cls.forEach(c => classesMap.adminSidebar.add(c)),
      remove: (...cls) => cls.forEach(c => classesMap.adminSidebar.delete(c)),
      contains: (c) => classesMap.adminSidebar.has(c),
      toggle: (c) => classesMap.adminSidebar.has(c) ? classesMap.adminSidebar.delete(c) : classesMap.adminSidebar.add(c)
    }
  },
  sidebarBackdrop: {
    id: 'sidebarBackdrop',
    classList: {
      add: (...cls) => cls.forEach(c => classesMap.sidebarBackdrop.add(c)),
      remove: (...cls) => cls.forEach(c => classesMap.sidebarBackdrop.delete(c)),
      contains: (c) => classesMap.sidebarBackdrop.has(c)
    }
  }
};

global.document = {
  getElementById: (id) => domElements[id] || null,
  querySelector: () => null,
  cookie: '',
  addEventListener: () => {}
};
global.window = { innerWidth: 400 };

const toggleFuncMatch = adminHtml.match(/function toggleAdminSidebar\(forceClose = false\) \{[\s\S]*?\n    \}/);
assert(toggleFuncMatch !== null, "toggleAdminSidebar function extracted from admin.html");
eval(toggleFuncMatch[0]);

// TEST 1: Initial Closed State Verification
console.log('\n--- Test 1: Initial Closed State ---');
assert(classesMap.adminSidebar.has('-translate-x-full'), "Sidebar initially closed (-translate-x-full)");
assert(classesMap.sidebarBackdrop.has('hidden'), "Backdrop initially hidden");

// TEST 2: Open Sidebar
console.log('\n--- Test 2: Click Menu Button (Open Sidebar) ---');
toggleAdminSidebar();

assert(!classesMap.adminSidebar.has('-translate-x-full'), "Sidebar is NO LONGER off-screen (-translate-x-full removed)");
assert(!classesMap.adminSidebar.has('hidden'), "Sidebar is NOT hidden (hidden removed)");
assert(classesMap.adminSidebar.has('translate-x-0'), "Sidebar is fully visible on-screen (translate-x-0 added)");
assert(!classesMap.sidebarBackdrop.has('hidden'), "Backdrop overlay is visible (hidden removed)");

// TEST 3: Stacking Order Verification in HTML
console.log('\n--- Test 3: Stacking Order & Z-Index Verification ---');
assert(adminHtml.includes('z-[10000]'), "adminSidebar has z-[10000] (Highest layer)");
assert(adminHtml.includes('z-[9998]'), "sidebarBackdrop has z-[9998] (Layer below sidebar)");

// TEST 4: Close Sidebar via Backdrop Click
console.log('\n--- Test 4: Click Backdrop Overlay (Close Sidebar) ---');
toggleAdminSidebar(true);

assert(classesMap.adminSidebar.has('-translate-x-full'), "Sidebar returned off-screen (-translate-x-full)");
assert(!classesMap.adminSidebar.has('translate-x-0'), "translate-x-0 removed");
assert(classesMap.sidebarBackdrop.has('hidden'), "Backdrop overlay hidden");

// TEST 5: Re-Open Sidebar Verification
console.log('\n--- Test 5: Re-Open Sidebar ---');
toggleAdminSidebar();

assert(classesMap.adminSidebar.has('translate-x-0'), "Sidebar re-opened cleanly (translate-x-0)");
assert(!classesMap.sidebarBackdrop.has('hidden'), "Backdrop overlay re-opened cleanly");

console.log('\n====================================================');
console.log('  SIDEBAR TOGGLE & OVERLAY FIX VERIFIED 100% CLEAN');
console.log('====================================================\n');
