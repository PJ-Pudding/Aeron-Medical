const fs = require('fs');
const path = require('path');

console.log('🚀 Pre-compiling AERON MEDICAL Project Tracker (Micro-Modular Architecture)...');

const babelPath = path.join(__dirname, 'libs', 'babel.min.js');
const modulesDir = path.join(__dirname, 'js', 'modules');
const appJsPath = path.join(__dirname, 'js', 'app.js');
const outputPath = path.join(__dirname, 'js', 'app.compiled.js');

function getAllJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.sort(); // Sort mod00, mod01, ... mod08
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllJsFiles(filePath));
    } else if (file.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
}

try {
  const Babel = require(babelPath);
  console.log('✅ Babel loaded successfully (version ' + (Babel ? Babel.version : 'unknown') + ')');

  // 1. Gather all module files from js/modules/
  const moduleFiles = getAllJsFiles(modulesDir);
  
  // Make sure App.js is always last
  const appFileIdx = moduleFiles.findIndex(f => path.basename(f) === 'App.js');
  if (appFileIdx !== -1) {
    const [appFile] = moduleFiles.splice(appFileIdx, 1);
    moduleFiles.push(appFile);
  }

  console.log(`📦 Bundling ${moduleFiles.length} module files from js/modules/...`);
  let bundledCode = `// ====================================================\n`;
  bundledCode += `// AERON MEDICAL Project Tracker - Modular Assembly\n`;
  bundledCode += `// Generated dynamically by build.js\n`;
  bundledCode += `// ====================================================\n\n`;

  moduleFiles.forEach(file => {
    const relPath = path.relative(__dirname, file).replace(/\\/g, '/');
    bundledCode += `// --- Module File: ${relPath} ---\n`;
    bundledCode += fs.readFileSync(file, 'utf8') + '\n\n';
  });

  // Save assembled JSX bundle to js/app.js
  fs.writeFileSync(appJsPath, bundledCode, 'utf8');
  console.log(`📖 Saved assembled JSX bundle to js/app.js (${bundledCode.length} bytes, ${bundledCode.split('\n').length} lines)`);

  // 2. Compile JSX to pure JS
  console.log('⚡ Compiling JSX bundle to pure JavaScript via Babel...');
  const startTime = Date.now();
  const result = Babel.transform(bundledCode, {
    presets: [
      ['react', { runtime: 'classic' }]
    ],
    filename: 'app.js'
  });
  const duration = Date.now() - startTime;

  console.log('✨ JSX Compilation finished in ' + duration + ' ms!');

  fs.writeFileSync(outputPath, result.code, 'utf8');
  console.log('🎉 Saved compiled app to js/app.compiled.js (' + result.code.length + ' bytes)!');

} catch (err) {
  console.error('❌ Compilation FAILED with error:');
  console.error(err);
  process.exit(1);
}
