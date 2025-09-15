import { KarakeepApiRequest } from '../../../nodes/shared/KarakeepApiRequest';
import { KarakeepCredentials, ApiRequestOptions } from '../../../nodes/shared/types';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

// Mock n8n workflow functions
const mockExecuteFunctions = {
	getNode: jest.fn(() => ({ name: 'Test Node' })),
	getCredentials: jest.fn(),
	helpers: {
		request: jest.fn(),
	},
	// Add minimal required properties for IExecuteFunctions
	getNodeParameter: jest.fn(),
	getCurrentNodeParameter: jest.fn(),
	getCurrentNodeParameters: jest.fn(),
	logger: {
		debug: jest.fn(),
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	},
	continueOnFail: jest.fn(() => false),
	getInputData: jest.fn(() => []),
	getWorkflowDataProxy: jest.fn(),
	getExecuteData: jest.fn(),
	getRestApiUrl: jest.fn(),
	getInstanceBaseUrl: jest.fn(),
	getInstanceId: jest.fn(),
	getTimezone: jest.fn(),
	getMode: jest.fn(),
	getActivationMode: jest.fn(),
	getNodeInputs: jest.fn(),
	getParentCallbackManager: jest.fn(),
	addInputData: jest.fn(),
	addOutputData: jest.fn(),
	getContext: jest.fn(),
	sendMessageToUI: jest.fn(),
	sendResponse: jest.fn(),
} as any;

// Mock credentials
const validCredentials: KarakeepCredentials = {
	instanceUrl: 'https://test.karakeep.app',
	apiKey: 'test-api-key-123',
};

const invalidCredentials: KarakeepCredentials = {
	instanceUrl: 'invalid-url',
	apiKey: '',
};

