/**
 * test_current_position_user_scoping.js
 * Verification suite for Current Position User-Scoping:
 * 1. User A (Ahmad1330x) renders ONLY Ahmad1330x positions.
 * 2. User B (Mumtaz9300) renders ONLY Mumtaz9300 positions.
 * 3. User C (Luqman987x - No positions) renders empty state: "No open market positions for @Luqman987x".
 * 4. User switching clears previous stale state cleanly.
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
console.log('  CURRENT POSITION USER-SCOPING TEST SUITE');
console.log('====================================================');

// Mock DOM
const domElements = {};
const moduleVisibilities = {};

global.document = {
  getElementById: (id) => {
    if (!domElements[id]) {
      domElements[id] = {
        innerText: '',
        innerHTML: '',
        value: '',
        checked: false,
        disabled: false,
        style: {},
        classList: {
          add: (...cls) => {
            if (cls.includes('hidden')) moduleVisibilities[id] = false;
          },
          remove: (...cls) => {
            if (cls.includes('hidden')) moduleVisibilities[id] = true;
          },
          contains: (c) => (c === 'hidden' ? !moduleVisibilities[id] : false)
        }
      };
    }
    return domElements[id];
  },
  querySelectorAll: (selector) => {
    if (selector === '.module-view') {
      return Object.keys(moduleVisibilities).map(id => ({
        id,
        classList: { add: (c) => { if (c === 'hidden') moduleVisibilities[id] = false; } }
      }));
    }
    return [];
  },
  querySelector: () => null,
  cookie: '',
  addEventListener: () => {}
};

const localStorageMap = new Map();
global.localStorage = {
  getItem: (k) => localStorageMap.get(k) || null,
  setItem: (k, v) => localStorageMap.set(k, String(v)),
  removeItem: (k) => localStorageMap.delete(k)
};
global.sessionStorage = { clear: () => {} };
global.window = global;
global.window.addEventListener = () => {};

global.showAdminToast = (msg, type) => {
  console.log(`  [Toast ${(type || 'info').toUpperCase()}] ${msg}`);
};
global.openModal = () => {};
global.closeModal = () => {};
global.applySidebarPermissions = () => {};
global.updateDashboardMetrics = () => {};
global.renderUsersTable = () => {};
global.renderSportHighlights = () => {};

eval(adminEngineJs);

const roleConfigMatch = adminHtml.match(/\/\/ ─── CENTRALIZED ROLE PERMISSIONS & DISPLAY CONFIGURATION ───[\s\S]*?window\.getNormalizedRole = getNormalizedRole;/);
eval(roleConfigMatch[0]);

const switchModuleMatch = adminHtml.match(/function switchAdminModule\(moduleId\) \{[\s\S]*?\n    \}/);
eval(switchModuleMatch[0]);

const marketPosMatch = adminHtml.match(/const DEFAULT_MARKET_POSITIONS = [\s\S]*?function openUserBookModal\(\) \{[\s\S]*?\n    \}/);
eval(marketPosMatch[0]);

// TEST 1: User A (Ahmad1330x)
console.log('\n--- TEST 1: User A (Ahmad1330x) Position Scoping ---');
refreshMarketPosition('Ahmad1330x');
const userAHtml = document.getElementById('marketPositionContent').innerHTML;

assert(userAHtml.includes('Besiktas v FK Kauno Zalgiris'), "User A: Besiktas soccer match rendered");
assert(userAHtml.includes('-1,700'), "User A: Net position -1,700 rendered");
assert(userAHtml.includes('Crvena Zvezda v Plzen'), "User A: Crvena Zvezda soccer match rendered");
assert(userAHtml.includes('-42'), "User A: Net position -42 rendered");
assert(userAHtml.includes('A Anisimova v J Pegula') === false, "User A: User B's tennis match is NOT rendered for User A");

// TEST 2: User B (Mumtaz9300)
console.log('\n--- TEST 2: User B (Mumtaz9300) Position Scoping ---');
refreshMarketPosition('Mumtaz9300');
const userBHtml = document.getElementById('marketPositionContent').innerHTML;

assert(userBHtml.includes('A Anisimova v J Pegula'), "User B: Tennis match rendered for User B");
assert(userBHtml.includes('-2,550'), "User B: Net position -2,550 rendered");
assert(userBHtml.includes('Besiktas v FK Kauno Zalgiris') === false, "User B: User A's soccer match is NOT rendered for User B");
assert(userBHtml.includes('Crvena Zvezda v Plzen') === false, "User B: User A's second soccer match is NOT rendered for User B");

// TEST 3: User C (Luqman987x - No Open Positions Empty State)
console.log('\n--- TEST 3: User C (Luqman987x) Empty State ---');
refreshMarketPosition('Luqman987x');
const userCHtml = document.getElementById('marketPositionContent').innerHTML;

assert(userCHtml.includes('No open market positions for @Luqman987x'), "User C: Empty state 'No open market positions for @Luqman987x' displayed");

// TEST 4: Immediate Switching Back to User A
console.log('\n--- TEST 4: Switching Back to User A ---');
refreshMarketPosition('Ahmad1330x');
const switchAHtml = document.getElementById('marketPositionContent').innerHTML;

assert(switchAHtml.includes('Besiktas v FK Kauno Zalgiris'), "Switching back: User A's soccer match re-rendered cleanly");
assert(switchAHtml.includes('A Anisimova v J Pegula') === false, "Switching back: User B's tennis match is NOT retained");

console.log('\n====================================================');
console.log('  CURRENT POSITION USER-SCOPING VERIFIED 100% CLEAN');
console.log('====================================================\n');
