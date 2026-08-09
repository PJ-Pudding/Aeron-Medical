const fs = require('fs');
const path = require('path');

const appPath = 'd:\\Team Projects\\js\\app.js';
const initialDataPath = 'd:\\Team Projects\\js\\initialData.js';

console.log('Testing app.js parsing...');
const appContent = fs.readFileSync(appPath, 'utf8');
const initialContent = fs.readFileSync(initialDataPath, 'utf8');

console.log('App content length:', appContent.length);
console.log('Initial data content length:', initialContent.length);

// Check unclosed strings or template literals or invalid characters
let inString = false;
let stringChar = '';
let line = 1;
let col = 0;

for (let i = 0; i < appContent.length; i++) {
  const ch = appContent[i];
  col++;
  if (ch === '\n') {
    line++;
    col = 0;
  }
}
console.log(`Total lines in app.js: ${line}`);
