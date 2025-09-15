import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { KarakeepApiRequest } from '../shared/KarakeepApiRequest';
import { ResourceType, ResourceOperations } from '../shared/types';
import { BookmarksResource } from './resources/BookmarksResource';
import { ListsResource } from './resources/ListsResource';
import { TagsResource } from './resources/TagsResource';
import { HighlightsResource } from './resources/HighlightsResource';
import { UsersResource } from './resources/UsersResource';
import { AssetsResource } from './resources/AssetsResource';
import { bookmarksOperations } from './descriptions/BookmarksDescription';
import { listsOperations } from './descriptions/ListsDescription';
import { tagsOperations } from './descriptions/TagsDescription';
import { highlightsOperations } from './descriptions/HighlightsDescription';
import { usersOperations } from './descriptions/UsersDescription';
import { assetsOperations } from './descriptions/AssetsDescription';

export class Karakeep implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Karakeep',
		name: 'karakeep',
		icon: 'file:karakeep.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Karakeep bookmark management service',
		defaults: {
			name: 'Karakeep',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'karakeepApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Bookmarks',
						value: 'bookmarks',
						description: 'Manage bookmarks and their content',
					},
					{
						name: 'Lists',
						value: 'lists',
						description: 'Manage bookmark collections and lists',
					},
					{
						name: 'Tags',
						value: 'tags',
						description: 'Manage bookmark tags and categories',
					},
					{
						name: 'Highlights',
						value: 'highlights',
						description: 'Manage text highlights and annotations',
					},
					{
						name: 'Users',
						value: 'users',
						description: 'Manage user accounts and permissions',
					},
					{
						name: 'Assets',
						value: 'assets',
						description: 'Manage files and media assets',
					},
				],
				default: 'bookmarks',
				description: 'The resource to operate on',
			},
			// Bookmarks Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['bookmarks'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Retrieve all bookmarks',
						action: 'Get all bookmarks',
					},
					{
						name: 'Get by ID',
						value: 'getById',
						description: 'Retrieve a specific bookmark by ID',
						action: 'Get a bookmark by ID',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new bookmark',
						action: 'Create a bookmark',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing bookmark',
						action: 'Update a bookmark',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a bookmark',
						action: 'Delete a bookmark',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search bookmarks with filters',
						action: 'Search bookmarks',
					},
					{
						name: 'Manage Tags',
						value: 'manageTags',
						description: 'Add or remove tags from a bookmark',
						action: 'Manage bookmark tags',
					},
					{
						name: 'Manage Assets',
						value: 'manageAssets',
						description: 'Add or remove assets from a bookmark',
						action: 'Manage bookmark assets',
					},
				],
				default: 'getAll',
				description: 'The operation to perform on bookmarks',
			},
			// Lists Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['lists'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Retrieve all lists',
						action: 'Get all lists',
					},
					{
						name: 'Get by ID',
						value: 'getById',
						description: 'Retrieve a specific list by ID',
						action: 'Get a list by ID',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new list',
						action: 'Create a list',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing list',
						action: 'Update a list',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a list',
						action: 'Delete a list',
					},
					{
						name: 'Add Bookmarks',
						value: 'addBookmarks',
						description: 'Add bookmarks to a list',
						action: 'Add bookmarks to list',
					},
					{
						name: 'Remove Bookmarks',
						value: 'removeBookmarks',
						description: 'Remove bookmarks from a list',
						action: 'Remove bookmarks from list',
					},
				],
				default: 'getAll',
				description: 'The operation to perform on lists',
			},
			// Tags Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['tags'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Retrieve all tags',
						action: 'Get all tags',
					},
					{
						name: 'Get by ID',
						value: 'getById',
						description: 'Retrieve a specific tag by ID',
						action: 'Get a tag by ID',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new tag',
						action: 'Create a tag',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing tag',
						action: 'Update a tag',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a tag',
						action: 'Delete a tag',
					},
					{
						name: 'Get Tagged Bookmarks',
						value: 'getTaggedBookmarks',
						description: 'Get all bookmarks with a specific tag',
						action: 'Get bookmarks by tag',
					},
				],
				default: 'getAll',
				description: 'The operation to perform on tags',
			},
			// Highlights Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['highlights'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Retrieve all highlights',
						action: 'Get all highlights',
					},
					{
						name: 'Get by ID',
						value: 'getById',
						description: 'Retrieve a specific highlight by ID',
						action: 'Get a highlight by ID',
					},
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new highlight',
						action: 'Create a highlight',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing highlight',
						action: 'Update a highlight',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a highlight',
						action: 'Delete a highlight',
					},
				],
				default: 'getAll',
				description: 'The operation to perform on highlights',
			},
			// Users Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['users'],
					},
				},
				options: [
					{
						name: 'Get Current User',
						value: 'getCurrentUser',
						description: 'Get current user information',
						action: 'Get current user',
					},
					{
						name: 'Get User Stats',
						value: 'getUserStats',
						description: 'Get current user statistics',
						action: 'Get user statistics',
					},
				],
				default: 'getCurrentUser',
				description: 'The operation to perform on users',
			},
			// Assets Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['assets'],
					},
				},
				options: [
					{
						name: 'Upload',
						value: 'upload',
						description: 'Upload a new asset',
						action: 'Upload an asset',
					},
					{
						name: 'Get by ID',
						value: 'getById',
						description: 'Retrieve a specific asset by ID',
						action: 'Get an asset by ID',
					},
					{
						name: 'Download',
						value: 'download',
						description: 'Download an asset',
						action: 'Download an asset',
					},
				],
				default: 'upload',
				description: 'The operation to perform on assets',
			},
			...bookmarksOperations,
			...listsOperations,
			...tagsOperations,
			...highlightsOperations,
			...usersOperations,
			...assetsOperations,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as ResourceType;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				// Route to appropriate resource handler
				switch (resource) {
					case 'bookmarks':
						responseData = await BookmarksResource.execute.call(this, operation as ResourceOperations['bookmarks'], i);
						break;
					case 'lists':
						responseData = await ListsResource.execute.call(this, operation as ResourceOperations['lists'], i);
						break;
					case 'tags':
						responseData = await TagsResource.execute.call(this, operation as ResourceOperations['tags'], i);
						break;
					case 'highlights':
						responseData = await HighlightsResource.execute.call(this, operation as ResourceOperations['highlights'], i);
						break;
					case 'users':
						responseData = await UsersResource.execute.call(this, operation as ResourceOperations['users'], i);
						break;
					case 'assets':
						responseData = await AssetsResource.execute.call(this, operation as ResourceOperations['assets'], i);
						break;
					default:
						throw new NodeOperationError(
							this.getNode(),
							`The resource "${resource}" is not supported`,
							{ itemIndex: i }
						);
				}

				// Handle array responses
				if (Array.isArray(responseData)) {
					responseData.forEach((item) => {
						returnData.push({
							json: item,
							pairedItem: { item: i },
						});
					});
				} else {
					// Handle binary data responses (e.g., from asset download)
					if (responseData && responseData.binary && responseData.json) {
						returnData.push({
							json: responseData.json,
							binary: responseData.binary,
							pairedItem: { item: i },
						});
					} else {
						returnData.push({
							json: responseData,
							pairedItem: { item: i },
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}












}