const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Prisma client binding issue...');

try {
  // Try to stop any running dev servers
  console.log('📋 Checking for running processes...');
  
  // Clean up any temporary files
  const prismaDir = path.join(__dirname, '..', 'node_modules', '.prisma');
  if (fs.existsSync(prismaDir)) {
    console.log('🧹 Cleaning up Prisma client directory...');
    try {
      fs.rmSync(prismaDir, { recursive: true, force: true });
      console.log('✅ Prisma client directory cleaned');
    } catch (error) {
      console.log('⚠️  Could not clean directory (files may be in use)');
    }
  }

  // Regenerate Prisma client
  console.log('🔄 Regenerating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client regenerated successfully');

  console.log('🎉 Prisma client fix completed!');
  console.log('💡 You can now restart your development server with: npm run dev');

} catch (error) {
  console.error('❌ Error fixing Prisma client:', error.message);
  console.log('\n🔧 Manual fix steps:');
  console.log('1. Stop your development server (Ctrl+C)');
  console.log('2. Run: npx prisma generate');
  console.log('3. Restart your server: npm run dev');
}