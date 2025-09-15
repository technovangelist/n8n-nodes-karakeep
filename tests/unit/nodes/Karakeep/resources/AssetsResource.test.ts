import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { AssetsResource } from '../../../../../nodes/Karakeep/resources/AssetsResource';
import { KarakeepApiRequest } from '../../../../../nodes/shared/KarakeepApiRequest';

// Mock the KarakeepApiRequest
jest.mock('../../../../../nodes/shared/KarakeepApiRequest');
const mockApiRequest = KarakeepApiRequest.apiRequest as jest.MockedFunction<typeof KarakeepApiRequest.apiRequest>;

// Mock the utils
jest.mock('../../../../../nodes/shared/utils', () => ({
	validateRequiredFields: jest.fn((data: any, required: string[]) => {
		const errors: any[] = [];
		required.forEach(field => {
			if (!data[field]) {
				errors.push({ field, message: `${field} is required` });
			}
		});
		return errors;
	}),
}));

// Mock IExecuteFunctions
const mockExecuteFunctions = {
	getNodeParameter: jest.fn(),
	getNode: jest.fn(() => ({
		name: 'Test Node',
		id: 'test-id',
		typeVersion: 1,
		type: 'karakeep',
		position: [0, 0],
		parameters: {}
	})),
	helpers: {
		assertBinaryData: jest.fn(),
	} as any,
} as unknown as IExecuteFunctions;

describe('AssetsResource', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('execute', () => {
		it('should route to upload operation', async () => {
			const uploadSpy = jest.spyOn(AssetsResource as any, 'upload').mockResolvedValue({ id: 'asset-1' });

			const result = await AssetsResource.execute.call(
				mockExecuteFunctions,
				'upload',
				0
			);

			expect(uploadSpy).toHaveBeenCalledWith(0);
			expect(result).toEqual({ id: 'asset-1' });
		});

		it('should route to getById operation', async () => {
			const getByIdSpy = jest.spyOn(AssetsResource as any, 'getById').mockResolvedValue({ id: 'asset-1' });

			const result = await AssetsResource.execute.call(
				mockExecuteFunctions,
				'getById',
				0
			);

			expect(getByIdSpy).toHaveBeenCalledWith(0);
			expect(result).toEqual({ id: 'asset-1' });
		});

		it('should route to download operation', async () => {
			const downloadSpy = jest.spyOn(AssetsResource as any, 'download').mockResolvedValue({ id: 'asset-1' });

			const result = await AssetsResource.execute.call(
				mockExecuteFunctions,
				'download',
				0
			);

			expect(downloadSpy).toHaveBeenCalledWith(0);
			expect(result).toEqual({ id: 'asset-1' });
		});

		it('should throw error for unsupported operation', async () => {
			await expect(
				AssetsResource.execute.call(
					mockExecuteFunctions,
					'unsupported' as any,
					0
				)
			).rejects.toThrow(NodeOperationError);
		});
	});

	describe('basic functionality', () => {
		it('should have upload method', () => {
			expect(typeof (AssetsResource as any).upload).toBe('function');
		});

		it('should have getById method', () => {
			expect(typeof (AssetsResource as any).getById).toBe('function');
		});

		it('should have download method', () => {
			expect(typeof (AssetsResource as any).download).toBe('function');
		});
	});
});