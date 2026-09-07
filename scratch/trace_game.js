const fs = require('fs');
const html = fs.readFileSync('e:\\NUMBER BET\\index.html', 'utf8');
const lines = html.split('\n');

console.log('=== gameLoop setInterval calls ===');
lines.forEach((l, i) => {
  if (l.includes('setInterval') && (l.includes('gameLoop') || l.includes('game'))) {
    console.log('LINE', i+1, ':', l.trim());
  }
});

console.log('\n=== gameLoop calls (not setInterval) ===');
lines.forEach((l, i) => {
  if (l.includes('gameLoop(') && !l.includes('function gameLoop')) {
    console.log('LINE', i+1, ':', l.trim());
  }
});

console.log('\n=== DOMContentLoaded ===');
lines.forEach((l, i) => {
  if (l.includes('DOMContentLoaded')) {
    console.log('LINE', i+1, ':', l.trim());
  }
});

console.log('\n=== Last 60 lines of Block 5 (game init) ===');
// Find block 5 end
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match, i = 0;
while ((match = scriptRegex.exec(html)) !== null) {
  if (!match[0].includes('src=')) {
    if (i === 5) {
      const block = match[1];
      const blockLines = block.split('\n');
      const last60 = blockLines.slice(-60);
      last60.forEach((l, idx) => {
        console.log(blockLines.length - 60 + idx + 1, ':', l);
      });
      break;
    }
    i++;
  }
}
