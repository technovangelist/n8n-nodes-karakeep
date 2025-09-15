import { INodeProperties } from 'n8n-workflow';

export const bookmarksOperations: INodeProperties[] = [
	// Bookmark ID parameter (used by multiple operations)
	{
		displayName: 'Bookmark ID',
		name: 'bookmarkId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['getById', 'update', 'delete', 'manageTags', 'manageAssets'],
			},
		},
		default: '',
		description: 'The ID of the bookmark to operate on',
	},

	// Bookmark type selection
	{
		displayName: 'Bookmark Type',
		name: 'bookmarkType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Link',
				value: 'link',
				description: 'Create a bookmark from a URL',
			},
			{
				name: 'Text',
				value: 'text',
				description: 'Create a text-based bookmark',
			},
			{
				name: 'Asset',
				value: 'asset',
				description: 'Create a bookmark from an asset (image/PDF)',
			},
		],
		default: 'link',
		description: 'The type of bookmark to create',
	},

	// Link bookmark parameters
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create'],
				bookmarkType: ['link'],
			},
		},
		default: '',
		description: 'The URL to bookmark',
		placeholder: 'https://example.com',
	},

	// Text bookmark parameters
	{
		displayName: 'Text Content',
		name: 'text',
		type: 'string',
		typeOptions: {
			rows: 5,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create'],
				bookmarkType: ['text'],
			},
		},
		default: '',
		description: 'The text content for the bookmark',
		placeholder: 'Enter your text content here...',
	},
	{
		displayName: 'Source URL',
		name: 'sourceUrl',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create'],
				bookmarkType: ['text'],
			},
		},
		default: '',
		description: 'Optional source URL for the text content',
		placeholder: 'https://source-website.com',
	},

	// Asset bookmark parameters
	{
		displayName: 'Asset Type',
		name: 'assetType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create'],
				bookmarkType: ['asset'],
			},
		},
		options: [
			{
				name: 'Image',
				value: 'image',
			},
			{
				name: 'PDF',
				value: 'pdf',
			},
		],
		default: 'image',
		description: 'The type of asset',
	},
	{
		displayName: 'Asset ID',
		name: 'assetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create'],
				bookmarkType: ['asset'],
			},
		},
		default: '',
		description: 'The ID of the asset to bookmark',
	},
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create'],
				bookmarkType: ['asset'],
			},
		},
		default: '',
		description: 'Optional file name for the asset',
	},
	{
		displayName: 'Source URL',
		name: 'assetSourceUrl',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create'],
				bookmarkType: ['asset'],
			},
		},
		default: '',
		description: 'Optional source URL for the asset',
		placeholder: 'https://source-website.com',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'The title of the bookmark (optional, max 1000 characters)',
	},
	{
		displayName: 'Note',
		name: 'note',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Personal note about the bookmark (optional)',
	},
	{
		displayName: 'Tags',
		name: 'tags',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Comma-separated list of tags to apply to the bookmark (optional)',
		placeholder: 'tag1, tag2, tag3',
	},
	{
		displayName: 'Archived',
		name: 'archived',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create', 'update'],
			},
		},
		default: false,
		description: 'Whether the bookmark should be archived',
	},
	{
		displayName: 'Favourited',
		name: 'favourited',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create', 'update'],
			},
		},
		default: false,
		description: 'Whether the bookmark should be marked as favourite',
	},
	{
		displayName: 'Summary',
		name: 'summary',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Summary of the bookmark content (optional)',
	},
	{
		displayName: 'Crawl Priority',
		name: 'crawlPriority',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Normal',
				value: 'normal',
			},
			{
				name: 'Low',
				value: 'low',
			},
		],
		default: 'normal',
		description: 'Priority for crawling the bookmark content',
	},

	// Additional update fields
	{
		displayName: 'URL',
		name: 'updateUrl',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Update the URL of the bookmark',
		placeholder: 'https://example.com',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Description of the bookmark content (optional)',
	},
	{
		displayName: 'Author',
		name: 'author',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Author of the bookmarked content (optional)',
	},
	{
		displayName: 'Publisher',
		name: 'publisher',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Publisher of the bookmarked content (optional)',
	},
	{
		displayName: 'Date Published',
		name: 'datePublished',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Publication date of the content (optional)',
	},
	{
		displayName: 'Date Modified',
		name: 'dateModified',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Last modification date of the content (optional)',
	},
	{
		displayName: 'Text Content',
		name: 'textContent',
		type: 'string',
		typeOptions: {
			rows: 5,
		},
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Text content of the bookmark (optional)',
	},
	{
		displayName: 'Asset Content',
		name: 'assetContent',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Asset content metadata (optional)',
	},
	{
		displayName: 'Created At',
		name: 'createdAt',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Override the creation date of the bookmark (optional)',
	},

	// Get All bookmarks parameters
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['getAll'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description: 'Page number for pagination',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 20,
				description: 'Number of bookmarks to return per page (max 100)',
			},
			{
				displayName: 'Archived',
				name: 'archived',
				type: 'options',
				options: [
					{
						name: 'All',
						value: 'all',
					},
					{
						name: 'Archived Only',
						value: 'true',
					},
					{
						name: 'Not Archived Only',
						value: 'false',
					},
				],
				default: 'all',
				description: 'Filter by archived status',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags to filter by',
				placeholder: 'tag1, tag2',
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				description: 'Filter bookmarks created after this date',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'dateTime',
				default: '',
				description: 'Filter bookmarks created before this date',
			},
		],
	},

	// Search bookmarks parameters
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['search'],
			},
		},
		default: '',
		description: 'Search query to find bookmarks. <a href="https://docs.karakeep.app/guides/search-query-language" target="_blank">Learn about search query syntax</a>',
		placeholder: 'Enter search terms',
	},
	{
		displayName: 'Search Options',
		name: 'searchOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['search'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				options: [
					{
						name: 'Relevance',
						value: 'relevance',
						description: 'Sort by relevance to the search query',
					},
					{
						name: 'Ascending',
						value: 'asc',
						description: 'Sort in ascending order',
					},
					{
						name: 'Descending',
						value: 'desc',
						description: 'Sort in descending order',
					},
				],
				default: 'relevance',
				description: 'Order to sort the search results',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				default: 20,
				description: 'Maximum number of results to return',
			},
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				default: '',
				description: 'Cursor for pagination (from previous search response)',
				placeholder: 'cursor-string-from-previous-response',
			},
			{
				displayName: 'Include Content',
				name: 'includeContent',
				type: 'boolean',
				default: true,
				description: 'Whether to include bookmark content in the response (may be large for some bookmarks)',
			},
		],
	},

	// Tag management parameters
	{
		displayName: 'Tag Action',
		name: 'tagAction',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['manageTags'],
			},
		},
		options: [
			{
				name: 'Add Tags',
				value: 'add',
				description: 'Add tags to the bookmark',
			},
			{
				name: 'Remove Tags',
				value: 'remove',
				description: 'Remove tags from the bookmark',
			},
		],
		default: 'add',
		description: 'Whether to add or remove tags',
	},
	{
		displayName: 'Tags Input Method',
		name: 'tagsInputMethod',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['manageTags'],
			},
		},
		options: [
			{
				name: 'Tag Names Only',
				value: 'names',
				description: 'Provide only tag names (system will find/create tag IDs)',
			},
			{
				name: 'Tag IDs and Names',
				value: 'idsAndNames',
				description: 'Provide both tag IDs and names as JSON',
			},
		],
		default: 'names',
		description: 'How to specify the tags to manage',
	},
	{
		displayName: 'Tag Names',
		name: 'tagsToManage',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['manageTags'],
				tagsInputMethod: ['names'],
			},
		},
		default: '',
		description: 'Comma-separated list of tag names to add or remove',
		placeholder: 'tag1, tag2, tag3',
	},
	{
		displayName: 'Tags JSON',
		name: 'tagsJson',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['manageTags'],
				tagsInputMethod: ['idsAndNames'],
			},
		},
		default: '[\n  {\n    "tagId": "tag-id-1",\n    "tagName": "tag name 1"\n  },\n  {\n    "tagId": "tag-id-2",\n    "tagName": "tag name 2"\n  }\n]',
		description: 'JSON array of tag objects with tagId and tagName properties',
	},

	// Asset management parameters
	{
		displayName: 'Asset Action',
		name: 'assetAction',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['manageAssets'],
			},
		},
		options: [
			{
				name: 'Attach Asset',
				value: 'attach',
				description: 'Attach a new asset to the bookmark',
			},
			{
				name: 'Replace Asset',
				value: 'replace',
				description: 'Replace an existing asset with a new one',
			},
			{
				name: 'Detach Asset',
				value: 'detach',
				description: 'Detach an asset from the bookmark',
			},
		],
		default: 'attach',
		description: 'The asset operation to perform',
	},
	{
		displayName: 'Asset ID',
		name: 'assetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['manageAssets'],
				assetAction: ['attach'],
			},
		},
		default: '',
		description: 'The ID of the asset to attach',
	},
	{
		displayName: 'Asset Type',
		name: 'assetType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['manageAssets'],
				assetAction: ['attach'],
			},
		},
		options: [
			{
				name: 'Link HTML Content',
				value: 'linkHtmlContent',
			},
			{
				name: 'Screenshot',
				value: 'screenshot',
			},
			{
				name: 'Asset Screenshot',
				value: 'assetScreenshot',
			},
			{
				name: 'Banner Image',
				value: 'bannerImage',
			},
			{
				name: 'Full Page Archive',
				value: 'fullPageArchive',
			},
			{
				name: 'Video',
				value: 'video',
			},
			{
				name: 'Bookmark Asset',
				value: 'bookmarkAsset',
			},
			{
				name: 'Precrawled Archive',
				value: 'precrawledArchive',
			},
			{
				name: 'Unknown',
				value: 'unknown',
			},
		],
		default: 'screenshot',
		description: 'The type of asset to attach',
	},
	{
		displayName: 'Current Asset ID',
		name: 'currentAssetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['manageAssets'],
				assetAction: ['replace', 'detach'],
			},
		},
		default: '',
		description: 'The ID of the existing asset to replace or detach',
	},
	{
		displayName: 'New Asset ID',
		name: 'newAssetId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['bookmarks'],
				operation: ['manageAssets'],
				assetAction: ['replace'],
			},
		},
		default: '',
		description: 'The ID of the new asset to replace with',
	},
];