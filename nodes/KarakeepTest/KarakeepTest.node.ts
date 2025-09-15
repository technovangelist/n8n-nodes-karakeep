import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { KarakeepApiRequest } from '../shared/KarakeepApiRequest';
import { ApiRequestOptions } from '../shared/types';

export class KarakeepTest implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Karakeep Test',
		name: 'karakeepTest',
		icon: 'file:karakeep.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Test node for Karakeep API client functionality',
		defaults: {
			name: 'Karakeep Test',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'karakeepApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Test Connection',
						value: 'testConnection',
						description: 'Test API connectivity and authentication',
						action: 'Test connection',
					},
					{
						name: 'Get Current User',
						value: 'getCurrentUser',
						description: 'Get current user information',
						action: 'Get current user',
					},
					{
						name: 'Get User Stats',
						value: 'getUserStats',
						description: 'Get current user statistics',
						action: 'Get user stats',
					},
					{
						name: 'Test Error Handling',
						value: 'testError',
						description: 'Test error handling with invalid endpoint',
						action: 'Test error handling',
					},
					{
						name: 'Test Retry Logic',
						value: 'testRetry',
						description: 'Test retry logic with simulated failures',
						action: 'Test retry logic',
					},
				],
				default: 'testConnection',
			},
			{
				displayName: 'Custom Endpoint',
				name: 'customEndpoint',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['testError'],
					},
				},
				default: 'invalid/endpoint',
				description: 'Custom endpoint to test (for error testing)',
			},
			{
				displayName: 'Retry Configuration',
				name: 'retryConfig',
				type: 'collection',
				placeholder: 'Add Retry Setting',
				displayOptions: {
					show: {
						operation: ['testRetry'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						type: 'number',
						default: 3,
						description: 'Maximum number of retry attempts',
					},
					{
						displayName: 'Base Delay (Ms)',
						name: 'baseDelay',
						type: 'number',
						default: 1000,
						description: 'Base delay between retries in milliseconds',
					},
					{
						displayName: 'Max Delay (Ms)',
						name: 'maxDelay',
						type: 'number',
						default: 30000,
						description: 'Maximum delay between retries in milliseconds',
					},
				],
			},
			{
				displayName: 'Rate Limit Configuration',
				name: 'rateLimitConfig',
				type: 'collection',
				placeholder: 'Add Rate Limit Setting',
				default: {},
				options: [
					{
						displayName: 'Max Requests Per Second',
						name: 'maxRequestsPerSecond',
						type: 'number',
						default: 10,
						description: 'Maximum requests per second',
					},
					{
						displayName: 'Queue Timeout (Ms)',
						name: 'queueTimeout',
						type: 'number',
						default: 30000,
						description: 'Maximum time to wait in queue in milliseconds',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const operation = this.getNodeParameter('operation', 0) as string;
		const retryConfig = this.getNodeParameter('retryConfig', 0, {}) as any;
		const rateLimitConfig = this.getNodeParameter('rateLimitConfig', 0, {}) as any;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: any;

				switch (operation) {
					case 'testConnection':
						// Test connection
						const credentials = await this.getCredentials('karakeepApi');
						const isConnected = await KarakeepApiRequest.testConnection.call(this, credentials as any);
						responseData = {
							connectionTest: {
								connected: isConnected,
								instanceUrl: credentials.instanceUrl,
								hasApiKey: !!credentials.apiKey,
							},
						};
						break;

					case 'getCurrentUser':
						// Get current user
						const userOptions: ApiRequestOptions = {
							method: 'GET',
							endpoint: 'users/me',
						};
						const userResponse = await KarakeepApiRequest.apiRequest.call(
							this,
							userOptions,
							retryConfig,
							rateLimitConfig,
						);
						responseData = {
							user: userResponse.data,
							meta: userResponse.meta,
						};
						break;

					case 'getUserStats':
						// Get user stats
						const statsOptions: ApiRequestOptions = {
							method: 'GET',
							endpoint: 'users/me/stats',
						};
						const statsResponse = await KarakeepApiRequest.apiRequest.call(
							this,
							statsOptions,
							retryConfig,
							rateLimitConfig,
						);
						responseData = {
							stats: statsResponse.data,
							meta: statsResponse.meta,
						};
						break;

					case 'testError':
						// Test error handling
						const customEndpoint = this.getNodeParameter('customEndpoint', 0) as string;
						const errorOptions: ApiRequestOptions = {
							method: 'GET',
							endpoint: customEndpoint,
						};
						try {
							const errorResponse = await KarakeepApiRequest.apiRequest.call(
								this,
								errorOptions,
								retryConfig,
								rateLimitConfig,
							);
							responseData = {
								unexpectedSuccess: true,
								response: errorResponse.data,
							};
						} catch (error) {
							const err = error as any;
							responseData = {
								errorHandling: {
									errorCaught: true,
									errorType: err.constructor.name,
									errorMessage: err.message,
									httpCode: err.httpCode || null,
								},
							};
						}
						break;

					case 'testRetry':
						// Test retry logic
						const retryOptions: ApiRequestOptions = {
							method: 'GET',
							endpoint: 'users/me',
						};
						const startTime = Date.now();
						try {
							const retryResponse = await KarakeepApiRequest.apiRequest.call(
								this,
								retryOptions,
								retryConfig,
								rateLimitConfig,
							);
							const endTime = Date.now();
							responseData = {
								retryTest: {
									success: true,
									duration: endTime - startTime,
									retryConfig,
									response: retryResponse.data,
								},
							};
						} catch (error) {
							const endTime = Date.now();
							responseData = {
								retryTest: {
									success: false,
									duration: endTime - startTime,
									retryConfig,
									error: (error as Error).message,
								},
							};
						}
						break;

					default:
						throw new NodeOperationError(
							this.getNode(),
							`The operation "${operation}" is not supported!`,
						);
				}

				returnData.push({
					json: {
						operation,
						success: true,
						timestamp: new Date().toISOString(),
						queueStatus: KarakeepApiRequest.getQueueStatus(),
						...responseData,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							operation,
							success: false,
							error: (error as Error).message,
							timestamp: new Date().toISOString(),
							queueStatus: KarakeepApiRequest.getQueueStatus(),
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}


}