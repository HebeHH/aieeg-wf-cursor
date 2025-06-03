const { execSync } = require('child_process');
const path = require('path');

// Check if GEMINI_API_KEY is set
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY environment variable is required');
  console.log('Please set it with: export GEMINI_API_KEY=your_api_key_here');
  process.exit(1);
}

console.log('🚀 Running combineData.ts...');

try {
  // Run the TypeScript file using ts-node or compile and run
  const scriptPath = path.join(__dirname, 'src', 'app', 'setup', 'combineData.ts');
  
  // Try to run with ts-node first, fallback to npx if not available
  try {
    execSync(`npx ts-node "${scriptPath}"`, { stdio: 'inherit' });
  } catch (error) {
    console.log('ts-node not found, trying with tsx...');
    execSync(`npx tsx "${scriptPath}"`, { stdio: 'inherit' });
  }
} catch (error) {
  console.error('❌ Error running script:', error.message);
  process.exit(1);
} 