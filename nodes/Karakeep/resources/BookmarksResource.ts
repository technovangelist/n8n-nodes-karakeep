import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { KarakeepApiRequest } from '../../shared/KarakeepApiRequest';
import {
	Bookmark,
	CreateBookmarkInput,
	UpdateBookmarkInput,
	BookmarkSearchParams,
	KarakeepResponse,
	ResourceOperations,
} from '../../shared/types';
import { validateUrl, validateRequiredFields, parseTagsString, formatDateForApi } from '../../shared/utils';

export class BookmarksResource {
	/**
	 * Execute bookmarks operations
	 */
	static async execute(
		this: IExecuteFunctions,
		operation: ResourceOperations['bookmarks'],
		itemIndex: number,
	): Promise<any> {
		switch (operation) {
			case 'getAll':
				return await BookmarksResource.getAll.call(this, itemIndex);
			case 'getById':
				return await BookmarksResource.getById.call(this, itemIndex);
			case 'create':
				return await BookmarksResource.create.call(this, itemIndex);
			case 'update':
				return await BookmarksResource.update.call(this, itemIndex);
			case 'delete':
				return await BookmarksResource.delete.call(this, itemIndex);
			case 'search':
				return await BookmarksResource.search.call(this, itemIndex);
			case 'manageTags':
				return await BookmarksResource.manageTags.call(this, itemIndex);
			case 'manageAssets':
				return await BookmarksResource.manageAssets.call(this, itemIndex);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" is not supported for bookmarks`,
					{ itemIndex }
				);
		}
	}

	/**
	 * Get all bookmarks with optional filtering and pagination
	 */
	private static async getAll(this: IExecuteFunctions, itemIndex: number): Promise<Bookmark[] | any> {
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
		if (additionalFields.archived && additionalFields.archived !== 'all') {
			params.archived = additionalFields.archived;
		}
		if (additionalFields.tags) {
			const tags = parseTagsString(additionalFields.tags);
			if (tags.length > 0) {
				params.tags = tags.join(',');
			}
		}
		if (additionalFields.startDate) {
			params.startDate = formatDateForApi(additionalFields.startDate);
		}
		if (additionalFields.endDate) {
			params.endDate = formatDateForApi(additionalFields.endDate);
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'GET',
			endpoint: 'bookmarks',
			params,
		});

		return response.data || response;
	}

	/**
	 * Get a specific bookmark by ID
	 */
	private static async getById(this: IExecuteFunctions, itemIndex: number): Promise<Bookmark | any> {
		const bookmarkId = this.getNodeParameter('bookmarkId', itemIndex) as string;
		
		if (!bookmarkId) {
			throw new NodeOperationError(
				this.getNode(),
				'Bookmark ID is required',
				{ itemIndex }
			);
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'GET',
			endpoint: `bookmarks/${bookmarkId}`,
		});

		return response.data || response;
	}

	/**
	 * Create a new bookmark
	 */
	private static async create(this: IExecuteFunctions, itemIndex: number): Promise<Bookmark | any> {
		const bookmarkType = this.getNodeParameter('bookmarkType', itemIndex) as 'link' | 'text' | 'asset';
		const title = this.getNodeParameter('title', itemIndex, '') as string;
		const note = this.getNodeParameter('note', itemIndex, '') as string;
		const tagsString = this.getNodeParameter('tags', itemIndex, '') as string;
		const archived = this.getNodeParameter('archived', itemIndex, false) as boolean;
		const favourited = this.getNodeParameter('favourited', itemIndex, false) as boolean;
		const summary = this.getNodeParameter('summary', itemIndex, '') as string;
		const crawlPriority = this.getNodeParameter('crawlPriority', itemIndex, 'normal') as 'low' | 'normal';

		const createData: CreateBookmarkInput = {
			type: bookmarkType,
		};

		// Handle type-specific required fields
		if (bookmarkType === 'link') {
			const url = this.getNodeParameter('url', itemIndex) as string;
			
			// Validate required fields
			const validationErrors = validateRequiredFields({ url }, ['url']);
			if (validationErrors.length > 0) {
				throw new NodeOperationError(
					this.getNode(),
					`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
					{ itemIndex }
				);
			}

			// Validate URL format
			if (!validateUrl(url)) {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid URL format',
					{ itemIndex }
				);
			}

			createData.url = url;
		} else if (bookmarkType === 'text') {
			const text = this.getNodeParameter('text', itemIndex) as string;
			const sourceUrl = this.getNodeParameter('sourceUrl', itemIndex, '') as string;

			// Validate required fields
			if (!text || text.trim() === '') {
				throw new NodeOperationError(
					this.getNode(),
					'Text content is required for text bookmarks',
					{ itemIndex }
				);
			}

			createData.text = text.trim();
			if (sourceUrl && sourceUrl.trim() !== '') {
				if (!validateUrl(sourceUrl)) {
					throw new NodeOperationError(
						this.getNode(),
						'Invalid source URL format',
						{ itemIndex }
					);
				}
				createData.sourceUrl = sourceUrl.trim();
			}
		} else if (bookmarkType === 'asset') {
			const assetType = this.getNodeParameter('assetType', itemIndex) as 'image' | 'pdf';
			const assetId = this.getNodeParameter('assetId', itemIndex) as string;
			const fileName = this.getNodeParameter('fileName', itemIndex, '') as string;
			const assetSourceUrl = this.getNodeParameter('assetSourceUrl', itemIndex, '') as string;

			// Validate required fields
			if (!assetId || assetId.trim() === '') {
				throw new NodeOperationError(
					this.getNode(),
					'Asset ID is required for asset bookmarks',
					{ itemIndex }
				);
			}

			createData.assetType = assetType;
			createData.assetId = assetId.trim();
			
			if (fileName && fileName.trim() !== '') {
				createData.fileName = fileName.trim();
			}
			if (assetSourceUrl && assetSourceUrl.trim() !== '') {
				if (!validateUrl(assetSourceUrl)) {
					throw new NodeOperationError(
						this.getNode(),
						'Invalid asset source URL format',
						{ itemIndex }
					);
				}
				createData.sourceUrl = assetSourceUrl.trim();
			}
		}

		// Add common optional fields only if they have meaningful values
		if (title && title.trim() !== '') {
			createData.title = title.trim();
		}
		if (note && note.trim() !== '') {
			createData.note = note.trim();
		}
		if (summary && summary.trim() !== '') {
			createData.summary = summary.trim();
		}
		if (archived !== undefined && archived !== null) {
			createData.archived = archived;
		}
		if (favourited !== undefined && favourited !== null) {
			createData.favourited = favourited;
		}
		if (crawlPriority && crawlPriority !== 'normal') {
			createData.crawlPriority = crawlPriority;
		}
		
		// Parse and add tags
		if (tagsString && tagsString.trim() !== '') {
			const tags = parseTagsString(tagsString);
			if (tags.length > 0) {
				createData.tags = tags;
			}
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'POST',
			endpoint: 'bookmarks',
			body: createData,
		});

		return response.data || response;
	}

	/**
	 * Update an existing bookmark
	 */
	private static async update(this: IExecuteFunctions, itemIndex: number): Promise<Bookmark | any> {
		const bookmarkId = this.getNodeParameter('bookmarkId', itemIndex) as string;
		const title = this.getNodeParameter('title', itemIndex, '') as string;
		const note = this.getNodeParameter('note', itemIndex, '') as string;
		const summary = this.getNodeParameter('summary', itemIndex, '') as string;
		const archived = this.getNodeParameter('archived', itemIndex) as boolean | undefined;
		const favourited = this.getNodeParameter('favourited', itemIndex) as boolean | undefined;
		
		// Additional update fields
		const updateUrl = this.getNodeParameter('updateUrl', itemIndex, '') as string;
		const description = this.getNodeParameter('description', itemIndex, '') as string;
		const author = this.getNodeParameter('author', itemIndex, '') as string;
		const publisher = this.getNodeParameter('publisher', itemIndex, '') as string;
		const datePublished = this.getNodeParameter('datePublished', itemIndex, '') as string;
		const dateModified = this.getNodeParameter('dateModified', itemIndex, '') as string;
		const textContent = this.getNodeParameter('textContent', itemIndex, '') as string;
		const assetContent = this.getNodeParameter('assetContent', itemIndex, '') as string;
		const createdAt = this.getNodeParameter('createdAt', itemIndex, '') as string;

		if (!bookmarkId) {
			throw new NodeOperationError(
				this.getNode(),
				'Bookmark ID is required',
				{ itemIndex }
			);
		}

		const updateData: UpdateBookmarkInput = {};

		// Only include fields that have meaningful values
		if (title && title.trim() !== '') {
			updateData.title = title.trim();
		}
		if (note && note.trim() !== '') {
			updateData.note = note.trim();
		}
		if (summary && summary.trim() !== '') {
			updateData.summary = summary.trim();
		}
		if (archived !== undefined) {
			updateData.archived = archived;
		}
		if (favourited !== undefined) {
			updateData.favourited = favourited;
		}
		
		// Additional fields
		if (updateUrl && updateUrl.trim() !== '') {
			if (!validateUrl(updateUrl)) {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid URL format',
					{ itemIndex }
				);
			}
			updateData.url = updateUrl.trim();
		}
		if (description && description.trim() !== '') {
			updateData.description = description.trim();
		}
		if (author && author.trim() !== '') {
			updateData.author = author.trim();
		}
		if (publisher && publisher.trim() !== '') {
			updateData.publisher = publisher.trim();
		}
		if (datePublished && datePublished.trim() !== '') {
			updateData.datePublished = formatDateForApi(datePublished);
		}
		if (dateModified && dateModified.trim() !== '') {
			updateData.dateModified = formatDateForApi(dateModified);
		}
		if (textContent && textContent.trim() !== '') {
			updateData.text = textContent.trim();
		}
		if (assetContent && assetContent.trim() !== '') {
			updateData.assetContent = assetContent.trim();
		}
		if (createdAt && createdAt.trim() !== '') {
			updateData.createdAt = formatDateForApi(createdAt);
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
			endpoint: `bookmarks/${bookmarkId}`,
			body: updateData,
		});

		return response.data || response;
	}

	/**
	 * Delete a bookmark
	 */
	private static async delete(this: IExecuteFunctions, itemIndex: number): Promise<{ success: boolean; id: string }> {
		const bookmarkId = this.getNodeParameter('bookmarkId', itemIndex) as string;

		if (!bookmarkId) {
			throw new NodeOperationError(
				this.getNode(),
				'Bookmark ID is required',
				{ itemIndex }
			);
		}

		await KarakeepApiRequest.apiRequest.call(this, {
			method: 'DELETE',
			endpoint: `bookmarks/${bookmarkId}`,
		});

		return { success: true, id: bookmarkId };
	}

	/**
	 * Search bookmarks with query and options
	 */
	private static async search(this: IExecuteFunctions, itemIndex: number): Promise<Bookmark[] | any> {
		const searchQuery = this.getNodeParameter('searchQuery', itemIndex) as string;
		const searchOptions = this.getNodeParameter('searchOptions', itemIndex, {}) as any;

		if (!searchQuery || searchQuery.trim() === '') {
			throw new NodeOperationError(
				this.getNode(),
				'Search query is required',
				{ itemIndex }
			);
		}

		const params: BookmarkSearchParams = {
			q: searchQuery.trim(),
		};

		// Add optional search parameters
		if (searchOptions.sortOrder && searchOptions.sortOrder !== '') {
			params.sortOrder = searchOptions.sortOrder;
		}
		if (searchOptions.limit) {
			params.limit = searchOptions.limit;
		}
		if (searchOptions.cursor && searchOptions.cursor.trim() !== '') {
			params.cursor = searchOptions.cursor.trim();
		}
		if (searchOptions.includeContent !== undefined) {
			params.includeContent = searchOptions.includeContent;
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'GET',
			endpoint: 'bookmarks/search',
			params: params as unknown as Record<string, string | number | boolean>,
		});

		return response.data || response;
	}

	/**
	 * Manage tags for a bookmark (add or remove)
	 */
	private static async manageTags(this: IExecuteFunctions, itemIndex: number): Promise<Bookmark | any> {
		const bookmarkId = this.getNodeParameter('bookmarkId', itemIndex) as string;
		const tagAction = this.getNodeParameter('tagAction', itemIndex) as 'add' | 'remove';
		const tagsInputMethod = this.getNodeParameter('tagsInputMethod', itemIndex) as 'names' | 'idsAndNames';

		if (!bookmarkId) {
			throw new NodeOperationError(
				this.getNode(),
				'Bookmark ID is required',
				{ itemIndex }
			);
		}

		let tags: Array<{ tagId?: string; tagName: string }> = [];

		if (tagsInputMethod === 'names') {
			const tagsString = this.getNodeParameter('tagsToManage', itemIndex) as string;
			
			if (!tagsString || tagsString.trim() === '') {
				throw new NodeOperationError(
					this.getNode(),
					'Tag names are required',
					{ itemIndex }
				);
			}

			const tagNames = parseTagsString(tagsString);
			if (tagNames.length === 0) {
				throw new NodeOperationError(
					this.getNode(),
					'At least one valid tag name is required',
					{ itemIndex }
				);
			}

			// Convert tag names to the required format
			tags = tagNames.map(tagName => ({ tagName }));
		} else {
			const tagsJson = this.getNodeParameter('tagsJson', itemIndex) as string;
			
			if (!tagsJson || tagsJson.trim() === '') {
				throw new NodeOperationError(
					this.getNode(),
					'Tags JSON is required',
					{ itemIndex }
				);
			}

			try {
				const parsedTags = JSON.parse(tagsJson);
				
				if (!Array.isArray(parsedTags)) {
					throw new NodeOperationError(
						this.getNode(),
						'Tags JSON must be an array',
						{ itemIndex }
					);
				}

				// Validate the structure
				for (const tag of parsedTags) {
					if (!tag.tagName) {
						throw new NodeOperationError(
							this.getNode(),
							'Each tag object must have a tagName property',
							{ itemIndex }
						);
					}
				}

				tags = parsedTags;
			} catch (error) {
				if (error instanceof NodeOperationError) {
					throw error;
				}
				throw new NodeOperationError(
					this.getNode(),
					`Invalid JSON format: ${(error as Error).message}`,
					{ itemIndex }
				);
			}
		}

		const endpoint = `bookmarks/${bookmarkId}/tags`;
		const method = tagAction === 'add' ? 'POST' : 'DELETE';

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method,
			endpoint,
			body: { tags },
		});

		return response.data || response;
	}

	/**
	 * Manage assets for a bookmark (attach, replace, or detach)
	 */
	private static async manageAssets(this: IExecuteFunctions, itemIndex: number): Promise<Bookmark | any> {
		const bookmarkId = this.getNodeParameter('bookmarkId', itemIndex) as string;
		const assetAction = this.getNodeParameter('assetAction', itemIndex) as 'attach' | 'replace' | 'detach';

		if (!bookmarkId) {
			throw new NodeOperationError(
				this.getNode(),
				'Bookmark ID is required',
				{ itemIndex }
			);
		}

		let endpoint: string;
		let method: 'POST' | 'PUT' | 'DELETE';
		let body: any = undefined;

		if (assetAction === 'attach') {
			const assetId = this.getNodeParameter('assetId', itemIndex) as string;
			const assetType = this.getNodeParameter('assetType', itemIndex) as string;

			if (!assetId) {
				throw new NodeOperationError(
					this.getNode(),
					'Asset ID is required for attach operation',
					{ itemIndex }
				);
			}

			if (!assetType) {
				throw new NodeOperationError(
					this.getNode(),
					'Asset Type is required for attach operation',
					{ itemIndex }
				);
			}

			endpoint = `bookmarks/${bookmarkId}/assets`;
			method = 'POST';
			body = {
				id: assetId,
				assetType: assetType,
			};
		} else if (assetAction === 'replace') {
			const currentAssetId = this.getNodeParameter('currentAssetId', itemIndex) as string;
			const newAssetId = this.getNodeParameter('newAssetId', itemIndex) as string;

			if (!currentAssetId) {
				throw new NodeOperationError(
					this.getNode(),
					'Current Asset ID is required for replace operation',
					{ itemIndex }
				);
			}

			if (!newAssetId) {
				throw new NodeOperationError(
					this.getNode(),
					'New Asset ID is required for replace operation',
					{ itemIndex }
				);
			}

			endpoint = `bookmarks/${bookmarkId}/assets/${currentAssetId}`;
			method = 'PUT';
			body = {
				assetId: newAssetId,
			};
		} else { // detach
			const currentAssetId = this.getNodeParameter('currentAssetId', itemIndex) as string;

			if (!currentAssetId) {
				throw new NodeOperationError(
					this.getNode(),
					'Current Asset ID is required for detach operation',
					{ itemIndex }
				);
			}

			endpoint = `bookmarks/${bookmarkId}/assets/${currentAssetId}`;
			method = 'DELETE';
			// No body for DELETE
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method,
			endpoint,
			body,
		});

		// For detach and replace operations, return success status
		if (assetAction === 'detach' || assetAction === 'replace') {
			return { success: true, action: assetAction, bookmarkId };
		}

		return response.data || response;
	}
}