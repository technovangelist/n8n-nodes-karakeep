import { KarakeepApi } from '../../../credentials/KarakeepApi.credentials';

describe('KarakeepApi Credentials', () => {
	let credentials: KarakeepApi;

	beforeEach(() => {
		credentials = new KarakeepApi();
	});

	describe('Credential Properties', () => {
		it('should have correct credential name', () => {
			expect(credentials.name).toBe('karakeepApi');
		});

		it('should have correct display name', () => {
			expect(credentials.displayName).toBe('Karakeep API');
		});

		it('should have documentation URL', () => {
			expect(credentials.documentationUrl).toBe('https://docs.karakeep.com/api');
		});

		it('should have required properties defined', () => {
			expect(credentials.properties).toHaveLength(2);
			
			const instanceUrlProperty = credentials.properties.find(p => p.name === 'instanceUrl');
			const apiKeyProperty = credentials.properties.find(p => p.name === 'apiKey');

			expect(instanceUrlProperty).toBeDefined();
			expect(apiKeyProperty).toBeDefined();
		});
	});

	describe('Instance URL Property', () => {
		let instanceUrlProperty: any;

		beforeEach(() => {
			instanceUrlProperty = credentials.properties.find(p => p.name === 'instanceUrl');
		});

		it('should be required', () => {
			expect(instanceUrlProperty.required).toBe(true);
		});

		it('should be string type', () => {
			expect(instanceUrlProperty.type).toBe('string');
		});

		it('should have default value', () => {
			expect(instanceUrlProperty.default).toBe('https://try.karakeep.app');
		});

		it('should have placeholder text', () => {
			expect(instanceUrlProperty.placeholder).toBe('https://your-instance.karakeep.app');
		});

		it('should have description', () => {
			expect(instanceUrlProperty.description).toBe('The URL of your Karakeep instance');
		});
	});

	describe('API Key Property', () => {
		let apiKeyProperty: any;

		beforeEach(() => {
			apiKeyProperty = credentials.properties.find(p => p.name === 'apiKey');
		});

		it('should be required', () => {
			expect(apiKeyProperty.required).toBe(true);
		});

		it('should be string type', () => {
			expect(apiKeyProperty.type).toBe('string');
		});

		it('should be password type', () => {
			expect(apiKeyProperty.typeOptions?.password).toBe(true);
		});

		it('should have empty default value', () => {
			expect(apiKeyProperty.default).toBe('');
		});

		it('should have placeholder text', () => {
			expect(apiKeyProperty.placeholder).toBe('your-api-key-here');
		});

		it('should have description', () => {
			expect(apiKeyProperty.description).toBe('Your Karakeep API key');
		});
	});

	describe('Authentication Configuration', () => {
		it('should use generic authentication type', () => {
			expect(credentials.authenticate.type).toBe('generic');
		});

		it('should set Authorization header with Bearer token', () => {
			expect(credentials.authenticate.properties?.headers?.Authorization).toBe('=Bearer {{$credentials.apiKey}}');
		});
	});

	describe('Credential Test Configuration', () => {
		it('should use correct base URL from credentials', () => {
			expect(credentials.test.request.baseURL).toBe('={{$credentials.instanceUrl}}');
		});

		it('should test with users/me endpoint', () => {
			expect(credentials.test.request.url).toBe('/api/v1/users/me');
		});

		it('should use GET method for test', () => {
			expect(credentials.test.request.method).toBe('GET');
		});
	});
});