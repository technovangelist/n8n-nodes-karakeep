# Karakeep Bookmarks Examples

This document provides examples of how to use the Karakeep node for bookmark management operations.

## Available Operations

### Get All Bookmarks
Retrieve all bookmarks with optional filtering and pagination.

**Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of bookmarks per page (max 100)
- `archived` (optional): Filter by archived status (all/true/false)
- `tags` (optional): Comma-separated list of tags to filter by
- `startDate` (optional): Filter bookmarks created after this date
- `endDate` (optional): Filter bookmarks created before this date

**Example:**
```json
{
  "resource": "bookmarks",
  "operation": "getAll",
  "additionalFields": {
    "page": 1,
    "limit": 20,
    "archived": "false",
    "tags": "work, important"
  }
}
```

### Get Bookmark by ID
Retrieve a specific bookmark by its ID.

**Parameters:**
- `bookmarkId` (required): The ID of the bookmark to retrieve

**Example:**
```json
{
  "resource": "bookmarks",
  "operation": "getById",
  "bookmarkId": "bookmark-123"
}
```

### Create Bookmark
Create a new bookmark. Supports three types: Link, Text, and Asset bookmarks.

#### Link Bookmark
**Parameters:**
- `bookmarkType`: "link"
- `url` (required): The URL to bookmark
- `title` (optional): The title of the bookmark
- `note` (optional): Personal note about the bookmark
- `tags` (optional): Comma-separated list of tags
- `archived` (optional): Whether the bookmark should be archived
- `favourited` (optional): Whether the bookmark should be favourited
- `summary` (optional): Summary of the bookmark content
- `crawlPriority` (optional): Priority for crawling ("normal" or "low")

**Example:**
```json
{
  "resource": "bookmarks",
  "operation": "create",
  "bookmarkType": "link",
  "url": "https://example.com",
  "title": "Example Website",
  "note": "This is a useful website",
  "tags": "example, useful, website",
  "archived": false,
  "favourited": true,
  "crawlPriority": "normal"
}
```

#### Text Bookmark
**Parameters:**
- `bookmarkType`: "text"
- `text` (required): The text content for the bookmark
- `sourceUrl` (optional): Optional source URL for the text content
- `title` (optional): The title of the bookmark
- `note` (optional): Personal note about the bookmark
- `tags` (optional): Comma-separated list of tags
- `archived` (optional): Whether the bookmark should be archived
- `favourited` (optional): Whether the bookmark should be favourited
- `summary` (optional): Summary of the bookmark content
- `crawlPriority` (optional): Priority for crawling ("normal" or "low")

**Example:**
```json
{
  "resource": "bookmarks",
  "operation": "create",
  "bookmarkType": "text",
  "text": "This is some important text content that I want to save as a bookmark.",
  "sourceUrl": "https://source-website.com",
  "title": "Important Text Note",
  "note": "Saved from a meeting discussion",
  "tags": "notes, meeting, important",
  "archived": false
}
```

#### Asset Bookmark
**Parameters:**
- `bookmarkType`: "asset"
- `assetType` (required): Type of asset ("image" or "pdf")
- `assetId` (required): The ID of the asset to bookmark
- `fileName` (optional): Optional file name for the asset
- `assetSourceUrl` (optional): Optional source URL for the asset
- `title` (optional): The title of the bookmark
- `note` (optional): Personal note about the bookmark
- `tags` (optional): Comma-separated list of tags
- `archived` (optional): Whether the bookmark should be archived
- `favourited` (optional): Whether the bookmark should be favourited
- `summary` (optional): Summary of the bookmark content
- `crawlPriority` (optional): Priority for crawling ("normal" or "low")

**Example:**
```json
{
  "resource": "bookmarks",
  "operation": "create",
  "bookmarkType": "asset",
  "assetType": "pdf",
  "assetId": "asset-123-456",
  "fileName": "important-document.pdf",
  "assetSourceUrl": "https://source-website.com",
  "title": "Important PDF Document",
  "note": "Reference document for the project",
  "tags": "pdf, document, reference",
  "archived": false
}
```

### Update Bookmark
Update an existing bookmark. You can update any combination of the available fields.

**Parameters:**
- `bookmarkId` (required): The ID of the bookmark to update
- `title` (optional): New title for the bookmark (max 1000 characters)
- `note` (optional): New note for the bookmark
- `summary` (optional): New summary for the bookmark
- `archived` (optional): New archived status
- `favourited` (optional): New favourited status
- `updateUrl` (optional): New URL for the bookmark
- `description` (optional): New description of the bookmark content
- `author` (optional): Author of the bookmarked content
- `publisher` (optional): Publisher of the bookmarked content
- `datePublished` (optional): Publication date of the content
- `dateModified` (optional): Last modification date of the content
- `textContent` (optional): Text content of the bookmark
- `assetContent` (optional): Asset content metadata
- `createdAt` (optional): Override the creation date of the bookmark

**Example - Basic Update:**
```json
{
  "resource": "bookmarks",
  "operation": "update",
  "bookmarkId": "bookmark-123",
  "title": "Updated Title",
  "note": "Updated note",
  "archived": true,
  "favourited": true
}
```

