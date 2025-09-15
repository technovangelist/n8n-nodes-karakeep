import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { HighlightsResource } from '../../../../../nodes/Karakeep/resources/HighlightsResource';
import { KarakeepApiRequest } from '../../../../../nodes/shared/KarakeepApiRequest';
import { Highlight, CreateHighlightInput, UpdateHighlightInput } from '../../../../../nodes/shared/types';

// Mock the KarakeepApiRequest
jest.mock('../../../../../nodes/shared/KarakeepApiRequest');
const mockApiRequest = KarakeepApiRequest.apiRequest as jest.MockedFunction<typeof KarakeepApiRequest.apiRequest>;

// Mock the validateRequiredFields utility
jest.mock('../../../../../nodes/shared/utils', () => ({
	validateRequiredFields: jest.fn((data, fields) => {
		const errors = [];
		for (const field of fields) {
			if (!data[field] && data[field] !== 0) {
				errors.push({ field, message: `${field} is required`, code: 'REQUIRED' });
			}
		}
		return errors;
	}),
}));

describe('HighlightsResource', () => {
	let mockExecuteFunctions: Partial<IExecuteFunctions>;
	let mockGetNodeParameter: jest.Mock;
	let mockGetNode: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		
		mockGetNodeParameter = jest.fn();
		mockGetNode = jest.fn().mockReturnValue({ name: 'Karakeep' });
		
		mockExecuteFunctions = {
			getNodeParameter: mockGetNodeParameter,
			getNode: mockGetNode,
		};
	});

	describe('execute', () => {
		it('should route to correct operation methods', async () => {
			// Test getAll
			mockGetNodeParameter.mockReturnValue({});
			mockApiRequest.mockResolvedValueOnce({ data: [] });
			await HighlightsResource.execute.call(
				mockExecuteFunctions as IExecuteFunctions,
				'getAll',
				0
			);
			
			// Test getById
			mockGetNodeParameter.mockReturnValue('highlight-1');
			mockApiRequest.mockResolvedValueOnce({ data: {} });
			await HighlightsResource.execute.call(
				mockExecuteFunctions as IExecuteFunctions,
				'getById',
				0
			);
			
			// Test delete
			mockGetNodeParameter.mockReturnValue('highlight-1');
			mockApiRequest.mockResolvedValueOnce({ data: null });
			await HighlightsResource.execute.call(
				mockExecuteFunctions as IExecuteFunctions,
				'delete',
				0
			);
			
			expect(mockApiRequest).toHaveBeenCalledTimes(3);
		});

		it('should throw error for unsupported operation', async () => {
			await expect(
				HighlightsResource.execute.call(
					mockExecuteFunctions as IExecuteFunctions,
					'unsupported' as any,
					0
				)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('getAll', () => {
		it('should get all highlights without filters', async () => {
			const mockHighlights = [
				{
					id: 'highlight-1',
					bookmarkId: 'bookmark-1',
					text: 'Important text',
					startOffset: 10,
					endOffset: 25,
					createdAt: '2023-01-01T00:00:00Z',
				},
			];
			const mockResponse = { data: mockHighlights };

			mockGetNodeParameter.mockReturnValue({});
			mockApiRequest.mockResolvedValue(mockResponse);

			const result = await HighlightsResource.execute.call(
				mockExecuteFunctions as IExecuteFunctions,
				'getAll',
				0
			);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'highlights',
				params: {},
			});
			expect(result).toEqual(mockHighlights);
		});

		it('should get all highlights with pagination and filters', async () => {
			const mockResponse = { data: [] };
			const additionalFields = {
				page: 2,
				limit: 10,
				bookmarkId: 'bookmark-123',
			};

			mockGetNodeParameter.mockReturnValue(additionalFields);
			mockApiRequest.mockResolvedValue(mockResponse);

			await HighlightsResource.execute.call(
				mockExecuteFunctions as IExecuteFunctions,
				'getAll',
				0
			);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'highlights',
				params: {
					page: 2,
					limit: 10,
					bookmarkId: 'bookmark-123',
				},
			});
		});
	});

	describe('getById', () => {
		it('should get highlight by ID', async () => {
			const mockHighlight: Highlight = {
				id: 'highlight-1',
				bookmarkId: 'bookmark-1',
				text: 'Important text',
				startOffset: 10,
				endOffset: 25,
				note: 'This is important',
				createdAt: '2023-01-01T00:00:00Z',
			};

			mockGetNodeParameter.mockReturnValue('highlight-1');
			mockApiRequest.mockResolvedValue({ data: mockHighlight });

			const result = await HighlightsResource.execute.call(
				mockExecuteFunctions as IExecuteFunctions,
				'getById',
				0
			);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'GET',
				endpoint: 'highlights/highlight-1',
			});
			expect(result).toEqual(mockHighlight);
		});

		it('should throw error when highlight ID is missing', async () => {
			mockGetNodeParameter.mockReturnValue('');

			await expect(
				HighlightsResource.execute.call(
					mockExecuteFunctions as IExecuteFunctions,
					'getById',
					0
				)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('create', () => {
		it('should create highlight with required fields', async () => {
			const mockHighlight: Highlight = {
				id: 'highlight-1',
				bookmarkId: 'bookmark-1',
				text: 'Important text',
				startOffset: 10,
				endOffset: 25,
				color: 'yellow',
				createdAt: '2023-01-01T00:00:00Z',
			};

			mockGetNodeParameter
				.mockReturnValueOnce('bookmark-1') // bookmarkId
				.mockReturnValueOnce('Important text') // text
				.mockReturnValueOnce(10) // startOffset
				.mockReturnValueOnce(25) // endOffset
				.mockReturnValueOnce('yellow') // color
				.mockReturnValueOnce(''); // note

			mockApiRequest.mockResolvedValue({ data: mockHighlight });

			const result = await HighlightsResource.execute.call(
				mockExecuteFunctions as IExecuteFunctions,
				'create',
				0
			);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'POST',
				endpoint: 'highlights',
				body: {
					bookmarkId: 'bookmark-1',
					text: 'Important text',
					startOffset: 10,
					endOffset: 25,
					color: 'yellow',
				},
			});
			expect(result).toEqual(mockHighlight);
		});

		it('should create highlight with optional note', async () => {
			const mockHighlight: Highlight = {
				id: 'highlight-1',
				bookmarkId: 'bookmark-1',
				text: 'Important text',
				startOffset: 10,
				endOffset: 25,
				color: 'red',
				note: 'This is important',
				createdAt: '2023-01-01T00:00:00Z',
			};

			mockGetNodeParameter
				.mockReturnValueOnce('bookmark-1') // bookmarkId
				.mockReturnValueOnce('Important text') // text
				.mockReturnValueOnce(10) // startOffset
				.mockReturnValueOnce(25) // endOffset
				.mockReturnValueOnce('red') // color
				.mockReturnValueOnce('This is important'); // note

			mockApiRequest.mockResolvedValue({ data: mockHighlight });

			const result = await HighlightsResource.execute.call(
				mockExecuteFunctions as IExecuteFunctions,
				'create',
				0
			);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'POST',
				endpoint: 'highlights',
				body: {
					bookmarkId: 'bookmark-1',
					text: 'Important text',
					startOffset: 10,
					endOffset: 25,
					color: 'red',
					note: 'This is important',
				},
			});
			expect(result).toEqual(mockHighlight);
		});

		it('should throw error when required fields are missing', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('') // bookmarkId - empty
				.mockReturnValueOnce('Important text') // text
				.mockReturnValueOnce(10) // startOffset
				.mockReturnValueOnce(25) // endOffset
				.mockReturnValueOnce('yellow'); // color

			await expect(
				HighlightsResource.execute.call(
					mockExecuteFunctions as IExecuteFunctions,
					'create',
					0
				)
			).rejects.toThrow(NodeOperationError);
		});

		it('should throw error when start offset is negative', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('bookmark-1') // bookmarkId
				.mockReturnValueOnce('Important text') // text
				.mockReturnValueOnce(-1) // startOffset - negative
				.mockReturnValueOnce(25) // endOffset
				.mockReturnValueOnce('yellow'); // color

			await expect(
				HighlightsResource.execute.call(
					mockExecuteFunctions as IExecuteFunctions,
					'create',
					0
				)
			).rejects.toThrow('Start offset must be a non-negative number');
		});

		it('should throw error when end offset is not greater than start offset', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('bookmark-1') // bookmarkId
				.mockReturnValueOnce('Important text') // text
				.mockReturnValueOnce(25) // startOffset
				.mockReturnValueOnce(25) // endOffset - same as start
				.mockReturnValueOnce('yellow'); // color

			await expect(
				HighlightsResource.execute.call(
					mockExecuteFunctions as IExecuteFunctions,
					'create',
					0
				)
			).rejects.toThrow('End offset must be greater than start offset');
		});

		it('should throw error when text is empty', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('bookmark-1') // bookmarkId
				.mockReturnValueOnce('   ') // text - whitespace only
				.mockReturnValueOnce(10) // startOffset
				.mockReturnValueOnce(25) // endOffset
				.mockReturnValueOnce('yellow'); // color

			await expect(
				HighlightsResource.execute.call(
					mockExecuteFunctions as IExecuteFunctions,
					'create',
					0
				)
			).rejects.toThrow('Highlight text cannot be empty');
		});
	});

	describe('update', () => {
		it('should update highlight with text only', async () => {
			const mockHighlight: Highlight = {
				id: 'highlight-1',
				bookmarkId: 'bookmark-1',
				text: 'Updated text',
				startOffset: 10,
				endOffset: 25,
				createdAt: '2023-01-01T00:00:00Z',
			};

			mockGetNodeParameter
				.mockReturnValueOnce('highlight-1') // highlightId
				.mockReturnValueOnce('Updated text') // text
				.mockReturnValueOnce(undefined) // startOffset
				.mockReturnValueOnce(undefined) // endOffset
				.mockReturnValueOnce('') // color
				.mockReturnValueOnce(''); // note

			mockApiRequest.mockResolvedValue({ data: mockHighlight });

			const result = await HighlightsResource.execute.call(
				mockExecuteFunctions as IExecuteFunctions,
				'update',
				0
			);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'PATCH',
				endpoint: 'highlights/highlight-1',
				body: {
					text: 'Updated text',
				},
			});
			expect(result).toEqual(mockHighlight);
		});

		it('should update highlight with position offsets', async () => {
			const mockHighlight: Highlight = {
				id: 'highlight-1',
				bookmarkId: 'bookmark-1',
				text: 'Important text',
				startOffset: 15,
				endOffset: 30,
				createdAt: '2023-01-01T00:00:00Z',
			};

			mockGetNodeParameter
				.mockReturnValueOnce('highlight-1') // highlightId
				.mockReturnValueOnce('') // text
				.mockReturnValueOnce(15) // startOffset
				.mockReturnValueOnce(30) // endOffset
				.mockReturnValueOnce('') // color
				.mockReturnValueOnce(''); // note

			mockApiRequest.mockResolvedValue({ data: mockHighlight });

			const result = await HighlightsResource.execute.call(
				mockExecuteFunctions as IExecuteFunctions,
				'update',
				0
			);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'PATCH',
				endpoint: 'highlights/highlight-1',
				body: {
					startOffset: 15,
					endOffset: 30,
				},
			});
			expect(result).toEqual(mockHighlight);
		});

		it('should update highlight with note', async () => {
			const mockHighlight: Highlight = {
				id: 'highlight-1',
				bookmarkId: 'bookmark-1',
				text: 'Important text',
				startOffset: 10,
				endOffset: 25,
				note: 'Updated note',
				createdAt: '2023-01-01T00:00:00Z',
			};

			mockGetNodeParameter
				.mockReturnValueOnce('highlight-1') // highlightId
				.mockReturnValueOnce('') // text
				.mockReturnValueOnce(undefined) // startOffset
				.mockReturnValueOnce(undefined) // endOffset
				.mockReturnValueOnce('') // color
				.mockReturnValueOnce('Updated note'); // note

			mockApiRequest.mockResolvedValue({ data: mockHighlight });

			const result = await HighlightsResource.execute.call(
				mockExecuteFunctions as IExecuteFunctions,
				'update',
				0
			);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'PATCH',
				endpoint: 'highlights/highlight-1',
				body: {
					note: 'Updated note',
				},
			});
			expect(result).toEqual(mockHighlight);
		});

		it('should update highlight with color', async () => {
			const mockHighlight: Highlight = {
				id: 'highlight-1',
				bookmarkId: 'bookmark-1',
				text: 'Important text',
				startOffset: 10,
				endOffset: 25,
				color: 'red',
				createdAt: '2023-01-01T00:00:00Z',
			};

			mockGetNodeParameter
				.mockReturnValueOnce('highlight-1') // highlightId
				.mockReturnValueOnce('') // text
				.mockReturnValueOnce(undefined) // startOffset
				.mockReturnValueOnce(undefined) // endOffset
				.mockReturnValueOnce('red') // color
				.mockReturnValueOnce(''); // note

			mockApiRequest.mockResolvedValue({ data: mockHighlight });

			const result = await HighlightsResource.execute.call(
				mockExecuteFunctions as IExecuteFunctions,
				'update',
				0
			);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'PATCH',
				endpoint: 'highlights/highlight-1',
				body: {
					color: 'red',
				},
			});
			expect(result).toEqual(mockHighlight);
		});

		it('should throw error when highlight ID is missing', async () => {
			mockGetNodeParameter.mockReturnValueOnce(''); // highlightId - empty

			await expect(
				HighlightsResource.execute.call(
					mockExecuteFunctions as IExecuteFunctions,
					'update',
					0
				)
			).rejects.toThrow('Highlight ID is required');
		});

		it('should throw error when no fields are provided for update', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('highlight-1') // highlightId
				.mockReturnValueOnce('') // text - empty
				.mockReturnValueOnce(undefined) // startOffset
				.mockReturnValueOnce(undefined) // endOffset
				.mockReturnValueOnce('') // color - empty
				.mockReturnValueOnce(''); // note - empty

			await expect(
				HighlightsResource.execute.call(
					mockExecuteFunctions as IExecuteFunctions,
					'update',
					0
				)
			).rejects.toThrow('At least one field must be provided for update');
		});

		it('should throw error when start offset is negative', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('highlight-1') // highlightId
				.mockReturnValueOnce('') // text
				.mockReturnValueOnce(-1) // startOffset - negative
				.mockReturnValueOnce(undefined) // endOffset
				.mockReturnValueOnce(''); // color

			await expect(
				HighlightsResource.execute.call(
					mockExecuteFunctions as IExecuteFunctions,
					'update',
					0
				)
			).rejects.toThrow('Start offset must be a non-negative number');
		});

		it('should throw error when end offset is negative', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('highlight-1') // highlightId
				.mockReturnValueOnce('') // text
				.mockReturnValueOnce(undefined) // startOffset
				.mockReturnValueOnce(-1) // endOffset - negative
				.mockReturnValueOnce(''); // color

			await expect(
				HighlightsResource.execute.call(
					mockExecuteFunctions as IExecuteFunctions,
					'update',
					0
				)
			).rejects.toThrow('End offset must be a non-negative number');
		});

		it('should throw error when end offset is not greater than start offset', async () => {
			mockGetNodeParameter
				.mockReturnValueOnce('highlight-1') // highlightId
				.mockReturnValueOnce('') // text
				.mockReturnValueOnce(25) // startOffset
				.mockReturnValueOnce(20) // endOffset - less than start
				.mockReturnValueOnce(''); // color

			await expect(
				HighlightsResource.execute.call(
					mockExecuteFunctions as IExecuteFunctions,
					'update',
					0
				)
			).rejects.toThrow('End offset must be greater than start offset');
		});
	});

	describe('delete', () => {
		it('should delete highlight by ID', async () => {
			mockGetNodeParameter.mockReturnValue('highlight-1');
			mockApiRequest.mockResolvedValue({ data: null });

			const result = await HighlightsResource.execute.call(
				mockExecuteFunctions as IExecuteFunctions,
				'delete',
				0
			);

			expect(mockApiRequest).toHaveBeenCalledWith({
				method: 'DELETE',
				endpoint: 'highlights/highlight-1',
			});
			expect(result).toEqual({ success: true, id: 'highlight-1' });
		});

		it('should throw error when highlight ID is missing', async () => {
			mockGetNodeParameter.mockReturnValue('');

			await expect(
				HighlightsResource.execute.call(
					mockExecuteFunctions as IExecuteFunctions,
					'delete',
					0
				)
			).rejects.toThrow('Highlight ID is required');
		});
	});
});