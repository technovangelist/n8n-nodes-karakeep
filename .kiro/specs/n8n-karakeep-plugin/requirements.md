# Requirements Document

## Introduction

This feature involves creating a comprehensive n8n plugin for Karakeep, a bookmark management service. The plugin will provide a single unified Karakeep node that handles all interactions with the Karakeep API, including bookmarks, lists, tags, highlights, users, and assets. The node will use a resource-based interface where users first select the resource type (bookmarks, lists, etc.) and then choose the specific operation, providing n8n users with full access to Karakeep's functionality through a clean, organized workflow interface.

## Requirements

### Requirement 1

**User Story:** As an n8n workflow creator, I want to authenticate with Karakeep using my API key and instance URL, so that I can securely access my Karakeep data in workflows.

#### Acceptance Criteria

1. WHEN configuring Karakeep credentials THEN the system SHALL require both an API key and Karakeep instance URL
2. WHEN making API requests THEN the system SHALL use the API key in a Bearer authorization header
3. WHEN the API key is invalid THEN the system SHALL return a clear authentication error message
4. IF the instance URL is malformed THEN the system SHALL validate and reject invalid URLs

### Requirement 2

**User Story:** As an n8n workflow creator, I want to select "Bookmarks" as a resource in the Karakeep node, so that I can create, read, update, and delete bookmarks in my Karakeep instance.

#### Endpoints

GET https://karakeep-instance-url/api/v1/bookmarks
POST https://karakeep-instance-url/api/v1/bookmarks
GET https://karakeep-instance-url/api/v1/bookmarks/search
GET https://karakeep-instance-url/api/v1/bookmarks/:bookmarkId
DELETE https://karakeep-instance-url/api/v1/bookmarks/:bookmarkId
PATCH https://karakeep-instance-url/api/v1/bookmarks/:bookmarkId
POST https://karakeep-instance-url/api/v1/bookmarks/:bookmarkId/tags
DELETE https://karakeep-instance-url/api/v1/bookmarks/:bookmarkId/tags
GET https://karakeep-instance-url/api/v1/bookmarks/:bookmarkId/highlights
POST https://karakeep-instance-url/api/v1/bookmarks/:bookmarkId/assets
PUT https://karakeep-instance-url/api/v1/bookmarks/:bookmarkId/assets/:assetId
DELETE https://karakeep-instance-url/api/v1/bookmarks/:bookmarkId/assets/:assetId


#### Acceptance Criteria

1. WHEN selecting Bookmarks resource THEN the system SHALL provide operations for Get All, Get by ID, Create, Update, Delete, and Search bookmarks
2. WHEN creating a bookmark THEN the system SHALL accept required fields like URL and optional fields like title, description, and tags
3. WHEN retrieving bookmarks THEN the system SHALL support filtering and pagination parameters
4. WHEN updating a bookmark THEN the system SHALL allow modification of all editable fields
5. WHEN deleting a bookmark THEN the system SHALL confirm successful deletion

### Requirement 3

**User Story:** As an n8n workflow creator, I want to select "Lists" as a resource in the Karakeep node, so that I can manage bookmark collections and organize my bookmarks into lists.

#### Endpoints

GET https://try.karakeep.app/api/v1/lists
POST https://try.karakeep.app/api/v1/lists
GET https://try.karakeep.app/api/v1/lists/:listId
DELETE https://try.karakeep.app/api/v1/lists/:listId
PATCH https://try.karakeep.app/api/v1/lists/:listId
GET https://try.karakeep.app/api/v1/lists/:listId/bookmarks
PUT https://try.karakeep.app/api/v1/lists/:listId/bookmarks/:bookmarkId
DELETE https://try.karakeep.app/api/v1/lists/:listId/bookmarks/:bookmarkId


#### Acceptance Criteria

1. WHEN selecting Lists resource THEN the system SHALL provide operations for Get All, Get by ID, Create, Update, Delete, Add Bookmarks, and Remove Bookmarks
2. WHEN creating a list THEN the system SHALL accept name, description, and visibility settings
3. WHEN retrieving lists THEN the system SHALL return list metadata and associated bookmarks
4. WHEN adding bookmarks to lists THEN the system SHALL support bulk operations
5. WHEN removing bookmarks from lists THEN the system SHALL maintain data integrity

### Requirement 4

**User Story:** As an n8n workflow creator, I want to select "Tags" as a resource in the Karakeep node, so that I can manage bookmark tags and organize content by categories.

#### Endpoints

