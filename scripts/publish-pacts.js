#!/usr/bin/env node

const pact = require('@pact-foundation/pact');
const path = require('path');
const fs = require('fs');

const PACT_BROKER_URL = process.env.PACT_BROKER_URL || 'https://api.dev.eyfabric.ey.com/pactbroker/test';
const PACT_BROKER_USERNAME = process.env.PACT_BROKER_USERNAME || 'pact';
const PACT_BROKER_PASSWORD = process.env.PACT_BROKER_PASSWORD || 'pact123';

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
console.log('   Version: 1.0.0');
console.log('   Tags: dev, test');
console.log('   Branch: main\n');

const opts = {
  pactFilesOrDirs: [pactsDir],
  pactBroker: PACT_BROKER_URL,
  pactBrokerUsername: PACT_BROKER_USERNAME,
  pactBrokerPassword: PACT_BROKER_PASSWORD,
  consumerVersion: '1.0.0',
  tags: ['dev', 'test']
};

pact.publishPacts(opts)
  .then(() => {
    console.log('✅ Success! Pacts published to broker\n');
    console.log('📋 Next steps:');
    console.log('   1. View pacts in broker:', PACT_BROKER_URL);
    console.log('   2. Run provider verification:');
    console.log('      cd ../backend && npm run test:pact:provider\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to publish pacts\n');
    console.error('Error:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check broker URL is accessible:');
    console.error(`      curl -I ${PACT_BROKER_URL}`);
    console.error('   2. Verify credentials:');
    console.error(`      curl -u ${PACT_BROKER_USERNAME}:${PACT_BROKER_PASSWORD} ${PACT_BROKER_URL}`);
    console.error('   3. Check network/firewall settings');
    console.error('   4. Verify broker is running and accessible\n');
    console.error('Full error:', error);
    process.exit(1);
  });
