const fs = require('fs');

const html = fs.readFileSync('e:\\NUMBER BET\\index.html', 'utf8');

// Search for any CSS rules targeting dedicatedGameViewSection
console.log("=== CSS rules targeting dedicatedGameViewSection ===");
const cssMatches = html.match(/#dedicatedGameViewSection[^{]*\{[^}]*\}/g);
if (cssMatches) {
  cssMatches.forEach(m => console.log(m));
} else {
  console.log("No specific CSS rules found with #dedicatedGameViewSection {...}");
}

// Search for JS functions modifying dedicatedGameViewSection
console.log("\n=== JS functions modifying dedicatedGameViewSection ===");
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('dedicatedGameViewSection')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
});
