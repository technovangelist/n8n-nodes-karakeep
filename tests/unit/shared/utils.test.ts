import {
	validateUrl,
	validateKarakeepUrl,
	buildQueryParams,
	buildApiUrl,
	createKarakeepError,
	createErrorFromResponse,
	isRetryableError,
	validateRequiredFields,
	validateBookmarkInput,
	validateListInput,
	validateTagInput,
	validateHighlightInput,
	normalizeApiResponse,
	transformData,
	deepClone,
	getNestedProperty,
	validatePaginationParams,
	calculatePaginationMeta,
	extractPaginationFromHeaders,
	parseTagsString,
	formatDateForApi,
	calculateBackoffDelay,
	shouldRetry,
	processBatch,
	SimpleCache,
	toKebabCase,
	toCamelCase,
	truncateString,
	formatFileSize,
} from '../../../nodes/shared/utils';

import {
	KarakeepError,
	ValidationResult,
	CreateBookmarkInput,
	UpdateBookmarkInput,
	CreateListInput,
	UpdateListInput,
	CreateTagInput,
	UpdateTagInput,
	CreateHighlightInput,
	UpdateHighlightInput,
	PaginationParams,
	RetryConfig,
	TransformationRule,
	CacheOptions,
} from '../../../nodes/shared/types';
import { beforeEach } from 'node:test';

describe('URL and Network Utilities', () => {
	describe('validateUrl', () => {
		it('should validate correct URLs', () => {
			expect(validateUrl('https://example.com')).toBe(true);
			expect(validateUrl('http://localhost:3000')).toBe(true);
			expect(validateUrl('https://api.karakeep.com/v1')).toBe(true);
		});

		it('should reject invalid URLs', () => {
			expect(validateUrl('not-a-url')).toBe(false);
			expect(validateUrl('://invalid')).toBe(false);
			expect(validateUrl('')).toBe(false);
		});
	});

	describe('validateKarakeepUrl', () => {
		it('should validate correct Karakeep URLs', () => {
			const result = validateKarakeepUrl('https://try.karakeep.app');
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should reject URLs ending with slash', () => {
			const result = validateKarakeepUrl('https://try.karakeep.app/');
			expect(result.isValid).toBe(false);
			expect(result.errors[0].code).toBe('INVALID_URL_FORMAT');
		});

		it('should reject empty or invalid URLs', () => {
			const result1 = validateKarakeepUrl('');
			expect(result1.isValid).toBe(false);
			expect(result1.errors[0].code).toBe('REQUIRED_FIELD');

			const result2 = validateKarakeepUrl('invalid-url');
			expect(result2.isValid).toBe(false);
			expect(result2.errors[0].code).toBe('INVALID_URL');
		});
	});

	describe('buildQueryParams', () => {
		it('should build query string from object', () => {
			const params = { page: 1, limit: 10, active: true };
			const result = buildQueryParams(params);
			expect(result).toBe('page=1&limit=10&active=true');
		});

		it('should handle array values', () => {
			const params = { tags: ['work', 'important'] };
			const result = buildQueryParams(params);
			expect(result).toBe('tags=work&tags=important');
		});

		it('should skip null and undefined values', () => {
			const params: Record<string, any> = { page: 1, limit: null, active: undefined };
			const result = buildQueryParams(params);
			expect(result).toBe('page=1');
		});
	});

	describe('buildApiUrl', () => {
		it('should construct correct API URLs', () => {
			const result = buildApiUrl('https://try.karakeep.app', 'bookmarks');
			expect(result).toBe('https://try.karakeep.app/api/v1/bookmarks');
		});

		it('should handle trailing slashes', () => {
			const result = buildApiUrl('https://try.karakeep.app/', '/bookmarks');
			expect(result).toBe('https://try.karakeep.app/api/v1/bookmarks');
		});

		it('should add query parameters', () => {
			const result = buildApiUrl('https://try.karakeep.app', 'bookmarks', { page: 1 });
			expect(result).toBe('https://try.karakeep.app/api/v1/bookmarks?page=1');
		});
	});
});

