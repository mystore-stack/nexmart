// Check environment variables for organization configuration
const fs = require('fs');
const path = require('path');

const envFiles = ['.env', '.env.local', '.env.example'];
const projectRoot = process.cwd();

console.log('========== ENVIRONMENT VARIABLE CHECK ==========');
console.log(`Project root: ${projectRoot}\n`);

for (const envFile of envFiles) {
  const envPath = path.join(projectRoot, envFile);
  if (fs.existsSync(envPath)) {
    console.log(`=== ${envFile} ===`);
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('DEFAULT_ORGANIZATION') || line.includes('ORGANIZATION')) {
        console.log(line);
      }
    });
    console.log('');
  } else {
    console.log(`=== ${envFile} === NOT FOUND\n`);
  }
}

console.log('=== PROCESS ENVIRONMENT VARIABLES ===');
console.log('DEFAULT_ORGANIZATION_SLUG:', process.env.DEFAULT_ORGANIZATION_SLUG);
console.log('DEFAULT_ORGANIZATION_ID:', process.env.DEFAULT_ORGANIZATION_ID);
