const fs = require('fs');
const path = require('path');

const colorMap = {
  // Backgrounds
  "'#0a0e13'": "'var(--bg-main)'",
  "'#0A0E13'": "'var(--bg-main)'",
  "'#0d1218'": "'var(--bg-surface)'",
  "'#0D1218'": "'var(--bg-surface)'",
  "'#10161d'": "'var(--bg-card)'",
  "'#10161D'": "'var(--bg-card)'",
  "'#141b23'": "'var(--bg-surface-hover)'",
  "'#141B23'": "'var(--bg-surface-hover)'",
  "'#182029'": "'var(--bg-surface-active)'",
  
  // Borders
  "'#1c242e'": "'var(--border-main)'",
  "'#1C242E'": "'var(--border-main)'",
  
  // Text
  "'#e6edf3'": "'var(--text-primary)'",
  "'#E6EDF3'": "'var(--text-primary)'",
  "'#b9c2cc'": "'var(--text-secondary)'",
  "'#B9C2CC'": "'var(--text-secondary)'",
  "'#7d8896'": "'var(--text-muted)'",
  "'#7D8896'": "'var(--text-muted)'",

  // Theme exceptions / Accents
  "'#E95420'": "'var(--accent-primary)'",
  "'#e95420'": "'var(--accent-primary)'",
  "'#ffffff'": "'var(--accent-text)'",
  "'#fff'": "'var(--accent-text)'",
  "'#DC4A3D'": "'var(--color-error)'",
  "'#dc4a3d'": "'var(--color-error)'",

  // For index.css replacements (no quotes)
  '#0a0e13': 'var(--bg-main)',
  '#0d1218': 'var(--bg-surface)',
  '#10161d': 'var(--bg-card)',
  '#141b23': 'var(--bg-surface-hover)',
  '#182029': 'var(--bg-surface-active)',
  '#1c242e': 'var(--border-main)',
  '#e6edf3': 'var(--text-primary)',
  '#b9c2cc': 'var(--text-secondary)',
  '#7d8896': 'var(--text-muted)',
  '#E95420': 'var(--accent-primary)',
  '#e95420': 'var(--accent-primary)',
  '#DC4A3D': 'var(--color-error)',
  '#dc4a3d': 'var(--color-error)',
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

      // Handle raw css replacements (like index.css)
      if (fullPath.endsWith('.css')) {
        for (const [find, replace] of Object.entries(colorMap)) {
          if (!find.startsWith("'")) { // only non-quoted mappings
            // Use regex to replace color boundaries
            const regex = new RegExp(find + '(?![a-zA-Z0-9])', 'gi');
            if (regex.test(content)) {
              content = content.replace(regex, replace);
              changed = true;
            }
          }
        }
      } else {
        // Handle TSX/TS quoted styles
        for (const [find, replace] of Object.entries(colorMap)) {
          if (content.includes(find)) {
            content = content.split(find).join(replace);
            changed = true;
          }
          // Also check double quotes
          const findDbl = find.replace(/'/g, '"');
          const replaceDbl = replace.replace(/'/g, '"');
          if (content.includes(findDbl)) {
            content = content.split(findDbl).join(replaceDbl);
            changed = true;
          }
        }
        
        // Also handle cases where color is passed without quotes but is a variable or inline e.g. color="#7d8896"
        const hexRegex = /(color|background|fill|stroke)="(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}))"/g;
        content = content.replace(hexRegex, (match, prop, hex) => {
          const mapKey = `'${hex.toLowerCase()}'`;
          const cssVar = colorMap[mapKey] ? colorMap[mapKey].replace(/'/g, '') : hex;
          if (cssVar !== hex) {
            changed = true;
            return `${prop}="${cssVar}"`;
          }
          return match;
        });
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

walk(srcDir);
console.log('Done mapping inline colors to CSS variables.');
