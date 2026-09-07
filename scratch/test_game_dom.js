const fs = require('fs');
const vm = require('vm');

const htmlPath = 'e:\\NUMBER BET\\game.html';
const html = fs.readFileSync(htmlPath, 'utf8');

// Find all script blocks in game.html
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
const scriptBlocks = [];
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  if (!match[0].includes('src=')) {
    scriptBlocks.push(match[1]);
  }
}

console.log("Analyzing game.html script blocks...");

const context = {
  document: {
    getElementById: (id) => {
      return {
        id: id,
        classList: {
          add: () => {},
          remove: () => {},
          toggle: () => {},
          contains: () => false,
        },
        style: {
          setProperty: () => {},
        },
        addEventListener: () => {},
        appendChild: () => {},
        removeChild: () => {},
        prepend: () => {},
        children: [],
        innerText: '',
        innerHTML: '',
        value: '',
      };
    },
    querySelectorAll: (query) => {
      return [];
    },
    querySelector: (query) => {
      return null;
    },
    addEventListener: () => {},
  },
  window: {
    location: { href: '' },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    setInterval: () => {},
    setTimeout: (fn, ms) => fn(),
    addEventListener: () => {},
  },
  console: console,
  parseInt: parseInt,
  parseFloat: parseFloat,
  Math: Math,
  Date: Date,
  String: String,
  Array: Array,
  Object: Object,
};

context.localStorage = context.window.localStorage;

vm.createContext(context);

for (let i = 0; i < scriptBlocks.length; i++) {
  try {
    vm.runInContext(scriptBlocks[i], context);
  } catch (err) {
    console.error(`RUNTIME ERROR in script block ${i}:`);
    console.error(err.stack);
  }
}

console.log("Analysis finished.");
