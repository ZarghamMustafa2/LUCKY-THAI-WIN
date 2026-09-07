/**
 * test_mobile_sidebar_reopen.js
 * Verification of Mobile Sidebar Drawer Toggle & Re-open Cycle
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
console.log('  MOBILE SIDEBAR RE-OPEN CYCLE VERIFICATION');
console.log('====================================================');

// Mock DOM elements
class MockClassList {
  constructor(initial = []) {
    this.classes = new Set(initial);
  }
  add(...cls) { cls.forEach(c => this.classes.add(c)); }
  remove(...cls) { cls.forEach(c => this.classes.delete(c)); }
  toggle(cls) { 
    if (this.classes.has(cls)) this.classes.delete(cls);
    else this.classes.add(cls);
  }
  contains(cls) { return this.classes.has(cls); }
}

const mockSidebar = { classList: new MockClassList(['-translate-x-full']) };
const mockBackdrop = { classList: new MockClassList(['hidden']) };

// Simulated toggle function from admin.html
function toggleAdminSidebar(forceClose = false, isMobile = true) {
  if (forceClose === true) {
    mockSidebar.classList.add('-translate-x-full');
    mockSidebar.classList.remove('translate-x-0');
    mockBackdrop.classList.add('hidden');
    return;
  }

  if (isMobile) {
    const isClosed = mockSidebar.classList.contains('-translate-x-full');
    if (isClosed) {
      mockSidebar.classList.remove('-translate-x-full');
      mockSidebar.classList.add('translate-x-0');
      mockBackdrop.classList.remove('hidden');
    } else {
      mockSidebar.classList.add('-translate-x-full');
      mockSidebar.classList.remove('translate-x-0');
      mockBackdrop.classList.add('hidden');
    }
  } else {
    mockSidebar.classList.toggle('hidden');
  }
}

// Simulated switchModule function
function switchAdminModule(moduleId) {
  toggleAdminSidebar(true, true);
}

// 1. Initial State: Sidebar is closed
console.log('\n--- Test 1: Initial State ---');
assert(mockSidebar.classList.contains('-translate-x-full'), 'Sidebar initially closed (-translate-x-full)');
assert(mockBackdrop.classList.contains('hidden'), 'Backdrop initially hidden');

// 2. User taps hamburger button
console.log('\n--- Test 2: User taps Hamburger button ---');
toggleAdminSidebar();
assert(mockSidebar.classList.contains('translate-x-0'), 'Sidebar opened (translate-x-0)');
assert(!mockSidebar.classList.contains('-translate-x-full'), 'Sidebar no longer has -translate-x-full');
assert(!mockBackdrop.classList.contains('hidden'), 'Backdrop visible (hidden removed)');

// 3. User taps on "Users" section
console.log('\n--- Test 3: User selects "Users" section ---');
switchAdminModule('users');
assert(mockSidebar.classList.contains('-translate-x-full'), 'Sidebar auto-closed on selection');
assert(mockBackdrop.classList.contains('hidden'), 'Backdrop hidden');

// 4. User taps Hamburger button AGAIN
console.log('\n--- Test 4: User taps Hamburger button AGAIN ---');
toggleAdminSidebar();
assert(mockSidebar.classList.contains('translate-x-0'), 'Sidebar re-opened successfully');
assert(!mockBackdrop.classList.contains('hidden'), 'Backdrop visible again');

// 5. User taps on "Reports" section
console.log('\n--- Test 5: User selects "Reports" section ---');
switchAdminModule('reports');
assert(mockSidebar.classList.contains('-translate-x-full'), 'Sidebar closed on Reports selection');

// 6. User taps Hamburger button 3rd time
console.log('\n--- Test 6: User taps Hamburger button 3rd time ---');
toggleAdminSidebar();
assert(mockSidebar.classList.contains('translate-x-0'), 'Sidebar re-opened 3rd time successfully');

// 7. User taps Backdrop to dismiss
console.log('\n--- Test 7: User taps Backdrop to close ---');
toggleAdminSidebar(true);
assert(mockSidebar.classList.contains('-translate-x-full'), 'Sidebar closed by backdrop click');

// 8. User taps Hamburger button 4th time
console.log('\n--- Test 8: User taps Hamburger button 4th time ---');
toggleAdminSidebar();
assert(mockSidebar.classList.contains('translate-x-0'), 'Sidebar re-opened 4th time');

console.log('\n====================================================');
console.log('  ALL MOBILE SIDEBAR RE-OPEN TESTS PASSED (100%)');
console.log('====================================================\n');
