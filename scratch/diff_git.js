const { execSync } = require('child_process');
const vm = require('vm');

function testBlock5(rev) {
  let html;
  try {
    html = execSync(`git show ${rev}:index.html`, { maxBuffer: 10 * 1024 * 1024 }).toString('utf8');
  } catch(e) {
    console.log(`${rev}: Git show failed`);
    return;
  }
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match, i = 0;
  let code = null;
  while ((match = scriptRegex.exec(html)) !== null) {
    if (!match[0].includes('src=')) {
      if (i === 5) {
        code = match[1];
        break;
      }
      i++;
    }
  }
  
  if (!code) {
    console.log(`${rev}: Could not find block 5!`);
    return;
  }
  
  try {
    new vm.Script(code);
    console.log(`${rev}: Compiled successfully!`);
  } catch (err) {
    console.log(`${rev}: Failed to compile - ${err.message}`);
  }
}

testBlock5('002a2b9f');
testBlock5('d8f2dcc6');
testBlock5('72e5cda');
testBlock5('fa9926f^');
testBlock5('fa9926f');
testBlock5('HEAD');
