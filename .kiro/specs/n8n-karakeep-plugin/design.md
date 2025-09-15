# Design Document

## Overview

The n8n Karakeep plugin will be implemented as a single unified node that handles all interactions with the Karakeep API. The node uses a resource-based interface where users first select the resource type (Bookmarks, Lists, Tags, Highlights, Users, Assets) and then choose the specific operation. The plugin follows n8n's standard architecture patterns with credential management, consistent error handling, and standardized data flow patterns while providing a clean, organized interface for all CRUD operations.

## Architecture

### Plugin Structure
```
n8n-nodes-karakeep/
├── credentials/
│   └── KarakeepApi.credentials.ts
├── nodes/
│   ├── Karakeep/
│   │   ├── Karakeep.node.ts
│   │   ├── resources/
│   │   │   ├── BookmarksResource.ts
│   │   │   ├── ListsResource.ts
│   │   │   ├── TagsResource.ts
│   │   │   ├── HighlightsResource.ts
│   │   │   ├── UsersResource.ts
│   │   │   └── AssetsResource.ts
│   │   └── descriptions/
│   │       ├── BookmarksDescription.ts
│   │       ├── ListsDescription.ts
│   │       ├── TagsDescription.ts
│   │       ├── HighlightsDescription.ts
│   │       ├── UsersDescription.ts
│   │       └── AssetsDescription.ts
│   └── shared/
│       ├── KarakeepApiRequest.ts
│       ├── types.ts
│       └── utils.ts
├── package.json
└── README.md
```

### Core Design Principles

1. **Resource-Based Organization**: Single node with resource selection (Bookmarks, Lists, Tags, etc.) and operation selection
2. **Modular Resource Handlers**: Each resource type has its own handler module for clean code organization
3. **Shared Infrastructure**: Common API request handling, authentication, and error management
4. **Consistent Interface**: All resources follow the same parameter structure and output format
5. **Type Safety**: Full TypeScript implementation with comprehensive type definitions
6. **Error Resilience**: Robust error handling with meaningful user feedback

## Components and Interfaces

### Credential Management

**KarakeepApi.credentials.ts**
- Manages API key and instance URL configuration
- Validates URL format and API key presence
- Provides secure credential storage following n8n patterns

```typescript
interface KarakeepCredentials {
  instanceUrl: string;
  apiKey: string;
}
```

### Shared API Client

**KarakeepApiRequest.ts**
- Centralized HTTP client for all Karakeep API interactions
- Handles authentication header injection
- Implements retry logic and rate limiting
- Provides consistent error handling and response parsing

### Node Implementation

#### Karakeep Node Structure
The single Karakeep node uses a two-level selection system:
1. **Resource Selection**: User selects from Bookmarks, Lists, Tags, Highlights, Users, or Assets
2. **Operation Selection**: Based on the selected resource, available operations are dynamically shown

#### Resource Implementations

**Bookmarks Resource**
- **Operations**: Get All, Get by ID, Create, Update, Delete, Search, Manage Tags, Manage Assets
- **Key Features**: Bulk operations, advanced search with filters, tag and asset management integration, pagination handling

**Lists Resource**
- **Operations**: Get All, Get by ID, Create, Update, Delete, Add Bookmarks, Remove Bookmarks
- **Key Features**: List membership management, bulk bookmark operations, visibility and permission handling

**Tags Resource**
- **Operations**: Get All, Get by ID, Create, Update, Delete, Get Tagged Bookmarks
- **Key Features**: Tag hierarchy support, usage statistics, bulk tagging operations

**Highlights Resource**
- **Operations**: Get All, Get by ID, Create, Update, Delete
- **Key Features**: Text position management, annotation support, bookmark association

**Users Resource**
- **Operations**: Get Current User, Get User Stats
- **Key Features**: Profile management, statistics and analytics, permission-based access control

**Assets Resource**
- **Operations**: Upload, Get by ID, Download
- **Key Features**: File upload handling, MIME type validation, progress tracking for large files

## Data Models

### Common Response Structure
```typescript
interface KarakeepResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}
```

### Resource Models
```typescript
interface Bookmark {
  id: string;
  url: string;
  title?: string;
  archived?: boolean;
  taggingStatus?: 'success' | 'failure' | 'pending'
  summarizationStatus?: 'success' | 'failure' | 'pending';
  note?: string;
  summary?: string
  tags?: Tag[];
  content: Content[];
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
}

interface List {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  bookmarkCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Tag {
  id: string;
  name: string;
  attachedBy: ai | human
}

interface Highlight {
  id: string;
  bookmarkId: string;
  text: string;
  startOffset: number;
  endOffset: number;
  note?: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface Asset {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}
```

## Error Handling

### Error Categories
1. **Authentication Errors**: Invalid API key, expired tokens
2. **Validation Errors**: Missing required fields, invalid data formats
3. **Network Errors**: Connection timeouts, DNS resolution failures
4. **API Errors**: Rate limiting, server errors, resource not found
5. **Permission Errors**: Insufficient privileges for operations

### Error Response Structure
```typescript
interface KarakeepError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode: number;
}
```

### Error Handling Strategy
- **Retry Logic**: Automatic retry for transient network errors with exponential backoff
- **Rate Limiting**: Respect API rate limits with intelligent queuing
- **User Feedback**: Clear, actionable error messages for workflow creators
- **Logging**: Comprehensive error logging for debugging

## Testing Strategy

### Unit Testing
- **Credential Validation**: Test URL validation and API key handling
- **API Client**: Mock HTTP requests and test response parsing
- **Node Logic**: Test parameter validation and data transformation
- **Error Handling**: Verify error scenarios and recovery mechanisms

### Integration Testing
- **API Connectivity**: Test against Karakeep API endpoints
- **Authentication Flow**: Verify credential usage and token handling
- **Data Flow**: Test complete request-response cycles
- **Error Scenarios**: Test API error responses and handling

### Test Structure
```
tests/
├── unit/
│   ├── credentials/
│   ├── nodes/
│   └── shared/
├── integration/
│   ├── api/
│   └── workflows/
└── fixtures/
    ├── responses/
    └── requests/
```

### Mock Strategy
- **API Responses**: Comprehensive mock responses for all endpoints
- **Error Scenarios**: Mock various error conditions and edge cases
- **Credential Testing**: Mock authentication flows and validation
- **Performance Testing**: Mock slow responses and timeouts

## Implementation Considerations

### Performance Optimization
- **Request Batching**: Group related API calls where possible
- **Caching**: Cache frequently accessed data like tags and lists
- **Pagination**: Efficient handling of large result sets
- **Connection Pooling**: Reuse HTTP connections for better performance

### Security Considerations
- **Credential Storage**: Secure handling of API keys in n8n's credential system
- **Input Validation**: Sanitize all user inputs before API calls
- **URL Validation**: Prevent SSRF attacks through URL validation
- **Error Information**: Avoid exposing sensitive information in error messages

### Scalability Features
- **Rate Limiting**: Built-in respect for API rate limits
- **Concurrent Requests**: Support for parallel operations where safe
- **Memory Management**: Efficient handling of large responses and file uploads
- **Resource Cleanup**: Proper cleanup of temporary resources and connections

### User Experience
- **Parameter Validation**: Real-time validation of node parameters
- **Auto-completion**: Intelligent suggestions for common values
- **Documentation**: Comprehensive inline help and examples
- **Error Recovery**: Graceful handling of common error scenarios