const fs = require('fs');

const appContent = fs.readFileSync('d:\\Team Projects\\js\\app.js', 'utf8');
const initialContent = fs.readFileSync('d:\\Team Projects\\js\\initialData.js', 'utf8');

console.log('App size:', appContent.length);
console.log('InitialData size:', initialContent.length);

// Check syntax error patterns:
// 1. Unmatched braces/brackets
// 2. Misplaced comments inside JSX
// 3. Duplicate variable declarations
// 4. Undefined window object references

function checkBrackets(str, filename) {
  let stack = [];
  let line = 1;
  let inStr = false;
  let quote = '';
  let inComment = false;
  let inLineComment = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '\n') {
      line++;
      inLineComment = false;
    }
  }
  console.log(`${filename}: Total lines ${line}`);
}

checkBrackets(initialContent, 'initialData.js');
checkBrackets(appContent, 'app.js');
