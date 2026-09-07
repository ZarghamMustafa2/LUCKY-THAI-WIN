const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync('index.html', 'utf8');

// Match all inline script blocks
const regex = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let index = 1;
let hasError = false;

while ((match = regex.exec(html)) !== null) {
  const code = match[1];
  try {
    new vm.Script(code, { filename: `inline-script-${index}.js` });
    console.log(`✓ Inline script #${index} syntax OK (${code.trim().length} chars)`);
  } catch (err) {
    console.error(`✗ Inline script #${index} syntax error:`, err.message);
    hasError = true;
  }
  index++;
}

// Check auth.js as well
try {
  const authCode = fs.readFileSync('auth.js', 'utf8');
  new vm.Script(authCode, { filename: 'auth.js' });
  console.log('✓ auth.js syntax OK');
} catch (err) {
  console.error('✗ auth.js syntax error:', err.message);
  hasError = true;
}

if (!hasError) {
  console.log('\nAll scripts passed JavaScript syntax validation successfully!');
} else {
  process.exit(1);
}
