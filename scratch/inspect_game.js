const fs = require('fs');
const html = fs.readFileSync('e:\\NUMBER BET\\index.html', 'utf8');
const lines = html.split('\n');

// gameContainer element
console.log('=== gameContainer ===');
lines.forEach((l, i) => {
  if (l.includes('id="gameContainer"')) {
    console.log('LINE', i+1, ':', l.trim().slice(0,300));
  }
});

// nextSpinBanner element
console.log('\n=== nextSpinBanner ===');
lines.forEach((l, i) => {
  if (l.includes('id="nextSpinBanner"')) {
    console.log('LINE', i+1, ':', l.trim().slice(0,300));
  }
});

// expandWheelStage
console.log('\n=== expandWheelStage calls ===');
lines.forEach((l, i) => {
  if (l.includes('expandWheelStage')) {
    console.log('LINE', i+1, ':', l.trim().slice(0,150));
  }
});

// collapseWheelStage
console.log('\n=== collapseWheelStage calls ===');
lines.forEach((l, i) => {
  if (l.includes('collapseWheelStage')) {
    console.log('LINE', i+1, ':', l.trim().slice(0,150));
  }
});

// navigateToAppRoute function body
console.log('\n=== navigateToAppRoute body ===');
const start = lines.findIndex(l => l.includes('window.navigateToAppRoute = function'));
for (let i = start; i < start + 30 && i < lines.length; i++) {
  console.log(i+1, ':', lines[i]);
}

// What does the game section look like at lines 2025-2035?
console.log('\n=== Game section lines 2025-2035 ===');
for (let i = 2024; i < 2036; i++) {
  console.log(i+1, ':', lines[i]);
}