describe('KarakeepApiRequest', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		KarakeepApiRequest.clearQueue();
		mockExecuteFunctions.getCredentials.mockResolvedValue(validCredentials);
	});

	describe('Credential Validation', () => {
		it('should validate valid credentials', async () => {
			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			mockExecuteFunctions.helpers.request.mockResolvedValue({
				data: { id: '1', email: 'test@example.com' },
			});

			await expect(
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options)
			).resolves.toBeDefined();
		});

		it('should reject empty API key', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				...validCredentials,
				apiKey: '',
			});

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			await expect(
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options)
			).rejects.toThrow('API key is required');
		});

		it('should reject empty instance URL', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				...validCredentials,
				instanceUrl: '',
			});

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			await expect(
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options)
			).rejects.toThrow('Instance URL is required');
		});

		it('should reject invalid URL format', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				...validCredentials,
				instanceUrl: 'not-a-url',
			});

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			await expect(
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options)
			).rejects.toThrow('Instance URL must be a valid HTTP or HTTPS URL');
		});

		it('should reject non-HTTP protocols', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				...validCredentials,
				instanceUrl: 'ftp://test.karakeep.app',
			});

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			await expect(
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options)
			).rejects.toThrow('Instance URL must be a valid HTTP or HTTPS URL');
		});
	});

	describe('Authentication', () => {
		it('should add Bearer token to request headers', async () => {
			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			mockExecuteFunctions.helpers.request.mockResolvedValue({
				data: { id: '1' },
			});

			await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: expect.objectContaining({
						'Authorization': 'Bearer test-api-key-123',
					}),
				})
			);
		});

		it('should include standard headers', async () => {
			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			mockExecuteFunctions.helpers.request.mockResolvedValue({
				data: { id: '1' },
			});

			await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: expect.objectContaining({
						'Content-Type': 'application/json',
						'User-Agent': 'n8n-karakeep-plugin/1.0.0',
					}),
				})
			);
		});

		it('should allow custom headers', async () => {
			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
				headers: {
					'Custom-Header': 'custom-value',
				},
			};

			mockExecuteFunctions.helpers.request.mockResolvedValue({
				data: { id: '1' },
			});

			await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledWith(
				expect.objectContaining({
					headers: expect.objectContaining({
						'Custom-Header': 'custom-value',
					}),
				})
			);
		});
	});

	describe('URL Construction', () => {
		it('should construct correct API URL', async () => {
			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'bookmarks',
			};

			mockExecuteFunctions.helpers.request.mockResolvedValue({
				data: [],
			});

			await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledWith(
				expect.objectContaining({
					url: 'https://test.karakeep.app/api/v1/bookmarks',
				})
			);
		});

		it('should handle trailing slash in instance URL', async () => {
			mockExecuteFunctions.getCredentials.mockResolvedValue({
				...validCredentials,
				instanceUrl: 'https://test.karakeep.app/',
			});

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'bookmarks',
			};

			mockExecuteFunctions.helpers.request.mockResolvedValue({
				data: [],
			});

			await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledWith(
				expect.objectContaining({
					url: 'https://test.karakeep.app/api/v1/bookmarks',
				})
			);
		});

		it('should handle leading slash in endpoint', async () => {
			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: '/bookmarks',
			};

			mockExecuteFunctions.helpers.request.mockResolvedValue({
				data: [],
			});

			await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledWith(
				expect.objectContaining({
					url: 'https://test.karakeep.app/api/v1/bookmarks',
				})
			);
		});

		it('should add query parameters', async () => {
			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'bookmarks',
				params: {
					page: 1,
					limit: 10,
					archived: 'false',
				},
			};

			mockExecuteFunctions.helpers.request.mockResolvedValue({
				data: [],
			});

			await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledWith(
				expect.objectContaining({
					url: 'https://test.karakeep.app/api/v1/bookmarks?page=1&limit=10&archived=false',
				})
			);
		});

		it('should skip null and undefined parameters', async () => {
			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'bookmarks',
				params: {
					page: 1,
					limit: null as any,
					archived: undefined as any,
				},
			};

			mockExecuteFunctions.helpers.request.mockResolvedValue({
				data: [],
			});

			await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledWith(
				expect.objectContaining({
					url: 'https://test.karakeep.app/api/v1/bookmarks?page=1',
				})
			);
		});
	});

	describe('Request Body Handling', () => {
		it('should include body for POST requests', async () => {
			const requestBody = {
				url: 'https://example.com',
				title: 'Test Bookmark',
			};

			const options: ApiRequestOptions = {
				method: 'POST',
				endpoint: 'bookmarks',
				body: requestBody,
			};

			mockExecuteFunctions.helpers.request.mockResolvedValue({
				data: { id: '1', ...requestBody },
			});

			await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledWith(
				expect.objectContaining({
					body: requestBody,
				})
			);
		});

		it('should not include body for GET requests', async () => {
			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'bookmarks',
				body: { shouldNotBeIncluded: true },
			};

			mockExecuteFunctions.helpers.request.mockResolvedValue({
				data: [],
			});

			await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledWith(
				expect.not.objectContaining({
					body: expect.anything(),
				})
			);
		});
	});

	describe('Response Handling', () => {
		it('should return response in standard format', async () => {
			const responseData = { id: '1', email: 'test@example.com' };
			mockExecuteFunctions.helpers.request.mockResolvedValue({
				data: responseData,
			});

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			const result = await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(result).toEqual({
				data: responseData,
			});
		});

		it('should wrap non-standard response format', async () => {
			const responseData = { id: '1', email: 'test@example.com' };
			mockExecuteFunctions.helpers.request.mockResolvedValue(responseData);

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			const result = await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(result).toEqual({
				data: responseData,
			});
		});

		it('should handle string responses', async () => {
			const responseString = '{"id":"1","email":"test@example.com"}';
			mockExecuteFunctions.helpers.request.mockResolvedValue(responseString);

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			const result = await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(result).toEqual({
				data: { id: '1', email: 'test@example.com' },
			});
		});

		it('should handle non-JSON string responses', async () => {
			const responseString = 'plain text response';
			mockExecuteFunctions.helpers.request.mockResolvedValue(responseString);

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			const result = await KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options);

			expect(result).toEqual({
				data: responseString,
			});
		});
	});

	describe('Error Handling', () => {
		it('should handle HTTP 404 errors', async () => {
			const error = {
				response: {
					status: 404,
					data: {
						code: 'NOT_FOUND',
						message: 'Resource not found',
					},
				},
			};

			mockExecuteFunctions.helpers.request.mockRejectedValue(error);

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'bookmarks/nonexistent',
			};

			await expect(
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options)
			).rejects.toThrow(NodeApiError);
		});

		it('should handle HTTP 401 authentication errors', async () => {
			const error = {
				response: {
					status: 401,
					data: {
						code: 'UNAUTHORIZED',
						message: 'Invalid API key',
					},
				},
			};

			mockExecuteFunctions.helpers.request.mockRejectedValue(error);

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			await expect(
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options)
			).rejects.toThrow(NodeApiError);
		});

		it('should handle network connection errors', async () => {
			const error = {
				code: 'ECONNREFUSED',
				message: 'Connection refused',
			};

			mockExecuteFunctions.helpers.request.mockRejectedValue(error);

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			await expect(
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options, { maxRetries: 0 })
			).rejects.toThrow('Cannot connect to Karakeep instance');
		}, 10000);

		it('should handle DNS resolution errors', async () => {
			const error = {
				code: 'ENOTFOUND',
				message: 'DNS lookup failed',
			};

			mockExecuteFunctions.helpers.request.mockRejectedValue(error);

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			await expect(
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options, { maxRetries: 0 })
			).rejects.toThrow('Cannot connect to Karakeep instance');
		}, 10000);

		it('should handle timeout errors', async () => {
			const error = {
				code: 'ETIMEDOUT',
				message: 'Request timeout',
			};

			mockExecuteFunctions.helpers.request.mockRejectedValue(error);

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			await expect(
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options, { maxRetries: 0 })
			).rejects.toThrow('Request to Karakeep API timed out');
		}, 10000);
	});

	describe('Retry Logic', () => {
		it('should retry on retryable status codes', async () => {
			const error = {
				response: {
					status: 500,
					data: {
						code: 'INTERNAL_ERROR',
						message: 'Internal server error',
					},
				},
			};

			// Fail twice, then succeed
			mockExecuteFunctions.helpers.request
				.mockRejectedValueOnce(error)
				.mockRejectedValueOnce(error)
				.mockResolvedValue({ data: { success: true } });

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			const result = await KarakeepApiRequest.apiRequest.call(
				mockExecuteFunctions,
				options,
				{ maxRetries: 3, baseDelay: 10 } // Fast retry for testing
			);

			expect(result).toEqual({ data: { success: true } });
			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledTimes(3);
		});

		it('should not retry on non-retryable status codes', async () => {
			const error = {
				response: {
					status: 400,
					data: {
						code: 'BAD_REQUEST',
						message: 'Invalid request',
					},
				},
			};

			mockExecuteFunctions.helpers.request.mockRejectedValue(error);

			const options: ApiRequestOptions = {
				method: 'POST',
				endpoint: 'bookmarks',
				body: { invalid: 'data' },
			};

			await expect(
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options)
			).rejects.toThrow(NodeApiError);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledTimes(1);
		});

		it('should respect max retry limit', async () => {
			const error = {
				response: {
					status: 500,
					data: {
						code: 'INTERNAL_ERROR',
						message: 'Internal server error',
					},
				},
			};

			mockExecuteFunctions.helpers.request.mockRejectedValue(error);

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			await expect(
				KarakeepApiRequest.apiRequest.call(
					mockExecuteFunctions,
					options,
					{ maxRetries: 2, baseDelay: 10 }
				)
			).rejects.toThrow(NodeApiError);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledTimes(3); // Initial + 2 retries
		});
	});

	describe('Rate Limiting', () => {
		it('should process requests in queue', async () => {
			mockExecuteFunctions.helpers.request.mockResolvedValue({ data: { success: true } });

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			// Make multiple requests
			const promises = [
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options),
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options),
				KarakeepApiRequest.apiRequest.call(mockExecuteFunctions, options),
			];

			const results = await Promise.all(promises);

			expect(results).toHaveLength(3);
			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledTimes(3);
		});

		it('should handle queue timeout', async () => {
			// Clear any existing queue
			KarakeepApiRequest.clearQueue();
			
			// Mock a request that takes longer than the queue timeout
			mockExecuteFunctions.helpers.request.mockImplementation(
				() => new Promise(resolve => setTimeout(() => resolve({ data: {} }), 200))
			);

			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			// Create multiple requests to fill the queue
			const promises = [];
			for (let i = 0; i < 5; i++) {
				promises.push(
					KarakeepApiRequest.apiRequest.call(
						mockExecuteFunctions,
						options,
						{},
						{ queueTimeout: 50, maxRequestsPerSecond: 1 } // Very short timeout and slow processing
					)
				);
			}

			// At least some should timeout
			const results = await Promise.allSettled(promises);
			const timeouts = results.filter(r => r.status === 'rejected' && 
				r.reason.message.includes('Request timed out in queue'));
			
			expect(timeouts.length).toBeGreaterThan(0);
		}, 10000);
	});

	describe('Connection Testing', () => {
		it('should test connection successfully', async () => {
			mockExecuteFunctions.helpers.request.mockResolvedValue({
				data: { id: '1', email: 'test@example.com' },
			});

			const result = await KarakeepApiRequest.testConnection.call(
				mockExecuteFunctions,
				validCredentials
			);

			expect(result).toBe(true);
		});

		it('should fail connection test with invalid credentials', async () => {
			const result = await KarakeepApiRequest.testConnection.call(
				mockExecuteFunctions,
				invalidCredentials
			);

			expect(result).toBe(false);
		});

		it('should fail connection test with API error', async () => {
			mockExecuteFunctions.helpers.request.mockRejectedValue({
				response: { status: 401 },
			});

			const result = await KarakeepApiRequest.testConnection.call(
				mockExecuteFunctions,
				validCredentials
			);

			expect(result).toBe(false);
		});
	});

	describe('Queue Management', () => {
		it('should clear queue', () => {
			// Add some items to queue (simulate)
			const options: ApiRequestOptions = {
				method: 'GET',
				endpoint: 'users/me',
			};

			// Clear queue
			KarakeepApiRequest.clearQueue();

			const status = KarakeepApiRequest.getQueueStatus();
			expect(status.queueLength).toBe(0);
			expect(status.isProcessing).toBe(false);
		});

		it('should report queue status', () => {
			const status = KarakeepApiRequest.getQueueStatus();
			expect(status).toHaveProperty('queueLength');
			expect(status).toHaveProperty('isProcessing');
			expect(typeof status.queueLength).toBe('number');
			expect(typeof status.isProcessing).toBe('boolean');
		});
	});
});