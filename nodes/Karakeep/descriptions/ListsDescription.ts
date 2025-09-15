import { INodeProperties } from 'n8n-workflow';

export const listsOperations: INodeProperties[] = [
	// List ID parameter (used by multiple operations)
	{
		displayName: 'List ID',
		name: 'listId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lists'],
				operation: ['getById', 'update', 'delete', 'addBookmarks', 'removeBookmarks'],
			},
		},
		default: '',
		description: 'The ID of the list to operate on',
	},

	// Create list parameters
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lists'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The name of the list (max 100 characters)',
		placeholder: 'My Reading List',
	},
	{
		displayName: 'Icon',
		name: 'icon',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lists'],
				operation: ['create'],
			},
		},
		default: '📚',
		description: 'Icon for the list (emoji or icon identifier)',
		placeholder: '📚',
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
				resource: ['lists'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Optional description of the list (max 500 characters)',
		placeholder: 'A collection of articles to read later',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['lists'],
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				name: 'Manual',
				value: 'manual',
				description: 'Manually curated list',
			},
			{
				name: 'Smart',
				value: 'smart',
				description: 'Automatically populated based on query',
			},
		],
		default: 'manual',
		description: 'Type of list - manual or smart (query-based)',
	},
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lists'],
				operation: ['create', 'update'],
				type: ['smart'],
			},
		},
		default: '',
		description: 'Query for smart lists (required when type is smart). <a href="https://docs.karakeep.app/guides/search-query-language" target="_blank">Learn about search query syntax</a>.',
		placeholder: 'tag:javascript OR tag:react',
	},
	{
		displayName: 'Parent List ID',
		name: 'parentId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lists'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'ID of parent list for nested organization',
		placeholder: 'parent-list-ID',
	},

	// Update list parameters
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lists'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Update the name of the list (max 100 characters)',
		placeholder: 'My Updated Reading List',
	},
	{
		displayName: 'Icon',
		name: 'icon',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lists'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Update the icon for the list',
		placeholder: '📚',
	},

	// Get All lists parameters
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['lists'],
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
				},
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Is Public',
				name: 'isPublic',
				type: 'options',
				options: [
					{
						name: 'All Lists',
						value: '',
						description: 'Return both public and private lists',
					},
					{
						name: 'Public Only',
						value: true,
						description: 'Return only public lists',
					},
					{
						name: 'Private Only',
						value: false,
						description: 'Return only private lists',
					},
				],
				default: '',
				description: 'Filter by list visibility',
			},
		],
	},

	// Bookmark management parameters
	{
		displayName: 'Bookmark Input Method',
		name: 'bookmarkInputMethod',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['lists'],
				operation: ['addBookmarks', 'removeBookmarks'],
			},
		},
		options: [
			{
				name: 'Single Bookmark',
				value: 'single',
				description: 'Add or remove a single bookmark',
			},
			{
				name: 'Multiple Bookmarks',
				value: 'multiple',
				description: 'Add or remove multiple bookmarks at once',
			},
		],
		default: 'single',
		description: 'How to specify the bookmarks to add or remove',
	},
	{
		displayName: 'Bookmark ID',
		name: 'bookmarkId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lists'],
				operation: ['addBookmarks', 'removeBookmarks'],
				bookmarkInputMethod: ['single'],
			},
		},
		default: '',
		description: 'The ID of the bookmark to add or remove',
	},
	{
		displayName: 'Bookmark IDs',
		name: 'bookmarkIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lists'],
				operation: ['addBookmarks', 'removeBookmarks'],
				bookmarkInputMethod: ['multiple'],
			},
		},
		default: '',
		description: 'Comma-separated list of bookmark IDs to add or remove',
		placeholder: 'bookmark-ID-1, bookmark-id-2, bookmark-id-3',
	},
];