describe('Error Handling Utilities', () => {
	describe('createKarakeepError', () => {
		it('should create standardized error object', () => {
			const error = createKarakeepError('TEST_ERROR', 'Test message', 400, { field: 'test' });
			expect(error).toEqual({
				code: 'TEST_ERROR',
				message: 'Test message',
				statusCode: 400,
				details: { field: 'test' },
			});
		});
	});

	describe('createErrorFromResponse', () => {
		it('should create error from HTTP response', () => {
			const error = createErrorFromResponse(404, { message: 'Not found' });
			expect(error.code).toBe('RESOURCE_NOT_FOUND');
			expect(error.message).toBe('Not found');
			expect(error.statusCode).toBe(404);
		});

		it('should map status codes to error codes', () => {
			const authError = createErrorFromResponse(401, {});
			expect(authError.code).toBe('AUTHENTICATION_ERROR');

			const rateLimitError = createErrorFromResponse(429, {});
			expect(rateLimitError.code).toBe('RATE_LIMIT_EXCEEDED');
		});
	});

	describe('isRetryableError', () => {
		it('should identify retryable errors', () => {
			const networkError = createKarakeepError('NETWORK_ERROR', 'Network failed', 0);
			expect(isRetryableError(networkError)).toBe(true);

			const serverError = createKarakeepError('API_ERROR', 'Server error', 500);
			expect(isRetryableError(serverError)).toBe(true);

			const authError = createKarakeepError('AUTHENTICATION_ERROR', 'Auth failed', 401);
			expect(isRetryableError(authError)).toBe(false);
		});
	});
});

describe('Validation Utilities', () => {
	describe('validateRequiredFields', () => {
		it('should identify missing required fields', () => {
			const data = { name: 'test', email: '' };
			const errors = validateRequiredFields(data, ['name', 'email', 'phone']);
			
			expect(errors).toHaveLength(2);
			expect(errors[0].field).toBe('email');
			expect(errors[1].field).toBe('phone');
		});

		it('should return empty array when all fields present', () => {
			const data = { name: 'test', email: 'test@example.com' };
			const errors = validateRequiredFields(data, ['name', 'email']);
			expect(errors).toHaveLength(0);
		});
	});

	describe('validateBookmarkInput', () => {
		it('should validate create bookmark input', () => {
			const validInput: CreateBookmarkInput = {
				url: 'https://example.com',
				title: 'Test Bookmark',
			};
			const result = validateBookmarkInput(validInput);
			expect(result.isValid).toBe(true);
		});

		it('should reject invalid URL', () => {
			const invalidInput: CreateBookmarkInput = {
				url: 'not-a-url',
			};
			const result = validateBookmarkInput(invalidInput);
			expect(result.isValid).toBe(false);
			expect(result.errors[0].code).toBe('INVALID_URL');
		});

		it('should reject too long title', () => {
			const invalidInput: CreateBookmarkInput = {
				url: 'https://example.com',
				title: 'a'.repeat(501),
			};
			const result = validateBookmarkInput(invalidInput);
			expect(result.isValid).toBe(false);
			expect(result.errors[0].code).toBe('FIELD_TOO_LONG');
		});

		it('should reject too many tags', () => {
			const invalidInput: CreateBookmarkInput = {
				url: 'https://example.com',
				tags: Array(51).fill('tag'),
			};
			const result = validateBookmarkInput(invalidInput);
			expect(result.isValid).toBe(false);
			expect(result.errors[0].code).toBe('TOO_MANY_ITEMS');
		});
	});

	describe('validateListInput', () => {
		it('should validate create list input', () => {
			const validInput: CreateListInput = {
				name: 'Test List',
				description: 'A test list',
			};
			const result = validateListInput(validInput);
			expect(result.isValid).toBe(true);
		});

		it('should reject too long name', () => {
			const invalidInput: CreateListInput = {
				name: 'a'.repeat(201),
			};
			const result = validateListInput(invalidInput);
			expect(result.isValid).toBe(false);
			expect(result.errors[0].code).toBe('FIELD_TOO_LONG');
		});
	});

	describe('validateTagInput', () => {
		it('should validate tag input', () => {
			const validInput: CreateTagInput = {
				name: 'test-tag',
			};
			const result = validateTagInput(validInput);
			expect(result.isValid).toBe(true);
		});

		it('should reject invalid characters', () => {
			const invalidInput: CreateTagInput = {
				name: 'test@tag!',
			};
			const result = validateTagInput(invalidInput);
			expect(result.isValid).toBe(false);
			expect(result.errors[0].code).toBe('INVALID_FORMAT');
		});
	});

	describe('validateHighlightInput', () => {
		it('should validate highlight input', () => {
			const validInput: CreateHighlightInput = {
				bookmarkId: '123',
				text: 'highlighted text',
				startOffset: 0,
				endOffset: 10,
			};
			const result = validateHighlightInput(validInput);
			expect(result.isValid).toBe(true);
		});

		it('should reject invalid offset range', () => {
			const invalidInput: CreateHighlightInput = {
				bookmarkId: '123',
				text: 'highlighted text',
				startOffset: 10,
				endOffset: 5,
			};
			const result = validateHighlightInput(invalidInput);
			expect(result.isValid).toBe(false);
			expect(result.errors[0].code).toBe('INVALID_RANGE');
		});
	});
});

