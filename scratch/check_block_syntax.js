const fs = require('fs');
const vm = require('vm');

const htmlPath = 'e:\\NUMBER BET\\index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

const lines = html.split('\n');
const startLine = 3255; // 0-based index for line 3256
const endLine = 5003; // 0-based index for line 5004

let blockLines = lines.slice(startLine, endLine + 1);

// Find the line where get4Digits ends (line 4103 in the HTML, which is index 4102)
const relativeIndex = 4102 - startLine;
console.log("Line at relative index:", blockLines[relativeIndex]);

// Insert return and closing brace
blockLines.splice(relativeIndex + 1, 0, 
  "        return [get4Digits(1), get4Digits(5), get4Digits(9), get4Digits(13)];",
  "      }"
);

const blockCode = blockLines.join('\n');

console.log("Compiling patched main script block code...");
try {
  new vm.Script(blockCode);
  console.log("SUCCESS: Main script block compiled successfully with patch!");
} catch (err) {
  console.error("Syntax Error found in patched code:");
  console.error(err);
}
