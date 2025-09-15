import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { UsersResource } from '../../../../../nodes/Karakeep/resources/UsersResource';
import { KarakeepApiRequest } from '../../../../../nodes/shared/KarakeepApiRequest';
import { User, UserStats } from '../../../../../nodes/shared/types';

// Mock the KarakeepApiRequest
jest.mock('../../../../../nodes/shared/KarakeepApiRequest');

describe('UsersResource', () => {
	let mockExecuteFunctions: jest.Mocked<IExecuteFunctions>;
	const mockApiRequest = KarakeepApiRequest.apiRequest as jest.MockedFunction<typeof KarakeepApiRequest.apiRequest>;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getNode: jest.fn().mockReturnValue({ name: 'Karakeep' }),
		} as any;

		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should route to getCurrentUser operation', async () => {
			const mockUser: User = {
				id: 'user-123',
				email: 'test@example.com',
				name: 'Test User',
				role: 'user',
				createdAt: '2023-01-01T00:00:00Z',
			};

			mockApiRequest.mockResolvedValue({ data: mockUser });

			const result = await UsersResource.execute.call(mockExecuteFunctions, 'getCurrentUser', 0);

			expect(result).toEqual(mockUser);
			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'users/me',
			});
		});

		it('should route to getUserStats operation', async () => {
			const mockStats: UserStats = {
				totalBookmarks: 150,
				totalLists: 12,
				totalTags: 45,
				totalHighlights: 23,
				totalAssets: 67,
			};

			mockApiRequest.mockResolvedValue({ data: mockStats });

			const result = await UsersResource.execute.call(mockExecuteFunctions, 'getUserStats', 0);

			expect(result).toEqual(mockStats);
			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'users/me/stats',
			});
		});

		it('should throw error for unsupported operation', async () => {
			await expect(
				UsersResource.execute.call(mockExecuteFunctions, 'unsupported' as any, 0)
			).rejects.toThrow(NodeOperationError);

			expect(mockExecuteFunctions.getNode).toHaveBeenCalled();
		});
	});

	describe('getCurrentUser', () => {
		it('should successfully get current user profile', async () => {
			const mockUser: User = {
				id: 'user-456',
				email: 'admin@example.com',
				name: 'Admin User',
				role: 'admin',
				createdAt: '2022-12-01T00:00:00Z',
			};

			mockApiRequest.mockResolvedValue({ data: mockUser });

			const result = await UsersResource.execute.call(mockExecuteFunctions, 'getCurrentUser', 0);

			expect(result).toEqual(mockUser);
			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'users/me',
			});
		});

		it('should handle response without data wrapper', async () => {
			const mockUser: User = {
				id: 'user-789',
				email: 'user@example.com',
				name: 'Regular User',
				role: 'user',
				createdAt: '2023-06-15T00:00:00Z',
			};

			mockApiRequest.mockResolvedValue(mockUser as any);

			const result = await UsersResource.execute.call(mockExecuteFunctions, 'getCurrentUser', 0);

			expect(result).toEqual(mockUser);
		});

		it('should handle 403 permission error', async () => {
			const error = new Error('403 Forbidden');
			mockApiRequest.mockRejectedValue(error);

			await expect(
				UsersResource.execute.call(mockExecuteFunctions, 'getCurrentUser', 0)
			).rejects.toThrow(NodeOperationError);

			const thrownError = await UsersResource.execute.call(mockExecuteFunctions, 'getCurrentUser', 0)
				.catch(err => err);

			expect(thrownError).toBeInstanceOf(NodeOperationError);
			expect(thrownError.message).toContain('Access denied: Insufficient permissions');
		});

		it('should handle 401 authentication error', async () => {
			const error = new Error('401 Unauthorized');
			mockApiRequest.mockRejectedValue(error);

			await expect(
				UsersResource.execute.call(mockExecuteFunctions, 'getCurrentUser', 0)
			).rejects.toThrow(NodeOperationError);

			const thrownError = await UsersResource.execute.call(mockExecuteFunctions, 'getCurrentUser', 0)
				.catch(err => err);

			expect(thrownError).toBeInstanceOf(NodeOperationError);
			expect(thrownError.message).toContain('Authentication failed');
		});

		it('should re-throw other errors', async () => {
			const error = new Error('Network error');
			mockApiRequest.mockRejectedValue(error);

			await expect(
				UsersResource.execute.call(mockExecuteFunctions, 'getCurrentUser', 0)
			).rejects.toThrow('Network error');
		});
	});

	describe('getUserStats', () => {
		it('should successfully get user statistics', async () => {
			const mockStats: UserStats = {
				totalBookmarks: 250,
				totalLists: 18,
				totalTags: 67,
				totalHighlights: 89,
				totalAssets: 134,
			};

			mockApiRequest.mockResolvedValue({ data: mockStats });

			const result = await UsersResource.execute.call(mockExecuteFunctions, 'getUserStats', 0);

			expect(result).toEqual(mockStats);
			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'users/me/stats',
			});
		});

		it('should handle response without data wrapper', async () => {
			const mockStats: UserStats = {
				totalBookmarks: 42,
				totalLists: 3,
				totalTags: 15,
				totalHighlights: 7,
				totalAssets: 21,
			};

			mockApiRequest.mockResolvedValue(mockStats as any);

			const result = await UsersResource.execute.call(mockExecuteFunctions, 'getUserStats', 0);

			expect(result).toEqual(mockStats);
		});

		it('should handle zero statistics', async () => {
			const mockStats: UserStats = {
				totalBookmarks: 0,
				totalLists: 0,
				totalTags: 0,
				totalHighlights: 0,
				totalAssets: 0,
			};

			mockApiRequest.mockResolvedValue({ data: mockStats });

			const result = await UsersResource.execute.call(mockExecuteFunctions, 'getUserStats', 0);

			expect(result).toEqual(mockStats);
		});

		it('should handle 403 permission error', async () => {
			const error = new Error('403 Forbidden');
			mockApiRequest.mockRejectedValue(error);

			await expect(
				UsersResource.execute.call(mockExecuteFunctions, 'getUserStats', 0)
			).rejects.toThrow(NodeOperationError);

			const thrownError = await UsersResource.execute.call(mockExecuteFunctions, 'getUserStats', 0)
				.catch(err => err);

			expect(thrownError).toBeInstanceOf(NodeOperationError);
			expect(thrownError.message).toContain('Access denied: Insufficient permissions to access user statistics');
		});

		it('should handle 401 authentication error', async () => {
			const error = new Error('401 Unauthorized');
			mockApiRequest.mockRejectedValue(error);

			await expect(
				UsersResource.execute.call(mockExecuteFunctions, 'getUserStats', 0)
			).rejects.toThrow(NodeOperationError);

			const thrownError = await UsersResource.execute.call(mockExecuteFunctions, 'getUserStats', 0)
				.catch(err => err);

			expect(thrownError).toBeInstanceOf(NodeOperationError);
			expect(thrownError.message).toContain('Authentication failed');
		});

		it('should re-throw other errors', async () => {
			const error = new Error('Server error');
			mockApiRequest.mockRejectedValue(error);

			await expect(
				UsersResource.execute.call(mockExecuteFunctions, 'getUserStats', 0)
			).rejects.toThrow('Server error');
		});
	});

	describe('permission-based access control', () => {
		it('should handle different user roles in getCurrentUser', async () => {
			const adminUser: User = {
				id: 'admin-123',
				email: 'admin@company.com',
				name: 'Admin User',
				role: 'admin',
				createdAt: '2022-01-01T00:00:00Z',
			};

			mockApiRequest.mockResolvedValue({ data: adminUser });

			const result = await UsersResource.execute.call(mockExecuteFunctions, 'getCurrentUser', 0);

			expect(result.role).toBe('admin');
			expect(result).toEqual(adminUser);
		});

		it('should handle user without name field', async () => {
			const userWithoutName: User = {
				id: 'user-no-name',
				email: 'noname@example.com',
				role: 'user',
				createdAt: '2023-03-15T00:00:00Z',
			};

			mockApiRequest.mockResolvedValue({ data: userWithoutName });

			const result = await UsersResource.execute.call(mockExecuteFunctions, 'getCurrentUser', 0);

			expect(result.name).toBeUndefined();
			expect(result.email).toBe('noname@example.com');
		});
	});

	describe('analytics functionality', () => {
		it('should handle comprehensive user statistics', async () => {
			const comprehensiveStats: UserStats = {
				totalBookmarks: 1250,
				totalLists: 45,
				totalTags: 189,
				totalHighlights: 567,
				totalAssets: 234,
			};

			mockApiRequest.mockResolvedValue({ data: comprehensiveStats });

			const result = await UsersResource.execute.call(mockExecuteFunctions, 'getUserStats', 0);

			expect(result.totalBookmarks).toBeGreaterThan(1000);
			expect(result.totalLists).toBeGreaterThan(40);
			expect(result.totalTags).toBeGreaterThan(180);
			expect(result.totalHighlights).toBeGreaterThan(500);
			expect(result.totalAssets).toBeGreaterThan(200);
		});

		it('should validate statistics data types', async () => {
			const mockStats: UserStats = {
				totalBookmarks: 100,
				totalLists: 5,
				totalTags: 25,
				totalHighlights: 15,
				totalAssets: 30,
			};

			mockApiRequest.mockResolvedValue({ data: mockStats });

			const result = await UsersResource.execute.call(mockExecuteFunctions, 'getUserStats', 0);

			expect(typeof result.totalBookmarks).toBe('number');
			expect(typeof result.totalLists).toBe('number');
			expect(typeof result.totalTags).toBe('number');
			expect(typeof result.totalHighlights).toBe('number');
			expect(typeof result.totalAssets).toBe('number');
		});
	});
});