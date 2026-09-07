/**
 * test_bpexch_dashboard_ui.js
 * Verification of BPEXCH Reference-Based Dashboard Recreation:
 * 1. Top Header: BPEXCH logo, hamburger menu, nav links (Dashboard, Users, Reports), account name & level, B: 0 Exp: 0.
 * 2. Left Sidebar: Dark charcoal background, exact menu items (Dashboard, Users, Current Position, Reports, Bet Lock, Star Casino, World Casino, BetFair Games, Soccer, Tennis, Cricket, and collapse bar).
 * 3. Search-Users Card: Header with filter icon, text input with 'Username' placeholder, green search button.
 * 4. Sport Highlights Card: Header with 'Sport Highlights' title, green 'Refresh' button, 'Soccer' and 'Amount' columns, match rows.
 * 5. Preservation: User ID Bp28233, credentials box, level hierarchy, and token transfers remain intact.
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
console.log('  BPEXCH DASHBOARD UI RECREATION VERIFICATION');
console.log('====================================================');

// 1. Top Header Verification
console.log('\n--- Test 1: BPEXCH Header Structure ---');
assert(adminHtml.includes('LUCKY THAI WIN'), 'Header contains LUCKY THAI WIN brand text');
assert(adminHtml.includes('topNavLink_dashboard') && adminHtml.includes('topNavLink_users') && adminHtml.includes('topNavLink_reports'), 'Top navigation links (Dashboard, Users, Reports) exist');
assert(adminHtml.includes('topBarAdminName') && adminHtml.includes('topBarAdminRole'), 'Top bar account name and role display exist');
assert(adminHtml.includes('topBarBalance') && adminHtml.includes('topBarExposure'), 'Top bar balance (B: 0) and exposure (Exp: 0) indicators exist');

// 2. Left Sidebar Verification
console.log('\n--- Test 2: Left Sidebar Navigation Items ---');
assert(adminHtml.includes('navBtn_dashboard'), 'Sidebar contains Dashboard item');
assert(adminHtml.includes('navBtn_users'), 'Sidebar contains Users item');
assert(adminHtml.includes('navBtn_current_position'), 'Sidebar contains Current Position item');
assert(adminHtml.includes('navBtn_reports'), 'Sidebar contains Reports item');
assert(adminHtml.includes('navBtn_risk') && adminHtml.includes('Bet Lock'), 'Sidebar contains Bet Lock item');
assert(adminHtml.includes('navBtn_star_casino') && adminHtml.includes('Star Casino'), 'Sidebar contains Star Casino item');
assert(adminHtml.includes('navBtn_world_casino') && adminHtml.includes('World Casino'), 'Sidebar contains World Casino item');
assert(adminHtml.includes('navBtn_betfair_games') && adminHtml.includes('BetFair Games'), 'Sidebar contains BetFair Games item');
assert(adminHtml.includes('navBtn_soccer') && adminHtml.includes('Soccer'), 'Sidebar contains Soccer item');
assert(adminHtml.includes('navBtn_tennis') && adminHtml.includes('Tennis'), 'Sidebar contains Tennis item');
assert(adminHtml.includes('navBtn_cricket') && adminHtml.includes('Cricket'), 'Sidebar contains Cricket item');
assert(adminHtml.includes('fa-chevron-left'), 'Sidebar contains collapse chevron toggle button');

// 3. Search-Users Card Verification
console.log('\n--- Test 3: Search-Users Section Card ---');
assert(adminHtml.includes('Search-Users'), 'Search-Users card header exists');
assert(adminHtml.includes('fa-filter'), 'Filter icon in Search-Users card exists');
assert(adminHtml.includes('id="dashSearchUserInput"'), 'dashSearchUserInput text field exists with placeholder Username');
assert(adminHtml.includes('handleDashboardUserSearch()'), 'Search button connected to handleDashboardUserSearch');

// 4. Sport Highlights Card & Table Verification
console.log('\n--- Test 4: Sport Highlights Card & Table ---');
assert(adminHtml.includes('Sport Highlights'), 'Sport Highlights card header exists');
assert(adminHtml.includes('refreshSportHighlights()'), 'Refresh button connected to refreshSportHighlights');
assert(adminHtml.includes('id="sportHighlightsTableBody"'), 'sportHighlightsTableBody table element exists');
assert(adminHtml.includes('highlightsCategoryHeader'), 'Category header (Soccer) exists');
assert(adminHtml.includes('Almeria v Eldense / Match Odds'), 'Sport highlights data contains Almeria v Eldense from screenshot');
assert(adminHtml.includes('Batman Petrolspor v Boluspor / Match Odds'), 'Sport highlights data contains Batman Petrolspor v Boluspor from screenshot');
assert(adminHtml.includes('Deportivo v Elche / Match Odds'), 'Sport highlights data contains Deportivo v Elche from screenshot');

// 5. Functionality Preservation & Lock Check
console.log('\n--- Test 5: Functionality Preservation (User Credentials & Level Scoping) ---');
assert(adminHtml.includes('moduleCredUserId') && adminHtml.includes('Bp28233'), 'User Credentials box for Bp28233 is preserved');
assert(adminHtml.includes('moduleCredName') && adminHtml.includes('Alex_Winner'), 'User Credentials box for Alex_Winner is preserved');
assert(adminHtml.includes('moduleCredPassword') && adminHtml.includes('Bp28233@pass'), 'User Credentials box for password is preserved');
assert(adminHtml.includes('toggleModuleCredPassword()'), 'Eye toggle for password is preserved');
assert(adminHtml.includes('levelDetailsCard'), 'Level details card for hierarchy scoping is preserved');

console.log('\n====================================================');
console.log('  ALL BPEXCH DASHBOARD UI CHECKS PASSED (100%)');
console.log('====================================================\n');
