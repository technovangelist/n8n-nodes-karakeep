import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { KarakeepApiRequest } from '../../shared/KarakeepApiRequest';
import {
	Asset,
	UploadAssetInput,
	ResourceOperations,
} from '../../shared/types';
import { validateRequiredFields } from '../../shared/utils';

export class AssetsResource {
	/**
	 * Execute assets operations
	 */
	static async execute(
		this: IExecuteFunctions,
		operation: ResourceOperations['assets'],
		itemIndex: number,
	): Promise<any> {
		switch (operation) {
			case 'upload':
				return await AssetsResource.upload.call(this, itemIndex);
			case 'getById':
				return await AssetsResource.getById.call(this, itemIndex);
			case 'download':
				return await AssetsResource.download.call(this, itemIndex);
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" is not supported for assets`,
					{ itemIndex }
				);
		}
	}

	/**
	 * Upload a new asset
	 */
	private static async upload(this: IExecuteFunctions, itemIndex: number): Promise<Asset | any> {
		const uploadMethod = this.getNodeParameter('uploadMethod', itemIndex) as 'binary' | 'url';
		
		let uploadData: any = {};
		let headers: Record<string, string> = {};

		if (uploadMethod === 'binary') {
			// Handle binary data upload
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex) as string;
			const filename = this.getNodeParameter('filename', itemIndex, '') as string;
			const mimeType = this.getNodeParameter('mimeType', itemIndex, '') as string;

			if (!binaryPropertyName) {
				throw new NodeOperationError(
					this.getNode(),
					'Binary property name is required for binary upload',
					{ itemIndex }
				);
			}

			const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
			
			// Use filename from binary data if not provided
			const finalFilename = filename || binaryData.fileName || 'uploaded-file';
			const finalMimeType = mimeType || binaryData.mimeType || 'application/octet-stream';

			// Validate file size (example: 50MB limit)
			const maxSize = 50 * 1024 * 1024; // 50MB
			if (binaryData.data.length > maxSize) {
				throw new NodeOperationError(
					this.getNode(),
					`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`,
					{ itemIndex }
				);
			}

			// Validate file type
			const allowedMimeTypes = [
				'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
				'application/pdf',
				'text/plain', 'text/html', 'text/markdown',
				'application/json', 'application/xml',
				'video/mp4', 'video/webm', 'video/ogg',
				'audio/mp3', 'audio/wav', 'audio/ogg'
			];

			if (!allowedMimeTypes.includes(finalMimeType)) {
				throw new NodeOperationError(
					this.getNode(),
					`File type ${finalMimeType} is not supported. Allowed types: ${allowedMimeTypes.join(', ')}`,
					{ itemIndex }
				);
			}

			// Prepare form data for upload
			uploadData = {
				file: binaryData.data,
				filename: finalFilename,
				mimeType: finalMimeType,
			};

			headers['Content-Type'] = 'multipart/form-data';

		} else {
			// Handle URL-based upload
			const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
			const filename = this.getNodeParameter('filename', itemIndex, '') as string;

			// Validate required fields
			const validationErrors = validateRequiredFields({ fileUrl }, ['fileUrl']);
			if (validationErrors.length > 0) {
				throw new NodeOperationError(
					this.getNode(),
					`Validation failed: ${validationErrors.map(e => e.message).join(', ')}`,
					{ itemIndex }
				);
			}

			// Basic URL validation
			try {
				new URL(fileUrl);
			} catch {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid file URL format',
					{ itemIndex }
				);
			}

			uploadData = {
				url: fileUrl,
			};

			if (filename && filename.trim() !== '') {
				uploadData.filename = filename.trim();
			}
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'POST',
			endpoint: 'assets',
			body: uploadData,
			headers,
		});

		return response.data || response;
	}

	/**
	 * Get a specific asset by ID
	 */
	private static async getById(this: IExecuteFunctions, itemIndex: number): Promise<Asset | any> {
		const assetId = this.getNodeParameter('assetId', itemIndex) as string;
		
		if (!assetId) {
			throw new NodeOperationError(
				this.getNode(),
				'Asset ID is required',
				{ itemIndex }
			);
		}

		const response = await KarakeepApiRequest.apiRequest.call(this, {
			method: 'GET',
			endpoint: `assets/${assetId}`,
		});

		return response.data || response;
	}

	/**
	 * Download an asset
	 */
	private static async download(this: IExecuteFunctions, itemIndex: number): Promise<any> {
		const assetId = this.getNodeParameter('assetId', itemIndex) as string;
		const returnFormat = this.getNodeParameter('returnFormat', itemIndex, 'binary') as 'binary' | 'url';
		
		if (!assetId) {
			throw new NodeOperationError(
				this.getNode(),
				'Asset ID is required',
				{ itemIndex }
			);
		}

		if (returnFormat === 'url') {
			// Return just the download URL without downloading the file
			const response = await KarakeepApiRequest.apiRequest.call(this, {
				method: 'GET',
				endpoint: `assets/${assetId}`,
			});

			const asset = response.data || response;
			return {
				assetId,
				downloadUrl: (asset as any).url || (asset as any).downloadUrl,
				filename: (asset as any).filename,
				mimeType: (asset as any).mimeType,
				size: (asset as any).size,
			};
		} else {
			// Download the actual file and return as binary data
			const response = await KarakeepApiRequest.apiRequest.call(this, {
				method: 'GET',
				endpoint: `assets/${assetId}`,
			});

			const asset = response.data || response;
			const downloadUrl = (asset as any).url || (asset as any).downloadUrl;

			if (!downloadUrl) {
				throw new NodeOperationError(
					this.getNode(),
					'Asset download URL not available',
					{ itemIndex }
				);
			}

			// Download the file content
			const fileResponse = await KarakeepApiRequest.apiRequest.call(this, {
				method: 'GET',
				endpoint: downloadUrl.replace(/^.*\/api\/v1\//, ''), // Extract relative path
			});

			// Return binary data
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex, 'data') as string;
			
			// Handle the response data
			const fileData = fileResponse.data || fileResponse;
			
			return {
				json: {
					assetId,
					filename: (asset as any).filename,
					mimeType: (asset as any).mimeType,
					size: (asset as any).size,
					downloadedAt: new Date().toISOString(),
				},
				binary: {
					[binaryPropertyName]: {
						data: Buffer.isBuffer(fileData) ? fileData : Buffer.from(fileData as string),
						mimeType: (asset as any).mimeType,
						fileName: (asset as any).filename,
					},
				},
			};
		}
	}
}