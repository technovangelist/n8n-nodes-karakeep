import { INodeProperties } from 'n8n-workflow';

export const tagsOperations: INodeProperties[] = [
	// Tag ID parameter (used by multiple operations)
	{
		displayName: 'Tag ID',
		name: 'tagId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tags'],
				operation: ['getById', 'update', 'delete', 'getTaggedBookmarks'],
			},
		},
		default: '',
		description: 'The ID of the tag to operate on',
	},

	// Tag name parameter (used by create and update operations)
	{
		displayName: 'Tag Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['tags'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'The name of the tag (max 100 characters)',
		placeholder: 'Enter tag name',
	},

	// Prevent duplicates option
	{
		displayName: 'Prevent Duplicates',
		name: 'preventDuplicates',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['tags'],
				operation: ['create', 'update'],
			},
		},
		default: true,
		description: 'Whether to check for existing tags with the same name and prevent creation/update if found',
	},

	// Include usage stats for getById
	{
		displayName: 'Include Usage Statistics',
		name: 'includeUsageStats',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['tags'],
				operation: ['getById'],
			},
		},
		default: false,
		description: 'Whether to include usage statistics (bookmark count, etc.) in the response',
	},

	// Force delete option
	{
		displayName: 'Force Delete',
		name: 'forceDelete',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['tags'],
				operation: ['delete'],
			},
		},
		default: false,
		description: 'Whether to force delete the tag even if it is attached to bookmarks (will remove tag from all bookmarks)',
	},

	// Get All tags parameters
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['tags'],
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
				description: 'Number of tags to return per page (max 100)',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{
						name: 'Name',
						value: 'name',
						description: 'Sort by tag name',
					},
					{
						name: 'Created Date',
						value: 'createdAt',
						description: 'Sort by creation date',
					},
					{
						name: 'Usage Count',
						value: 'usageCount',
						description: 'Sort by number of bookmarks using this tag',
					},
				],
				default: 'name',
				description: 'Field to sort tags by',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				options: [
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
				default: 'asc',
				description: 'Order to sort the results',
			},
			{
				displayName: 'Include Usage Statistics',
				name: 'includeUsageStats',
				type: 'boolean',
				default: false,
				description: 'Whether to include usage statistics (bookmark count, etc.) for each tag',
			},
		],
	},

	// Get Tagged Bookmarks parameters
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['tags'],
				operation: ['getTaggedBookmarks'],
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
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{
						name: 'Created Date',
						value: 'createdAt',
						description: 'Sort by bookmark creation date',
					},
					{
						name: 'Updated Date',
						value: 'updatedAt',
						description: 'Sort by bookmark last update date',
					},
					{
						name: 'Title',
						value: 'title',
						description: 'Sort by bookmark title',
					},
					{
						name: 'URL',
						value: 'url',
						description: 'Sort by bookmark URL',
					},
				],
				default: 'createdAt',
				description: 'Field to sort bookmarks by',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				options: [
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
				default: 'desc',
				description: 'Order to sort the results',
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
				description: 'Filter bookmarks by archived status',
			},
			{
				displayName: 'Include Content',
				name: 'includeContent',
				type: 'boolean',
				default: false,
				description: 'Whether to include bookmark content in the response (may be large for some bookmarks)',
			},
		],
	},
];