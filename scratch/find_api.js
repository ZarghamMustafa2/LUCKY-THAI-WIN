const fs = require('fs');
const c = fs.readFileSync('C:/Users/NEW PC TECH/.gemini/antigravity/brain/14f6e3c4-3eee-4e5f-8804-79f167d97328/.system_generated/steps/11922/content.md', 'utf8');

// Look for Firebase, API base URLs, or domain references
const patterns = [
  /firebaseio\.com[^"']*/g,
  /firebase[^"']{0,60}/gi,
  /https?:\/\/(?!cdn\.jsdelivr|fonts\.google|cdnjs|ritmu\.tv\/static)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,4}(?:\/[^"'\s]{0,60})?/g,
  /baseURL[^"']{0,80}/gi,
  /apiUrl[^"']{0,80}/gi,
  /"url"[^"']{0,80}/gi
];

const found = new Set();
patterns.forEach(re => {
  let m;
  while ((m = re.exec(c)) && found.size < 60) {
    found.add(m[0].trim());
  }
});

console.log([...found].join('\n'));
