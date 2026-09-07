const fs = require('fs');

const htmlPath = 'e:\\NUMBER BET\\index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

const lines = html.split('\n');
const startLine = 3255; // 0-based index for line 3256 (first line of JS code in block 5)
const endLine = 5003; // 0-based index for line 5004 (last line of JS code in block 5)

const blockLines = lines.slice(startLine, endLine + 1);
const code = blockLines.join('\n');

console.log("Analyzing brackets and braces in block 5...");

const stack = [];
let inString = false;
let stringChar = '';
let inComment = false;
let commentType = ''; // 'single' or 'multi'

for (let i = 0; i < code.length; i++) {
  const char = code[i];
  const nextChar = code[i + 1];
  
  // Handle strings
  if (inString) {
    if (char === '\\') {
      i++; // Skip escaped char
    } else if (char === stringChar) {
      inString = false;
    }
    continue;
  }
  
  // Handle comments
  if (inComment) {
    if (commentType === 'single' && char === '\n') {
      inComment = false;
    } else if (commentType === 'multi' && char === '*' && nextChar === '/') {
      inComment = false;
      i++;
    }
    continue;
  }
  
  // Start of string
  if (char === '"' || char === "'" || char === '`') {
    inString = true;
    stringChar = char;
    continue;
  }
  
  // Start of comment
  if (char === '/' && nextChar === '/') {
    inComment = true;
    commentType = 'single';
    i++;
    continue;
  }
  if (char === '/' && nextChar === '*') {
    inComment = true;
    commentType = 'multi';
    i++;
    continue;
  }
  
  // Braces
  if (char === '{' || char === '(' || char === '[') {
    stack.push({ char, index: i, line: getLineNumber(i) });
  } else if (char === '}' || char === ')' || char === ']') {
    if (stack.length === 0) {
      console.error(`Unmatched closing character '${char}' at index ${i}, line ${getLineNumber(i)}`);
    } else {
      const top = stack.pop();
      const match = getMatchingChar(top.char);
      if (match !== char) {
        console.error(`Mismatch: opened '${top.char}' at line ${top.line}, but closed with '${char}' at line ${getLineNumber(i)}`);
      }
    }
  }
}

while (stack.length > 0) {
  const top = stack.pop();
  console.error(`Unclosed opened character '${top.char}' at line ${top.line}`);
}

function getLineNumber(index) {
  let count = 0;
  for (let i = 0; i <= index; i++) {
    if (code[i] === '\n') {
      count++;
    }
  }
  return startLine + 1 + count;
}

function getMatchingChar(openChar) {
  if (openChar === '{') return '}';
  if (openChar === '(') return ')';
  if (openChar === '[') return ']';
  return '';
}
