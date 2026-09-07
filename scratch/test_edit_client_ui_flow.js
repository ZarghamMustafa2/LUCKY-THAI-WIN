/**
 * test_edit_client_ui_flow.js
 * Verify Edit Client view and Max Bet Sizes layout
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
console.log('  EDIT CLIENT VIEW (SCREENSHOT VERIFICATION) TEST');
console.log('====================================================');

// 1. Check module container
assert(adminHtml.includes('id="module_edit_client"'), "module_edit_client container exists");

// 2. Check top navigation green pill tabs
assert(adminHtml.includes("Edit User"), "Edit User green button exists");
assert(adminHtml.includes("Ledger"), "Ledger navigation button exists");
assert(adminHtml.includes("Bets"), "Bets navigation button exists");
assert(adminHtml.includes("Profit Loss"), "Profit Loss navigation button exists");
assert(adminHtml.includes("Current Position"), "Current Position navigation button exists");
assert(adminHtml.includes('id="editClientHeaderUsername"'), "editClientHeaderUsername heading exists");

// 3. Check Left Card: Edit Client form fields
assert(adminHtml.includes('id="editClientId"'), "editClientId element exists");
assert(adminHtml.includes('id="editClientUsername"'), "editClientUsername element exists");
assert(adminHtml.includes('id="editClientType"'), "editClientType element exists");
assert(adminHtml.includes('id="editClientCurrency"'), "editClientCurrency element exists");
assert(adminHtml.includes('id="editClientPassword"'), "editClientPassword input exists");
assert(adminHtml.includes('id="editClientIsActive"'), "editClientIsActive checkbox exists");
assert(adminHtml.includes('id="editClientBettingAllowed"'), "editClientBettingAllowed checkbox exists");
assert(adminHtml.includes('id="editClientCanSettle"'), "editClientCanSettle checkbox exists (Enable S button)");
assert(adminHtml.includes('id="editClientPhone"'), "editClientPhone input exists");
assert(adminHtml.includes('id="editClientReference"'), "editClientReference input exists");
assert(adminHtml.includes('id="editClientNotes"'), "editClientNotes textarea exists");
assert(adminHtml.includes('id="editClientCommission"'), "editClientCommission input exists");
assert(adminHtml.includes("Min commission is 2.00 %"), "Min commission helper text exists");
assert(adminHtml.includes('id="editClientDomain"'), "editClientDomain input exists");
assert(adminHtml.includes("handleSaveEditClient(event)"), "handleSaveEditClient submit handler exists");

// 4. Check Right Card: Max Bet Sizes form fields
assert(adminHtml.includes("Max Bet Sizes"), "Max Bet Sizes card header exists");
assert(adminHtml.includes('id="maxBetSoccer"'), "maxBetSoccer input exists");
assert(adminHtml.includes("Max: 1,000,000"), "Soccer max helper text exists");
assert(adminHtml.includes('id="maxBetTennis"'), "maxBetTennis input exists");
assert(adminHtml.includes("Max: 250,000"), "Tennis max helper text exists");
assert(adminHtml.includes('id="maxBetCricket"'), "maxBetCricket input exists");
assert(adminHtml.includes("Max: 5,000,000"), "Cricket max helper text exists");
assert(adminHtml.includes('id="maxBetFancy"'), "maxBetFancy input exists");
assert(adminHtml.includes("Max: 200,000"), "Fancy max helper text exists");
assert(adminHtml.includes('id="maxBetRaces"'), "maxBetRaces input exists");
assert(adminHtml.includes('id="maxBetCasino"'), "maxBetCasino input exists");
assert(adminHtml.includes("Max: 50,000"), "Casino max helper text exists");
assert(adminHtml.includes('id="maxBetGreyhound"'), "maxBetGreyhound input exists");
assert(adminHtml.includes('id="maxBetBookMaker"'), "maxBetBookMaker input exists");
assert(adminHtml.includes("Max: 2,000,000"), "BookMaker max helper text exists");
assert(adminHtml.includes('id="maxBetTPin"'), "maxBetTPin input exists");
assert(adminHtml.includes("handleSaveMaxBetSizes(event)"), "handleSaveMaxBetSizes submit handler exists");

// 5. Check Options column pencil button wiring
assert(adminHtml.includes("openEditUserView('${u.username}')"), "Pencil button in table triggers openEditUserView");
assert(adminHtml.includes("openEditUserView('Ahmad1330x')"), "Pencil badge in legend triggers openEditUserView");

// 6. Check JS methods
assert(adminHtml.includes("function openEditUserView(username)"), "openEditUserView JS function exists");
assert(adminHtml.includes("function handleSaveEditClient(e)"), "handleSaveEditClient JS function exists");
assert(adminHtml.includes("function handleSaveMaxBetSizes(e)"), "handleSaveMaxBetSizes JS function exists");

console.log('\n====================================================');
console.log('  ALL EDIT CLIENT VERIFICATION CHECKS PASSED (100%)');
console.log('====================================================\n');
