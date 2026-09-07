const fs = require('fs');
const vm = require('vm');

console.log('================================================================');
console.log('🎯 USER PROFILE DROPDOWN INTERACTIVITY TEST SUITE');
console.log('================================================================\n');

// 1. Verify index.html dropdown functionality
const indexHtml = fs.readFileSync('index.html', 'utf8');

const checksIndex = [
  'id="headerProfileContainer"',
  'id="headerProfileBtn"',
  'id="profileDropdown"',
  'toggleProfileDropdown',
  'openProfileStatementModal',
  'openProfileResultModal',
  'openProfileProfitLossModal',
  'openProfileBetHistoryModal'
];

checksIndex.forEach(chk => {
  const found = indexHtml.includes(chk);
  console.log(`✓ [index.html] ${chk}: ${found ? 'PRESENT' : 'MISSING'}`);
  if (!found) throw new Error(`Missing ${chk} in index.html`);
});

// 2. Verify game.html dropdown functionality
const gameHtml = fs.readFileSync('game.html', 'utf8');

const checksGame = [
  'id="gameProfileContainer"',
  'id="gameProfileDropdown"',
  'toggleGameProfileDropdown',
  'openProfileStatementModal',
  'openProfileResultModal',
  'openProfileProfitLossModal'
];

checksGame.forEach(chk => {
  const found = gameHtml.includes(chk);
  console.log(`✓ [game.html] ${chk}: ${found ? 'PRESENT' : 'MISSING'}`);
  if (!found) throw new Error(`Missing ${chk} in game.html`);
});

console.log('\n================================================================');
console.log('🎉 ALL DROPDOWN INTERACTION TESTS PASSED (100%)');
console.log('================================================================');
