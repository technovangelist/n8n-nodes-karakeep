import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IDataObject,
	NodeApiError,
	NodeOperationError,
	sleep,
} from 'n8n-workflow';

import {
	KarakeepCredentials,
	KarakeepResponse,
	KarakeepError,
	ApiRequestOptions,
} from './types';

/**
 * Configuration for retry logic
 */
interface RetryConfig {
	maxRetries: number;
	baseDelay: number;
	maxDelay: number;
	retryableStatusCodes: number[];
}

/**
 * Configuration for rate limiting
 */
interface RateLimitConfig {
	maxRequestsPerSecond: number;
	queueTimeout: number;
}

/**
 * Request queue item
 */
interface QueuedRequest {
	resolve: (value: any) => void;
	reject: (error: any) => void;
	options: ApiRequestOptions;
	credentials: KarakeepCredentials;
	timestamp: number;
}

/**
 * Karakeep API Request Handler
 * Provides centralized HTTP client with authentication, retry logic, and rate limiting
 */
export class KarakeepApiRequest {
	private static requestQueue: QueuedRequest[] = [];
	private static isProcessingQueue = false;
	private static lastRequestTime = 0;

	private static readonly DEFAULT_RETRY_CONFIG: RetryConfig = {
		maxRetries: 3,
		baseDelay: 1000, // 1 second
		maxDelay: 30000, // 30 seconds
		retryableStatusCodes: [408, 429, 500, 502, 503, 504],
	};

