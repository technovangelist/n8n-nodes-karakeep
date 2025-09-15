import {
	KarakeepError,
	ValidationResult,
	ValidationError,
	PaginationParams,
	KarakeepResponse,
	RetryConfig,
	RateLimitInfo,
	BulkOperationResult,
	BulkOperationError,
	TransformationRule,
	CacheEntry,
	CacheOptions,
	CreateBookmarkInput,
	CreateListInput,
	CreateTagInput,
	CreateHighlightInput,
	UpdateBookmarkInput,
	UpdateListInput,
	UpdateTagInput,
	UpdateHighlightInput,
} from './types';

// ============================================================================
// URL and Network Utilities
// ============================================================================

/**
 * Validates if a URL is properly formatted
 */
export function validateUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates if a URL is a valid Karakeep instance URL
 */
export function validateKarakeepUrl(url: string): ValidationResult {
	const errors: ValidationError[] = [];

	if (!url || typeof url !== 'string') {
		errors.push({
			field: 'instanceUrl',
			message: 'Instance URL is required',
			code: 'REQUIRED_FIELD',
		});
		return { isValid: false, errors };
	}

	if (!validateUrl(url)) {
		errors.push({
			field: 'instanceUrl',
			message: 'Invalid URL format',
			code: 'INVALID_URL',
		});
	}

	// Ensure URL doesn't end with slash for consistency
	if (url.endsWith('/')) {
		errors.push({
			field: 'instanceUrl',
			message: 'URL should not end with a slash',
			code: 'INVALID_URL_FORMAT',
		});
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Builds query parameters string from object
 */
export function buildQueryParams(params: Record<string, string | number | boolean | string[]>): string {
	const searchParams = new URLSearchParams();
	
	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			if (Array.isArray(value)) {
				value.forEach(item => searchParams.append(key, String(item)));
			} else {
				searchParams.append(key, String(value));
			}
		}
	});
	
	return searchParams.toString();
}

/**
 * Constructs full API endpoint URL
 */
