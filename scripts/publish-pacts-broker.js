#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PACT_BROKER_URL = process.env.PACT_BROKER_URL || 'https://api.dev.eyfabric.ey.com/pactbroker/test';
const PACT_BROKER_USERNAME = process.env.PACT_BROKER_USERNAME || 'pact';
const PACT_BROKER_PASSWORD = process.env.PACT_BROKER_PASSWORD || 'pact123';
const CONSUMER_VERSION = process.env.CONSUMER_VERSION || '1.0.' + Date.now();

console.log('\n🚀 Publishing Pacts to Broker');
console.log('================================\n');

const pactsDir = path.resolve(__dirname, '../pacts');

// Check if pacts directory exists
if (!fs.existsSync(pactsDir)) {
  console.error('❌ Pacts directory not found:', pactsDir);
  console.error('\n💡 Run consumer tests first to generate pacts:');
  console.error('   npm run test:pact\n');
  process.exit(1);
}

// Check if pact files exist
const pactFiles = fs.readdirSync(pactsDir).filter(f => f.endsWith('.json'));

if (pactFiles.length === 0) {
  console.error('❌ No pact files found in:', pactsDir);
  console.error('\n💡 Run consumer tests first to generate pacts:');
  console.error('   npm run test:pact\n');
  process.exit(1);
}

console.log('📁 Found pact files:');
pactFiles.forEach(f => console.log('   ✓', f));
console.log('');

console.log('📤 Publishing to broker:');
console.log('   URL:', PACT_BROKER_URL);
console.log('   Consumer: ECommerceFrontend');
console.log('   Provider: ECommerceAPI');
console.log('   Version:', CONSUMER_VERSION);
console.log('   Tags: dev, test');
console.log('   Branch: main\n');

try {
  // Use pact-broker CLI to publish
  pactFiles.forEach(pactFile => {
    const pactPath = path.join(pactsDir, pactFile);
    console.log(`📦 Publishing ${pactFile}...`);
    
    const command = `npx pact-broker publish "${pactPath}" \\
      --consumer-app-version="${CONSUMER_VERSION}" \\
      --broker-base-url="${PACT_BROKER_URL}" \\
      --broker-username="${PACT_BROKER_USERNAME}" \\
      --broker-password="${PACT_BROKER_PASSWORD}" \\
      --tag="dev" \\
      --tag="test" \\
      --branch="main"`;
    
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error('\n❌ Failed to publish:', pactFile);
      throw error;
    }
  });
  
  console.log('\n✅ Success! All pacts published to broker\n');
  console.log('📋 Next steps:');
  console.log('   1. View pacts in broker:', PACT_BROKER_URL);
  console.log('   2. Run provider verification:');
  console.log('      cd ../backend && npm run test:pact:provider\n');
  process.exit(0);
  
} catch (error) {
  console.error('\n❌ Failed to publish pacts\n');
  console.error('🔍 Troubleshooting:');
  console.error('   1. Check broker URL is accessible:');
  console.error(`      curl -I ${PACT_BROKER_URL}`);
  console.error('   2. Verify credentials:');
  console.error(`      curl -u ${PACT_BROKER_USERNAME}:${PACT_BROKER_PASSWORD} ${PACT_BROKER_URL}`);
  console.error('   3. Check network/firewall settings');
  console.error('   4. Verify broker is running and accessible\n');
  process.exit(1);
}
