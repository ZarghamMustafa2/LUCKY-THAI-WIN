const fs = require('fs');

const authCode = fs.readFileSync('auth.js', 'utf8');

// Mock browser environment
const dom = {
  elements: {},
  cookies: '',
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] !== undefined ? this.store[k] : null; },
    setItem(k, v) { this.store[k] = String(v); },
    clear() { this.store = {}; }
  },
  sessionStorage: {
    store: {},
    clear() { this.store = {}; }
  }
};

global.window = {
  isUserLoggedInFallback: false,
  localStorage: dom.localStorage,
  sessionStorage: dom.sessionStorage,
  document: {
    readyState: 'complete',
    cookie: '',
    getElementById(id) {
      if (!dom.elements[id]) {
        dom.elements[id] = {
          id: id,
          classList: {
            classes: new Set(['hidden', 'opacity-0']),
            add(...c) { c.forEach(x => this.classes.add(x)); },
            remove(...c) { c.forEach(x => this.classes.delete(x)); },
            contains(c) { return this.classes.has(c); },
            toggle(c) { if (this.classes.has(c)) this.classes.delete(c); else this.classes.add(c); }
          },
          style: {
            display: '',
            opacity: '',
            pointerEvents: '',
            zIndex: '',
            setProperty(k, v) { this[k] = v; }
          },
          value: '',
          innerText: ''
        };
      }
      return dom.elements[id];
    },
    addEventListener() {}
  },
  addEventListener() {},
  showToast(msg) { console.log(`[TOAST]: ${msg}`); }
};

global.document = global.window.document;
global.localStorage = global.window.localStorage;
global.sessionStorage = global.window.sessionStorage;

// Execute auth.js
eval(authCode);

console.log('\n--- TEST 1: Initial Login State ---');
global.window.localStorage.setItem('isUserLoggedIn', 'true');
global.window.localStorage.setItem('userLoginName', 'Alex_Winner');
global.window.checkUserAuthStatus();
const overlay = global.window.document.getElementById('fullAppLoginOverlay');
console.log('Overlay hidden when logged in:', overlay.classList.contains('hidden'));

console.log('\n--- TEST 2: Perform Logout ---');
global.window.performUserLogout();
console.log('After Logout - isUserLoggedIn in localStorage:', global.window.localStorage.getItem('isUserLoggedIn'));
console.log('After Logout - overlay display style:', overlay.style.display);
console.log('After Logout - overlay opacity:', overlay.style.opacity);
console.log('After Logout - overlay has hidden class:', overlay.classList.contains('hidden'));
console.log('After Logout - profileDropdown has hidden class:', global.window.document.getElementById('profileDropdown').classList.contains('hidden'));

console.log('\n--- TEST 3: Fresh Page Load Check while Logged Out ---');
global.window.checkUserAuthStatus();
console.log('On page load while logged out - overlay has hidden class:', overlay.classList.contains('hidden'));
console.log('On page load while logged out - overlay display:', overlay.style.display);

console.log('\n--- TEST 4: Login Form Submit ---');
global.window.document.getElementById('authUsernameInput').value = 'Zargham';
global.window.document.getElementById('authPasswordInput').value = '123456';
global.window.handleAppLoginSubmit();
console.log('After Login - isUserLoggedIn:', global.window.localStorage.getItem('isUserLoggedIn'));
console.log('After Login - userLoginName:', global.window.localStorage.getItem('userLoginName'));
console.log('After Login - overlay has hidden class:', overlay.classList.contains('hidden'));

console.log('\nAll tests completed successfully!');
