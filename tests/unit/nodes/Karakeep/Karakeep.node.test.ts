import { Karakeep } from '../../../../nodes/Karakeep/Karakeep.node';
import { IExecuteFunctions, INodeExecutionData, INodePropertyOptions } from 'n8n-workflow';

describe('Karakeep Node', () => {
	let karakeepNode: Karakeep;

	beforeEach(() => {
		karakeepNode = new Karakeep();
	});

	describe('Node Description', () => {
		it('should have correct basic properties', () => {
			const { description } = karakeepNode;
			
			expect(description.displayName).toBe('Karakeep');
			expect(description.name).toBe('karakeep');
			expect(description.group).toEqual(['transform']);
			expect(description.version).toBe(1);
			expect(description.inputs).toEqual(['main']);
			expect(description.outputs).toEqual(['main']);
		});

		it('should require karakeepApi credentials', () => {
			const { description } = karakeepNode;
			
			expect(description.credentials).toEqual([
				{
					name: 'karakeepApi',
					required: true,
				},
			]);
		});

		it('should have resource selection with all six resource types', () => {
			const { description } = karakeepNode;
			const resourceProperty = description.properties.find(p => p.name === 'resource');
			
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.type).toBe('options');
			expect(resourceProperty?.options).toHaveLength(6);
			
			const resourceValues = (resourceProperty?.options as INodePropertyOptions[])?.map(o => o.value);
			expect(resourceValues).toEqual([
				'bookmarks',
				'lists',
				'tags',
				'highlights',
				'users',
				'assets',
			]);
		});

		it('should have correct operation options for bookmarks resource', () => {
			const { description } = karakeepNode;
			const bookmarksOperationProperty = description.properties.find(
				p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('bookmarks')
			);
			
			expect(bookmarksOperationProperty).toBeDefined();
			expect(bookmarksOperationProperty?.options).toHaveLength(8);
			
			const operationValues = (bookmarksOperationProperty?.options as INodePropertyOptions[])?.map(o => o.value);
			expect(operationValues).toEqual([
				'getAll',
				'getById',
				'create',
				'update',
				'delete',
				'search',
				'manageTags',
				'manageAssets',
			]);
		});

		it('should have correct operation options for lists resource', () => {
			const { description } = karakeepNode;
			const listsOperationProperty = description.properties.find(
				p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('lists')
			);
			
			expect(listsOperationProperty).toBeDefined();
			expect(listsOperationProperty?.options).toHaveLength(7);
			
			const operationValues = (listsOperationProperty?.options as INodePropertyOptions[])?.map(o => o.value);
			expect(operationValues).toEqual([
				'getAll',
				'getById',
				'create',
				'update',
				'delete',
				'addBookmarks',
				'removeBookmarks',
			]);
		});

		it('should have correct operation options for tags resource', () => {
			const { description } = karakeepNode;
			const tagsOperationProperty = description.properties.find(
				p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('tags')
			);
			
			expect(tagsOperationProperty).toBeDefined();
			expect(tagsOperationProperty?.options).toHaveLength(6);
			
			const operationValues = (tagsOperationProperty?.options as INodePropertyOptions[])?.map(o => o.value);
			expect(operationValues).toEqual([
				'getAll',
				'getById',
				'create',
				'update',
				'delete',
				'getTaggedBookmarks',
			]);
		});

		it('should have correct operation options for highlights resource', () => {
			const { description } = karakeepNode;
			const highlightsOperationProperty = description.properties.find(
				p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('highlights')
			);
			
			expect(highlightsOperationProperty).toBeDefined();
			expect(highlightsOperationProperty?.options).toHaveLength(5);
			
			const operationValues = (highlightsOperationProperty?.options as INodePropertyOptions[])?.map(o => o.value);
			expect(operationValues).toEqual([
				'getAll',
				'getById',
				'create',
				'update',
				'delete',
			]);
		});

		it('should have correct operation options for users resource', () => {
			const { description } = karakeepNode;
			const usersOperationProperty = description.properties.find(
				p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('users')
			);
			
			expect(usersOperationProperty).toBeDefined();
			expect(usersOperationProperty?.options).toHaveLength(2);
			
			const operationValues = (usersOperationProperty?.options as INodePropertyOptions[])?.map(o => o.value);
			expect(operationValues).toEqual([
				'getCurrentUser',
				'getUserStats',
			]);
		});

		it('should have correct operation options for assets resource', () => {
			const { description } = karakeepNode;
			const assetsOperationProperty = description.properties.find(
				p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes('assets')
			);
			
			expect(assetsOperationProperty).toBeDefined();
			expect(assetsOperationProperty?.options).toHaveLength(3);
			
			const operationValues = (assetsOperationProperty?.options as INodePropertyOptions[])?.map(o => o.value);
			expect(operationValues).toEqual([
				'upload',
				'getById',
				'download',
			]);
		});
	});

	describe('Node Structure', () => {
		it('should have dynamic operation selection based on resource', () => {
			const { description } = karakeepNode;
			
			// Check that each resource has its own operation property with displayOptions
			const operationProperties = description.properties.filter(p => p.name === 'operation');
			
			// Should have 6 operation properties, one for each resource
			expect(operationProperties).toHaveLength(6);
			
			// Each operation property should have displayOptions that show for specific resource
			operationProperties.forEach(prop => {
				expect(prop.displayOptions?.show?.resource).toBeDefined();
				expect(prop.displayOptions?.show?.resource).toHaveLength(1);
			});
		});

		it('should have proper node metadata', () => {
			const { description } = karakeepNode;
			
			expect(description.icon).toBe('file:logo.svg');
			expect(description.subtitle).toBe('={{$parameter["operation"] + ": " + $parameter["resource"]}}');
			expect(description.description).toBe('Interact with Karakeep bookmark management service');
			expect(description.defaults.name).toBe('Karakeep');
		});

		it('should have all required properties for n8n node', () => {
			const { description } = karakeepNode;
			
			// Check required n8n node properties
			expect(description.displayName).toBeDefined();
			expect(description.name).toBeDefined();
			expect(description.group).toBeDefined();
			expect(description.version).toBeDefined();
			expect(description.inputs).toBeDefined();
			expect(description.outputs).toBeDefined();
			expect(description.credentials).toBeDefined();
			expect(description.properties).toBeDefined();
		});
	});

	describe('Resource and Operation Mapping', () => {
		it('should have correct resource-operation mapping structure', () => {
			const { description } = karakeepNode;
			
			const resourceProperty = description.properties.find(p => p.name === 'resource');
			const resources = (resourceProperty?.options as INodePropertyOptions[])?.map(o => o.value);
			
			// Each resource should have a corresponding operation property
			resources?.forEach(resource => {
				const operationProperty = description.properties.find(
					p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes(resource)
				);
				expect(operationProperty).toBeDefined();
			});
		});

		it('should have proper default values', () => {
			const { description } = karakeepNode;
			
			const resourceProperty = description.properties.find(p => p.name === 'resource');
			expect(resourceProperty?.default).toBe('bookmarks');
			
			// Check that each operation property has a default
			const operationProperties = description.properties.filter(p => p.name === 'operation');
			operationProperties.forEach(prop => {
				expect(prop.default).toBeDefined();
			});
		});

		it('should have proper action descriptions for operations', () => {
			const { description } = karakeepNode;
			
			const operationProperties = description.properties.filter(p => p.name === 'operation');
			
			operationProperties.forEach(prop => {
				const options = prop.options as INodePropertyOptions[];
				options?.forEach(option => {
					expect(option.action).toBeDefined();
					expect(option.description).toBeDefined();
				});
			});
		});
	});
});