import {
	KarakeepResponse,
	KarakeepError,
	KarakeepCredentials,
	Content,
	Tag,
	Asset,
	Bookmark,
	List,
	Highlight,
	User,
	UserStats,
	ApiRequestOptions,
	PaginationParams,
	BookmarkSearchParams,
	ListFilterParams,
	ResourceType,
	ResourceOperations,
	CreateBookmarkInput,
	UpdateBookmarkInput,
	CreateListInput,
	UpdateListInput,
	CreateTagInput,
	UpdateTagInput,
	CreateHighlightInput,
	UpdateHighlightInput,
	UploadAssetInput,
	ValidationResult,
	ValidationError,
	HttpResponse,
	RetryConfig,
	RateLimitInfo,
	FileUploadProgress,
	BulkOperationResult,
	BulkOperationError,
	EndpointConfig,
	TransformationRule,
	CacheEntry,
	CacheOptions,
	WebhookPayload,
} from '../../../nodes/shared/types';

describe('Type Definitions', () => {
	describe('Core API Types', () => {
		it('should define KarakeepResponse correctly', () => {
			const response: KarakeepResponse<string> = {
				data: 'test',
				meta: {
					pagination: {
						page: 1,
						limit: 10,
						total: 100,
					},
				},
			};

			expect(response.data).toBe('test');
			expect(response.meta?.pagination?.page).toBe(1);
		});

		it('should define KarakeepError correctly', () => {
			const error: KarakeepError = {
				code: 'TEST_ERROR',
				message: 'Test error message',
				statusCode: 400,
				details: { field: 'test' },
			};

			expect(error.code).toBe('TEST_ERROR');
			expect(error.statusCode).toBe(400);
		});

		it('should define KarakeepCredentials correctly', () => {
			const credentials: KarakeepCredentials = {
				instanceUrl: 'https://try.karakeep.app',
				apiKey: 'test-api-key',
			};

			expect(credentials.instanceUrl).toBe('https://try.karakeep.app');
			expect(credentials.apiKey).toBe('test-api-key');
		});
	});

	describe('Resource Types', () => {
		it('should define Bookmark correctly', () => {
			const bookmark: Bookmark = {
				id: '123',
				url: 'https://example.com',
				title: 'Test Bookmark',
				archived: false,
				taggingStatus: 'success',
				summarizationStatus: 'pending',
				note: 'Test note',
				summary: 'Test summary',
				tags: [{ id: '1', name: 'test', attachedBy: 'human' }],
				content: [{ id: '1', type: 'text', data: 'content' }],
				assets: [],
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};

			expect(bookmark.id).toBe('123');
			expect(bookmark.taggingStatus).toBe('success');
			expect(bookmark.tags?.[0].attachedBy).toBe('human');
		});

		it('should define List correctly', () => {
			const list: List = {
				id: '123',
				name: 'Test List',
				description: 'A test list',
				icon: 'list',
				type: 'manual',
				public: true,
				bookmarkCount: 5,
				createdAt: '2023-01-01T00:00:00Z',
				updatedAt: '2023-01-01T00:00:00Z',
			};

			expect(list.name).toBe('Test List');
			expect(list.public).toBe(true);
		});

		it('should define Tag correctly', () => {
			const tag: Tag = {
				id: '123',
				name: 'test-tag',
				attachedBy: 'ai',
			};

			expect(tag.name).toBe('test-tag');
			expect(tag.attachedBy).toBe('ai');
		});

		it('should define Highlight correctly', () => {
			const highlight: Highlight = {
				id: '123',
				bookmarkId: '456',
				text: 'highlighted text',
				startOffset: 0,
				endOffset: 10,
				note: 'Test note',
				createdAt: '2023-01-01T00:00:00Z',
			};

			expect(highlight.bookmarkId).toBe('456');
			expect(highlight.startOffset).toBe(0);
		});

		it('should define User correctly', () => {
			const user: User = {
				id: '123',
				email: 'test@example.com',
				name: 'Test User',
				role: 'admin',
				createdAt: '2023-01-01T00:00:00Z',
			};

			expect(user.email).toBe('test@example.com');
			expect(user.role).toBe('admin');
		});

		it('should define Asset correctly', () => {
			const asset: Asset = {
				id: '123',
				filename: 'test.jpg',
				mimeType: 'image/jpeg',
				size: 1024,
				url: 'https://example.com/test.jpg',
				createdAt: '2023-01-01T00:00:00Z',
			};

			expect(asset.filename).toBe('test.jpg');
			expect(asset.mimeType).toBe('image/jpeg');
		});
	});

	describe('Input Types', () => {
		it('should define CreateBookmarkInput correctly', () => {
			const input: CreateBookmarkInput = {
				type: 'link',
				url: 'https://example.com',
				title: 'Test Bookmark',
				note: 'Test note',
				tags: ['tag1', 'tag2'],
				archived: false,
			};

			expect(input.url).toBe('https://example.com');
			expect(input.tags).toHaveLength(2);
		});

		it('should define UpdateBookmarkInput correctly', () => {
			const input: UpdateBookmarkInput = {
				title: 'Updated Title',
				archived: true,
			};

			expect(input.title).toBe('Updated Title');
			expect(input.archived).toBe(true);
		});

		it('should define CreateListInput correctly', () => {
			const input: CreateListInput = {
				name: 'Test List',
				description: 'A test list',
				icon: 'list',
			};

			expect(input.name).toBe('Test List');
			expect(input.icon).toBe('list');
		});

		it('should define CreateHighlightInput correctly', () => {
			const input: CreateHighlightInput = {
				bookmarkId: '123',
				text: 'highlighted text',
				startOffset: 0,
				endOffset: 10,
				note: 'Test note',
			};

			expect(input.bookmarkId).toBe('123');
			expect(input.startOffset).toBe(0);
		});

		it('should define UploadAssetInput correctly', () => {
			const buffer = Buffer.from('test file content');
			const input: UploadAssetInput = {
				file: buffer,
				filename: 'test.txt',
				mimeType: 'text/plain',
			};

			expect(input.filename).toBe('test.txt');
			expect(input.file).toBeInstanceOf(Buffer);
		});
	});

	describe('Validation Types', () => {
		it('should define ValidationResult correctly', () => {
			const result: ValidationResult = {
				isValid: false,
				errors: [
					{
						field: 'email',
						message: 'Invalid email format',
						code: 'INVALID_FORMAT',
					},
				],
			};

			expect(result.isValid).toBe(false);
			expect(result.errors[0].field).toBe('email');
		});

		it('should define ValidationError correctly', () => {
			const error: ValidationError = {
				field: 'url',
				message: 'Invalid URL format',
				code: 'INVALID_URL',
			};

			expect(error.field).toBe('url');
			expect(error.code).toBe('INVALID_URL');
		});
	});

	describe('HTTP and Network Types', () => {
		it('should define HttpResponse correctly', () => {
			const response: HttpResponse<{ message: string }> = {
				data: { message: 'success' },
				status: 200,
				statusText: 'OK',
				headers: { 'content-type': 'application/json' },
			};

			expect(response.status).toBe(200);
			expect(response.data.message).toBe('success');
		});

		it('should define RetryConfig correctly', () => {
			const config: RetryConfig = {
				maxRetries: 3,
				baseDelay: 1000,
				maxDelay: 10000,
				retryableStatusCodes: [500, 502, 503],
			};

			expect(config.maxRetries).toBe(3);
			expect(config.retryableStatusCodes).toContain(500);
		});

		it('should define RateLimitInfo correctly', () => {
			const info: RateLimitInfo = {
				limit: 100,
				remaining: 95,
				resetTime: 1640995200,
			};

			expect(info.limit).toBe(100);
			expect(info.remaining).toBe(95);
		});
	});

	describe('Pagination Types', () => {
		it('should define PaginationParams correctly', () => {
			const params: PaginationParams = {
				page: 1,
				limit: 10,
			};

			expect(params.page).toBe(1);
			expect(params.limit).toBe(10);
		});

		it('should define BookmarkSearchParams correctly', () => {
			const params: BookmarkSearchParams = {
				q: 'test',
				page: 1,
				limit: 10,
				query: 'test',
				tags: ['work', 'important'],
				archived: false,
				startDate: '2023-01-01',
				endDate: '2023-12-31',
			};

			expect(params.query).toBe('test');
			expect(params.tags).toContain('work');
		});

		it('should define ListFilterParams correctly', () => {
			const params: ListFilterParams = {
				page: 1,
				limit: 10,
				isPublic: true,
			};

			expect(params.isPublic).toBe(true);
		});
	});

	describe('Resource and Operation Types', () => {
		it('should define ResourceType correctly', () => {
			const resources: ResourceType[] = [
				'bookmarks',
				'lists',
				'tags',
				'highlights',
				'users',
				'assets',
			];

			expect(resources).toHaveLength(6);
			expect(resources).toContain('bookmarks');
		});

		it('should define ResourceOperations correctly', () => {
			const operations: ResourceOperations = {
				bookmarks: 'getAll',
				lists: 'create',
				tags: 'update',
				highlights: 'delete',
				users: 'getCurrentUser',
				assets: 'upload',
			};

			expect(operations.bookmarks).toBe('getAll');
			expect(operations.users).toBe('getCurrentUser');
		});
	});

	describe('Bulk Operation Types', () => {
		it('should define BulkOperationResult correctly', () => {
			const result: BulkOperationResult<string> = {
				successful: ['item1', 'item2'],
				failed: [
					{
						item: 'item3',
						error: {
							code: 'VALIDATION_ERROR',
							message: 'Invalid item',
							statusCode: 400,
						},
					},
				],
				totalProcessed: 3,
			};

			expect(result.successful).toHaveLength(2);
			expect(result.failed).toHaveLength(1);
			expect(result.totalProcessed).toBe(3);
		});

		it('should define BulkOperationError correctly', () => {
			const error: BulkOperationError = {
				item: { id: '123', name: 'test' },
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Invalid item',
					statusCode: 400,
				},
			};

			expect(error.item.id).toBe('123');
			expect(error.error.code).toBe('VALIDATION_ERROR');
		});
	});

	describe('Configuration Types', () => {
		it('should define EndpointConfig correctly', () => {
			const config: EndpointConfig = {
				path: '/bookmarks',
				method: 'GET',
				requiresAuth: true,
				rateLimit: {
					requests: 100,
					windowMs: 60000,
				},
			};

			expect(config.path).toBe('/bookmarks');
			expect(config.requiresAuth).toBe(true);
			expect(config.rateLimit?.requests).toBe(100);
		});

		it('should define TransformationRule correctly', () => {
			const rule: TransformationRule<{ name: string }, { fullName: string }> = {
				source: 'name',
				target: 'fullName',
				transform: (value) => `Mr. ${value}`,
			};

			expect(rule.source).toBe('name');
			expect(rule.target).toBe('fullName');
			expect(rule.transform?.('John')).toBe('Mr. John');
		});

		it('should define CacheEntry correctly', () => {
			const entry: CacheEntry<string> = {
				data: 'cached value',
				timestamp: Date.now(),
				ttl: 60000,
			};

			expect(entry.data).toBe('cached value');
			expect(typeof entry.timestamp).toBe('number');
		});

		it('should define CacheOptions correctly', () => {
			const options: CacheOptions = {
				ttl: 60000,
				maxSize: 100,
			};

			expect(options.ttl).toBe(60000);
			expect(options.maxSize).toBe(100);
		});
	});

	describe('File and Progress Types', () => {
		it('should define FileUploadProgress correctly', () => {
			const progress: FileUploadProgress = {
				loaded: 512,
				total: 1024,
				percentage: 50,
			};

			expect(progress.loaded).toBe(512);
			expect(progress.percentage).toBe(50);
		});
	});

	describe('Webhook Types', () => {
		it('should define WebhookPayload correctly', () => {
			const payload: WebhookPayload = {
				event: 'bookmark.created',
				resource: 'bookmarks',
				data: { id: '123', url: 'https://example.com' },
				timestamp: '2023-01-01T00:00:00Z',
			};

			expect(payload.event).toBe('bookmark.created');
			expect(payload.resource).toBe('bookmarks');
		});
	});

	describe('API Request Types', () => {
		it('should define ApiRequestOptions correctly', () => {
			const options: ApiRequestOptions = {
				method: 'POST',
				endpoint: '/bookmarks',
				body: { url: 'https://example.com' },
				headers: { 'Content-Type': 'application/json' },
				params: { page: 1, limit: 10 },
			};

			expect(options.method).toBe('POST');
			expect(options.endpoint).toBe('/bookmarks');
			expect(options.body.url).toBe('https://example.com');
		});
	});

	describe('User Stats Types', () => {
		it('should define UserStats correctly', () => {
			const stats: UserStats = {
				totalBookmarks: 150,
				totalLists: 10,
				totalTags: 25,
				totalHighlights: 75,
				totalAssets: 30,
			};

			expect(stats.totalBookmarks).toBe(150);
			expect(stats.totalLists).toBe(10);
		});
	});
});