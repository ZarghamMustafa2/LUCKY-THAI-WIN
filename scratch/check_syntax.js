const fs = require('fs');
const vm = require('vm');

const htmlPath = 'e:\\NUMBER BET\\index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

// Find script tag containing startDraw
const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let code = '';

while ((match = scriptRegex.exec(html)) !== null) {
  if (!match[0].includes('src=') && match[1].includes('startDraw')) {
    code = match[1];
    break;
  }
}

if (!code) {
  console.error("Could not find script block containing startDraw!");
  process.exit(1);
}

console.log("Mocking DOM environment...");

const elements = {};
function mockElement(id) {
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
}

const mockDocument = {
  getElementById: (id) => {
    if (!elements[id]) {
      elements[id] = mockElement(id);
    }
    return elements[id];
  },
  querySelectorAll: (query) => {
    return [mockElement('mock-item')];
  },
  querySelector: (query) => {
    return mockElement('mock-item');
  },
  addEventListener: () => {},
  createElement: () => mockElement('new-el'),
};

const mockWindow = {
  location: { href: '' },
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

try {
  console.log("Running main script block in mock context...");
  vm.runInContext(code, context);
  console.log("SUCCESS: Main script block executed without any runtime errors during initialization!");
} catch (err) {
  console.error("RUNTIME ERROR during initialization:");
  console.error(err.stack);
}
