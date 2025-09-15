// Base API Response Structure
export interface KarakeepResponse<T> {
	data: T;
	meta?: {
		pagination?: {
			page: number;
			limit: number;
			total: number;
		};
	};
}

// Common Error Structure
export interface KarakeepError {
	code: string;
	message: string;
	details?: Record<string, any>;
	statusCode: number;
}

// Credential Interface
export interface KarakeepCredentials {
	instanceUrl: string;
	apiKey: string;
}

// Content Interface
export interface Content {
	id: string;
	type: string;
	data: any;
}

// Tag Interface
export interface Tag {
	id: string;
	name: string;
	attachedBy: 'ai' | 'human';
}

// Asset Interface
export interface Asset {
	id: string;
	filename: string;
	mimeType: string;
	size: number;
	url: string;
	createdAt: string;
}

// Bookmark Interface
export interface Bookmark {
	id: string;
	url: string;
	title?: string;
	archived?: boolean;
	taggingStatus?: 'success' | 'failure' | 'pending';
	summarizationStatus?: 'success' | 'failure' | 'pending';
	note?: string;
	summary?: string;
	tags?: Tag[];
	content: Content[];
	assets: Asset[];
	createdAt: string;
	updatedAt: string;
}

// List Interface
export interface List {
	id: string;
	name: string;
	description?: string | null;
	icon: string;
	parentId?: string | null;
	type: 'manual' | 'smart';
	query?: string | null;
	public: boolean;
	bookmarkCount?: number;
	createdAt?: string;
	updatedAt?: string;
}

// Highlight Interface
export interface Highlight {
	id: string;
	bookmarkId: string;
	text: string;
	startOffset: number;
	endOffset: number;
	color?: 'yellow' | 'red' | 'green' | 'blue';
	note?: string;
	userId?: string;
	createdAt: string;
}

// User Interface
export interface User {
	id: string;
	email: string;
	name?: string;
	role: 'admin' | 'user';
	createdAt: string;
}

// User Stats Interface
export interface UserStats {
	totalBookmarks: number;
	totalLists: number;
	totalTags: number;
	totalHighlights: number;
	totalAssets: number;
}

// API Request Options
export interface ApiRequestOptions {
	method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
	endpoint: string;
	body?: any;
	headers?: Record<string, string>;
	params?: Record<string, string | number | boolean>;
}

// Pagination Parameters
export interface PaginationParams {
	page?: number;
	limit?: number;
}

// Search Parameters for Bookmarks
export interface BookmarkSearchParams {
	q: string; // required query parameter
	sortOrder?: 'asc' | 'desc' | 'relevance';
	limit?: number;
	cursor?: string;
	includeContent?: boolean;
}

// Filter Parameters for Lists
export interface ListFilterParams extends PaginationParams {
	isPublic?: boolean;
}

// Resource Types
export type ResourceType = 'bookmarks' | 'lists' | 'tags' | 'highlights' | 'users' | 'assets';

// Operation Types by Resource
export interface ResourceOperations {
	bookmarks: 'getAll' | 'getById' | 'create' | 'update' | 'delete' | 'search' | 'manageTags' | 'manageAssets';
	lists: 'getAll' | 'getById' | 'create' | 'update' | 'delete' | 'addBookmarks' | 'removeBookmarks';
	tags: 'getAll' | 'getById' | 'create' | 'update' | 'delete' | 'getTaggedBookmarks';
	highlights: 'getAll' | 'getById' | 'create' | 'update' | 'delete';
	users: 'getCurrentUser' | 'getUserStats';
	assets: 'upload' | 'getById' | 'download';
}

// Create/Update Input Types
export interface CreateBookmarkInput {
	type: 'link' | 'text' | 'asset';
	// Link bookmark fields
	url?: string;
	precrawledArchiveId?: string;
	// Text bookmark fields
	text?: string;
	sourceUrl?: string;
	// Asset bookmark fields
	assetType?: 'image' | 'pdf';
	assetId?: string;
	fileName?: string;
	// Common fields for all types
	title?: string | null;
	note?: string;
	tags?: string[];
	archived?: boolean;
	favourited?: boolean;
	summary?: string;
	createdAt?: string | null;
	crawlPriority?: 'low' | 'normal';
}

export interface UpdateBookmarkInput {
	archived?: boolean;
	favourited?: boolean;
	summary?: string | null;
	note?: string;
	title?: string | null;
	createdAt?: string | null;
	url?: string;
	description?: string | null;
	author?: string | null;
	publisher?: string | null;
	datePublished?: string | null;
	dateModified?: string | null;
	text?: string | null;
	assetContent?: string | null;
}

export interface CreateListInput {
	name: string;
	description?: string;
	icon: string;
	type?: 'manual' | 'smart';
	query?: string;
	parentId?: string | null;
}

export interface UpdateListInput {
	name?: string;
	description?: string;
	icon?: string;
	type?: 'manual' | 'smart';
	query?: string;
	parentId?: string | null;
}

export interface CreateTagInput {
	name: string;
}

export interface UpdateTagInput {
	name: string;
}

export interface CreateHighlightInput {
	bookmarkId: string;
	text: string;
	startOffset: number;
	endOffset: number;
	color?: 'yellow' | 'red' | 'green' | 'blue';
	note?: string;
}

export interface UpdateHighlightInput {
	text?: string;
	startOffset?: number;
	endOffset?: number;
	color?: 'yellow' | 'red' | 'green' | 'blue';
	note?: string;
}

export interface UploadAssetInput {
	file: Buffer;
	filename: string;
	mimeType: string;
}

// Validation Result Types
export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
}

export interface ValidationError {
	field: string;
	message: string;
	code: string;
}

// HTTP Response Types
export interface HttpResponse<T = any> {
	data: T;
	status: number;
	statusText: string;
	headers: Record<string, string>;
}

// Retry Configuration
export interface RetryConfig {
	maxRetries: number;
	baseDelay: number;
	maxDelay: number;
	retryableStatusCodes: number[];
}

// Rate Limiting Types
export interface RateLimitInfo {
	limit: number;
	remaining: number;
	resetTime: number;
}

// File Upload Types
export interface FileUploadProgress {
	loaded: number;
	total: number;
	percentage: number;
}

// Bulk Operation Types
export interface BulkOperationResult<T> {
	successful: T[];
	failed: BulkOperationError[];
	totalProcessed: number;
}

export interface BulkOperationError {
	item: any;
	error: KarakeepError;
}

// API Endpoint Configuration
export interface EndpointConfig {
	path: string;
	method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
	requiresAuth: boolean;
	rateLimit?: {
		requests: number;
		windowMs: number;
	};
}

// Data Transformation Types
export interface TransformationRule<T, U> {
	source: keyof T;
	target: keyof U;
	transform?: (value: any) => any;
}

// Cache Types
export interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

export interface CacheOptions {
	ttl: number; // Time to live in milliseconds
	maxSize: number;
}

// Webhook Types (for future extensibility)
export interface WebhookPayload {
	event: string;
	resource: ResourceType;
	data: any;
	timestamp: string;
}