describe('Data Transformation Utilities', () => {
	describe('normalizeApiResponse', () => {
		it('should remove null values', () => {
			const data = { name: 'test', value: null, nested: { prop: null, keep: 'value' } };
			const result = normalizeApiResponse(data);
			expect(result).toEqual({ name: 'test', nested: { keep: 'value' } });
		});

		it('should handle arrays', () => {
			const data = [{ name: 'test', value: null }, { name: 'test2', value: 'keep' }];
			const result = normalizeApiResponse(data);
			expect(result).toEqual([{ name: 'test' }, { name: 'test2', value: 'keep' }]);
		});
	});

	describe('transformData', () => {
		it('should transform data using rules', () => {
			const data = { firstName: 'John', lastName: 'Doe', age: 30 };
			const rules: TransformationRule<typeof data, { name: string; years: number }>[] = [
				{ source: 'firstName', target: 'name' },
				{ source: 'age', target: 'years', transform: (age) => age + 1 },
			];
			const result = transformData(data, rules);
			expect(result).toEqual({ name: 'John', years: 31 });
		});
	});

	describe('deepClone', () => {
		it('should deep clone objects', () => {
			const original = { name: 'test', nested: { value: 123 }, array: [1, 2, 3] };
			const cloned = deepClone(original);
			
			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned.nested).not.toBe(original.nested);
		});

		it('should handle dates', () => {
			const date = new Date();
			const cloned = deepClone(date);
			expect(cloned).toEqual(date);
			expect(cloned).not.toBe(date);
		});
	});

	describe('getNestedProperty', () => {
		it('should get nested property values', () => {
			const obj = { user: { profile: { name: 'John' } } };
			expect(getNestedProperty(obj, 'user.profile.name')).toBe('John');
			expect(getNestedProperty(obj, 'user.profile.age', 'unknown')).toBe('unknown');
		});
	});
});

describe('Pagination Utilities', () => {
	describe('validatePaginationParams', () => {
		it('should validate correct pagination params', () => {
			const params: PaginationParams = { page: 1, limit: 10 };
			const result = validatePaginationParams(params);
			expect(result.isValid).toBe(true);
		});

		it('should reject invalid page numbers', () => {
			const params: PaginationParams = { page: 0 };
			const result = validatePaginationParams(params);
			expect(result.isValid).toBe(false);
			expect(result.errors[0].code).toBe('INVALID_VALUE');
		});

		it('should reject invalid limits', () => {
			const params: PaginationParams = { limit: 101 };
			const result = validatePaginationParams(params);
			expect(result.isValid).toBe(false);
			expect(result.errors[0].code).toBe('INVALID_VALUE');
		});
	});

	describe('calculatePaginationMeta', () => {
		it('should calculate pagination metadata', () => {
			const meta = calculatePaginationMeta(2, 10, 25);
			expect(meta).toEqual({
				totalPages: 3,
				hasNext: true,
				hasPrev: true,
				offset: 10,
			});
		});
	});

	describe('extractPaginationFromHeaders', () => {
		it('should extract rate limit info from headers', () => {
			const headers = {
				'x-ratelimit-limit': '100',
				'x-ratelimit-remaining': '95',
				'x-ratelimit-reset': '1640995200',
			};
			const info = extractPaginationFromHeaders(headers);
			expect(info).toEqual({
				limit: 100,
				remaining: 95,
				resetTime: 1640995200,
			});
		});
	});
});

describe('Retry and Rate Limiting Utilities', () => {
	describe('calculateBackoffDelay', () => {
		it('should calculate exponential backoff delay', () => {
			const config: RetryConfig = {
				maxRetries: 3,
				baseDelay: 1000,
				maxDelay: 10000,
				retryableStatusCodes: [500, 502, 503],
			};

			expect(calculateBackoffDelay(1, config)).toBe(1000);
			expect(calculateBackoffDelay(2, config)).toBe(2000);
			expect(calculateBackoffDelay(3, config)).toBe(4000);
		});

		it('should respect max delay', () => {
			const config: RetryConfig = {
				maxRetries: 10,
				baseDelay: 1000,
				maxDelay: 5000,
				retryableStatusCodes: [500],
			};

			expect(calculateBackoffDelay(10, config)).toBe(5000);
		});
	});

	describe('shouldRetry', () => {
		it('should determine if operation should be retried', () => {
			const config: RetryConfig = {
				maxRetries: 3,
				baseDelay: 1000,
				maxDelay: 10000,
				retryableStatusCodes: [500, 502, 503],
			};

			const retryableError = createKarakeepError('API_ERROR', 'Server error', 500);
			expect(shouldRetry(retryableError, 1, config)).toBe(true);
			expect(shouldRetry(retryableError, 3, config)).toBe(false);

			const nonRetryableError = createKarakeepError('AUTH_ERROR', 'Auth failed', 401);
			expect(shouldRetry(nonRetryableError, 1, config)).toBe(false);
		});
	});
});

