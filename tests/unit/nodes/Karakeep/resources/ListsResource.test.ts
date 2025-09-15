import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { ListsResource } from '../../../../../nodes/Karakeep/resources/ListsResource';
import { KarakeepApiRequest } from '../../../../../nodes/shared/KarakeepApiRequest';

// Mock the KarakeepApiRequest
jest.mock('../../../../../nodes/shared/KarakeepApiRequest');
const mockApiRequest = KarakeepApiRequest.apiRequest as jest.MockedFunction<typeof KarakeepApiRequest.apiRequest>;

// Mock IExecuteFunctions
const mockExecuteFunctions = {
	getNodeParameter: jest.fn(),
	getNode: jest.fn(() => ({ name: 'Karakeep' })),
	continueOnFail: jest.fn(() => false),
} as unknown as IExecuteFunctions;

describe('ListsResource', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should route to correct operation methods', async () => {
			const operations = ['getAll', 'getById', 'create', 'update', 'delete', 'addBookmarks', 'removeBookmarks'];
			
			for (const operation of operations) {
				jest.clearAllMocks();
				mockApiRequest.mockResolvedValueOnce({ data: { success: true } });
				
				// Set up minimal required parameters for each operation
				if (operation === 'getAll') {
					(mockExecuteFunctions.getNodeParameter as jest.Mock)
						.mockReturnValue({}); // additionalFields
				} else if (operation === 'getById' || operation === 'delete') {
					(mockExecuteFunctions.getNodeParameter as jest.Mock)
						.mockReturnValue('list-123'); // listId
				} else if (operation === 'create') {
					(mockExecuteFunctions.getNodeParameter as jest.Mock)
						.mockReturnValueOnce('Test List') // name
						.mockReturnValueOnce('📚') // icon
						.mockReturnValueOnce('') // description
						.mockReturnValueOnce('manual') // type
						.mockReturnValueOnce('') // query
						.mockReturnValueOnce(''); // parentId
				} else if (operation === 'update') {
					(mockExecuteFunctions.getNodeParameter as jest.Mock)
						.mockReturnValueOnce('list-123') // listId
						.mockReturnValueOnce('Updated List') // name
						.mockReturnValueOnce('🔖') // icon
						.mockReturnValueOnce('') // description
						.mockReturnValueOnce('') // type
						.mockReturnValueOnce('') // query
						.mockReturnValueOnce(''); // parentId
				} else if (operation === 'addBookmarks' || operation === 'removeBookmarks') {
					(mockExecuteFunctions.getNodeParameter as jest.Mock)
						.mockReturnValueOnce('list-123') // listId
						.mockReturnValueOnce('single') // bookmarkInputMethod
						.mockReturnValueOnce('bookmark-123'); // bookmarkId
				}

				await expect(
					ListsResource.execute.call(mockExecuteFunctions, operation as any, 0)
				).resolves.toBeDefined();
			}
		});

		it('should throw error for unsupported operation', async () => {
			await expect(
				ListsResource.execute.call(mockExecuteFunctions, 'unsupported' as any, 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('getAll', () => {
		it('should get all lists without filters', async () => {
			const mockResponse = {
				data: [
					{ id: 'list-1', name: 'List 1', isPublic: true },
					{ id: 'list-2', name: 'List 2', isPublic: false },
				],
			};

			mockApiRequest.mockResolvedValueOnce(mockResponse);
			(mockExecuteFunctions.getNodeParameter as jest.Mock).mockReturnValue({});

			const result = await ListsResource.execute.call(mockExecuteFunctions, 'getAll', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'lists',
				params: {},
			});
			expect(result).toEqual(mockResponse.data);
		});

		it('should get all lists with pagination and filters', async () => {
			const mockResponse = { 
				data: [
					{ id: 'list-1', name: 'List 1', isPublic: true },
					{ id: 'list-2', name: 'List 2', isPublic: false },
				] 
			};
			const additionalFields = {
				page: 2,
				limit: 10,
				isPublic: true,
			};

			mockApiRequest.mockResolvedValueOnce(mockResponse);
			(mockExecuteFunctions.getNodeParameter as jest.Mock).mockReturnValue(additionalFields);

			const result = await ListsResource.execute.call(mockExecuteFunctions, 'getAll', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'lists',
				params: {
					page: 2,
					limit: 10,
					public: true,
				},
			});
			expect(result).toEqual(mockResponse.data);
		});
	});

	describe('getById', () => {
		it('should get a specific list by ID', async () => {
			const mockResponse = { data: { id: 'list-123', name: 'Test List' } };

			mockApiRequest.mockResolvedValueOnce(mockResponse);
			(mockExecuteFunctions.getNodeParameter as jest.Mock).mockReturnValue('list-123');

			const result = await ListsResource.execute.call(mockExecuteFunctions, 'getById', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'lists/list-123',
			});
			expect(result).toEqual(mockResponse.data);
		});

		it('should throw error when list ID is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock).mockReturnValue('');

			await expect(
				ListsResource.execute.call(mockExecuteFunctions, 'getById', 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('create', () => {
		it('should create a new list with required fields only', async () => {
			const mockResponse = { data: { id: 'list-123', name: 'Test List', icon: '📚' } };

			mockApiRequest.mockResolvedValueOnce(mockResponse);
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('Test List') // name
				.mockReturnValueOnce('📚') // icon
				.mockReturnValueOnce('') // description
				.mockReturnValueOnce('manual') // type
				.mockReturnValueOnce('') // query
				.mockReturnValueOnce(''); // parentId

			const result = await ListsResource.execute.call(mockExecuteFunctions, 'create', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'POST',
				endpoint: 'lists',
				body: {
					name: 'Test List',
					icon: '📚',
				},
			});
			expect(result).toEqual(mockResponse.data);
		});

		it('should create a new list with all fields', async () => {
			const mockResponse = { data: { id: 'list-123', name: 'Test List', icon: '📚' } };

			mockApiRequest.mockResolvedValueOnce(mockResponse);
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('Test List') // name
				.mockReturnValueOnce('📚') // icon
				.mockReturnValueOnce('A test list description') // description
				.mockReturnValueOnce('smart') // type
				.mockReturnValueOnce('tag:javascript') // query
				.mockReturnValueOnce('parent-123'); // parentId

			const result = await ListsResource.execute.call(mockExecuteFunctions, 'create', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'POST',
				endpoint: 'lists',
				body: {
					name: 'Test List',
					icon: '📚',
					description: 'A test list description',
					type: 'smart',
					query: 'tag:javascript',
					parentId: 'parent-123',
				},
			});
			expect(result).toEqual(mockResponse.data);
		});

		it('should throw error when name is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('') // name
				.mockReturnValueOnce('📚') // icon
				.mockReturnValue('');

			await expect(
				ListsResource.execute.call(mockExecuteFunctions, 'create', 0)
			).rejects.toThrow(NodeOperationError);
		});

		it('should throw error when icon is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('Test List') // name
				.mockReturnValueOnce('') // icon
				.mockReturnValue('');

			await expect(
				ListsResource.execute.call(mockExecuteFunctions, 'create', 0)
			).rejects.toThrow(NodeOperationError);
		});

		it('should throw error when smart list has no query', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('Test List') // name
				.mockReturnValueOnce('📚') // icon
				.mockReturnValueOnce('') // description
				.mockReturnValueOnce('smart') // type
				.mockReturnValueOnce('') // query
				.mockReturnValueOnce(''); // parentId

			await expect(
				ListsResource.execute.call(mockExecuteFunctions, 'create', 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('update', () => {
		it('should update a list with provided fields', async () => {
			const mockResponse = { data: { id: 'list-123', name: 'Updated List' } };

			mockApiRequest.mockResolvedValueOnce(mockResponse);
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('list-123') // listId
				.mockReturnValueOnce('Updated List') // name
				.mockReturnValueOnce('🔖') // icon
				.mockReturnValueOnce('Updated description') // description
				.mockReturnValueOnce('manual') // type
				.mockReturnValueOnce('') // query
				.mockReturnValueOnce(''); // parentId

			const result = await ListsResource.execute.call(mockExecuteFunctions, 'update', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'PATCH',
				endpoint: 'lists/list-123',
				body: {
					name: 'Updated List',
					icon: '🔖',
					description: 'Updated description',
					type: 'manual',
				},
			});
			expect(result).toEqual(mockResponse.data);
		});

		it('should throw error when list ID is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('') // listId
				.mockReturnValue('');

			await expect(
				ListsResource.execute.call(mockExecuteFunctions, 'update', 0)
			).rejects.toThrow(NodeOperationError);
		});

		it('should throw error when no fields are provided for update', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('list-123') // listId
				.mockReturnValueOnce('') // name
				.mockReturnValueOnce('') // icon
				.mockReturnValueOnce('') // description
				.mockReturnValueOnce('') // type
				.mockReturnValueOnce('') // query
				.mockReturnValueOnce(''); // parentId

			await expect(
				ListsResource.execute.call(mockExecuteFunctions, 'update', 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('delete', () => {
		it('should delete a list', async () => {
			mockApiRequest.mockResolvedValueOnce({ data: null });
			(mockExecuteFunctions.getNodeParameter as jest.Mock).mockReturnValue('list-123');

			const result = await ListsResource.execute.call(mockExecuteFunctions, 'delete', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'DELETE',
				endpoint: 'lists/list-123',
			});
			expect(result).toEqual({ success: true, id: 'list-123' });
		});

		it('should throw error when list ID is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock).mockReturnValue('');

			await expect(
				ListsResource.execute.call(mockExecuteFunctions, 'delete', 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('addBookmarks', () => {
		it('should add a single bookmark to a list', async () => {
			const mockResponse = { data: { success: true } };

			mockApiRequest.mockResolvedValueOnce(mockResponse);
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('list-123') // listId
				.mockReturnValueOnce('single') // bookmarkInputMethod
				.mockReturnValueOnce('bookmark-123'); // bookmarkId

			const result = await ListsResource.execute.call(mockExecuteFunctions, 'addBookmarks', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'PUT',
				endpoint: 'lists/list-123/bookmarks/bookmark-123',
			});
			expect(result).toEqual({
				success: true,
				listId: 'list-123',
				bookmarkId: 'bookmark-123',
				data: mockResponse.data,
			});
		});

		it('should add multiple bookmarks to a list', async () => {
			const mockResponse = { data: { success: true } };

			mockApiRequest.mockResolvedValue(mockResponse);
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('list-123') // listId
				.mockReturnValueOnce('multiple') // bookmarkInputMethod
				.mockReturnValueOnce('bookmark-1, bookmark-2, bookmark-3'); // bookmarkIds

			const result = await ListsResource.execute.call(mockExecuteFunctions, 'addBookmarks', 0);

			expect(mockApiRequest).toHaveBeenCalledTimes(3);
			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'PUT',
				endpoint: 'lists/list-123/bookmarks/bookmark-1',
			});
			expect(result).toEqual({
				success: true,
				listId: 'list-123',
				addedBookmarks: [mockResponse.data, mockResponse.data, mockResponse.data],
				totalProcessed: 3,
			});
		});

		it('should throw error when list ID is missing', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('') // listId
				.mockReturnValue('single');

			await expect(
				ListsResource.execute.call(mockExecuteFunctions, 'addBookmarks', 0)
			).rejects.toThrow(NodeOperationError);
		});

		it('should throw error when bookmark ID is missing for single method', async () => {
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('list-123') // listId
				.mockReturnValueOnce('single') // bookmarkInputMethod
				.mockReturnValueOnce(''); // bookmarkId

			await expect(
				ListsResource.execute.call(mockExecuteFunctions, 'addBookmarks', 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('removeBookmarks', () => {
		it('should remove a single bookmark from a list', async () => {
			mockApiRequest.mockResolvedValueOnce({ data: null });
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('list-123') // listId
				.mockReturnValueOnce('single') // bookmarkInputMethod
				.mockReturnValueOnce('bookmark-123'); // bookmarkId

			const result = await ListsResource.execute.call(mockExecuteFunctions, 'removeBookmarks', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'DELETE',
				endpoint: 'lists/list-123/bookmarks/bookmark-123',
			});
			expect(result).toEqual({
				success: true,
				listId: 'list-123',
				removedBookmarks: [{ success: true, bookmarkId: 'bookmark-123' }],
				totalProcessed: 1,
			});
		});

		it('should remove multiple bookmarks from a list', async () => {
			mockApiRequest.mockResolvedValue({ data: null });
			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('list-123') // listId
				.mockReturnValueOnce('multiple') // bookmarkInputMethod
				.mockReturnValueOnce('bookmark-1, bookmark-2'); // bookmarkIds

			const result = await ListsResource.execute.call(mockExecuteFunctions, 'removeBookmarks', 0);

			expect(mockApiRequest).toHaveBeenCalledTimes(2);
			expect(result).toEqual({
				success: true,
				listId: 'list-123',
				removedBookmarks: [
					{ success: true, bookmarkId: 'bookmark-1' },
					{ success: true, bookmarkId: 'bookmark-2' },
				],
				totalProcessed: 2,
			});
		});

		it('should handle errors when removing individual bookmarks', async () => {
			mockApiRequest
				.mockResolvedValueOnce({ data: null }) // First bookmark succeeds
				.mockRejectedValueOnce(new Error('Bookmark not found')); // Second bookmark fails

			(mockExecuteFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('list-123') // listId
				.mockReturnValueOnce('multiple') // bookmarkInputMethod
				.mockReturnValueOnce('bookmark-1, bookmark-2'); // bookmarkIds

			const result = await ListsResource.execute.call(mockExecuteFunctions, 'removeBookmarks', 0);

			expect(result).toEqual({
				success: true,
				listId: 'list-123',
				removedBookmarks: [
					{ success: true, bookmarkId: 'bookmark-1' },
					{ success: false, bookmarkId: 'bookmark-2', error: 'Bookmark not found' },
				],
				totalProcessed: 2,
			});
		});
	});
});