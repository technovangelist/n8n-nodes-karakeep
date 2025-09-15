import { Karakeep } from '../../nodes/Karakeep/Karakeep.node';

describe('Karakeep Node Integration', () => {
	let karakeepNode: Karakeep;

	beforeEach(() => {
		karakeepNode = new Karakeep();
	});

	it('should instantiate the node successfully', () => {
		expect(karakeepNode).toBeInstanceOf(Karakeep);
		expect(karakeepNode.description).toBeDefined();
	});

	it('should have all required node properties', () => {
		const { description } = karakeepNode;
		
		// Verify core n8n node structure
		expect(description.displayName).toBe('Karakeep');
		expect(description.name).toBe('karakeep');
		expect(description.version).toBe(1);
		expect(description.inputs).toEqual(['main']);
		expect(description.outputs).toEqual(['main']);
		
		// Verify credentials requirement
		expect(description.credentials).toHaveLength(1);
		expect(description.credentials?.[0].name).toBe('karakeepApi');
		expect(description.credentials?.[0].required).toBe(true);
	});

	it('should have resource and operation selection interface', () => {
		const { description } = karakeepNode;
		
		// Find resource property
		const resourceProperty = description.properties.find(p => p.name === 'resource');
		expect(resourceProperty).toBeDefined();
		expect(resourceProperty?.type).toBe('options');
		
		// Find operation properties
		const operationProperties = description.properties.filter(p => p.name === 'operation');
		expect(operationProperties).toHaveLength(6); // One for each resource
		
		// Verify each operation property has displayOptions
		operationProperties.forEach(prop => {
			expect(prop.displayOptions?.show?.resource).toBeDefined();
		});
	});

	it('should have proper resource-operation mapping', () => {
		const { description } = karakeepNode;
		
		const expectedResourceOperations = {
			bookmarks: ['getAll', 'getById', 'create', 'update', 'delete', 'search', 'manageTags', 'manageAssets'],
			lists: ['getAll', 'getById', 'create', 'update', 'delete', 'addBookmarks', 'removeBookmarks'],
			tags: ['getAll', 'getById', 'create', 'update', 'delete', 'getTaggedBookmarks'],
			highlights: ['getAll', 'getById', 'create', 'update', 'delete'],
			users: ['getCurrentUser', 'getUserStats'],
			assets: ['upload', 'getById', 'download'],
		};

		Object.entries(expectedResourceOperations).forEach(([resource, expectedOps]) => {
			const operationProperty = description.properties.find(
				p => p.name === 'operation' && p.displayOptions?.show?.resource?.includes(resource)
			);
			
			expect(operationProperty).toBeDefined();
			expect(operationProperty?.options).toHaveLength(expectedOps.length);
			
			const actualOps = (operationProperty?.options as any[])?.map(o => o.value);
			expect(actualOps).toEqual(expectedOps);
		});
	});

	it('should have proper node metadata for n8n', () => {
		const { description } = karakeepNode;
		
		expect(description.icon).toBe('file:logo.svg');
		expect(description.group).toEqual(['transform']);
		expect(description.subtitle).toBe('={{$parameter["operation"] + ": " + $parameter["resource"]}}');
		expect(description.description).toBe('Interact with Karakeep bookmark management service');
		expect(description.defaults.name).toBe('Karakeep');
	});
});