describe('Bulk Operation Utilities', () => {
	describe('processBatch', () => {
		it('should process items in batches', async () => {
			const items = [1, 2, 3, 4, 5];
			const processor = jest.fn().mockImplementation(async (batch: number[]) => 
				batch.map(n => n * 2)
			);

			const result = await processBatch(items, 2, processor);

			expect(result.successful).toEqual([2, 4, 6, 8, 10]);
			expect(result.failed).toHaveLength(0);
			expect(result.totalProcessed).toBe(5);
			expect(processor).toHaveBeenCalledTimes(3);
		});

		it('should handle batch failures', async () => {
			const items = [1, 2, 3];
			const processor = jest.fn().mockRejectedValue(new Error('Batch failed'));

			const result = await processBatch(items, 2, processor);

			expect(result.successful).toHaveLength(0);
			expect(result.failed).toHaveLength(3);
			expect(result.totalProcessed).toBe(3);
		});
	});
});

describe('Cache Utilities', () => {
	describe('SimpleCache', () => {
		let cache: SimpleCache<string>;

		beforeEach(() => {
			cache = new SimpleCache<string>({ ttl: 1000, maxSize: 2 });
		});

		it('should store and retrieve values', () => {
			cache.set('key1', 'value1');
			expect(cache.get('key1')).toBe('value1');
		});

		it('should return null for non-existent keys', () => {
			expect(cache.get('nonexistent')).toBeNull();
		});

		it('should respect TTL', async () => {
			const shortTtlCache = new SimpleCache<string>({ ttl: 10, maxSize: 10 });
			shortTtlCache.set('key1', 'value1');
			
			// Wait for TTL to expire
			await new Promise(resolve => setTimeout(resolve, 20));
			
			expect(shortTtlCache.get('key1')).toBeNull();
		});

		it('should respect max size', () => {
			cache.set('key1', 'value1');
			cache.set('key2', 'value2');
			cache.set('key3', 'value3'); // Should evict key1

			expect(cache.get('key1')).toBeNull();
			expect(cache.get('key2')).toBe('value2');
			expect(cache.get('key3')).toBe('value3');
		});

		it('should delete keys', () => {
			cache.set('key1', 'value1');
			expect(cache.delete('key1')).toBe(true);
			expect(cache.get('key1')).toBeNull();
		});

		it('should clear all entries', () => {
			cache.set('key1', 'value1');
			cache.set('key2', 'value2');
			cache.clear();
			expect(cache.size()).toBe(0);
		});
	});
});

describe('String and Format Utilities', () => {
	describe('toKebabCase', () => {
		it('should convert to kebab-case', () => {
			expect(toKebabCase('camelCase')).toBe('camel-case');
			expect(toKebabCase('PascalCase')).toBe('pascal-case');
			expect(toKebabCase('snake_case')).toBe('snake-case');
			expect(toKebabCase('space separated')).toBe('space-separated');
		});
	});

	describe('toCamelCase', () => {
		it('should convert to camelCase', () => {
			expect(toCamelCase('kebab-case')).toBe('kebabCase');
			expect(toCamelCase('snake_case')).toBe('snakeCase');
			expect(toCamelCase('space separated')).toBe('spaceSeparated');
		});
	});

	describe('truncateString', () => {
		it('should truncate long strings', () => {
			expect(truncateString('This is a long string', 10)).toBe('This is...');
			expect(truncateString('Short', 10)).toBe('Short');
		});

		it('should use custom suffix', () => {
			expect(truncateString('This is a long string', 10, '---')).toBe('This is---');
		});
	});

	describe('formatFileSize', () => {
		it('should format file sizes', () => {
			expect(formatFileSize(1024)).toBe('1.0 KB');
			expect(formatFileSize(1048576)).toBe('1.0 MB');
			expect(formatFileSize(1073741824)).toBe('1.0 GB');
			expect(formatFileSize(500)).toBe('500.0 B');
		});
	});

	describe('parseTagsString', () => {
		it('should parse comma-separated tags', () => {
			expect(parseTagsString('tag1, tag2, tag3')).toEqual(['tag1', 'tag2', 'tag3']);
			expect(parseTagsString('single')).toEqual(['single']);
			expect(parseTagsString('')).toEqual([]);
			expect(parseTagsString('  tag1  ,  tag2  ')).toEqual(['tag1', 'tag2']);
		});

		it('should handle invalid input', () => {
			expect(parseTagsString(null as any)).toEqual([]);
			expect(parseTagsString(undefined as any)).toEqual([]);
		});
	});

	describe('formatDateForApi', () => {
		it('should format dates for API', () => {
			const date = new Date('2023-01-01T12:00:00.000Z');
			expect(formatDateForApi(date)).toBe('2023-01-01T12:00:00.000Z');
			expect(formatDateForApi('2023-01-01T12:00:00.000Z')).toBe('2023-01-01T12:00:00.000Z');
		});
	});
});