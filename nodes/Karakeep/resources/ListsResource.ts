import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { KarakeepApiRequest } from '../../shared/KarakeepApiRequest';
import {
	List,
	CreateListInput,
	UpdateListInput,
	ResourceOperations,
} from '../../shared/types';
import { validateRequiredFields } from '../../shared/utils';

export class ListsResource {
	/**
	 * Execute lists operations
	 */
	static async execute(
		this: IExecuteFunctions,
		operation: ResourceOperations['lists'],
		itemIndex: number,
	): Promise<any> {
		switch (operation) {
			case 'getAll':
				return await ListsResource.getAll.call(this, itemIndex);
			case 'getById':
				return await ListsResource.getById.call(this, itemIndex);
			case 'create':
				return await ListsResource.create.call(this, itemIndex);
			case 'update':
				return await ListsResource.update.call(this, itemIndex);
			case 'delete':
				return await ListsResource.delete.call(this, itemIndex);
			case 'addBookmarks':
				return await ListsResource.addBookmarks.call(this, itemIndex);
			case 'removeBookmarks':
				return await ListsResource.removeBookmarks.call(this, itemIndex);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" is not supported for lists`,
					{ itemIndex }
				);
		}
	}

	/**
	 * Get all lists with optional filtering and pagination
	 */
	private static async getAll(this: IExecuteFunctions, itemIndex: number): Promise<List[] | any> {
		const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as any;
		
		const params: Record<string, string | number> = {};
		
		// Add pagination parameters
		if (additionalFields.page) {
			params.page = additionalFields.page;
		}
		if (additionalFields.limit) {
			params.limit = additionalFields.limit;
		}
		
		// Add filtering parameters
		if (additionalFields.isPublic !== undefined && additionalFields.isPublic !== '') {
			params.public = additionalFields.isPublic;
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'GET',
			endpoint: 'lists',
			params,
		});

		return response.data || response;
	}

	/**
	 * Get a specific list by ID
	 */
	private static async getById(this: IExecuteFunctions, itemIndex: number): Promise<List | any> {
		const listId = this.getNodeParameter('listId', itemIndex) as string;
		
		if (!listId) {
			throw new NodeOperationError(
				this.getNode(),
				'List ID is required',
				{ itemIndex }
			);
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'GET',
			endpoint: `lists/${listId}`,
		});

		return response.data || response;
	}

	/**
	 * Create a new list
	 */
	private static async create(this: IExecuteFunctions, itemIndex: number): Promise<List | any> {
		const name = this.getNodeParameter('name', itemIndex) as string;
		const icon = this.getNodeParameter('icon', itemIndex) as string;
		const description = this.getNodeParameter('description', itemIndex, '') as string;
		const type = this.getNodeParameter('type', itemIndex, 'manual') as 'manual' | 'smart';
		const query = this.getNodeParameter('query', itemIndex, '') as string;
		const parentId = this.getNodeParameter('parentId', itemIndex, '') as string;

		// Validate required fields
		const validationErrors = validateRequiredFields({ name, icon }, ['name', 'icon']);
		if (validationErrors.length > 0) {
			throw new NodeOperationError(
				this.getNode(),
				`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
				{ itemIndex }
			);
		}

		// Validate name length
		if (name.trim().length > 100) {
			throw new NodeOperationError(
				this.getNode(),
				'List name must be 100 characters or less',
				{ itemIndex }
			);
		}

		// Validate description length
		if (description && description.trim().length > 500) {
			throw new NodeOperationError(
				this.getNode(),
				'List description must be 500 characters or less',
				{ itemIndex }
			);
		}

		// Validate smart list requirements
		if (type === 'smart' && (!query || query.trim() === '')) {
			throw new NodeOperationError(
				this.getNode(),
				'Query is required for smart lists',
				{ itemIndex }
			);
		}

		const createData: CreateListInput = {
			name: name.trim(),
			icon: icon.trim(),
		};

		// Add optional fields only if they have meaningful values
		if (description && description.trim() !== '') {
			createData.description = description.trim();
		}
		if (type && type !== 'manual') {
			createData.type = type;
		}
		if (query && query.trim() !== '') {
			createData.query = query.trim();
		}
		if (parentId && parentId.trim() !== '') {
			createData.parentId = parentId.trim();
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'POST',
			endpoint: 'lists',
			body: createData,
		});

		return response.data || response;
	}

	/**
	 * Update an existing list
	 */
	private static async update(this: IExecuteFunctions, itemIndex: number): Promise<List | any> {
		const listId = this.getNodeParameter('listId', itemIndex) as string;
		const name = this.getNodeParameter('name', itemIndex, '') as string;
		const icon = this.getNodeParameter('icon', itemIndex, '') as string;
		const description = this.getNodeParameter('description', itemIndex, '') as string;
		const type = this.getNodeParameter('type', itemIndex, '') as string;
		const query = this.getNodeParameter('query', itemIndex, '') as string;
		const parentId = this.getNodeParameter('parentId', itemIndex, '') as string;

		if (!listId) {
			throw new NodeOperationError(
				this.getNode(),
				'List ID is required',
				{ itemIndex }
			);
		}

		const updateData: UpdateListInput = {};

		// Only include fields that have meaningful values
		if (name && name.trim() !== '') {
			// Validate name length
			if (name.trim().length > 100) {
				throw new NodeOperationError(
					this.getNode(),
					'List name must be 100 characters or less',
					{ itemIndex }
				);
			}
			updateData.name = name.trim();
		}
		if (icon && icon.trim() !== '') {
			updateData.icon = icon.trim();
		}
		if (description && description.trim() !== '') {
			// Validate description length
			if (description.trim().length > 500) {
				throw new NodeOperationError(
					this.getNode(),
					'List description must be 500 characters or less',
					{ itemIndex }
				);
			}
			updateData.description = description.trim();
		}
		if (type && type !== '') {
			updateData.type = type as 'manual' | 'smart';
			// Validate smart list requirements
			if (type === 'smart' && (!query || query.trim() === '')) {
				throw new NodeOperationError(
					this.getNode(),
					'Query is required for smart lists',
					{ itemIndex }
				);
			}
		}
		if (query && query.trim() !== '') {
			updateData.query = query.trim();
		}
		if (parentId && parentId.trim() !== '') {
			updateData.parentId = parentId.trim();
		}

		// Check if there's anything to update
		if (Object.keys(updateData).length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'At least one field must be provided for update',
				{ itemIndex }
			);
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'PATCH',
			endpoint: `lists/${listId}`,
			body: updateData,
		});

		return response.data || response;
	}

	/**
	 * Delete a list
	 */
	private static async delete(this: IExecuteFunctions, itemIndex: number): Promise<{ success: boolean; id: string }> {
		const listId = this.getNodeParameter('listId', itemIndex) as string;

		if (!listId) {
			throw new NodeOperationError(
				this.getNode(),
				'List ID is required',
				{ itemIndex }
			);
		}

		await KarakeepApiRequest.apiRequest.call(this, {
			method: 'DELETE',
			endpoint: `lists/${listId}`,
		});

		return { success: true, id: listId };
	}

	/**
	 * Add bookmarks to a list
	 */
	private static async addBookmarks(this: IExecuteFunctions, itemIndex: number): Promise<any> {
		const listId = this.getNodeParameter('listId', itemIndex) as string;
		const bookmarkInputMethod = this.getNodeParameter('bookmarkInputMethod', itemIndex) as 'single' | 'multiple';

		if (!listId) {
			throw new NodeOperationError(
				this.getNode(),
				'List ID is required',
				{ itemIndex }
			);
		}

		let bookmarkIds: string[] = [];

		if (bookmarkInputMethod === 'single') {
			const bookmarkId = this.getNodeParameter('bookmarkId', itemIndex) as string;
			
			if (!bookmarkId || bookmarkId.trim() === '') {
				throw new NodeOperationError(
					this.getNode(),
					'Bookmark ID is required',
					{ itemIndex }
				);
			}

			bookmarkIds = [bookmarkId.trim()];
		} else {
			const bookmarkIdsInput = this.getNodeParameter('bookmarkIds', itemIndex) as string;
			
			if (!bookmarkIdsInput || bookmarkIdsInput.trim() === '') {
				throw new NodeOperationError(
					this.getNode(),
					'Bookmark IDs are required',
					{ itemIndex }
				);
			}

			// Parse comma-separated bookmark IDs
			bookmarkIds = bookmarkIdsInput
				.split(',')
				.map(id => id.trim())
				.filter(id => id !== '');

			if (bookmarkIds.length === 0) {
				throw new NodeOperationError(
					this.getNode(),
					'At least one valid bookmark ID is required',
					{ itemIndex }
				);
			}
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'PUT',
			endpoint: `lists/${listId}/bookmarks/${bookmarkIds[0]}`,
		});

		// For multiple bookmarks, we need to make multiple requests
		if (bookmarkIds.length > 1) {
			const results = [response.data || response];
			
			for (let i = 1; i < bookmarkIds.length; i++) {
				try {
					const result = await KarakeepApiRequest.apiRequest.call(this, {
						method: 'PUT',
						endpoint: `lists/${listId}/bookmarks/${bookmarkIds[i]}`,
					});
					results.push(result.data || result);
				} catch (error) {
					// Continue with other bookmarks even if one fails
					results.push({
						success: false,
						bookmarkId: bookmarkIds[i],
						error: (error as Error).message,
					});
				}
			}

			return {
				success: true,
				listId,
				addedBookmarks: results,
				totalProcessed: bookmarkIds.length,
			};
		}

		return {
			success: true,
			listId,
			bookmarkId: bookmarkIds[0],
			data: response.data || response,
		};
	}

	/**
	 * Remove bookmarks from a list
	 */
	private static async removeBookmarks(this: IExecuteFunctions, itemIndex: number): Promise<any> {
		const listId = this.getNodeParameter('listId', itemIndex) as string;
		const bookmarkInputMethod = this.getNodeParameter('bookmarkInputMethod', itemIndex) as 'single' | 'multiple';

		if (!listId) {
			throw new NodeOperationError(
				this.getNode(),
				'List ID is required',
				{ itemIndex }
			);
		}

		let bookmarkIds: string[] = [];

		if (bookmarkInputMethod === 'single') {
			const bookmarkId = this.getNodeParameter('bookmarkId', itemIndex) as string;
			
			if (!bookmarkId || bookmarkId.trim() === '') {
				throw new NodeOperationError(
					this.getNode(),
					'Bookmark ID is required',
					{ itemIndex }
				);
			}

			bookmarkIds = [bookmarkId.trim()];
		} else {
			const bookmarkIdsInput = this.getNodeParameter('bookmarkIds', itemIndex) as string;
			
			if (!bookmarkIdsInput || bookmarkIdsInput.trim() === '') {
				throw new NodeOperationError(
					this.getNode(),
					'Bookmark IDs are required',
					{ itemIndex }
				);
			}

			// Parse comma-separated bookmark IDs
			bookmarkIds = bookmarkIdsInput
				.split(',')
				.map(id => id.trim())
				.filter(id => id !== '');

			if (bookmarkIds.length === 0) {
				throw new NodeOperationError(
					this.getNode(),
					'At least one valid bookmark ID is required',
					{ itemIndex }
				);
			}
		}

		// For multiple bookmarks, we need to make multiple requests
		const results = [];
		
		for (const bookmarkId of bookmarkIds) {
			try {
				await KarakeepApiRequest.apiRequest.call(this, {
					method: 'DELETE',
					endpoint: `lists/${listId}/bookmarks/${bookmarkId}`,
				});
				results.push({
					success: true,
					bookmarkId,
				});
			} catch (error) {
				// Continue with other bookmarks even if one fails
				results.push({
					success: false,
					bookmarkId,
					error: (error as Error).message,
				});
			}
		}

		return {
			success: true,
			listId,
			removedBookmarks: results,
			totalProcessed: bookmarkIds.length,
		};
	}
}