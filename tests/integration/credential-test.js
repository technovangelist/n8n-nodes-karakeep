/**
 * Integration test script to verify credential functionality
 * This script simulates how n8n would load and use the credentials
 */

const { KarakeepApi } = require('../../dist/credentials/KarakeepApi.credentials');

function testCredentialLoading() {
	console.log('Testing credential loading...');
	
	const credentials = new KarakeepApi();
	
	// Test basic properties
	console.log('✓ Credential name:', credentials.name);
	console.log('✓ Display name:', credentials.displayName);
	console.log('✓ Documentation URL:', credentials.documentationUrl);
	
	// Test properties structure
	const instanceUrlProp = credentials.properties.find(p => p.name === 'instanceUrl');
	const apiKeyProp = credentials.properties.find(p => p.name === 'apiKey');
	
	if (!instanceUrlProp || !apiKeyProp) {
		throw new Error('Required properties not found');
	}
	
	console.log('✓ Instance URL property configured');
	console.log('✓ API Key property configured');
	
	// Test authentication configuration
	if (credentials.authenticate.type !== 'generic') {
		throw new Error('Authentication type should be generic');
	}
	
	console.log('✓ Authentication configuration valid');
	
	// Test credential test configuration
	if (!credentials.test.request.baseURL || !credentials.test.request.url) {
		throw new Error('Credential test configuration incomplete');
	}
	
	console.log('✓ Credential test configuration valid');
	
	console.log('\n✅ All credential tests passed!');
}

function testCredentialValidation() {
	console.log('\nTesting credential validation...');
	
	const { validateKarakeepCredentials } = require('../../dist/credentials/utils/validation');
	
	// Test valid credentials
	const validResult = validateKarakeepCredentials({
		instanceUrl: 'https://api.karakeep.app',
		apiKey: '1234567890abcdef'
	});
	
	if (!validResult.isValid) {
		throw new Error('Valid credentials should pass validation');
	}
	
	console.log('✓ Valid credentials pass validation');
	
	// Test invalid credentials
	const invalidResult = validateKarakeepCredentials({
		instanceUrl: 'invalid-url',
		apiKey: 'short'
	});
	
	if (invalidResult.isValid) {
		throw new Error('Invalid credentials should fail validation');
	}
	
	console.log('✓ Invalid credentials fail validation');
	console.log('✓ Validation errors:', invalidResult.errors);
	
	console.log('\n✅ All validation tests passed!');
}

// Run tests
try {
	testCredentialLoading();
	testCredentialValidation();
	console.log('\n🎉 All integration tests completed successfully!');
} catch (error) {
	console.error('\n❌ Integration test failed:', error.message);
	process.exit(1);
}