GET https://try.karakeep.app/api/v1/tags
POST https://try.karakeep.app/api/v1/tags
GET https://try.karakeep.app/api/v1/tags/:tagId
DELETE https://try.karakeep.app/api/v1/tags/:tagId
PATCH https://try.karakeep.app/api/v1/tags/:tagId
GET https://try.karakeep.app/api/v1/tags/:tagId/bookmarks


#### Acceptance Criteria

1. WHEN selecting Tags resource THEN the system SHALL provide operations for Get All, Get by ID, Create, Update, Delete, and Get Tagged Bookmarks
2. WHEN creating tags THEN the system SHALL prevent duplicate tag names
3. WHEN retrieving tags THEN the system SHALL include usage statistics and associated bookmark counts
4. WHEN applying tags to bookmarks THEN the system SHALL support batch tagging operations
5. WHEN deleting tags THEN the system SHALL handle tag removal from associated bookmarks

### Requirement 5

**User Story:** As an n8n workflow creator, I want to select "Highlights" as a resource in the Karakeep node, so that I can manage text highlights and annotations within bookmarks.

#### Endpoints

GET https://try.karakeep.app/api/v1/highlights
POST https://try.karakeep.app/api/v1/highlights
GET https://try.karakeep.app/api/v1/highlights/:highlightId
DELETE https://try.karakeep.app/api/v1/highlights/:highlightId
PATCH https://try.karakeep.app/api/v1/highlights/:highlightId

#### Acceptance Criteria

1. WHEN selecting Highlights resource THEN the system SHALL provide operations for Get All, Get by ID, Create, Update, and Delete highlights
2. WHEN creating highlights THEN the system SHALL accept text selection, position data, and optional notes
3. WHEN retrieving highlights THEN the system SHALL return highlights organized by bookmark
4. WHEN updating highlights THEN the system SHALL preserve text position accuracy
5. WHEN deleting highlights THEN the system SHALL remove associated annotations

### Requirement 6

**User Story:** As an n8n workflow creator, I want to select "Users" as a resource in the Karakeep node, so that I can manage user accounts and permissions in multi-user Karakeep instances.

#### Endpoints

GET https://try.karakeep.app/api/v1/users/me
GET https://try.karakeep.app/api/v1/users/me/stats

#### Acceptance Criteria

1. WHEN selecting Users resource THEN the system SHALL provide operations for Get Current User and Get User Stats based on API permissions
2. WHEN retrieving user information THEN the system SHALL return profile data and permissions
3. WHEN updating user profiles THEN the system SHALL validate required fields and permissions
4. IF the current user lacks admin permissions THEN the system SHALL restrict access to user management operations
5. WHEN managing user permissions THEN the system SHALL enforce role-based access controls

### Requirement 7

**User Story:** As an n8n workflow creator, I want to select "Assets" as a resource in the Karakeep node, so that I can manage files, images, and other media associated with bookmarks.

#### Endpoints

POST https://try.karakeep.app/api/v1/assets
GET https://try.karakeep.app/api/v1/assets/:assetId


#### Acceptance Criteria

1. WHEN selecting Assets resource THEN the system SHALL provide operations for Upload, Get by ID, and Download assets
2. WHEN uploading assets THEN the system SHALL validate file types and size limits
3. WHEN retrieving assets THEN the system SHALL return asset metadata and download URLs
4. WHEN deleting assets THEN the system SHALL remove files from storage and update bookmark references
5. WHEN processing large assets THEN the system SHALL provide progress feedback

### Requirement 8

**User Story:** As an n8n workflow creator, I want consistent error handling across all Karakeep nodes, so that I can reliably debug and handle failures in my workflows.

#### Acceptance Criteria

1. WHEN API requests fail THEN the system SHALL return structured error messages with HTTP status codes
2. WHEN network timeouts occur THEN the system SHALL provide retry mechanisms with exponential backoff
3. WHEN rate limits are exceeded THEN the system SHALL respect rate limiting headers and queue requests
4. WHEN validation errors occur THEN the system SHALL return specific field-level error messages
5. WHEN authentication fails THEN the system SHALL provide clear guidance for credential configuration

### Requirement 9

**User Story:** As an n8n workflow creator, I want comprehensive input validation and output formatting, so that data flows correctly between the Karakeep node and other n8n nodes.

#### Acceptance Criteria

1. WHEN configuring node parameters THEN the system SHALL validate input types and required fields
2. WHEN processing API responses THEN the system SHALL normalize data formats for consistent output
3. WHEN handling arrays and objects THEN the system SHALL preserve data structure and types
4. WHEN dealing with optional fields THEN the system SHALL handle null and undefined values gracefully
5. WHEN outputting data THEN the system SHALL follow n8n conventions for data structure and naming