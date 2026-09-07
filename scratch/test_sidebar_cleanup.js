/**
 * test_sidebar_cleanup.js
 * Verification suite to ensure 7 specified items are removed from sidebar navigation.
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
console.log('  SIDEBAR NAVIGATION CLEANUP VERIFICATION SUITE');
console.log('====================================================');

const removedNavIds = [
  'navBtn_inactive_accounts',
  'navBtn_security',
  'navBtn_archive',
  'navBtn_risk',
  'navBtn_star_casino',
  'navBtn_world_casino',
  'navBtn_paper_casino'
];

const removedTitles = [
  'Inactive Accounts',
  'Security & 2FA',
  'Archive',
  'Bet Lock',
  'Star Casino',
  'World Casino',
  'Paper Casino'
];

// Extract sidebar HTML block
const sidebarMatch = adminHtml.match(/<aside[\s\S]*?<\/aside>/);
assert(sidebarMatch !== null, "Sidebar <aside> element found in admin.html");

const sidebarHtml = sidebarMatch[0];

removedNavIds.forEach((id, idx) => {
  const hasId = sidebarHtml.includes(`id="${id}"`);
  assert(!hasId, `Sidebar DOES NOT contain button element with id="${id}"`);
});

removedTitles.forEach((title) => {
  const hasTitle = sidebarHtml.includes(`<span>${title}</span>`);
  assert(!hasTitle, `Sidebar DOES NOT contain span title "${title}"`);
});

// Verify remaining items are intact
const preservedNavIds = [
  'navBtn_dashboard',
  'navBtn_users',
  'navBtn_current_position',
  'navBtn_reports',
  'navBtn_api_services',
  'navBtn_betfair_games',
  'navBtn_soccer',
  'navBtn_tennis',
  'navBtn_cricket',
  'navBtn_racing',
  'navBtn_playon'
];

preservedNavIds.forEach((id) => {
  const hasId = sidebarHtml.includes(`id="${id}"`);
  assert(hasId, `Sidebar preserves required navigation item id="${id}"`);
});

console.log('\n====================================================');
console.log('  SIDEBAR NAVIGATION CLEANUP VERIFIED 100% CLEAN');
console.log('====================================================\n');
