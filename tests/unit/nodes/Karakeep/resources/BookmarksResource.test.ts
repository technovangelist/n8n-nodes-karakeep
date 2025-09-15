import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { BookmarksResource } from '../../../../../nodes/Karakeep/resources/BookmarksResource';
import { KarakeepApiRequest } from '../../../../../nodes/shared/KarakeepApiRequest';
import { Bookmark } from '../../../../../nodes/shared/types';

// Mock the KarakeepApiRequest
jest.mock('../../../../../nodes/shared/KarakeepApiRequest', () => ({
	KarakeepApiRequest: {
		apiRequest: jest.fn(),
	},
}));

// Mock the IExecuteFunctions
const mockExecuteFunctions = {
	getNodeParameter: jest.fn(),
	getNode: jest.fn(() => ({ name: 'Karakeep' })),
} as unknown as IExecuteFunctions;

describe('BookmarksResource', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should route to correct operation method', async () => {
			const getByIdSpy = jest.spyOn(BookmarksResource as any, 'getById').mockResolvedValue({});
			
			await BookmarksResource.execute.call(mockExecuteFunctions, 'getById', 0);
			
			expect(getByIdSpy).toHaveBeenCalledWith(0);
		});

		it('should throw error for unsupported operation', async () => {
			await expect(
				BookmarksResource.execute.call(mockExecuteFunctions, 'unsupported' as any, 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('getAll', () => {
		it('should get all bookmarks without filters', async () => {
			const mockBookmarks = [
				{ id: '1', url: 'https://example.com', title: 'Example' },
				{ id: '2', url: 'https://test.com', title: 'Test' },
			];

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValue({});
			
			(KarakeepApiRequest.apiRequest as jest.Mock)
				.mockResolvedValue({ data: mockBookmarks });

			const result = await (BookmarksResource as any).getAll.call(mockExecuteFunctions, 0);

			expect(KarakeepApiRequest.apiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'bookmarks',
				params: {},
			});
			expect(result).toEqual(mockBookmarks);
		});

		it('should get all bookmarks with pagination and filters', async () => {
			const additionalFields = {
				page: 2,
				limit: 10,
				archived: 'false',
				tags: 'work, important',
				startDate: '2023-01-01T00:00:00.000Z',
				endDate: '2023-12-31T23:59:59.999Z',
			};

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValue(additionalFields);

			const mockBookmarks = [{ id: '1', url: 'https://example.com' }];
			(KarakeepApiRequest.apiRequest as jest.Mock)
				.mockResolvedValue({ data: mockBookmarks });

			const result = await (BookmarksResource as any).getAll.call(mockExecuteFunctions, 0);

			expect(KarakeepApiRequest.apiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'bookmarks',
				params: {
					page: 2,
					limit: 10,
					archived: 'false',
					tags: 'work,important',
					startDate: '2023-01-01T00:00:00.000Z',
					endDate: '2023-12-31T23:59:59.999Z',
				},
			});
			expect(result).toEqual(mockBookmarks);
		});
	});

	describe('getById', () => {
		it('should get bookmark by ID', async () => {
			const mockBookmark = { id: '123', url: 'https://example.com', title: 'Example' };
			
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					if (param === 'bookmarkId') return '123';
					return '';
				});
			
			(KarakeepApiRequest.apiRequest as jest.Mock)
				.mockResolvedValue({ data: mockBookmark });

			const result = await (BookmarksResource as any).getById.call(mockExecuteFunctions, 0);

			expect(KarakeepApiRequest.apiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'bookmarks/123',
			});
			expect(result).toEqual(mockBookmark);
		});

		it('should throw error when bookmark ID is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					if (param === 'bookmarkId') return '';
					return '';
				});

			await expect(
				(BookmarksResource as any).getById.call(mockExecuteFunctions, 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('create', () => {
		it('should create bookmark with required fields only', async () => {
			const mockBookmark = { id: '123', url: 'https://example.com' };
			
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'url': return 'https://example.com';
						case 'title': return '';
						case 'note': return '';
						case 'tags': return '';
						case 'archived': return false;
						default: return '';
					}
				});
			
			(KarakeepApiRequest.apiRequest as jest.Mock)
				.mockResolvedValue({ data: mockBookmark });

			const result = await (BookmarksResource as any).create.call(mockExecuteFunctions, 0);

			expect(KarakeepApiRequest.apiRequest).toHaveBeenCalledWith({
				method: 'POST',
				endpoint: 'bookmarks',
				body: {
					url: 'https://example.com',
				},
			});
			expect(result).toEqual(mockBookmark);
		});

		it('should create bookmark with all fields', async () => {
			const mockBookmark = { 
				id: '123', 
				url: 'https://example.com', 
				title: 'Example',
				note: 'Test note',
				archived: true,
				tags: ['work', 'important']
			};
			
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'url': return 'https://example.com';
						case 'title': return 'Example';
						case 'note': return 'Test note';
						case 'tags': return 'work, important';
						case 'archived': return true;
						default: return '';
					}
				});
			
			(KarakeepApiRequest.apiRequest as jest.Mock)
				.mockResolvedValue({ data: mockBookmark });

			const result = await (BookmarksResource as any).create.call(mockExecuteFunctions, 0);

			expect(KarakeepApiRequest.apiRequest).toHaveBeenCalledWith({
				method: 'POST',
				endpoint: 'bookmarks',
				body: {
					url: 'https://example.com',
					title: 'Example',
					note: 'Test note',
					archived: true,
					tags: ['work', 'important'],
				},
			});
			expect(result).toEqual(mockBookmark);
		});

		it('should throw error for invalid URL', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'url': return 'invalid-url';
						default: return '';
					}
				});

			await expect(
				(BookmarksResource as any).create.call(mockExecuteFunctions, 0)
			).rejects.toThrow(NodeOperationError);
		});

		it('should throw error when URL is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'url': return '';
						default: return '';
					}
				});

			await expect(
				(BookmarksResource as any).create.call(mockExecuteFunctions, 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('update', () => {
		it('should update bookmark with provided fields', async () => {
			const mockBookmark = { 
				id: '123', 
				url: 'https://example.com', 
				title: 'Updated Title',
				archived: true
			};
			
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'bookmarkId': return '123';
						case 'title': return 'Updated Title';
						case 'note': return '';
						case 'archived': return true;
						default: return '';
					}
				});
			
			(KarakeepApiRequest.apiRequest as jest.Mock)
				.mockResolvedValue({ data: mockBookmark });

			const result = await (BookmarksResource as any).update.call(mockExecuteFunctions, 0);

			expect(KarakeepApiRequest.apiRequest).toHaveBeenCalledWith({
				method: 'PATCH',
				endpoint: 'bookmarks/123',
				body: {
					title: 'Updated Title',
					archived: true,
				},
			});
			expect(result).toEqual(mockBookmark);
		});

		it('should throw error when bookmark ID is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValue('');

			await expect(
				(BookmarksResource as any).update.call(mockExecuteFunctions, 0)
			).rejects.toThrow(NodeOperationError);
		});

		it('should throw error when no fields to update', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'bookmarkId': return '123';
						case 'title': return '';
						case 'note': return '';
						case 'archived': return undefined;
						default: return '';
					}
				});

			await expect(
				(BookmarksResource as any).update.call(mockExecuteFunctions, 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('delete', () => {
		it('should delete bookmark by ID', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValue('123');
			
			(KarakeepApiRequest.apiRequest as jest.Mock)
				.mockResolvedValue({});

			const result = await (BookmarksResource as any).delete.call(mockExecuteFunctions, 0);

			expect(KarakeepApiRequest.apiRequest).toHaveBeenCalledWith({
				method: 'DELETE',
				endpoint: 'bookmarks/123',
			});
			expect(result).toEqual({ success: true, id: '123' });
		});

		it('should throw error when bookmark ID is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValue('');

			await expect(
				(BookmarksResource as any).delete.call(mockExecuteFunctions, 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('search', () => {
		it('should search bookmarks with query only', async () => {
			const mockBookmarks = [
				{ id: '1', url: 'https://example.com', title: 'Example' },
			];

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'query': return 'example';
						case 'searchOptions': return {};
						default: return '';
					}
				});
			
			(KarakeepApiRequest.apiRequest as jest.Mock)
				.mockResolvedValue({ data: mockBookmarks });

			const result = await (BookmarksResource as any).search.call(mockExecuteFunctions, 0);

			expect(KarakeepApiRequest.apiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'bookmarks/search',
				params: {
					query: 'example',
				},
			});
			expect(result).toEqual(mockBookmarks);
		});

		it('should search bookmarks with query and filters', async () => {
			const searchOptions = {
				page: 1,
				limit: 20,
				tags: 'work, important',
				archived: 'false',
				startDate: '2023-01-01T00:00:00.000Z',
				endDate: '2023-12-31T23:59:59.999Z',
			};

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'query': return 'example';
						case 'searchOptions': return searchOptions;
						default: return '';
					}
				});

			const mockBookmarks = [{ id: '1', url: 'https://example.com' }];
			(KarakeepApiRequest.apiRequest as jest.Mock)
				.mockResolvedValue({ data: mockBookmarks });

			const result = await (BookmarksResource as any).search.call(mockExecuteFunctions, 0);

			expect(KarakeepApiRequest.apiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'bookmarks/search',
				params: {
					query: 'example',
					page: 1,
					limit: 20,
					archived: false,
					tags: ['work', 'important'],
					startDate: '2023-01-01T00:00:00.000Z',
					endDate: '2023-12-31T23:59:59.999Z',
				},
			});
			expect(result).toEqual(mockBookmarks);
		});

		it('should throw error when query is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'query': return '';
						default: return {};
					}
				});

			await expect(
				(BookmarksResource as any).search.call(mockExecuteFunctions, 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('manageTags', () => {
		it('should add tags to bookmark', async () => {
			const mockBookmark = { 
				id: '123', 
				url: 'https://example.com',
				tags: [{ id: '1', name: 'work' }, { id: '2', name: 'important' }]
			};
			
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'bookmarkId': return '123';
						case 'tagAction': return 'add';
						case 'tagsToManage': return 'work, important';
						default: return '';
					}
				});
			
			(KarakeepApiRequest.apiRequest as jest.Mock)
				.mockResolvedValue({ data: mockBookmark });

			const result = await (BookmarksResource as any).manageTags.call(mockExecuteFunctions, 0);

			expect(KarakeepApiRequest.apiRequest).toHaveBeenCalledWith({
				method: 'POST',
				endpoint: 'bookmarks/123/tags',
				body: { tags: ['work', 'important'] },
			});
			expect(result).toEqual(mockBookmark);
		});

		it('should remove tags from bookmark', async () => {
			const mockBookmark = { 
				id: '123', 
				url: 'https://example.com',
				tags: []
			};
			
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'bookmarkId': return '123';
						case 'tagAction': return 'remove';
						case 'tagsToManage': return 'work';
						default: return '';
					}
				});
			
			(KarakeepApiRequest.apiRequest as jest.Mock)
				.mockResolvedValue({ data: mockBookmark });

			const result = await (BookmarksResource as any).manageTags.call(mockExecuteFunctions, 0);

			expect(KarakeepApiRequest.apiRequest).toHaveBeenCalledWith({
				method: 'DELETE',
				endpoint: 'bookmarks/123/tags',
				body: { tags: ['work'] },
			});
			expect(result).toEqual(mockBookmark);
		});

		it('should throw error when bookmark ID is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'bookmarkId': return '';
						case 'tagAction': return 'add';
						case 'tagsToManage': return 'work';
						default: return '';
					}
				});

			await expect(
				(BookmarksResource as any).manageTags.call(mockExecuteFunctions, 0)
			).rejects.toThrow(NodeOperationError);
		});

		it('should throw error when tags are missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'bookmarkId': return '123';
						case 'tagAction': return 'add';
						case 'tagsToManage': return '';
						default: return '';
					}
				});

			await expect(
				(BookmarksResource as any).manageTags.call(mockExecuteFunctions, 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('manageAssets', () => {
		it('should add asset to bookmark', async () => {
			const mockBookmark = { 
				id: '123', 
				url: 'https://example.com',
				assets: [{ id: 'asset-123', filename: 'image.jpg' }]
			};
			
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'bookmarkId': return '123';
						case 'assetAction': return 'add';
						case 'assetId': return 'asset-123';
						default: return '';
					}
				});
			
			(KarakeepApiRequest.apiRequest as jest.Mock)
				.mockResolvedValue({ data: mockBookmark });

			const result = await (BookmarksResource as any).manageAssets.call(mockExecuteFunctions, 0);

			expect(KarakeepApiRequest.apiRequest).toHaveBeenCalledWith({
				method: 'POST',
				endpoint: 'bookmarks/123/assets',
				body: { assetId: 'asset-123' },
			});
			expect(result).toEqual(mockBookmark);
		});

		it('should remove asset from bookmark', async () => {
			const mockBookmark = { 
				id: '123', 
				url: 'https://example.com',
				assets: []
			};
			
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'bookmarkId': return '123';
						case 'assetAction': return 'remove';
						case 'assetId': return 'asset-123';
						default: return '';
					}
				});
			
			(KarakeepApiRequest.apiRequest as jest.Mock)
				.mockResolvedValue({ data: mockBookmark });

			const result = await (BookmarksResource as any).manageAssets.call(mockExecuteFunctions, 0);

			expect(KarakeepApiRequest.apiRequest).toHaveBeenCalledWith({
				method: 'DELETE',
				endpoint: 'bookmarks/123/assets/asset-123',
				body: undefined,
			});
			expect(result).toEqual(mockBookmark);
		});

		it('should throw error when bookmark ID is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'bookmarkId': return '';
						case 'assetAction': return 'add';
						case 'assetId': return 'asset-123';
						default: return '';
					}
				});

			await expect(
				(BookmarksResource as any).manageAssets.call(mockExecuteFunctions, 0)
			).rejects.toThrow(NodeOperationError);
		});

		it('should throw error when asset ID is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockImplementation((param) => {
					switch (param) {
						case 'bookmarkId': return '123';
						case 'assetAction': return 'add';
						case 'assetId': return '';
						default: return '';
					}
				});

			await expect(
				(BookmarksResource as any).manageAssets.call(mockExecuteFunctions, 0)
			).rejects.toThrow(NodeOperationError);
		});
	});
});