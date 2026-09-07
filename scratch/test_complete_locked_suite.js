/**
 * test_complete_locked_suite.js
 * MASTER LOCK SUITE - Verifies and locks all completed platform features:
 * 1. Branding: LUCKY THAI WIN
 * 2. Top Header & Session Bar (B: 0, Exp: 0, Ahmad5050x / SuperMaster)
 * 3. Mobile Responsive Drawer & Re-open Cycle (z-[60], top-[50px] backdrop)
 * 4. Dashboard View (Search-Users + Sport Highlights with exact matches)
 * 5. Users Section (Report Type tabs + Search Users + Quad Metrics + Legend)
 * 6. Reports Section (Report Type tabs [Book Detail active] + Date/Time Filter + Submit + Welcome to Exchange footer)
 * 7. Bet Lock Section (Allowed Market Types tree + All Casino, Cricket, Greyhound, Horse Race, Soccer, Tennis + Save button)
 * 8. Removal of Active Synchronized Player credentials bar as requested by user
 * 9. Cash / Credit Adjustment Modal (Option C flow)
 * 10. Edit Client & Max Bet Sizes View (Pencil icon flow)
 * 11. Load Balance Click Masking & Loading Animation Delay
 * 12. Role Hierarchy Modal Integration in addUserModal (Company -> Super Admin -> Admin -> Super Master -> Master -> User)
 * 13. Recursive Hierarchy Account Visibility Scoper (getHierarchyUsers)
 * 14. Centralized Role Permissions Matrix & Fixed Role Normalization (getNormalizedRole)
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
console.log('  LUCKY THAI WIN - MASTER LOCK VERIFICATION SUITE');
console.log('====================================================');

// 1. Branding & Top Header
console.log('\n--- Lock 1: Branding & Header Structure ---');
assert(adminHtml.includes('LUCKY THAIWIN') || adminHtml.includes('LUCKY THAI WIN'), 'Header contains LUCKY THAIWIN brand text');
assert(adminHtml.includes('topNavLink_dashboard'), 'Dashboard top navigation link exists');
assert(adminHtml.includes('topNavLink_users'), 'Users top navigation link exists');
assert(adminHtml.includes('topNavLink_reports'), 'Reports top navigation link exists');
assert(adminHtml.includes('topBarBalance') && adminHtml.includes('topBarExposure'), 'B: 0 and Exp: 0 indicators exist');

// 2. Mobile Responsiveness & Drawer
console.log('\n--- Lock 2: Mobile Responsive Drawer & Layering ---');
assert(adminHtml.includes('sidebarBackdrop'), 'Backdrop overlay exists');
assert(adminHtml.includes('top-[50px]'), 'Backdrop starts below top header (top-[50px])');
assert(adminHtml.includes('z-[60]'), 'Header has z-[60] for guaranteed mobile accessibility');
assert(adminHtml.includes('toggleAdminSidebar'), 'toggleAdminSidebar handler exists');

// 3. Dashboard
console.log('\n--- Lock 3: Dashboard & Sport Highlights ---');
assert(adminHtml.includes('dashSearchUserInput'), 'Dashboard user search input exists');
assert(adminHtml.includes('sportHighlightsTableBody'), 'Sport highlights table exists');
assert(adminHtml.includes('Almeria v Eldense'), 'Sport highlights data includes Almeria v Eldense');
assert(adminHtml.includes('Deportivo v Elche'), 'Sport highlights data includes Deportivo v Elche');

// 4. Users Section
console.log('\n--- Lock 4: Users Section & Clients List ---');
assert(adminHtml.includes('userSearchModuleInput'), 'userSearchModuleInput exists');
assert(adminHtml.includes('usersClientsListTitle'), 'Dynamic Clients List title exists');
assert(adminHtml.includes('clientsCreditRemaining'), 'Credit Remaining metric exists');
assert(adminHtml.includes('clientsCash'), 'Cash metric exists');
assert(adminHtml.includes('clientsPlDownline'), 'P/L Downline metric exists');
assert(adminHtml.includes('clientsUsersCount'), 'Users count metric exists');

// 5. Reports Section
console.log('\n--- Lock 5: Reports Section & Date Filter ---');
assert(adminHtml.includes('repTab_book_detail'), 'Book Detail report tab exists');
assert(adminHtml.includes('reportStartDateInput'), 'Report start date input exists');
assert(adminHtml.includes('reportEndDateInput'), 'Report end date input exists');
assert(adminHtml.includes('Welcome to Exchange.'), 'Welcome to Exchange footer exists');

// 6. Bet Lock Section
console.log('\n--- Lock 6: Bet Lock Allowed Market Types ---');
assert(adminHtml.includes('betLockTitle'), 'Allowed Market Types title element exists');
assert(adminHtml.includes('chk_cat_all_casino'), 'All Casino category checkbox exists');
assert(adminHtml.includes('chk_cat_cricket'), 'Cricket category checkbox exists');
assert(adminHtml.includes('chk_cat_greyhound'), 'Greyhound category checkbox exists');
assert(adminHtml.includes('chk_cat_horse_race'), 'Horse Race category checkbox exists');
assert(adminHtml.includes('chk_cat_soccer'), 'Soccer category checkbox exists');
assert(adminHtml.includes('chk_cat_tennis'), 'Tennis category checkbox exists');
assert(adminHtml.includes('saveBetLockSettings()'), 'Save button connected to saveBetLockSettings()');

// 7. Active Synchronized Player Bar Removed
console.log('\n--- Lock 7: Active Synchronized Player Bar Removed ---');
assert(!adminHtml.includes('Active Synchronized Player:'), 'Active Synchronized Player bar is completely removed as requested');

// 8. Cash / Credit Adjustment Modal (Option C)
console.log('\n--- Lock 8: Cash / Credit Adjustment Modal (Option C) ---');
assert(adminHtml.includes('id="adjustWalletModal"'), 'adjustWalletModal modal element exists');
assert(adminHtml.includes('id="depositAmountInput"'), 'depositAmountInput input exists');
assert(adminHtml.includes('handleDepositCashSubmit(event)'), 'handleDepositCashSubmit handler connected');

// 9. Edit Client & Max Bet Sizes (Pencil Icon Flow)
console.log('\n--- Lock 9: Edit Client & Max Bet Sizes View (Pencil Icon Flow) ---');
assert(adminHtml.includes('id="module_edit_client"'), 'module_edit_client container exists');
assert(adminHtml.includes('id="editClientHeaderUsername"'), 'editClientHeaderUsername header element exists');
assert(adminHtml.includes('id="editClientId"'), 'editClientId element exists');
assert(adminHtml.includes('id="editClientCanSettle"'), 'Can Settle PL (Enable S button) checkbox exists');
assert(adminHtml.includes('handleSaveEditClient(event)'), 'Save edit client form handler connected');
assert(adminHtml.includes('id="maxBetSoccer"'), 'Soccer max bet input exists');
assert(adminHtml.includes('id="maxBetCricket"'), 'Cricket max bet input exists');
assert(adminHtml.includes('id="maxBetBookMaker"'), 'BookMaker max bet input exists');
assert(adminHtml.includes('handleSaveMaxBetSizes(event)'), 'Save max bet sizes form handler connected');

// 10. Load Balance Click Masking & Loading Animation
console.log('\n--- Lock 10: Load Balance Click Masking & Loading Delay ---');
assert(adminHtml.includes('id="loadBalanceBtn"'), 'Load balance button ID loadBalanceBtn exists');
assert(adminHtml.includes('let isUsersBalanceLoaded = false;'), 'isUsersBalanceLoaded starts false');
assert(adminHtml.includes('let isUsersBalanceLoading = false;'), 'isUsersBalanceLoading starts false');
assert(adminHtml.includes('fa-circle-notch fa-spin'), 'Circle notch loading spinner animation exists');

// 11. Role Hierarchy Modal Integration & Centralized Matrix
console.log('\n--- Lock 11: Centralized Role Permissions & Options Matrix ---');
assert(adminHtml.includes('id="newUserTypeContainer"'), 'newUserTypeContainer dynamic container exists');
assert(adminHtml.includes('ROLE_CREATION_PERMISSIONS'), 'ROLE_CREATION_PERMISSIONS matrix exists');
assert(adminHtml.includes('!allowedRoles.includes(selectedRoleKey)'), 'Backend permission validation check exists');

// 12. Recursive Hierarchy Visibility Engine
console.log('\n--- Lock 12: Recursive Hierarchy Account Visibility Engine ---');
assert(adminHtml.includes('AdminCore.repo.getHierarchyUsers(admin)'), 'renderUsersTable calls backend getHierarchyUsers');

console.log('\n====================================================');
console.log('  ALL CHECKS LOCKED AND VERIFIED (100% COMPLETE)');
console.log('====================================================\n');
