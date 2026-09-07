const fs = require('fs');

const html = fs.readFileSync('e:\\NUMBER BET\\index.html', 'utf8');

const styleBlocks = [];
const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
let match;
while ((match = styleRegex.exec(html)) !== null) {
  styleBlocks.push(match[1]);
}

console.log(`Found ${styleBlocks.length} <style> blocks.`);

styleBlocks.forEach((css, idx) => {
  console.log(`\n--- Style Block ${idx} ---`);
  const lines = css.split('\n');
  lines.forEach((l, i) => {
    if (l.includes('hidden') || l.includes('display') || l.includes('visibility') || l.includes('opacity') || l.includes('dedicatedGameViewSection')) {
      console.log(`L${i + 1}: ${l.trim()}`);
    }
  });
});