	private static readonly DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
		maxRequestsPerSecond: 10,
		queueTimeout: 30000, // 30 seconds
	};

	/**
	 * Make an authenticated API request to Karakeep
	 */
	static async apiRequest<T = any>(
		this: IExecuteFunctions | ILoadOptionsFunctions,
		options: ApiRequestOptions,
		retryConfig: Partial<RetryConfig> = {},
		rateLimitConfig: Partial<RateLimitConfig> = {},
	): Promise<KarakeepResponse<T>> {
		const credentials = await this.getCredentials('karakeepApi') as KarakeepCredentials;

		if (!credentials) {
			throw new NodeOperationError(this.getNode(), 'No credentials found for Karakeep API');
		}

		// Validate credentials
		KarakeepApiRequest.validateCredentials(credentials);

		const finalRetryConfig = { ...KarakeepApiRequest.DEFAULT_RETRY_CONFIG, ...retryConfig };
		const finalRateLimitConfig = { ...KarakeepApiRequest.DEFAULT_RATE_LIMIT_CONFIG, ...rateLimitConfig };

		// Add request to queue for rate limiting
		return new Promise((resolve, reject) => {
			const queueItem: QueuedRequest = {
				resolve,
				reject,
				options,
				credentials,
				timestamp: Date.now(),
			};

			KarakeepApiRequest.requestQueue.push(queueItem);
			KarakeepApiRequest.processQueue.call(this, finalRetryConfig, finalRateLimitConfig);
		});
	}

	/**
	 * Process the request queue with rate limiting
	 */
	private static async processQueue(
		this: IExecuteFunctions | ILoadOptionsFunctions,
		retryConfig: RetryConfig,
		rateLimitConfig: RateLimitConfig,
	): Promise<void> {
		if (KarakeepApiRequest.isProcessingQueue) {
			return;
		}

		KarakeepApiRequest.isProcessingQueue = true;

		try {
			while (KarakeepApiRequest.requestQueue.length > 0) {
				const queueItem = KarakeepApiRequest.requestQueue.shift()!;

				// Check if request has timed out
				if (Date.now() - queueItem.timestamp > rateLimitConfig.queueTimeout) {
					queueItem.reject(new NodeOperationError(this.getNode(), 'Request timed out in queue'));
					continue;
				}

				// Implement rate limiting
				const timeSinceLastRequest = Date.now() - KarakeepApiRequest.lastRequestTime;
				const minInterval = 1000 / rateLimitConfig.maxRequestsPerSecond;

				if (timeSinceLastRequest < minInterval) {
					await sleep(minInterval - timeSinceLastRequest);
				}

				try {
					const result = await KarakeepApiRequest.executeRequest.call(
						this,
						queueItem.options,
						queueItem.credentials,
						retryConfig,
					);
					KarakeepApiRequest.lastRequestTime = Date.now();
					queueItem.resolve(result);
				} catch (error) {
					queueItem.reject(error);
				}
			}
		} finally {
			KarakeepApiRequest.isProcessingQueue = false;
		}
	}

	/**
	 * Execute a single API request with retry logic
	 */
	private static async executeRequest<T = any>(
		this: IExecuteFunctions | ILoadOptionsFunctions,
		options: ApiRequestOptions,
		credentials: KarakeepCredentials,
		retryConfig: RetryConfig,
	): Promise<KarakeepResponse<T>> {
		let lastError: Error;

		for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
			try {
				return await KarakeepApiRequest.makeHttpRequest.call(this, options, credentials) as KarakeepResponse<T>;
			} catch (error) {
				lastError = error as Error;

				// Don't retry on non-retryable errors
				if (error instanceof NodeApiError) {
					const statusCode = error.httpCode;
					if (statusCode && !retryConfig.retryableStatusCodes.includes(Number(statusCode))) {
						throw error;
					}
				}

				// Don't retry on the last attempt
				if (attempt === retryConfig.maxRetries) {
					break;
				}

				// Calculate delay with exponential backoff
				const delay = Math.min(
					retryConfig.baseDelay * Math.pow(2, attempt),
					retryConfig.maxDelay,
				);

				// Add jitter to prevent thundering herd
				const jitter = Math.random() * 0.1 * delay;
				await sleep(delay + jitter);
			}
		}

		throw lastError!;
	}

	/**
	 * Make the actual HTTP request
	 */
	private static async makeHttpRequest<T = any>(
		this: IExecuteFunctions | ILoadOptionsFunctions,
		options: ApiRequestOptions,
		credentials: KarakeepCredentials,
	): Promise<KarakeepResponse<T>> {
		const { method, endpoint, body, headers = {}, params } = options;

		// Build URL
		const baseUrl = credentials.instanceUrl.replace(/\/$/, '');
		let url = `${baseUrl}/api/v1/${endpoint.replace(/^\//, '')}`;

		// Add query parameters
		if (params && Object.keys(params).length > 0) {
			const searchParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					searchParams.append(key, String(value));
				}
			});
			url += `?${searchParams.toString()}`;
		}





		// Prepare headers
		const requestHeaders = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${credentials.apiKey}`,
			'User-Agent': 'n8n-karakeep-plugin/1.0.0',
			...headers,
		};

		// Prepare request options
		const requestOptions: IDataObject = {
			method,
			url,
			headers: requestHeaders,
			json: true,
			timeout: 30000, // 30 seconds
		};

		// Add body for non-GET requests
		if (body && method !== 'GET') {
			requestOptions.body = body;
		}

		try {
			const response = await this.helpers.request(requestOptions);

			// Handle different response formats
			if (typeof response === 'string') {
				try {
					const parsed = JSON.parse(response);
					// Check if parsed response is already in our expected format
					if (parsed && typeof parsed === 'object' && 'data' in parsed) {
						return parsed as KarakeepResponse<T>;
					}
					// Otherwise, wrap it
					return { data: parsed as T };
				} catch {
					// If it's not JSON, wrap it in our standard format
					return { data: response as T };
				}
			}

			// If response is already an object, return as is or wrap if needed
			if (response && typeof response === 'object') {
				// Check if it's already in our expected format
				if ('data' in response) {
					return response as KarakeepResponse<T>;
				}
				// Otherwise, wrap it
				return { data: response as T };
			}

			// Fallback for other types
			return { data: response as T };

		} catch (error: any) {
			// Handle HTTP errors
			if (error.response) {
				const statusCode = error.response.status || error.statusCode;
				const responseBody = error.response.data || error.response.body;

				// Try to parse error response
				let errorMessage = 'Unknown API error';
				let errorCode = 'UNKNOWN_ERROR';
				let errorDetails: Record<string, any> = {};

				if (responseBody) {
					if (typeof responseBody === 'string') {
						try {
							const parsed = JSON.parse(responseBody);
							errorMessage = parsed.message || parsed.error || errorMessage;
							errorCode = parsed.code || errorCode;
							errorDetails = parsed.details || parsed;
						} catch {
							errorMessage = responseBody;
							errorDetails = { rawResponse: responseBody };
						}
					} else if (typeof responseBody === 'object') {
						errorMessage = responseBody.message || responseBody.error || errorMessage;
						errorCode = responseBody.code || errorCode;
						errorDetails = responseBody.details || responseBody;
					}
				}

				const karakeepError: KarakeepError = {
					code: errorCode,
					message: errorMessage,
					details: errorDetails,
					statusCode,
				};

				throw new NodeApiError(this.getNode(), karakeepError as any, {
					message: `Karakeep API Error (${statusCode}): ${errorMessage}`,
					httpCode: statusCode,
				});
			}

			// Handle network errors
			if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
				throw new NodeOperationError(
					this.getNode(),
					`Cannot connect to Karakeep instance at ${credentials.instanceUrl}. Please check the instance URL.`,
				);
			}

			if (error.code === 'ETIMEDOUT') {
				throw new NodeOperationError(
					this.getNode(),
					'Request to Karakeep API timed out. Please try again.',
				);
			}

			// Re-throw other errors
			throw error;
		}
	}

	/**
	 * Validate credentials format
	 */
	private static validateCredentials(credentials: KarakeepCredentials): void {
		if (!credentials.apiKey || credentials.apiKey.trim() === '') {
			throw new NodeOperationError(
				{} as any,
				'API key is required for Karakeep authentication',
			);
		}

		if (!credentials.instanceUrl || credentials.instanceUrl.trim() === '') {
			throw new NodeOperationError(
				{} as any,
				'Instance URL is required for Karakeep authentication',
			);
		}

		// Validate URL format
		try {
			const url = new URL(credentials.instanceUrl);
			if (!['http:', 'https:'].includes(url.protocol)) {
				throw new Error('Invalid protocol');
			}
		} catch {
			throw new NodeOperationError(
				{} as any,
				'Instance URL must be a valid HTTP or HTTPS URL',
			);
		}
	}

	/**
	 * Test API connectivity
	 */
	static async testConnection(
		this: IExecuteFunctions | ILoadOptionsFunctions,
		credentials: KarakeepCredentials,
	): Promise<boolean> {
		try {
			KarakeepApiRequest.validateCredentials(credentials);

			// Make a simple request to test connectivity
			await KarakeepApiRequest.makeHttpRequest.call(this, {
				method: 'GET',
				endpoint: 'users/me',
			}, credentials) as KarakeepResponse<any>;

			return true;
		} catch (error) {
			return false;
		}
	}

	/**
	 * Clear the request queue (useful for testing)
	 */
	static clearQueue(): void {
		KarakeepApiRequest.requestQueue = [];
		KarakeepApiRequest.isProcessingQueue = false;
	}

	/**
	 * Get queue status (useful for monitoring)
	 */
	static getQueueStatus(): { queueLength: number; isProcessing: boolean } {
		return {
			queueLength: KarakeepApiRequest.requestQueue.length,
			isProcessing: KarakeepApiRequest.isProcessingQueue,
		};
	}
}