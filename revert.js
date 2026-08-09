/**
 * AERON MEDICAL Checkpoint Revert System
 * Company: AERON MEDICAL Co., Ltd.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const BACKUP_BASE_DIR = path.join(ROOT_DIR, 'backups');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function revertToLatestCheckpoint() {
  const latestDir = path.join(BACKUP_BASE_DIR, 'checkpoint_latest');
  const metaPath = path.join(latestDir, 'checkpoint_meta.json');

  if (!fs.existsSync(latestDir) || !fs.existsSync(metaPath)) {
    console.error('❌ Error: No existing checkpoint backup found to revert!');
    process.exit(1);
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  console.log(`🔄 Reverting project codebase to Checkpoint [${meta.timestamp}] created at ${meta.date}...`);

  const itemsToRestore = ['js', 'css', 'libs', 'assets', 'db', 'index.html', 'server.js', 'server.ps1', 'build.js'];

  for (const item of itemsToRestore) {
    const src = path.join(latestDir, item);
    const dest = path.join(ROOT_DIR, item);

    if (fs.existsSync(src)) {
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        copyDirRecursive(src, dest);
      } else {
        fs.copyFileSync(src, dest);
      }
    }
  }

  console.log(`🎉 Project successfully reverted to Checkpoint [${meta.timestamp}]!`);
}

revertToLatestCheckpoint();
