#!/usr/bin/env node

/**
 * Pre-Deployment Checklist Script
 * Run this before deploying to Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running Pre-Deployment Checks...\n');

let hasErrors = false;
let hasWarnings = false;

// Check 1: package.json exists
console.log('📦 Checking package.json...');
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (pkg.scripts && pkg.scripts.build) {
    console.log('✅ Build script found');
  } else {
    console.log('❌ No build script in package.json');
    hasErrors = true;
  }
  
  if (pkg.scripts && pkg.scripts.start) {
    console.log('✅ Start script found');
  } else {
    console.log('⚠️  No start script in package.json');
    hasWarnings = true;
  }
} else {
  console.log('❌ package.json not found');
  hasErrors = true;
}

console.log('');

// Check 2: next.config exists
console.log('⚙️  Checking Next.js config...');
const configFiles = ['next.config.js', 'next.config.ts', 'next.config.mjs'];
const configExists = configFiles.some(file => fs.existsSync(file));

if (configExists) {
  console.log('✅ Next.js config found');
} else {
  console.log('❌ No Next.js config file found');
  hasErrors = true;
}

console.log('');

// Check 3: Environment variables
console.log('🔐 Checking environment setup...');
if (fs.existsSync('.env.local.example') || fs.existsSync('.env.example')) {
  console.log('✅ Environment example file exists');
} else {
  console.log('⚠️  No .env.example file (consider creating one for documentation)');
  hasWarnings = true;
}

if (fs.existsSync('.env.local') || fs.existsSync('.env')) {
  console.log('⚠️  Local .env file detected (make sure it\'s in .gitignore)');
  hasWarnings = true;
}

console.log('');

// Check 4: .gitignore
console.log('📝 Checking .gitignore...');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  
  if (gitignore.includes('.env')) {
    console.log('✅ .env files are ignored');
  } else {
    console.log('❌ .env files not in .gitignore - this is a security risk!');
    hasErrors = true;
  }
  
  if (gitignore.includes('node_modules')) {
    console.log('✅ node_modules is ignored');
  } else {
    console.log('⚠️  node_modules not in .gitignore');
    hasWarnings = true;
  }
} else {
  console.log('❌ .gitignore not found');
  hasErrors = true;
}

console.log('');

// Check 5: Required directories
console.log('📁 Checking project structure...');
const requiredDirs = ['app', 'components', 'public'];
let missingDirs = [];

requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    missingDirs.push(dir);
  }
});

if (missingDirs.length === 0) {
  console.log('✅ All required directories exist');
} else {
  console.log(`⚠️  Missing directories: ${missingDirs.join(', ')}`);
  hasWarnings = true;
}

console.log('');

// Check 6: vercel.json
console.log('🔧 Checking Vercel configuration...');
if (fs.existsSync('vercel.json')) {
  console.log('✅ vercel.json found');
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    if (vercelConfig.env || vercelConfig.buildCommand) {
      console.log('✅ Vercel configuration looks valid');
    }
  } catch (e) {
    console.log('⚠️  vercel.json exists but may have invalid JSON');
    hasWarnings = true;
  }
} else {
  console.log('⚠️  No vercel.json (optional, but recommended)');
  hasWarnings = true;
}

console.log('');

// Check 7: TypeScript
console.log('📘 Checking TypeScript...');
if (fs.existsSync('tsconfig.json')) {
  console.log('✅ TypeScript configured');
} else {
  console.log('⚠️  No tsconfig.json found');
  hasWarnings = true;
}

console.log('');

// Summary
console.log('═══════════════════════════════════════');
console.log('📊 Pre-Deployment Check Summary\n');

if (!hasErrors && !hasWarnings) {
  console.log('🎉 All checks passed! Your project is ready for deployment.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Run: npm run build (to test locally)');
  console.log('2. Commit your changes');
  console.log('3. Deploy to Vercel');
  process.exit(0);
} else if (!hasErrors && hasWarnings) {
  console.log('⚠️  Checks passed with warnings.');
  console.log('You can deploy, but consider addressing the warnings above.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Review warnings above');
  console.log('2. Run: npm run build');
  console.log('3. Deploy to Vercel');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please fix the errors before deploying.');
  console.log('');
  process.exit(1);
}

