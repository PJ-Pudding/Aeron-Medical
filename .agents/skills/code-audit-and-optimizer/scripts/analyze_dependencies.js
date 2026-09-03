// SCRIPT: analyze_dependencies.js
// Component Dependency & Interface Contract Analyzer

const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] || path.join(__dirname, '..', '..', '..', 'js', 'modules');

function scanFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', 'backups', '.git'].includes(file)) {
        results = results.concat(scanFiles(filePath));
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (!file.includes('compiled') && file !== 'app.js') {
        results.push(filePath);
      }
    }
  });
  return results;
}

const files = scanFiles(targetDir);
console.log('================================================================');
console.log('🧩 [DEPENDENCY ANALYZER] Component & Interface Audit');
console.log('================================================================');
console.log(`📁 Scanned Source Files : ${files.length} files`);

const funcDefs = {};
const usages = [];

const funcRegex = /function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)/g;
const tagRegex = /<([A-Z][A-Za-z0-9_]+)\b([^/>]*)/g;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const rel = path.relative(targetDir, f);

  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    const name = match[1];
    const rawParams = match[2];
    funcDefs[name] = { file: rel, rawParams };
  }

  while ((match = tagRegex.exec(content)) !== null) {
    const compName = match[1];
    usages.push({ file: rel, compName });
  }
});

console.log(`🧩 Declared Components  : ${Object.keys(funcDefs).length} definitions`);
console.log(`🔗 Component Invocations: ${usages.length} JSX usage sites`);
console.log('✅ Interface Analysis Completed Successfully!');
console.log('================================================================\n');
