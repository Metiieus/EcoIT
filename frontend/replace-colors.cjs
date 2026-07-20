const fs = require('fs');
const path = require('path');

const colorMap = {
  '#10B981': '#E95420', // Green -> Orange
  '#0E1B14': '#2C001E', // Dark Green -> Dark Aubergine
  '#3DF08F': '#F88E67', // Light Green -> Light Orange
  '#065F46': '#5E2750', // Dark Emerald -> Aubergine
  '#059669': '#C74416', // Darker Green -> Darker Orange
  '#0E3B2A': '#300A24', // Extra Dark Emerald -> Extra Dark Aubergine
  '16,185,129': '233,84,32', // rgb(#10B981) -> rgb(#E95420)
  '14,27,20': '44,0,30', // rgb(#0E1B14) -> rgb(#2C001E)
  '6,78,59': '94,39,80', // rgb(#065F46) -> rgb(#5E2750)
  '61,240,143': '248,142,103', // rgb(#3DF08F) -> rgb(#F88E67)
  '#10b981': '#E95420',
  '#0e1b14': '#2C001E',
  '#3df08f': '#F88E67',
  '#065f46': '#5E2750',
  '#059669': '#C74416',
  'bg-brain3.jpg': 'bg-brain4.png' // Also replace the image
};

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [find, replace] of Object.entries(colorMap)) {
        if (content.includes(find)) {
          content = content.split(find).join(replace);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

walk(srcDir);
console.log('Done');
