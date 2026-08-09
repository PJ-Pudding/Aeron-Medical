/**
 * AERON MEDICAL Automated Checkpoint Backup System
 * Company: AERON MEDICAL Co., Ltd.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const BACKUP_BASE_DIR = path.join(ROOT_DIR, 'backups');

function getTimestamp() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'backups' && entry.name !== '.git') {
        copyDirRecursive(srcPath, destPath);
      }
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createCheckpoint() {
  const timestamp = getTimestamp();
  const timeDir = path.join(BACKUP_BASE_DIR, `checkpoint_${timestamp}`);
  const latestDir = path.join(BACKUP_BASE_DIR, 'checkpoint_latest');

  if (!fs.existsSync(BACKUP_BASE_DIR)) {
    fs.mkdirSync(BACKUP_BASE_DIR, { recursive: true });
  }

  // Files to back up
  const itemsToBackup = [
    'js',
    'css',
    'libs',
    'assets',
    'db',
    'index.html',
    'server.js',
    'server.ps1',
    'build.js'
  ];

  console.log(`📦 Creating Checkpoint Backup: checkpoint_${timestamp}...`);

  for (const item of itemsToBackup) {
    const src = path.join(ROOT_DIR, item);
    const destTime = path.join(timeDir, item);
    const destLatest = path.join(latestDir, item);

    if (fs.existsSync(src)) {
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        copyDirRecursive(src, destTime);
        copyDirRecursive(src, destLatest);
      } else {
        fs.mkdirSync(path.dirname(destTime), { recursive: true });
        fs.mkdirSync(path.dirname(destLatest), { recursive: true });
        fs.copyFileSync(src, destTime);
        fs.copyFileSync(src, destLatest);
      }
    }
  }

  // Save metadata
  const meta = {
    timestamp,
    date: new Date().toLocaleString('th-TH'),
    status: 'VERIFIED_STABLE',
    backupDir: timeDir
  };

  fs.writeFileSync(path.join(timeDir, 'checkpoint_meta.json'), JSON.stringify(meta, null, 2), 'utf8');
  fs.writeFileSync(path.join(latestDir, 'checkpoint_meta.json'), JSON.stringify(meta, null, 2), 'utf8');

  console.log(`🎉 Backup Saved Successfully to:`);
  console.log(`   └─ ${timeDir}`);
  console.log(`   └─ ${latestDir}`);
}

createCheckpoint();
