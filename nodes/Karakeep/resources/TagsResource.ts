import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { KarakeepApiRequest } from '../../shared/KarakeepApiRequest';
import {
	Tag,
	Bookmark,
	CreateTagInput,
	UpdateTagInput,
	ResourceOperations,
	PaginationParams,
} from '../../shared/types';
import { validateRequiredFields } from '../../shared/utils';

export class TagsResource {
	/**
	 * Execute tags operations
	 */
	static async execute(
		this: IExecuteFunctions,
		operation: ResourceOperations['tags'],
		itemIndex: number,
	): Promise<any> {
		switch (operation) {
			case 'getAll':
				return await TagsResource.getAll.call(this, itemIndex);
			case 'getById':
				return await TagsResource.getById.call(this, itemIndex);
			case 'create':
				return await TagsResource.create.call(this, itemIndex);
			case 'update':
				return await TagsResource.update.call(this, itemIndex);
			case 'delete':
				return await TagsResource.delete.call(this, itemIndex);
			case 'getTaggedBookmarks':
				return await TagsResource.getTaggedBookmarks.call(this, itemIndex);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" is not supported for tags`,
					{ itemIndex }
				);
		}
	}

	/**
	 * Get all tags with optional pagination
	 */
	private static async getAll(this: IExecuteFunctions, itemIndex: number): Promise<Tag[] | any> {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as any;
		
		const params: Record<string, string | number> = {};
		
		// Add pagination parameters
		if (additionalFields.page) {
			params.page = additionalFields.page;
		}
		if (additionalFields.limit) {
			params.limit = additionalFields.limit;
		}
		
		// Add sorting parameters
		if (additionalFields.sortBy) {
			params.sortBy = additionalFields.sortBy;
		}
		if (additionalFields.sortOrder) {
			params.sortOrder = additionalFields.sortOrder;
		}

		// Add filtering parameters
		if (additionalFields.includeUsageStats !== undefined) {
			params.includeUsageStats = additionalFields.includeUsageStats;
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'GET',
			endpoint: 'tags',
			params,
		});

		return response.data || response;
	}

	/**
	 * Get a specific tag by ID
	 */
	private static async getById(this: IExecuteFunctions, itemIndex: number): Promise<Tag | any> {
		const tagId = this.getNodeParameter('tagId', itemIndex) as string;
		const includeUsageStats = this.getNodeParameter('includeUsageStats', itemIndex, false) as boolean;
		
		if (!tagId) {
			throw new NodeOperationError(
				this.getNode(),
				'Tag ID is required',
				{ itemIndex }
			);
		}

		const params: Record<string, string | number | boolean> = {};
		if (includeUsageStats) {
			params.includeUsageStats = true;
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'GET',
			endpoint: `tags/${tagId}`,
			params,
		});

		return response.data || response;
	}

	/**
	 * Create a new tag
	 */
	private static async create(this: IExecuteFunctions, itemIndex: number): Promise<Tag | any> {
		const name = this.getNodeParameter('name', itemIndex) as string;
		const preventDuplicates = this.getNodeParameter('preventDuplicates', itemIndex, true) as boolean;

		// Validate required fields
		const validationErrors = validateRequiredFields({ name }, ['name']);
		if (validationErrors.length > 0) {
			throw new NodeOperationError(
				this.getNode(),
				`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
				{ itemIndex }
			);
		}

		// Validate tag name format
		const trimmedName = name.trim();
		if (trimmedName === '') {
			throw new NodeOperationError(
				this.getNode(),
				'Tag name cannot be empty',
				{ itemIndex }
			);
		}

		if (trimmedName.length > 100) {
			throw new NodeOperationError(
				this.getNode(),
				'Tag name cannot exceed 100 characters',
				{ itemIndex }
			);
		}

		// Check for duplicate if prevention is enabled
		if (preventDuplicates) {
			try {
				// Search for existing tag with the same name
				const existingTags = await KarakeepApiRequest.apiRequest.call(this, {
					method: 'GET',
					endpoint: 'tags',
					params: { search: trimmedName },
				});

				const tagsArray = existingTags.data || existingTags;
				const duplicateTag = Array.isArray(tagsArray) ? tagsArray.find(
					(tag: Tag) => tag.name.toLowerCase() === trimmedName.toLowerCase()
				) : null;

				if (duplicateTag) {
					throw new NodeOperationError(
						this.getNode(),
						`Tag with name "${trimmedName}" already exists (ID: ${duplicateTag.id})`,
						{ itemIndex }
					);
				}
			} catch (error) {
				// If it's our duplicate error, re-throw it
				if (error instanceof NodeOperationError && error.message.includes('already exists')) {
					throw error;
				}
				// Otherwise, continue with creation (search might have failed for other reasons)
			}
		}

		const createData: CreateTagInput = {
			name: trimmedName,
		};

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'POST',
			endpoint: 'tags',
			body: createData,
		});

		return response.data || response;
	}

	/**
	 * Update an existing tag
	 */
	private static async update(this: IExecuteFunctions, itemIndex: number): Promise<Tag | any> {
		const tagId = this.getNodeParameter('tagId', itemIndex) as string;
		const name = this.getNodeParameter('name', itemIndex) as string;
		const preventDuplicates = this.getNodeParameter('preventDuplicates', itemIndex, true) as boolean;

		if (!tagId) {
			throw new NodeOperationError(
				this.getNode(),
				'Tag ID is required',
				{ itemIndex }
			);
		}

		// Validate required fields
		const validationErrors = validateRequiredFields({ name }, ['name']);
		if (validationErrors.length > 0) {
			throw new NodeOperationError(
				this.getNode(),
				`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
				{ itemIndex }
			);
		}

		// Validate tag name format
		const trimmedName = name.trim();
		if (trimmedName === '') {
			throw new NodeOperationError(
				this.getNode(),
				'Tag name cannot be empty',
				{ itemIndex }
			);
		}

		if (trimmedName.length > 100) {
			throw new NodeOperationError(
				this.getNode(),
				'Tag name cannot exceed 100 characters',
				{ itemIndex }
			);
		}

		// Check for duplicate if prevention is enabled
		if (preventDuplicates) {
			try {
				// Search for existing tag with the same name (excluding current tag)
				const existingTags = await KarakeepApiRequest.apiRequest.call(this, {
					method: 'GET',
					endpoint: 'tags',
					params: { search: trimmedName },
				});

				const tagsArray = existingTags.data || existingTags;
				const duplicateTag = Array.isArray(tagsArray) ? tagsArray.find(
					(tag: Tag) => tag.name.toLowerCase() === trimmedName.toLowerCase() && tag.id !== tagId
				) : null;

				if (duplicateTag) {
					throw new NodeOperationError(
						this.getNode(),
						`Tag with name "${trimmedName}" already exists (ID: ${duplicateTag.id})`,
						{ itemIndex }
					);
				}
			} catch (error) {
				// If it's our duplicate error, re-throw it
				if (error instanceof NodeOperationError && error.message.includes('already exists')) {
					throw error;
				}
				// Otherwise, continue with update (search might have failed for other reasons)
			}
		}

		const updateData: UpdateTagInput = {
			name: trimmedName,
		};

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'PATCH',
			endpoint: `tags/${tagId}`,
			body: updateData,
		});

		return response.data || response;
	}

	/**
	 * Delete a tag
	 */
	private static async delete(this: IExecuteFunctions, itemIndex: number): Promise<{ success: boolean; id: string }> {
		const tagId = this.getNodeParameter('tagId', itemIndex) as string;
		const forceDelete = this.getNodeParameter('forceDelete', itemIndex, false) as boolean;

		if (!tagId) {
			throw new NodeOperationError(
				this.getNode(),
				'Tag ID is required',
				{ itemIndex }
			);
		}

		// If not forcing delete, check if tag is in use
		if (!forceDelete) {
			try {
				const taggedBookmarks = await KarakeepApiRequest.apiRequest.call(this, {
					method: 'GET',
					endpoint: `tags/${tagId}/bookmarks`,
					params: { limit: 1 }, // Just check if any bookmarks exist
				});

				const bookmarks = taggedBookmarks.data || taggedBookmarks;
				if (Array.isArray(bookmarks) && bookmarks.length > 0) {
					throw new NodeOperationError(
						this.getNode(),
						`Cannot delete tag "${tagId}" because it is still attached to bookmarks. Use "Force Delete" option to remove the tag from all bookmarks and delete it.`,
						{ itemIndex }
					);
				}
			} catch (error) {
				// If it's our usage error, re-throw it
				if (error instanceof NodeOperationError && error.message.includes('still attached to bookmarks')) {
					throw error;
				}
				// Otherwise, continue with deletion (check might have failed for other reasons)
			}
		}

		const params: Record<string, string | boolean> = {};
		if (forceDelete) {
			params.force = true;
		}

		await KarakeepApiRequest.apiRequest.call(this, {
			method: 'DELETE',
			endpoint: `tags/${tagId}`,
			params,
		});

		return { success: true, id: tagId };
	}

	/**
	 * Get all bookmarks that have a specific tag
	 */
	private static async getTaggedBookmarks(this: IExecuteFunctions, itemIndex: number): Promise<Bookmark[] | any> {
		const tagId = this.getNodeParameter('tagId', itemIndex) as string;
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as any;

		if (!tagId) {
			throw new NodeOperationError(
				this.getNode(),
				'Tag ID is required',
				{ itemIndex }
			);
		}

		const params: Record<string, string | number | boolean> = {};
		
		// Add pagination parameters
		if (additionalFields.page) {
			params.page = additionalFields.page;
		}
		if (additionalFields.limit) {
			params.limit = additionalFields.limit;
		}
		
		// Add sorting parameters
		if (additionalFields.sortBy) {
			params.sortBy = additionalFields.sortBy;
		}
		if (additionalFields.sortOrder) {
			params.sortOrder = additionalFields.sortOrder;
		}

		// Add filtering parameters
		if (additionalFields.archived && additionalFields.archived !== 'all') {
			params.archived = additionalFields.archived;
		}
		if (additionalFields.includeContent !== undefined) {
			params.includeContent = additionalFields.includeContent;
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'GET',
			endpoint: `tags/${tagId}/bookmarks`,
			params,
		});

		return response.data || response;
	}
}