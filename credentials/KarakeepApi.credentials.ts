import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class KarakeepApi implements ICredentialType {
	name = 'karakeepApi';
	displayName = 'Karakeep API';
	documentationUrl = 'https://docs.karakeep.com/api';
	properties: INodeProperties[] = [
		{
			displayName: 'Instance URL',
			name: 'instanceUrl',
			type: 'string',
			default: 'https://try.karakeep.app',
			placeholder: 'https://your-instance.karakeep.app',
			description: 'The URL of your Karakeep instance',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			placeholder: 'your-api-key-here',
			description: 'Your Karakeep API key',
			required: true,
		},
	];

	// Generic authentication method for API requests
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// Test the credentials by making a simple API call
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.instanceUrl}}',
			url: '/api/v1/users/me',
			method: 'GET',
		},
	};
}