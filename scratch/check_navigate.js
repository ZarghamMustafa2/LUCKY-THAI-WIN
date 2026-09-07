const fs = require('fs');
const html = fs.readFileSync('e:\\NUMBER BET\\index.html', 'utf8');
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match, i = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  if (!match[0].includes('src=')) {
    const code = match[1];
    if (code.includes('navigateToAppRoute')) {
      console.log(`Block ${i} contains navigateToAppRoute`);
      // Find lines around it
      const lines = code.split('\n');
      lines.forEach((l, idx) => {
        if (l.includes('navigateToAppRoute') || l.includes('window.navigateToAppRoute')) {
          console.log(`  Line ${idx+1}: ${l.trim().slice(0,120)}`);
        }
      });
    }
    i++;
  }
}

// Also check: is the game card onclick calling window.navigateToAppRoute?
console.log('\n--- Game card onclick check ---');
const htmlLines = html.split('\n');
htmlLines.forEach((l, idx) => {
  if (l.includes('onclick') && (l.includes("navigateToAppRoute('game-thai-4d')") || l.includes('navigateToAppRoute("game-thai-4d")'))) {
    console.log(`Line ${idx+1}: ${l.trim().slice(0, 200)}`);
  }
});
