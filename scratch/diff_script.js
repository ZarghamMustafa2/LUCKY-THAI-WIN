const fs = require('fs');

function getBlock5(filename) {
  const html = fs.readFileSync(filename, 'utf8');
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match, i = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    if (!match[0].includes('src=')) {
      if (i === 5) {
        return match[1];
      }
      i++;
    }
  }
  return null;
}

const prevBlock = getBlock5('prev_index.html');
const currBlock = getBlock5('index.html');

if (!prevBlock || !currBlock) {
  console.error("Could not find block 5 in one of the files!");
  process.exit(1);
}

const prevLines = prevBlock.split('\n');
const currLines = currBlock.split('\n');

console.log("Prev block lines:", prevLines.length);
console.log("Curr block lines:", currLines.length);

// Simple line-by-line diff
let diffCount = 0;
for (let i = 0; i < Math.max(prevLines.length, currLines.length); i++) {
  const pLine = prevLines[i] || '';
  const cLine = currLines[i] || '';
  if (pLine.trim() !== cLine.trim()) {
    console.log(`Line ${i + 1} differs:`);
    console.log(`  Prev: ${pLine}`);
    console.log(`  Curr: ${cLine}`);
    diffCount++;
    if (diffCount > 20) {
      console.log("Too many diffs, stopping.");
      break;
    }
  }
}