**Example - Comprehensive Update:**
```json
{
  "resource": "bookmarks",
  "operation": "update",
  "bookmarkId": "bookmark-123",
  "title": "Complete Article Title",
  "summary": "Updated summary of the article",
  "description": "Detailed description of the content",
  "author": "John Doe",
  "publisher": "Tech Blog",
  "datePublished": "2023-12-01T10:00:00.000Z",
  "dateModified": "2023-12-15T14:30:00.000Z",
  "archived": false,
  "favourited": true
}
```

**Example - URL Update:**
```json
{
  "resource": "bookmarks",
  "operation": "update",
  "bookmarkId": "bookmark-123",
  "updateUrl": "https://new-url.com",
  "note": "URL has been updated to the new location"
}
```

### Delete Bookmark
Delete a bookmark.

**Parameters:**
- `bookmarkId` (required): The ID of the bookmark to delete

**Example:**
```json
{
  "resource": "bookmarks",
  "operation": "delete",
  "bookmarkId": "bookmark-123"
}
```

### Search Bookmarks
Search bookmarks with a query and optional parameters. Karakeep supports a powerful search query language - see the [Search Query Language documentation](https://docs.karakeep.app/guides/search-query-language) for detailed syntax and examples.

**Parameters:**
- `searchQuery` (required): Search query to find bookmarks (see [Search Query Language](https://docs.karakeep.app/guides/search-query-language) for syntax)
- `sortOrder` (optional): Sort order - "relevance" (default), "asc", or "desc"
- `limit` (optional): Maximum number of results to return
- `cursor` (optional): Cursor for pagination (from previous search response)
- `includeContent` (optional): Whether to include bookmark content (default: true)

**Example - Basic Search:**
```json
{
  "resource": "bookmarks",
  "operation": "search",
  "searchQuery": "javascript tutorial",
  "searchOptions": {
    "sortOrder": "relevance",
    "limit": 20,
    "includeContent": true
  }
}
```

**Example - Paginated Search:**
```json
{
  "resource": "bookmarks",
  "operation": "search",
  "searchQuery": "react components",
  "searchOptions": {
    "sortOrder": "desc",
    "limit": 10,
    "cursor": "cursor-from-previous-response",
    "includeContent": false
  }
}
```

**Example - Content-Light Search:**
```json
{
  "resource": "bookmarks",
  "operation": "search",
  "searchQuery": "machine learning",
  "searchOptions": {
    "sortOrder": "asc",
    "limit": 50,
    "includeContent": false
  }
}
```

### Manage Tags
Add or remove tags from a bookmark. Supports two input methods: tag names only or full tag objects with IDs.

**Parameters:**
- `bookmarkId` (required): The ID of the bookmark
- `tagAction` (required): Whether to "add" or "remove" tags
- `tagsInputMethod` (required): "names" for tag names only, or "idsAndNames" for full tag objects
- `tagsToManage` (required when using "names"): Comma-separated list of tag names
- `tagsJson` (required when using "idsAndNames"): JSON array of tag objects

**Example - Add Tags by Name:**
```json
{
  "resource": "bookmarks",
  "operation": "manageTags",
  "bookmarkId": "bookmark-123",
  "tagAction": "add",
  "tagsInputMethod": "names",
  "tagsToManage": "important, work, project"
}
```

**Example - Add Tags with IDs and Names:**
```json
{
  "resource": "bookmarks",
  "operation": "manageTags",
  "bookmarkId": "bookmark-123",
  "tagAction": "add",
  "tagsInputMethod": "idsAndNames",
  "tagsJson": [
    {
      "tagId": "tag-456",
      "tagName": "important"
    },
    {
      "tagId": "tag-789",
      "tagName": "work"
    }
  ]
}
```

**Example - Remove Tags by Name:**
```json
{
  "resource": "bookmarks",
  "operation": "manageTags",
  "bookmarkId": "bookmark-123",
  "tagAction": "remove",
  "tagsInputMethod": "names",
  "tagsToManage": "old-tag, unused"
}
```

### Manage Assets
Attach, replace, or detach assets from a bookmark.

**Parameters:**
- `bookmarkId` (required): The ID of the bookmark
- `assetAction` (required): "attach", "replace", or "detach"
- For **attach**: `assetId` and `assetType` required
- For **replace**: `currentAssetId` and `newAssetId` required  
- For **detach**: `currentAssetId` required

**Example - Attach Asset:**
```json
{
  "resource": "bookmarks",
  "operation": "manageAssets",
  "bookmarkId": "bookmark-123",
  "assetAction": "attach",
  "assetId": "asset-456",
  "assetType": "screenshot"
}
```

**Example - Replace Asset:**
```json
{
  "resource": "bookmarks",
  "operation": "manageAssets",
  "bookmarkId": "bookmark-123",
  "assetAction": "replace",
  "currentAssetId": "old-asset-456",
  "newAssetId": "new-asset-789"
}
```

**Example - Detach Asset:**
```json
{
  "resource": "bookmarks",
  "operation": "manageAssets",
  "bookmarkId": "bookmark-123",
  "assetAction": "detach",
  "currentAssetId": "asset-456"
}
```

**Available Asset Types:**
- `linkHtmlContent` - HTML content of the link
- `screenshot` - Screenshot of the page
- `assetScreenshot` - Screenshot of an asset
- `bannerImage` - Banner/header image
- `fullPageArchive` - Full page archive
- `video` - Video content
- `bookmarkAsset` - General bookmark asset
- `precrawledArchive` - Pre-crawled archive
- `unknown` - Unknown asset type

## Common Use Cases

### 1. Bulk Bookmark Creation
Create multiple bookmarks from a list of URLs:

```json
{
  "workflow": "For each URL in input data",
  "node": {
    "resource": "bookmarks",
    "operation": "create",
    "url": "{{ $json.url }}",
    "title": "{{ $json.title }}",
    "tags": "{{ $json.category }}, imported"
  }
}
```

### 2. Archive Old Bookmarks
Find and archive bookmarks older than a certain date:

```json
{
  "step1": {
    "resource": "bookmarks",
    "operation": "getAll",
    "additionalFields": {
      "endDate": "2023-01-01T00:00:00.000Z",
      "archived": "false"
    }
  },
  "step2": {
    "resource": "bookmarks",
    "operation": "update",
    "bookmarkId": "{{ $json.id }}",
    "archived": true
  }
}
```

### 3. Tag Management Workflow
Automatically tag bookmarks based on their content:

```json
{
  "step1": {
    "resource": "bookmarks",
    "operation": "search",
    "searchQuery": "tutorial",
    "searchOptions": {
      "sortOrder": "relevance",
      "includeContent": false
    }
  },
  "step2": {
    "resource": "bookmarks",
    "operation": "manageTags",
    "bookmarkId": "{{ $json.id }}",
    "tagAction": "add",
    "tagsToManage": "tutorial, learning"
  }
}
```

### 4. Bookmark Cleanup
Remove bookmarks that are no longer accessible:

```json
{
  "step1": {
    "resource": "bookmarks",
    "operation": "getAll"
  },
  "step2": "Check URL accessibility (HTTP node)",
  "step3": {
    "resource": "bookmarks",
    "operation": "delete",
    "bookmarkId": "{{ $json.id }}"
  }
}
```

### 5. Content Enrichment Workflow
Automatically enrich bookmarks with metadata:

```json
{
  "step1": {
    "resource": "bookmarks",
    "operation": "getAll",
    "additionalFields": {
      "archived": "false"
    }
  },
  "step2": "Extract metadata from content (HTTP node + parsing)",
  "step3": {
    "resource": "bookmarks",
    "operation": "update",
    "bookmarkId": "{{ $json.id }}",
    "author": "{{ $json.extractedAuthor }}",
    "publisher": "{{ $json.extractedPublisher }}",
    "datePublished": "{{ $json.extractedDate }}",
    "description": "{{ $json.extractedDescription }}"
  }
}
```

### 6. Bookmark Migration
Update bookmark URLs when sites move:

```json
{
  "step1": {
    "resource": "bookmarks",
    "operation": "search",
    "searchQuery": "old-domain.com",
    "searchOptions": {
      "includeContent": false,
      "limit": 100
    }
  },
  "step2": {
    "resource": "bookmarks",
    "operation": "update",
    "bookmarkId": "{{ $json.id }}",
    "updateUrl": "{{ $json.url.replace('old-domain.com', 'new-domain.com') }}",
    "note": "URL updated due to domain migration"
  }
}
```

### 7. Advanced Search with Pagination
Handle large search results with cursor-based pagination:

```json
{
  "step1": {
    "resource": "bookmarks",
    "operation": "search",
    "searchQuery": "programming",
    "searchOptions": {
      "sortOrder": "desc",
      "limit": 50,
      "includeContent": false
    }
  },
  "step2": "Process first batch of results",
  "step3": {
    "resource": "bookmarks",
    "operation": "search",
    "searchQuery": "programming",
    "searchOptions": {
      "sortOrder": "desc",
      "limit": 50,
      "cursor": "{{ $json.cursor }}",
      "includeContent": false
    }
  }
}
```

## Error Handling

The Karakeep node provides detailed error messages for common issues:

- **Invalid URL**: When creating bookmarks with malformed URLs
- **Missing Required Fields**: When required parameters are not provided
- **Resource Not Found**: When trying to access non-existent bookmarks
- **Authentication Errors**: When API credentials are invalid
- **Rate Limiting**: When API rate limits are exceeded

## Best Practices

1. **Use Pagination**: When retrieving large numbers of bookmarks, use pagination to avoid timeouts
2. **Batch Operations**: Group related operations together for better performance
3. **Error Handling**: Always include error handling in your workflows
4. **Tag Consistency**: Use consistent tag naming conventions
5. **URL Validation**: Validate URLs before creating bookmarks
6. **Regular Cleanup**: Periodically clean up unused tags and archived bookmarks