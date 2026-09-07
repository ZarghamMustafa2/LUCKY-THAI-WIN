const fs = require('fs');
const html = fs.readFileSync('e:/NUMBER BET/index.html', 'utf8');

// Simple DOM Mock
const mockDOM = {
  elements: {},
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        innerText: '',
        value: '',
        classList: { remove: () => {}, add: () => {} },
        setAttribute: () => {},
        getAttribute: () => null,
        addEventListener: (event, fn) => { this.elements[id].clickFn = fn; }
      };
    }
    return this.elements[id];
  },
  querySelectorAll() { return []; },
  addEventListener() {}
};

global.document = mockDOM;
global.window = global;
global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

// Extract script blocks
const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
console.log(`Found ${scriptMatches.length} script tags`);

scriptMatches.forEach((m, idx) => {
  try {
    eval(m[1]);
    console.log(`Executed script tag #${idx + 1}`);
  } catch (e) {
    console.error(`Error in script tag #${idx + 1}:`, e.message);
  }
});

console.log("Initial Balance:", window.currentBalance);
console.log("Initial Active Bets:", window.activeBets);

console.log("\nSimulating click on inlinePlaceBetBtn...");
try {
  window.placeInlineBet();
  console.log("SUCCESS! Balance after bet:", window.currentBalance);
  console.log("Active Bets count:", window.activeBets.length);
  console.log("Active Bets content:", window.activeBets);
} catch (e) {
  console.error("FAILED to place bet:", e);
}
