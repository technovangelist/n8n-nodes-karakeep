import { INodeProperties } from 'n8n-workflow';

export const assetsOperations: INodeProperties[] = [
	// Asset ID parameter (used by getById and download operations)
	{
		displayName: 'Asset ID',
		name: 'assetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['assets'],
				operation: ['getById', 'download'],
			},
		},
		default: '',
		description: 'The ID of the asset to retrieve or download',
	},

	// Upload method selection
	{
		displayName: 'Upload Method',
		name: 'uploadMethod',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['assets'],
				operation: ['upload'],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binary',
				description: 'Upload file from binary data (from previous node)',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Upload file from a URL',
			},
		],
		default: 'binary',
		description: 'Method to use for uploading the asset',
	},

	// Binary upload parameters
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['assets'],
				operation: ['upload'],
				uploadMethod: ['binary'],
			},
		},
		default: 'data',
		description: 'Name of the binary property containing the file data',
		placeholder: 'data',
	},
	{
		displayName: 'Filename',
		name: 'filename',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['assets'],
				operation: ['upload'],
				uploadMethod: ['binary'],
			},
		},
		default: '',
		description: 'Custom filename for the uploaded asset (optional, will use binary data filename if not provided)',
		placeholder: 'my-file.pdf',
	},
	{
		displayName: 'MIME Type',
		name: 'mimeType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['assets'],
				operation: ['upload'],
				uploadMethod: ['binary'],
			},
		},
		options: [
			{
				name: 'Auto-detect',
				value: '',
				description: 'Automatically detect from binary data',
			},
			{
				name: 'JPEG Image',
				value: 'image/jpeg',
			},
			{
				name: 'PNG Image',
				value: 'image/png',
			},
			{
				name: 'GIF Image',
				value: 'image/gif',
			},
			{
				name: 'WebP Image',
				value: 'image/webp',
			},
			{
				name: 'SVG Image',
				value: 'image/svg+xml',
			},
			{
				name: 'PDF Document',
				value: 'application/pdf',
			},
			{
				name: 'Plain Text',
				value: 'text/plain',
			},
			{
				name: 'HTML',
				value: 'text/html',
			},
			{
				name: 'Markdown',
				value: 'text/markdown',
			},
			{
				name: 'JSON',
				value: 'application/json',
			},
			{
				name: 'XML',
				value: 'application/xml',
			},
			{
				name: 'MP4 Video',
				value: 'video/mp4',
			},
			{
				name: 'WebM Video',
				value: 'video/webm',
			},
			{
				name: 'MP3 Audio',
				value: 'audio/mp3',
			},
			{
				name: 'WAV Audio',
				value: 'audio/wav',
			},
		],
		default: '',
		description: 'MIME type of the file (optional, will auto-detect if not provided)',
	},

	// URL upload parameters
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['assets'],
				operation: ['upload'],
				uploadMethod: ['url'],
			},
		},
		default: '',
		description: 'URL of the file to upload',
		placeholder: 'https://example.com/file.pdf',
	},
	{
		displayName: 'Filename',
		name: 'filename',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['assets'],
				operation: ['upload'],
				uploadMethod: ['url'],
			},
		},
		default: '',
		description: 'Custom filename for the uploaded asset (optional, will extract from URL if not provided)',
		placeholder: 'my-file.pdf',
	},

	// Download parameters
	{
		displayName: 'Return Format',
		name: 'returnFormat',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['assets'],
				operation: ['download'],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binary',
				description: 'Download the file and return as binary data',
			},
			{
				name: 'Download URL',
				value: 'url',
				description: 'Return only the download URL without downloading the file',
			},
		],
		default: 'binary',
		description: 'How to return the asset data',
	},
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['assets'],
				operation: ['download'],
				returnFormat: ['binary'],
			},
		},
		default: 'data',
		description: 'Name of the binary property to store the downloaded file',
		placeholder: 'data',
	},
];