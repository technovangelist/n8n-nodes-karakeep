module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		sourceType: 'module',
		extraFileExtensions: ['.json'],
	},
	plugins: ['n8n-nodes-base'],
	extends: ['plugin:n8n-nodes-base/nodes'],
	rules: {
		'n8n-nodes-base/node-param-default-missing': 'off',
		'n8n-nodes-base/node-param-description-missing': 'off',
		'n8n-nodes-base/node-param-display-name-miscased': 'off',
		'n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options': 'off',
		'n8n-nodes-base/node-param-option-name-wrong-for-get-all': 'off',
		'n8n-nodes-base/node-param-resource-without-no-data-expression': 'off',
		'n8n-nodes-base/node-param-operation-without-no-data-expression': 'off',
		'n8n-nodes-base/node-param-options-type-unsorted-items': 'off',
		'n8n-nodes-base/node-param-collection-type-unsorted-items': 'off',
		'n8n-nodes-base/node-param-placeholder-miscased-id': 'off',
	},
};