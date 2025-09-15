import { isValidUrl, isValidApiKey, validateKarakeepCredentials } from '../../../../credentials/utils/validation';

describe('Validation Utils', () => {
	describe('isValidUrl', () => {
		it('should return true for valid HTTP URLs', () => {
			expect(isValidUrl('http://example.com')).toBe(true);
			expect(isValidUrl('http://localhost:3000')).toBe(true);
		});

		it('should return true for valid HTTPS URLs', () => {
			expect(isValidUrl('https://example.com')).toBe(true);
			expect(isValidUrl('https://api.karakeep.app')).toBe(true);
			expect(isValidUrl('https://subdomain.example.com/path')).toBe(true);
		});

		it('should return false for invalid URLs', () => {
			expect(isValidUrl('not-a-url')).toBe(false);
			expect(isValidUrl('ftp://example.com')).toBe(false);
			expect(isValidUrl('')).toBe(false);
			expect(isValidUrl('http://')).toBe(false);
		});

		it('should return false for malformed URLs', () => {
			expect(isValidUrl('https://')).toBe(false);
			expect(isValidUrl('://example.com')).toBe(false);
			expect(isValidUrl('http://')).toBe(false);
		});
	});

	describe('isValidApiKey', () => {
		it('should return true for valid API keys', () => {
			expect(isValidApiKey('1234567890')).toBe(true);
			expect(isValidApiKey('abcdefghijklmnop')).toBe(true);
			expect(isValidApiKey('sk-1234567890abcdef')).toBe(true);
		});

		it('should return false for invalid API keys', () => {
			expect(isValidApiKey('')).toBe(false);
			expect(isValidApiKey('short')).toBe(false);
			expect(isValidApiKey('123456789')).toBe(false); // 9 chars, need 10+
		});

		it('should return false for non-string values', () => {
			expect(isValidApiKey(null as any)).toBe(false);
			expect(isValidApiKey(undefined as any)).toBe(false);
			expect(isValidApiKey(123 as any)).toBe(false);
		});

		it('should handle whitespace correctly', () => {
			expect(isValidApiKey('   ')).toBe(false);
			expect(isValidApiKey('  1234567890  ')).toBe(true); // trimmed length >= 10
		});
	});

	describe('validateKarakeepCredentials', () => {
		it('should return valid for correct credentials', () => {
			const result = validateKarakeepCredentials({
				instanceUrl: 'https://api.karakeep.app',
				apiKey: '1234567890abcdef'
			});

			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should return errors for missing instanceUrl', () => {
			const result = validateKarakeepCredentials({
				instanceUrl: '',
				apiKey: '1234567890abcdef'
			});

			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Instance URL is required');
		});

		it('should return errors for invalid instanceUrl', () => {
			const result = validateKarakeepCredentials({
				instanceUrl: 'not-a-url',
				apiKey: '1234567890abcdef'
			});

			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Instance URL must be a valid HTTP or HTTPS URL');
		});

		it('should return errors for missing apiKey', () => {
			const result = validateKarakeepCredentials({
				instanceUrl: 'https://api.karakeep.app',
				apiKey: ''
			});

			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('API Key is required');
		});

		it('should return errors for invalid apiKey', () => {
			const result = validateKarakeepCredentials({
				instanceUrl: 'https://api.karakeep.app',
				apiKey: 'short'
			});

			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('API Key must be at least 10 characters long');
		});

		it('should return multiple errors when both fields are invalid', () => {
			const result = validateKarakeepCredentials({
				instanceUrl: 'invalid-url',
				apiKey: 'short'
			});

			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveLength(2);
			expect(result.errors).toContain('Instance URL must be a valid HTTP or HTTPS URL');
			expect(result.errors).toContain('API Key must be at least 10 characters long');
		});
	});
});