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
		'n8n-nodes-base/node-param-default-missing': 'error',
		'n8n-nodes-base/node-param-description-missing': 'error',
		'n8n-nodes-base/node-param-display-name-miscased': 'error',
		'n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options': 'error',
		'n8n-nodes-base/node-param-option-name-wrong-for-get-all': 'error',
		'n8n-nodes-base/node-param-resource-without-no-data-expression': 'error',
		'n8n-nodes-base/node-param-operation-without-no-data-expression': 'error',
	},
};