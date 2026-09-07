const fs = require('fs');
const vm = require('vm');

// 1. Validate admin-engine.js
try {
  const code = fs.readFileSync('admin-engine.js', 'utf8');
  new vm.Script(code, { filename: 'admin-engine.js' });
  console.log('✓ admin-engine.js syntax OK');
} catch (err) {
  console.error('✗ admin-engine.js syntax error:', err.message);
  process.exit(1);
}

// 2. Validate all inline scripts in admin.html
const html = fs.readFileSync('admin.html', 'utf8');
const regex = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let index = 1;
let hasError = false;

while ((match = regex.exec(html)) !== null) {
  const scriptContent = match[1];
  try {
    new vm.Script(scriptContent, { filename: `admin-inline-${index}.js` });
    console.log(`✓ admin.html inline script #${index} syntax OK (${scriptContent.trim().length} chars)`);
  } catch (err) {
    console.error(`✗ admin.html inline script #${index} syntax error:`, err.message);
    hasError = true;
  }
  index++;
}

if (!hasError) {
  console.log('\nAll Admin Panel scripts passed validation successfully!');
} else {
  process.exit(1);
}
