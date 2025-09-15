import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { KarakeepApiRequest } from '../../shared/KarakeepApiRequest';
import {
	User,
	UserStats,
	ResourceOperations,
} from '../../shared/types';

export class UsersResource {
	/**
	 * Execute users operations
	 */
	static async execute(
		this: IExecuteFunctions,
		operation: ResourceOperations['users'],
		itemIndex: number,
	): Promise<any> {
		switch (operation) {
			case 'getCurrentUser':
				return await UsersResource.getCurrentUser.call(this, itemIndex);
			case 'getUserStats':
				return await UsersResource.getUserStats.call(this, itemIndex);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" is not supported for users`,
					{ itemIndex }
				);
		}
	}

	/**
	 * Get current user profile information
	 */
	private static async getCurrentUser(this: IExecuteFunctions, itemIndex: number): Promise<User | any> {
		try {
			const response = await KarakeepApiRequest.apiRequest.call(this, {
				method: 'GET',
				endpoint: 'users/me',
			});

			return response.data || response;
		} catch (error) {
			// Handle permission-based access control
			if (error instanceof Error && error.message.includes('403')) {
				throw new NodeOperationError(
					this.getNode(),
					'Access denied: Insufficient permissions to access user profile information',
					{ itemIndex }
				);
			}
			
			if (error instanceof Error && error.message.includes('401')) {
				throw new NodeOperationError(
					this.getNode(),
					'Authentication failed: Please check your API credentials',
					{ itemIndex }
				);
			}

			throw error;
		}
	}

	/**
	 * Get current user statistics and analytics
	 */
	private static async getUserStats(this: IExecuteFunctions, itemIndex: number): Promise<UserStats | any> {
		try {
			const response = await KarakeepApiRequest.apiRequest.call(this, {
				method: 'GET',
				endpoint: 'users/me/stats',
			});

			return response.data || response;
		} catch (error) {
			// Handle permission-based access control
			if (error instanceof Error && error.message.includes('403')) {
				throw new NodeOperationError(
					this.getNode(),
					'Access denied: Insufficient permissions to access user statistics',
					{ itemIndex }
				);
			}
			
			if (error instanceof Error && error.message.includes('401')) {
				throw new NodeOperationError(
					this.getNode(),
					'Authentication failed: Please check your API credentials',
					{ itemIndex }
				);
			}

			throw error;
		}
	}
}