export function buildApiUrl(baseUrl: string, endpoint: string, params?: Record<string, any>): string {
	const cleanBaseUrl = baseUrl.replace(/\/$/, '');
	const cleanEndpoint = endpoint.replace(/^\//, '');
	let url = `${cleanBaseUrl}/api/v1/${cleanEndpoint}`;
	
	if (params) {
		const queryString = buildQueryParams(params);
		if (queryString) {
			url += `?${queryString}`;
		}
	}
	
	return url;
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Creates a standardized error object
 */
export function createKarakeepError(
	code: string,
	message: string,
	statusCode: number,
	details?: Record<string, any>
): KarakeepError {
	return {
		code,
		message,
		statusCode,
		details,
	};
}

/**
 * Creates error from HTTP response
 */
export function createErrorFromResponse(
	statusCode: number,
	responseBody: any,
	defaultMessage: string = 'API request failed'
): KarakeepError {
	let message = defaultMessage;
	let code = 'API_ERROR';
	let details: Record<string, any> = {};

	if (responseBody) {
		if (typeof responseBody === 'string') {
			message = responseBody;
		} else if (responseBody.message) {
			message = responseBody.message;
		} else if (responseBody.error) {
			message = responseBody.error;
		}

		if (responseBody.code) {
			code = responseBody.code;
		}

		if (responseBody.details) {
			details = responseBody.details;
		}
	}

	// Map common HTTP status codes to specific error codes
	switch (statusCode) {
		case 401:
			code = 'AUTHENTICATION_ERROR';
			message = message || 'Invalid API key or authentication failed';
			break;
		case 403:
			code = 'PERMISSION_ERROR';
			message = message || 'Insufficient permissions for this operation';
			break;
		case 404:
			code = 'RESOURCE_NOT_FOUND';
			message = message || 'Requested resource not found';
			break;
		case 429:
			code = 'RATE_LIMIT_EXCEEDED';
			message = message || 'Rate limit exceeded, please try again later';
			break;
		case 422:
			code = 'VALIDATION_ERROR';
			message = message || 'Invalid input data';
			break;
		case 500:
			code = 'SERVER_ERROR';
			message = message || 'Internal server error';
			break;
	}

	return createKarakeepError(code, message, statusCode, details);
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: KarakeepError): boolean {
	const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'];
	const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
	
	return retryableCodes.includes(error.code) || retryableStatusCodes.includes(error.statusCode);
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validates required fields in an object
 */
export function validateRequiredFields(
	data: Record<string, any>,
	requiredFields: string[]
): ValidationError[] {
	const errors: ValidationError[] = [];
	
	requiredFields.forEach(field => {
		if (data[field] === undefined || data[field] === null || data[field] === '') {
			errors.push({
				field,
				message: `${field} is required`,
				code: 'REQUIRED_FIELD',
			});
		}
	});
	
	return errors;
}

/**
 * Validates bookmark input data
 */
export function validateBookmarkInput(data: CreateBookmarkInput | UpdateBookmarkInput): ValidationResult {
	const errors: ValidationError[] = [];

	// For create operations, URL is required
	if ('url' in data) {
		if (!data.url) {
			errors.push({
				field: 'url',
				message: 'URL is required',
				code: 'REQUIRED_FIELD',
			});
		} else if (!validateUrl(data.url)) {
			errors.push({
				field: 'url',
				message: 'Invalid URL format',
				code: 'INVALID_URL',
			});
		}
	}

	// Validate title length if provided
	if (data.title && data.title.length > 500) {
		errors.push({
			field: 'title',
			message: 'Title must be 500 characters or less',
			code: 'FIELD_TOO_LONG',
		});
	}

	// Validate note length if provided
	if (data.note && data.note.length > 10000) {
		errors.push({
			field: 'note',
			message: 'Note must be 10000 characters or less',
			code: 'FIELD_TOO_LONG',
		});
	}

	// Validate tags array if provided
	if ('tags' in data && data.tags) {
		if (!Array.isArray(data.tags)) {
			errors.push({
				field: 'tags',
				message: 'Tags must be an array',
				code: 'INVALID_TYPE',
			});
		} else if (data.tags.length > 50) {
			errors.push({
				field: 'tags',
				message: 'Maximum 50 tags allowed',
				code: 'TOO_MANY_ITEMS',
			});
		}
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Validates list input data
 */
export function validateListInput(data: CreateListInput | UpdateListInput): ValidationResult {
	const errors: ValidationError[] = [];

	// For create operations, name is required
	if ('name' in data && !data.name) {
		errors.push({
			field: 'name',
			message: 'List name is required',
			code: 'REQUIRED_FIELD',
		});
	}

	// Validate name length
	if (data.name && data.name.length > 200) {
		errors.push({
			field: 'name',
			message: 'List name must be 200 characters or less',
			code: 'FIELD_TOO_LONG',
		});
	}

	// Validate description length if provided
	if (data.description && data.description.length > 1000) {
		errors.push({
			field: 'description',
			message: 'Description must be 1000 characters or less',
			code: 'FIELD_TOO_LONG',
		});
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Validates tag input data
 */
export function validateTagInput(data: CreateTagInput | UpdateTagInput): ValidationResult {
	const errors: ValidationError[] = [];

	if (!data.name) {
		errors.push({
			field: 'name',
			message: 'Tag name is required',
			code: 'REQUIRED_FIELD',
		});
	} else {
		// Validate tag name format
		if (data.name.length > 100) {
			errors.push({
				field: 'name',
				message: 'Tag name must be 100 characters or less',
				code: 'FIELD_TOO_LONG',
			});
		}

		// Check for invalid characters
		if (!/^[a-zA-Z0-9\s\-_]+$/.test(data.name)) {
			errors.push({
				field: 'name',
				message: 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores',
				code: 'INVALID_FORMAT',
			});
		}
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Validates highlight input data
 */
export function validateHighlightInput(data: CreateHighlightInput | UpdateHighlightInput): ValidationResult {
	const errors: ValidationError[] = [];

	// For create operations, bookmarkId is required
	if ('bookmarkId' in data && !data.bookmarkId) {
		errors.push({
			field: 'bookmarkId',
			message: 'Bookmark ID is required',
			code: 'REQUIRED_FIELD',
		});
	}

	// Validate text
	if ('text' in data && !data.text) {
		errors.push({
			field: 'text',
			message: 'Highlighted text is required',
			code: 'REQUIRED_FIELD',
		});
	}

	// Validate offsets
	if (data.startOffset !== undefined && data.endOffset !== undefined) {
		if (data.startOffset < 0) {
			errors.push({
				field: 'startOffset',
				message: 'Start offset must be non-negative',
				code: 'INVALID_VALUE',
			});
		}

		if (data.endOffset < 0) {
			errors.push({
				field: 'endOffset',
				message: 'End offset must be non-negative',
				code: 'INVALID_VALUE',
			});
		}

		if (data.startOffset >= data.endOffset) {
			errors.push({
				field: 'endOffset',
				message: 'End offset must be greater than start offset',
				code: 'INVALID_RANGE',
			});
		}
	}

	// Validate note length if provided
	if (data.note && data.note.length > 1000) {
		errors.push({
			field: 'note',
			message: 'Note must be 1000 characters or less',
			code: 'FIELD_TOO_LONG',
		});
	}

	return { isValid: errors.length === 0, errors };
}

// ============================================================================
// Data Transformation Utilities
// ============================================================================

/**
 * Sanitizes and normalizes API response data
 */
export function normalizeApiResponse<T>(data: any): T {
	// Remove any null values and normalize data structure
	if (Array.isArray(data)) {
		return data.map(item => normalizeApiResponse(item)) as T;
	}
	
	if (data && typeof data === 'object') {
		const normalized: any = {};
		Object.entries(data).forEach(([key, value]) => {
			if (value !== null) {
				normalized[key] = normalizeApiResponse(value);
			}
		});
		return normalized as T;
	}
	
	return data as T;
}

/**
 * Transforms data using transformation rules
 */
export function transformData<T, U>(
	data: T,
	rules: TransformationRule<T, U>[]
): Partial<U> {
	const result: any = {};

	rules.forEach(rule => {
		const sourceValue = (data as any)[rule.source];
		if (sourceValue !== undefined) {
			result[rule.target] = rule.transform ? rule.transform(sourceValue) : sourceValue;
		}
	});

	return result as Partial<U>;
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
	if (obj === null || typeof obj !== 'object') {
		return obj;
	}

	if (obj instanceof Date) {
		return new Date(obj.getTime()) as T;
	}

	if (Array.isArray(obj)) {
		return obj.map(item => deepClone(item)) as T;
	}

	const cloned: any = {};
	Object.keys(obj).forEach(key => {
		cloned[key] = deepClone((obj as any)[key]);
	});

	return cloned as T;
}

/**
 * Safely gets nested property value
 */
export function getNestedProperty(obj: any, path: string, defaultValue?: any): any {
	const keys = path.split('.');
	let current = obj;

	for (const key of keys) {
		if (current === null || current === undefined || !(key in current)) {
			return defaultValue;
		}
		current = current[key];
	}

	return current;
}

// ============================================================================
// Pagination Utilities
// ============================================================================

/**
 * Validates pagination parameters
 */
export function validatePaginationParams(params: PaginationParams): ValidationResult {
	const errors: ValidationError[] = [];

	if (params.page !== undefined) {
		if (!Number.isInteger(params.page) || params.page < 1) {
			errors.push({
				field: 'page',
				message: 'Page must be a positive integer',
				code: 'INVALID_VALUE',
			});
		}
	}

	if (params.limit !== undefined) {
		if (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 100) {
			errors.push({
				field: 'limit',
				message: 'Limit must be an integer between 1 and 100',
				code: 'INVALID_VALUE',
			});
		}
	}

	return { isValid: errors.length === 0, errors };
}

/**
 * Calculates pagination metadata
 */
export function calculatePaginationMeta(
	page: number,
	limit: number,
	total: number
): { totalPages: number; hasNext: boolean; hasPrev: boolean; offset: number } {
	const totalPages = Math.ceil(total / limit);
	const hasNext = page < totalPages;
	const hasPrev = page > 1;
	const offset = (page - 1) * limit;

	return { totalPages, hasNext, hasPrev, offset };
}

/**
 * Extracts pagination info from response headers
 */
export function extractPaginationFromHeaders(headers: Record<string, string>): Partial<RateLimitInfo> {
	const info: Partial<RateLimitInfo> = {};

	if (headers['x-ratelimit-limit']) {
		info.limit = parseInt(headers['x-ratelimit-limit'], 10);
	}

	if (headers['x-ratelimit-remaining']) {
		info.remaining = parseInt(headers['x-ratelimit-remaining'], 10);
	}

	if (headers['x-ratelimit-reset']) {
		info.resetTime = parseInt(headers['x-ratelimit-reset'], 10);
	}

	return info;
}

// ============================================================================
// Retry and Rate Limiting Utilities
// ============================================================================

/**
 * Calculates delay for exponential backoff
 */
export function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
	const delay = config.baseDelay * Math.pow(2, attempt - 1);
	return Math.min(delay, config.maxDelay);
}

/**
 * Checks if operation should be retried
 */
export function shouldRetry(error: KarakeepError, attempt: number, config: RetryConfig): boolean {
	if (attempt >= config.maxRetries) {
		return false;
	}

	return config.retryableStatusCodes.includes(error.statusCode) || isRetryableError(error);
}

/**
 * Sleeps for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Bulk Operation Utilities
// ============================================================================

/**
 * Processes items in batches
 */
export async function processBatch<T, U>(
	items: T[],
	batchSize: number,
	processor: (batch: T[]) => Promise<U[]>
): Promise<BulkOperationResult<U>> {
	const result: BulkOperationResult<U> = {
		successful: [],
		failed: [],
		totalProcessed: 0,
	};

	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize);
		
		try {
			const batchResults = await processor(batch);
			result.successful.push(...batchResults);
		} catch (error) {
			// Handle batch failure
			batch.forEach(item => {
				result.failed.push({
					item,
					error: error instanceof Error 
						? createKarakeepError('BATCH_ERROR', error.message, 500)
						: createKarakeepError('BATCH_ERROR', 'Unknown batch processing error', 500),
				});
			});
		}

		result.totalProcessed += batch.length;
	}

	return result;
}

// ============================================================================
// Cache Utilities
// ============================================================================

/**
 * Simple in-memory cache implementation
 */
export class SimpleCache<T> {
	private cache = new Map<string, CacheEntry<T>>();
	private options: CacheOptions;

	constructor(options: CacheOptions) {
		this.options = options;
	}

	set(key: string, value: T): void {
		// Remove oldest entries if cache is full
		if (this.cache.size >= this.options.maxSize) {
			const oldestKey = this.cache.keys().next().value;
			if (oldestKey) {
				this.cache.delete(oldestKey);
			}
		}

		this.cache.set(key, {
			data: value,
			timestamp: Date.now(),
			ttl: this.options.ttl,
		});
	}

	get(key: string): T | null {
		const entry = this.cache.get(key);
		
		if (!entry) {
			return null;
		}

		// Check if entry has expired
		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	delete(key: string): boolean {
		return this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}

	size(): number {
		return this.cache.size;
	}
}

// ============================================================================
// String and Format Utilities
// ============================================================================

/**
 * Converts string to kebab-case
 */
export function toKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, '$1-$2')
		.replace(/[\s_]+/g, '-')
		.toLowerCase();
}

/**
 * Converts string to camelCase
 */
export function toCamelCase(str: string): string {
	return str
		.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
		.replace(/^[A-Z]/, char => char.toLowerCase());
}

/**
 * Truncates string to specified length
 */
export function truncateString(str: string, maxLength: number, suffix: string = '...'): string {
	if (str.length <= maxLength) {
		return str;
	}
	return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Formats file size in human readable format
 */
export function formatFileSize(bytes: number): string {
	const units = ['B', 'KB', 'MB', 'GB', 'TB'];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Parses a comma-separated string of tags into an array
 */
export function parseTagsString(tagsString: string): string[] {
	if (!tagsString || typeof tagsString !== 'string') {
		return [];
	}

	return tagsString
		.split(',')
		.map(tag => tag.trim())
		.filter(tag => tag.length > 0);
}

/**
 * Formats a date for API requests (ISO string)
 */
export function formatDateForApi(date: string | Date): string {
	if (typeof date === 'string') {
		return new Date(date).toISOString();
	}
	return date.toISOString();
}