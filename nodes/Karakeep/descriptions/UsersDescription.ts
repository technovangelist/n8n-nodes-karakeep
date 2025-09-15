import { INodeProperties } from 'n8n-workflow';

export const usersOperations: INodeProperties[] = [
	// No additional parameters needed for getCurrentUser operation
	// The operation will use the authenticated user's credentials to fetch their own profile

	// No additional parameters needed for getUserStats operation  
	// The operation will use the authenticated user's credentials to fetch their own statistics

	// Information display for users about the operations
	{
		displayName: 'User Operations Info',
		name: 'userOperationsInfo',
		type: 'notice',
		displayOptions: {
			show: {
				resource: ['users'],
			},
		},
		default: '',
		description: 'User operations work with the currently authenticated user. No additional parameters are required - the operations will use your API credentials to fetch your profile and statistics.',
	},
];