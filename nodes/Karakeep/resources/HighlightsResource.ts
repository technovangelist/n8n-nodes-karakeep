import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { KarakeepApiRequest } from '../../shared/KarakeepApiRequest';
import {
	Highlight,
	CreateHighlightInput,
	UpdateHighlightInput,
	ResourceOperations,
} from '../../shared/types';
import { validateRequiredFields } from '../../shared/utils';

export class HighlightsResource {
	/**
	 * Execute highlights operations
	 */
	static async execute(
		this: IExecuteFunctions,
		operation: ResourceOperations['highlights'],
		itemIndex: number,
	): Promise<any> {
		switch (operation) {
			case 'getAll':
				return await HighlightsResource.getAll.call(this, itemIndex);
			case 'getById':
				return await HighlightsResource.getById.call(this, itemIndex);
			case 'create':
				return await HighlightsResource.create.call(this, itemIndex);
			case 'update':
				return await HighlightsResource.update.call(this, itemIndex);
			case 'delete':
				return await HighlightsResource.delete.call(this, itemIndex);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" is not supported for highlights`,
					{ itemIndex }
				);
		}
	}

	/**
	 * Get all highlights with optional filtering and pagination
	 */
	private static async getAll(this: IExecuteFunctions, itemIndex: number): Promise<Highlight[] | any> {
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
		if (additionalFields.bookmarkId) {
			params.bookmarkId = additionalFields.bookmarkId;
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'GET',
			endpoint: 'highlights',
			params,
		});

		return response.data || response;
	}

	/**
	 * Get a specific highlight by ID
	 */
	private static async getById(this: IExecuteFunctions, itemIndex: number): Promise<Highlight | any> {
		const highlightId = this.getNodeParameter('highlightId', itemIndex) as string;

		if (!highlightId) {
			throw new NodeOperationError(
				this.getNode(),
				'Highlight ID is required',
				{ itemIndex }
			);
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'GET',
			endpoint: `highlights/${highlightId}`,
		});

		return response.data || response;
	}

	/**
	 * Create a new highlight
	 */
	private static async create(this: IExecuteFunctions, itemIndex: number): Promise<Highlight | any> {
		const bookmarkId = this.getNodeParameter('bookmarkId', itemIndex) as string;
		const text = this.getNodeParameter('text', itemIndex) as string;
		const startOffset = this.getNodeParameter('startOffset', itemIndex) as number;
		const endOffset = this.getNodeParameter('endOffset', itemIndex) as number;
		const color = this.getNodeParameter('color', itemIndex, 'yellow') as 'yellow' | 'red' | 'green' | 'blue';
		const note = this.getNodeParameter('note', itemIndex, '') as string;

		// Validate required fields
		const validationErrors = validateRequiredFields(
			{ bookmarkId, text, startOffset, endOffset },
			['bookmarkId', 'text', 'startOffset', 'endOffset']
		);
		if (validationErrors.length > 0) {
			throw new NodeOperationError(
				this.getNode(),
				`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
				{ itemIndex }
			);
		}

		// Validate text position parameters
		if (startOffset < 0) {
			throw new NodeOperationError(
				this.getNode(),
				'Start offset must be a non-negative number',
				{ itemIndex }
			);
		}

		if (endOffset <= startOffset) {
			throw new NodeOperationError(
				this.getNode(),
				'End offset must be greater than start offset',
				{ itemIndex }
			);
		}

		if (!text || text.trim() === '') {
			throw new NodeOperationError(
				this.getNode(),
				'Highlight text cannot be empty',
				{ itemIndex }
			);
		}

		const createData: CreateHighlightInput = {
			bookmarkId: bookmarkId.trim(),
			text: text.trim(),
			startOffset,
			endOffset,
			color,
		};

		// Add optional note if provided
		if (note && note.trim() !== '') {
			createData.note = note.trim();
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'POST',
			endpoint: 'highlights',
			body: createData,
		});

		return response.data || response;
	}

	/**
	 * Update an existing highlight
	 */
	private static async update(this: IExecuteFunctions, itemIndex: number): Promise<Highlight | any> {
		const highlightId = this.getNodeParameter('highlightId', itemIndex) as string;
		const text = this.getNodeParameter('text', itemIndex, '') as string;
		const startOffset = this.getNodeParameter('startOffset', itemIndex) as number | undefined;
		const endOffset = this.getNodeParameter('endOffset', itemIndex) as number | undefined;
		const color = this.getNodeParameter('color', itemIndex, '') as string;
		const note = this.getNodeParameter('note', itemIndex, '') as string;

		if (!highlightId) {
			throw new NodeOperationError(
				this.getNode(),
				'Highlight ID is required',
				{ itemIndex }
			);
		}

		const updateData: UpdateHighlightInput = {};

		// Only include fields that have meaningful values
		if (text && text.trim() !== '') {
			updateData.text = text.trim();
		}

		if (startOffset !== undefined && startOffset !== null) {
			if (startOffset < 0) {
				throw new NodeOperationError(
					this.getNode(),
					'Start offset must be a non-negative number',
					{ itemIndex }
				);
			}
			updateData.startOffset = startOffset;
		}

		if (endOffset !== undefined && endOffset !== null) {
			if (endOffset < 0) {
				throw new NodeOperationError(
					this.getNode(),
					'End offset must be a non-negative number',
					{ itemIndex }
				);
			}
			updateData.endOffset = endOffset;
		}

		// Validate position relationship if both offsets are being updated
		if (updateData.startOffset !== undefined && updateData.endOffset !== undefined) {
			if (updateData.endOffset <= updateData.startOffset) {
				throw new NodeOperationError(
					this.getNode(),
					'End offset must be greater than start offset',
					{ itemIndex }
				);
			}
		}

		if (color && color !== '' && ['yellow', 'red', 'green', 'blue'].includes(color)) {
			updateData.color = color as 'yellow' | 'red' | 'green' | 'blue';
		}

		if (note !== undefined && note !== null && note.trim() !== '') {
			updateData.note = note.trim();
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
			endpoint: `highlights/${highlightId}`,
			body: updateData,
		});

		return response.data || response;
	}

	/**
	 * Delete a highlight
	 */
	private static async delete(this: IExecuteFunctions, itemIndex: number): Promise<{ success: boolean; id: string }> {
		const highlightId = this.getNodeParameter('highlightId', itemIndex) as string;

		if (!highlightId) {
			throw new NodeOperationError(
				this.getNode(),
				'Highlight ID is required',
				{ itemIndex }
			);
		}

		await KarakeepApiRequest.apiRequest.call(this, {
			method: 'DELETE',
			endpoint: `highlights/${highlightId}`,
		});

		return { success: true, id: highlightId };
	}
}