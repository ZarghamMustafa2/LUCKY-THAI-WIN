const fs = require('fs');
const html = fs.readFileSync('e:\\NUMBER BET\\index.html', 'utf8');
const lines = html.split('\n');

// Check dedicatedGameViewSection
lines.forEach((l, i) => {
  if (l.includes('dedicatedGameViewSection')) {
    console.log('LINE', i+1, ':', l.trim().slice(0, 150));
  }
});

console.log('\n--- gameContainer ---');
lines.forEach((l, i) => {
  if (l.includes('id="gameContainer"') || l.includes("id='gameContainer'")) {
    console.log('LINE', i+1, ':', l.trim().slice(0, 150));
  }
});

console.log('\n--- navigateToAppRoute definition ---');
lines.forEach((l, i) => {
  if (l.includes('navigateToAppRoute') && (l.includes('function') || l.includes('window'))) {
    console.log('LINE', i+1, ':', l.trim().slice(0, 150));
  }
});

console.log('\n--- game-thai-4d routing ---');
lines.forEach((l, i) => {
  if (l.includes('game-thai-4d') || l.includes('thai-4d') || l.includes('thai_4d')) {
    console.log('LINE', i+1, ':', l.trim().slice(0, 150));
  }
});

console.log('\n--- onclick navigateToAppRoute ---');
lines.forEach((l, i) => {
  if (l.includes('onclick') && l.includes('navigateToAppRoute')) {
    console.log('LINE', i+1, ':', l.trim().slice(0, 150));
  }
});
