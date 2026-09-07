const fs = require('fs');
const c = fs.readFileSync('C:/Users/NEW PC TECH/.gemini/antigravity/brain/14f6e3c4-3eee-4e5f-8804-79f167d97328/.system_generated/steps/11922/content.md', 'utf8');
const hits = [];
const re = /["']([^"']*(?:stream|live|hls|m3u8|channel|manifest|cdn|media|broadcast|\.api)[^"']{0,80})["']/gi;
let m;
while ((m = re.exec(c)) && hits.length < 50) {
  hits.push(m[1]);
}
console.log([...new Set(hits)].join('\n'));
