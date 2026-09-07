const fs = require('fs');
const html = fs.readFileSync('e:\\NUMBER BET\\index.html', 'utf8');
const lines = html.split('\n');

let openLine = -1;
lines.forEach((l, i) => {
  if (l.includes('id="dedicatedGameViewSection"')) {
    openLine = i;
  }
});

console.log('dedicatedGameViewSection starts at line:', openLine + 1);

let depth = 0;
for (let i = openLine; i < lines.length; i++) {
  const l = lines[i];
  const opens = (l.match(/<div\b/g) || []).length;
  const closes = (l.match(/<\/div>/g) || []).length;
  depth += opens - closes;
  if (depth <= 0) {
    console.log('dedicatedGameViewSection ends at line:', i + 1);
    break;
  }
}
