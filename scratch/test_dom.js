const fs = require('fs');
const vm = require('vm');

const htmlPath = 'e:\\NUMBER BET\\index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

// Find all script blocks in index.html
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
const scriptBlocks = [];
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  if (!match[0].includes('src=')) {
    scriptBlocks.push(match[1]);
  }
}

console.log("Analyzing script blocks...");

// Let's create a proxy for document to check element existence
const queriedIds = new Set();
const missingIds = new Set();

const mockDocument = {
  getElementById: (id) => {
    queriedIds.add(id);
    const hasId = html.includes('id="' + id + '"') || html.includes("id='" + id + "'") || html.includes('id=' + id);
    if (!hasId) {
      missingIds.add(id);
      console.warn("WARNING: Element with ID not found in HTML:", id);
      return null; // Return null so we see if the script throws
    }
    return {
      id: id,
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {},
        contains: () => false,
      },
      style: {},
      addEventListener: () => {},
      appendChild: () => {},
      removeChild: () => {},
      prepend: () => {},
      children: [],
      innerText: '',
      innerHTML: '',
    };
  },
  querySelectorAll: (query) => {
    return [];
  },
  querySelector: (query) => {
    return null;
  },
  addEventListener: () => {},
  createElement: () => ({ classList: { add: () => {}, remove: () => {} } }),
};

const mockWindow = {
  location: { href: '', hash: '#games/thai-4d' },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
  },
  setInterval: () => {},
  setTimeout: (fn, ms) => fn(),
  addEventListener: () => {},
};

const context = {
  document: mockDocument,
  window: mockWindow,
  localStorage: mockWindow.localStorage,
  navigator: {},
  location: mockWindow.location,
  console: console,
  setTimeout: mockWindow.setTimeout,
  setInterval: mockWindow.setInterval,
  parseInt: parseInt,
  parseFloat: parseFloat,
  Math: Math,
  Date: Date,
  String: String,
  Array: Array,
  Object: Object,
  BroadcastChannel: class { constructor() {} postMessage() {} addEventListener() {} },
};

vm.createContext(context);

for (let i = 0; i < scriptBlocks.length; i++) {
  try {
    vm.runInContext(scriptBlocks[i], context);
  } catch (err) {
    console.error(`RUNTIME ERROR in script block ${i}:`);
    console.error(err.stack);
  }
}

console.log("\nQuery summary:");
console.log("Total unique IDs queried:", queriedIds.size);
console.log("Missing IDs:", Array.from(missingIds));
