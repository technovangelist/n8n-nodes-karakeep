import { INodeProperties } from 'n8n-workflow';

export const highlightsOperations: INodeProperties[] = [
	// Highlight ID parameter (used by multiple operations)
	{
		displayName: 'Highlight ID',
		name: 'highlightId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['highlights'],
				operation: ['getById', 'update', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the highlight to operate on',
	},

	// Create highlight parameters
	{
		displayName: 'Bookmark ID',
		name: 'bookmarkId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['highlights'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The ID of the bookmark this highlight belongs to',
	},
	{
		displayName: 'Highlight Text',
		name: 'text',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['highlights'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The text content that is being highlighted',
		placeholder: 'Enter the highlighted text...',
	},
	{
		displayName: 'Start Offset',
		name: 'startOffset',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['highlights'],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'The character position where the highlight starts (0-based index)',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'End Offset',
		name: 'endOffset',
		type: 'number',
		required: true,
		displayOptions: {
			show: {
				resource: ['highlights'],
				operation: ['create'],
			},
		},
		default: 0,
		description: 'The character position where the highlight ends (0-based index)',
		typeOptions: {
			minValue: 1,
		},
	},
	{
		displayName: 'Color',
		name: 'color',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['highlights'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Yellow',
				value: 'yellow',
			},
			{
				name: 'Red',
				value: 'red',
			},
			{
				name: 'Green',
				value: 'green',
			},
			{
				name: 'Blue',
				value: 'blue',
			},
		],
		default: 'yellow',
		description: 'The color of the highlight',
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
				resource: ['highlights'],
				operation: ['create', 'update'],
			},
		},
		default: '',
		description: 'Optional note or annotation for the highlight',
		placeholder: 'Add a note about this highlight...',
	},

	// Update highlight parameters
	{
		displayName: 'Highlight Text',
		name: 'text',
		type: 'string',
		typeOptions: {
			rows: 3,
		},
		displayOptions: {
			show: {
				resource: ['highlights'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Update the highlighted text content (optional)',
		placeholder: 'Enter the updated highlighted text...',
	},
	{
		displayName: 'Start Offset',
		name: 'startOffset',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['highlights'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Update the character position where the highlight starts (optional)',
		typeOptions: {
			minValue: 0,
		},
	},
	{
		displayName: 'End Offset',
		name: 'endOffset',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['highlights'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Update the character position where the highlight ends (optional)',
		typeOptions: {
			minValue: 1,
		},
	},
	{
		displayName: 'Color',
		name: 'color',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['highlights'],
				operation: ['update'],
			},
		},
		options: [
			{
				name: 'Yellow',
				value: 'yellow',
			},
			{
				name: 'Red',
				value: 'red',
			},
			{
				name: 'Green',
				value: 'green',
			},
			{
				name: 'Blue',
				value: 'blue',
			},
		],
		default: '',
		description: 'Update the color of the highlight (optional)',
	},

	// Get All highlights parameters
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['highlights'],
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
				description: 'Number of highlights to return per page (max 100)',
			},
			{
				displayName: 'Bookmark ID',
				name: 'bookmarkId',
				type: 'string',
				default: '',
				description: 'Filter highlights by bookmark ID',
				placeholder: 'bookmark-id-123',
			},
		],
	},
];