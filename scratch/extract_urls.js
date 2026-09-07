const fs = require('fs');
const c = fs.readFileSync('C:/Users/NEW PC TECH/.gemini/antigravity/brain/14f6e3c4-3eee-4e5f-8804-79f167d97328/.system_generated/steps/11922/content.md', 'utf8');
const urls = c.match(/https?:\/\/[^\s"'\\<>]+/g) || [];
const filtered = urls.filter(u => !u.match(/ritmu\.tv\/static|cloudflare|localhost|webpack/));
const unique = [...new Set(filtered)].slice(0, 30);
console.log(unique.join('\n'));
