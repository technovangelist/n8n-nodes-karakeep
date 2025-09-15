import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { TagsResource } from '../../../../../nodes/Karakeep/resources/TagsResource';
import { KarakeepApiRequest } from '../../../../../nodes/shared/KarakeepApiRequest';
import { Tag, Bookmark } from '../../../../../nodes/shared/types';

// Mock the KarakeepApiRequest
jest.mock('../../../../../nodes/shared/KarakeepApiRequest');
const mockApiRequest = KarakeepApiRequest.apiRequest as jest.MockedFunction<typeof KarakeepApiRequest.apiRequest>;

// Mock the utils
jest.mock('../../../../../nodes/shared/utils', () => ({
	validateRequiredFields: jest.fn((data: any, required: string[]) => {
		const errors = [];
		for (const field of required) {
			if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
				errors.push({ field, message: `${field} is required`, code: 'REQUIRED' });
			}
		}
		return errors;
	}),
}));

describe('TagsResource', () => {
	let mockExecuteFunctions: jest.Mocked<IExecuteFunctions>;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
		} as any;

		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should route to correct operation method', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('test-tag-id') // tagId
				.mockReturnValueOnce(false); // includeUsageStats
			mockApiRequest.mockResolvedValue({ data: { id: 'test-tag-id', name: 'test-tag' } });

			await TagsResource.execute.call(mockExecuteFunctions, 'getById', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'tags/test-tag-id',
				params: {},
			});
		});

		it('should throw error for unsupported operation', async () => {
			await expect(
				TagsResource.execute.call(mockExecuteFunctions, 'unsupported' as any, 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('getAll', () => {
		it('should get all tags without additional parameters', async () => {
			const mockTags: Tag[] = [
				{ id: 'tag1', name: 'JavaScript', attachedBy: 'human' },
				{ id: 'tag2', name: 'TypeScript', attachedBy: 'ai' },
			];

			mockExecuteFunctions.getNodeParameter.mockReturnValue({});
			mockApiRequest.mockResolvedValue({ data: mockTags });

			const result = await TagsResource.execute.call(mockExecuteFunctions, 'getAll', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'tags',
				params: {},
			});
			expect(result).toEqual(mockTags);
		});

		it('should get all tags with pagination and sorting', async () => {
			const additionalFields = {
				page: 2,
				limit: 10,
				sortBy: 'name',
				sortOrder: 'desc',
				includeUsageStats: true,
			};

			mockExecuteFunctions.getNodeParameter.mockReturnValue(additionalFields);
			mockApiRequest.mockResolvedValue({ data: [] });

			await TagsResource.execute.call(mockExecuteFunctions, 'getAll', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'tags',
				params: {
					page: 2,
					limit: 10,
					sortBy: 'name',
					sortOrder: 'desc',
					includeUsageStats: true,
				},
			});
		});
	});

	describe('getById', () => {
		it('should get tag by ID', async () => {
			const mockTag: Tag = { id: 'tag1', name: 'JavaScript', attachedBy: 'human' };

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('tag1') // tagId
				.mockReturnValueOnce(false); // includeUsageStats

			mockApiRequest.mockResolvedValue({ data: mockTag });

			const result = await TagsResource.execute.call(mockExecuteFunctions, 'getById', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'tags/tag1',
				params: {},
			});
			expect(result).toEqual(mockTag);
		});

		it('should get tag by ID with usage stats', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('tag1') // tagId
				.mockReturnValueOnce(true); // includeUsageStats

			mockApiRequest.mockResolvedValue({ data: {} });

			await TagsResource.execute.call(mockExecuteFunctions, 'getById', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'tags/tag1',
				params: { includeUsageStats: true },
			});
		});

		it('should throw error when tag ID is missing', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('');

			await expect(
				TagsResource.execute.call(mockExecuteFunctions, 'getById', 0)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('create', () => {
		it('should create a new tag', async () => {
			const mockTag: Tag = { id: 'new-tag', name: 'React', attachedBy: 'human' };

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('React') // name
				.mockReturnValueOnce(true); // preventDuplicates

			mockApiRequest
				.mockResolvedValueOnce({ data: [] }) // duplicate check
				.mockResolvedValueOnce({ data: mockTag }); // create

			const result = await TagsResource.execute.call(mockExecuteFunctions, 'create', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'POST',
				endpoint: 'tags',
				body: { name: 'React' },
			});
			expect(result).toEqual(mockTag);
		});

		it('should create tag without duplicate check when preventDuplicates is false', async () => {
			const mockTag: Tag = { id: 'new-tag', name: 'React', attachedBy: 'human' };

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('React') // name
				.mockReturnValueOnce(false); // preventDuplicates

			mockApiRequest.mockResolvedValueOnce({ data: mockTag });

			const result = await TagsResource.execute.call(mockExecuteFunctions, 'create', 0);

			expect(mockApiRequest).toHaveBeenCalledTimes(1);
			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'POST',
				endpoint: 'tags',
				body: { name: 'React' },
			});
			expect(result).toEqual(mockTag);
		});

		it('should throw error when duplicate tag exists', async () => {
			const existingTag: Tag = { id: 'existing', name: 'react', attachedBy: 'human' };

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('React') // name (different case)
				.mockReturnValueOnce(true); // preventDuplicates

			mockApiRequest.mockResolvedValueOnce({ data: [existingTag] });

			await expect(
				TagsResource.execute.call(mockExecuteFunctions, 'create', 0)
			).rejects.toThrow('Tag with name "React" already exists');
		});

		it('should throw error when tag name is empty', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('   ') // empty name
				.mockReturnValueOnce(true);

			await expect(
				TagsResource.execute.call(mockExecuteFunctions, 'create', 0)
			).rejects.toThrow('Validation failed');
		});

		it('should throw error when tag name is too long', async () => {
			const longName = 'a'.repeat(101);
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce(longName)
				.mockReturnValueOnce(true);

			await expect(
				TagsResource.execute.call(mockExecuteFunctions, 'create', 0)
			).rejects.toThrow('Tag name cannot exceed 100 characters');
		});

		it('should handle validation errors', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('') // empty name
				.mockReturnValueOnce(true);

			await expect(
				TagsResource.execute.call(mockExecuteFunctions, 'create', 0)
			).rejects.toThrow('Validation failed');
		});
	});

	describe('update', () => {
		it('should update an existing tag', async () => {
			const mockTag: Tag = { id: 'tag1', name: 'Updated Tag', attachedBy: 'human' };

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('tag1') // tagId
				.mockReturnValueOnce('Updated Tag') // name
				.mockReturnValueOnce(true); // preventDuplicates

			mockApiRequest
				.mockResolvedValueOnce({ data: [] }) // duplicate check
				.mockResolvedValueOnce({ data: mockTag }); // update

			const result = await TagsResource.execute.call(mockExecuteFunctions, 'update', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'PATCH',
				endpoint: 'tags/tag1',
				body: { name: 'Updated Tag' },
			});
			expect(result).toEqual(mockTag);
		});

		it('should update tag without duplicate check when preventDuplicates is false', async () => {
			const mockTag: Tag = { id: 'tag1', name: 'Updated Tag', attachedBy: 'human' };

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('tag1') // tagId
				.mockReturnValueOnce('Updated Tag') // name
				.mockReturnValueOnce(false); // preventDuplicates

			mockApiRequest.mockResolvedValueOnce({ data: mockTag });

			const result = await TagsResource.execute.call(mockExecuteFunctions, 'update', 0);

			expect(mockApiRequest).toHaveBeenCalledTimes(1);
			expect(result).toEqual(mockTag);
		});

		it('should throw error when duplicate tag exists (excluding current tag)', async () => {
			const existingTag: Tag = { id: 'other-tag', name: 'updated tag', attachedBy: 'human' };

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('tag1') // tagId
				.mockReturnValueOnce('Updated Tag') // name (different case)
				.mockReturnValueOnce(true); // preventDuplicates

			mockApiRequest.mockResolvedValueOnce({ data: [existingTag] });

			await expect(
				TagsResource.execute.call(mockExecuteFunctions, 'update', 0)
			).rejects.toThrow('Tag with name "Updated Tag" already exists');
		});

		it('should allow updating to same name (same tag)', async () => {
			const currentTag: Tag = { id: 'tag1', name: 'same name', attachedBy: 'human' };
			const updatedTag: Tag = { id: 'tag1', name: 'Same Name', attachedBy: 'human' };

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('tag1') // tagId
				.mockReturnValueOnce('Same Name') // name (different case but same tag)
				.mockReturnValueOnce(true); // preventDuplicates

			mockApiRequest
				.mockResolvedValueOnce({ data: [currentTag] }) // duplicate check finds same tag
				.mockResolvedValueOnce({ data: updatedTag }); // update

			const result = await TagsResource.execute.call(mockExecuteFunctions, 'update', 0);

			expect(result).toEqual(updatedTag);
		});

		it('should throw error when tag ID is missing', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('');

			await expect(
				TagsResource.execute.call(mockExecuteFunctions, 'update', 0)
			).rejects.toThrow('Tag ID is required');
		});
	});

	describe('delete', () => {
		it('should delete a tag when not in use', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('tag1') // tagId
				.mockReturnValueOnce(false); // forceDelete

			mockApiRequest
				.mockResolvedValueOnce({ data: [] }) // check usage - no bookmarks
				.mockResolvedValueOnce({ data: null }); // delete

			const result = await TagsResource.execute.call(mockExecuteFunctions, 'delete', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'DELETE',
				endpoint: 'tags/tag1',
				params: {},
			});
			expect(result).toEqual({ success: true, id: 'tag1' });
		});

		it('should force delete a tag when in use', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('tag1') // tagId
				.mockReturnValueOnce(true); // forceDelete

			mockApiRequest.mockResolvedValueOnce({ data: null }); // delete

			const result = await TagsResource.execute.call(mockExecuteFunctions, 'delete', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'DELETE',
				endpoint: 'tags/tag1',
				params: { force: true },
			});
			expect(result).toEqual({ success: true, id: 'tag1' });
		});

		it('should throw error when tag is in use and not forcing delete', async () => {
			const mockBookmarks: Bookmark[] = [
				{
					id: 'bookmark1',
					url: 'https://example.com',
					content: [],
					assets: [],
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('tag1') // tagId
				.mockReturnValueOnce(false); // forceDelete

			mockApiRequest.mockResolvedValueOnce({ data: mockBookmarks }); // check usage - has bookmarks

			await expect(
				TagsResource.execute.call(mockExecuteFunctions, 'delete', 0)
			).rejects.toThrow('Cannot delete tag "tag1" because it is still attached to bookmarks');
		});

		it('should throw error when tag ID is missing', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('');

			await expect(
				TagsResource.execute.call(mockExecuteFunctions, 'delete', 0)
			).rejects.toThrow('Tag ID is required');
		});
	});

	describe('getTaggedBookmarks', () => {
		it('should get bookmarks for a tag', async () => {
			const mockBookmarks: Bookmark[] = [
				{
					id: 'bookmark1',
					url: 'https://example.com',
					content: [],
					assets: [],
					createdAt: '2023-01-01T00:00:00Z',
					updatedAt: '2023-01-01T00:00:00Z',
				},
			];

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('tag1') // tagId
				.mockReturnValueOnce({}); // additionalFields

			mockApiRequest.mockResolvedValue({ data: mockBookmarks });

			const result = await TagsResource.execute.call(mockExecuteFunctions, 'getTaggedBookmarks', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'tags/tag1/bookmarks',
				params: {},
			});
			expect(result).toEqual(mockBookmarks);
		});

		it('should get bookmarks for a tag with filtering and pagination', async () => {
			const additionalFields = {
				page: 2,
				limit: 10,
				sortBy: 'createdAt',
				sortOrder: 'desc',
				archived: 'false',
				includeContent: true,
			};

			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('tag1') // tagId
				.mockReturnValueOnce(additionalFields); // additionalFields

			mockApiRequest.mockResolvedValue({ data: [] });

			await TagsResource.execute.call(mockExecuteFunctions, 'getTaggedBookmarks', 0);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'tags/tag1/bookmarks',
				params: {
					page: 2,
					limit: 10,
					sortBy: 'createdAt',
					sortOrder: 'desc',
					archived: 'false',
					includeContent: true,
				},
			});
		});

		it('should throw error when tag ID is missing', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('');

			await expect(
				TagsResource.execute.call(mockExecuteFunctions, 'getTaggedBookmarks', 0)
			).rejects.toThrow('Tag ID is required');
		});
	});

	describe('error handling', () => {
		it('should handle API errors gracefully', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('tag1');
			mockApiRequest.mockRejectedValue(new Error('API Error'));

			await expect(
				TagsResource.execute.call(mockExecuteFunctions, 'getById', 0)
			).rejects.toThrow('API Error');
		});

		it('should handle network timeouts', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('tag1');
			mockApiRequest.mockRejectedValue(new Error('Network timeout'));

			await expect(
				TagsResource.execute.call(mockExecuteFunctions, 'getById', 0)
			).rejects.toThrow('Network timeout');
		});
	});
});