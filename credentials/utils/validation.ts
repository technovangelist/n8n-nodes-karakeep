/**
 * Validates if a URL is properly formatted
 * @param url The URL string to validate
 * @returns true if valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
	try {
		const urlObj = new URL(url);
		return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
	} catch {
		return false;
	}
}

/**
 * Validates if an API key has the expected format
 * @param apiKey The API key to validate
 * @returns true if valid, false otherwise
 */
export function isValidApiKey(apiKey: string): boolean {
	// Basic validation: non-empty string with minimum length
	return typeof apiKey === 'string' && apiKey.trim().length >= 10;
}

/**
 * Validates Karakeep credentials
 * @param credentials Object containing instanceUrl and apiKey
 * @returns Object with validation results
 */
export function validateKarakeepCredentials(credentials: { instanceUrl: string; apiKey: string }) {
	const errors: string[] = [];
	
	if (!credentials.instanceUrl) {
		errors.push('Instance URL is required');
	} else if (!isValidUrl(credentials.instanceUrl)) {
		errors.push('Instance URL must be a valid HTTP or HTTPS URL');
	}
	
	if (!credentials.apiKey) {
		errors.push('API Key is required');
	} else if (!isValidApiKey(credentials.apiKey)) {
		errors.push('API Key must be at least 10 characters long');
	}
	
	return {
		isValid: errors.length === 0,
		errors,
	};
}