#!/usr/bin/env node
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

// Load .env.local (fall back to .env)
const envPath = path.resolve(process.cwd(), '.env.local');
const fallback = path.resolve(process.cwd(), '.env');
let res;
try {
  res = dotenv.config({ path: envPath });
  if (res.error) {
    res = dotenv.config({ path: fallback });
  }
} catch (e) {
  // ignore
}

if (res && res.error) {
  console.warn('No .env.local or .env found — continuing with current environment');
} else {
  console.log('Loaded environment from', res && res.parsed ? (res.parsed.__loaded_from || envPath) : envPath);
}

function run(cmd) {
  console.log('\n> ' + cmd + '\n');
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

try {
  // Cleanup potential locked prisma engine files (Windows and Unix support)
  try {
    if (process.platform === 'win32') {
      console.log('Cleaning prisma tmp files and stopping node processes (Windows)...');
      // remove tmp files and existing engine, stop node processes
      execSync('powershell -Command "Remove-Item -Path node_modules\\.prisma\\client\\query_engine-windows.dll.node.tmp* -Force -ErrorAction SilentlyContinue; Remove-Item -Path node_modules\\.prisma\\client\\query_engine-windows.dll.node -Force -ErrorAction SilentlyContinue; Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"', { stdio: 'inherit' });
    } else {
      console.log('Cleaning prisma tmp files (Unix)...');
      execSync('rm -f node_modules/.prisma/client/query_engine-*.node.tmp* || true; rm -f node_modules/.prisma/client/query_engine-*.node || true', { stdio: 'inherit' });
      try { execSync('pkill node || true', { stdio: 'inherit' }); } catch (e) { /* ignore */ }
    }
  } catch (e) {
    console.warn('Cleanup step failed (non-fatal):', e && e.message ? e.message : e);
  }

  // regenerate prisma client, push schema, seed database
  run('npm run db:generate');
  run('npm run db:push');
  run('npm run db:seed');

  // optional: start dev server if --dev passed
  if (process.argv.includes('--dev')) {
    run('npm run dev');
  } else {
    console.log('\n✅ Setup complete. To start the dev server run: npm run dev');
    console.log('Or run this script with --dev to start it automatically: npm run setup:neon:dev');
  }
} catch (err) {
  console.error('\n❌ Setup failed:', err && err.message ? err.message : err);
  process.exit(1);
}
