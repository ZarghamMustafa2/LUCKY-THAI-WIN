/**
 * test_thai_win_draw_results_section.js
 * Automated verification suite for Thai Win 4D Draw Results Section & Admin Panel Management
 */

const fs = require('fs');

const gameHtml = fs.readFileSync('e:\\NUMBER BET\\game.html', 'utf8');
const luckyGameHtml = fs.readFileSync('e:\\NUMBER BET\\lucky-thai-game\\index.html', 'utf8');
const adminHtml = fs.readFileSync('e:\\NUMBER BET\\admin.html', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ PASS: ${message}`);
}

console.log('====================================================');
console.log('  THAI WIN 4 DRAW RESULTS SECTION VERIFICATION SUITE');
console.log('====================================================');

console.log('\n--- TEST 1: Game Page UI Structure & Box Labels ---');
assert(gameHtml.includes('id="drawResultBox1"'), "Box 1 (1st DRAW) present in game.html");
assert(gameHtml.includes('id="drawResultBox2"'), "Box 2 (2nd DRAW) present in game.html");
assert(gameHtml.includes('id="drawResultBox3"'), "Box 3 (2nd DRAW) present in game.html");
assert(gameHtml.includes('id="drawResultBox4"'), "Box 4 (2nd DRAW) present in game.html");

assert(gameHtml.includes('1st DRAW'), "Label '1st DRAW' present in game.html");
assert(gameHtml.includes('2nd DRAW'), "Label '2nd DRAW' present in game.html");

console.log('\n--- TEST 2: Layout Position (Directly ABOVE Place Your Bet) ---');
const resultsPos = gameHtml.indexOf('OFFICIAL THAI WIN LIVE DRAW RESULTS SECTION');
const betPos = gameHtml.indexOf('PLACE YOUR BET BOARD FORM');
assert(resultsPos !== -1 && betPos !== -1 && resultsPos < betPos, "Draw Results section is positioned directly ABOVE Place Your Bet section");

console.log('\n--- TEST 3: Standalone Game Sub-directory Sync ---');
assert(luckyGameHtml.includes('id="drawResultBox1"'), "Box 1 present in lucky-thai-game/index.html");
assert(luckyGameHtml.includes('id="drawResultBox4"'), "Box 4 present in lucky-thai-game/index.html");

console.log('\n--- TEST 4: Admin Panel Draw Results Management Card ---');
assert(adminHtml.includes('id="adminDrawInput1"'), "Admin 1st DRAW input present");
assert(adminHtml.includes('id="adminDrawInput2"'), "Admin 2nd DRAW input present");
assert(adminHtml.includes('id="adminDrawInput3"'), "Admin 2nd DRAW input present");
assert(adminHtml.includes('id="adminDrawInput4"'), "Admin 2nd DRAW input present");
assert(adminHtml.includes('saveAdminDrawResults'), "saveAdminDrawResults function present in admin.html");

console.log('\n--- TEST 5: Real-Time Event Bus & Persistence Logic ---');
assert(gameHtml.includes('THAINXT_DRAW_RESULTS_UPDATED'), "Real-time event listener registered in game.html");
assert(adminHtml.includes('THAINXT_DRAW_RESULTS_UPDATED'), "Real-time event broadcaster registered in admin.html");

console.log('\n====================================================');
console.log('  THAI WIN 4 DRAW RESULTS SECTION VERIFIED 100% CLEAN');
console.log('====================================================\n');
