const fs = require('fs');
const html = fs.readFileSync('e:\\NUMBER BET\\index.html', 'utf8');
const lines = html.split('\n');

// Find structure: where is each section relative to each other
console.log('=== KEY LINE NUMBERS ===');
lines.forEach((l, i) => {
  const t = l.trim();
  if (
    t.startsWith('<script') ||
    t.startsWith('</script>') ||
    l.includes('id="dashboardViewSection"') ||
    l.includes('id="dedicatedGameViewSection"') ||
    l.includes('id="nextSpinBanner"') ||
    l.includes('id="gameContainer"') ||
    l.includes('window.navigateToAppRoute = function') ||
    l.includes('window.expandWheelStage = function') ||
    l.includes('window.appendQuickDigit = function') ||
    l.includes('window.placeInlineBet = function') ||
    l.includes('window.toggleBetRound = function') ||
    l.includes('function gameLoop') ||
    l.includes('setInterval') ||
    (t === '</main>') ||
    (t === '</body>')
  ) {
    console.log(`L${i+1}: ${l.trim().slice(0,100)}`);
  }
});
