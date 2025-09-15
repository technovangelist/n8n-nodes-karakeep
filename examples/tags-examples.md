# Karakeep Tags Examples

This document provides examples of using the Karakeep n8n node for tag management operations.

## Basic Tag Operations

### 1. Get All Tags

Retrieve all tags with pagination and sorting:

```json
{
  "resource": "tags",
  "operation": "getAll",
  "additionalFields": {
    "page": 1,
    "limit": 20,
    "sortBy": "name",
    "sortOrder": "asc",
    "includeUsageStats": true
  }
}
```

### 2. Get Tag by ID

Retrieve a specific tag with usage statistics:

```json
{
  "resource": "tags",
  "operation": "getById",
  "tagId": "tag-123",
  "includeUsageStats": true
}
```

### 3. Create New Tag

Create a new tag with duplicate prevention:

```json
{
  "resource": "tags",
  "operation": "create",
  "name": "JavaScript",
  "preventDuplicates": true
}
```

### 4. Update Tag

Update an existing tag name:

```json
{
  "resource": "tags",
  "operation": "update",
  "tagId": "tag-123",
  "name": "TypeScript",
  "preventDuplicates": true
}
```

### 5. Delete Tag

Delete a tag (with safety check):

```json
{
  "resource": "tags",
  "operation": "delete",
  "tagId": "tag-123",
  "forceDelete": false
}
```

Force delete a tag (removes from all bookmarks):

```json
{
  "resource": "tags",
  "operation": "delete",
  "tagId": "tag-123",
  "forceDelete": true
}
```

### 6. Get Tagged Bookmarks

Get all bookmarks with a specific tag:

```json
{
  "resource": "tags",
  "operation": "getTaggedBookmarks",
  "tagId": "tag-123",
  "additionalFields": {
    "page": 1,
    "limit": 10,
    "sortBy": "createdAt",
    "sortOrder": "desc",
    "archived": "false",
    "includeContent": false
  }
}
```

## Advanced Tag Management Workflows

### Bulk Tag Creation

Create multiple tags from a list:

1. **Start with Manual Trigger**
2. **Set Node** with tag names:
   ```json
   {
     "tags": ["JavaScript", "TypeScript", "React", "Node.js", "API"]
   }
   ```
3. **Split In Batches** to process each tag
4. **Karakeep Node** to create each tag:
   ```json
   {
     "resource": "tags",
     "operation": "create",
     "name": "{{ $json.tags }}",
     "preventDuplicates": true
   }
   ```

### Tag Cleanup Workflow

Find and clean up unused tags:

1. **Schedule Trigger** (weekly)
2. **Karakeep Node** - Get all tags with usage stats:
   ```json
   {
     "resource": "tags",
     "operation": "getAll",
     "additionalFields": {
       "includeUsageStats": true,
       "limit": 100
     }
   }
   ```
3. **Function Node** to filter unused tags:
   ```javascript
   return items.filter(item => item.json.usageCount === 0);
   ```
4. **Karakeep Node** - Delete unused tags:
   ```json
   {
     "resource": "tags",
     "operation": "delete",
     "tagId": "{{ $json.id }}",
     "forceDelete": false
   }
   ```

### Tag Standardization Workflow

Standardize tag names (e.g., convert to lowercase):

1. **Karakeep Node** - Get all tags:
   ```json
   {
     "resource": "tags",
     "operation": "getAll",
     "additionalFields": {
       "limit": 100
     }
   }
   ```
2. **Function Node** to identify tags needing standardization:
   ```javascript
   return items.filter(item => {
     const name = item.json.name;
     const standardized = name.toLowerCase().trim();
     return name !== standardized;
   }).map(item => ({
     ...item,
     json: {
       ...item.json,
       standardizedName: item.json.name.toLowerCase().trim()
     }
   }));
   ```
3. **Karakeep Node** - Update tag names:
   ```json
   {
     "resource": "tags",
     "operation": "update",
     "tagId": "{{ $json.id }}",
     "name": "{{ $json.standardizedName }}",
     "preventDuplicates": true
   }
   ```

### Tag Usage Analytics

Generate tag usage reports:

1. **Schedule Trigger** (monthly)
2. **Karakeep Node** - Get all tags with usage stats:
   ```json
   {
     "resource": "tags",
     "operation": "getAll",
     "additionalFields": {
       "includeUsageStats": true,
       "sortBy": "usageCount",
       "sortOrder": "desc",
       "limit": 100
     }
   }
   ```
3. **Function Node** to generate report:
   ```javascript
   const totalTags = items.length;
   const usedTags = items.filter(item => item.json.usageCount > 0).length;
   const topTags = items.slice(0, 10);
   
   return [{
     json: {
       reportDate: new Date().toISOString(),
       totalTags,
       usedTags,
       unusedTags: totalTags - usedTags,
       topTags: topTags.map(item => ({
         name: item.json.name,
         usageCount: item.json.usageCount
       }))
     }
   }];
   ```
4. **Send Email** or save to file

### Smart Tag Suggestions

Suggest tags for new bookmarks based on content:

1. **Webhook Trigger** (when new bookmark is created)
2. **Karakeep Node** - Get bookmark content:
   ```json
   {
     "resource": "bookmarks",
     "operation": "getById",
     "bookmarkId": "{{ $json.bookmarkId }}"
   }
   ```
3. **Function Node** to analyze content and suggest tags:
   ```javascript
   const content = $json.content || '';
   const title = $json.title || '';
   const url = $json.url || '';
   
   // Simple keyword-based tag suggestions
   const suggestions = [];
   const text = (title + ' ' + content + ' ' + url).toLowerCase();
   
   if (text.includes('javascript') || text.includes('js')) suggestions.push('JavaScript');
   if (text.includes('typescript') || text.includes('ts')) suggestions.push('TypeScript');
   if (text.includes('react')) suggestions.push('React');
   if (text.includes('node')) suggestions.push('Node.js');
   if (text.includes('api')) suggestions.push('API');
   if (text.includes('tutorial')) suggestions.push('Tutorial');
   if (text.includes('documentation')) suggestions.push('Documentation');
   
   return [{ json: { bookmarkId: $json.id, suggestedTags: suggestions } }];
   ```
4. **Karakeep Node** - Add suggested tags to bookmark:
   ```json
   {
     "resource": "bookmarks",
     "operation": "manageTags",
     "bookmarkId": "{{ $json.bookmarkId }}",
     "tagAction": "add",
     "tagsInputMethod": "names",
     "tagsToManage": "{{ $json.suggestedTags.join(', ') }}"
   }
   ```

## Error Handling Examples

### Handling Duplicate Tags

```json
{
  "resource": "tags",
  "operation": "create",
  "name": "JavaScript",
  "preventDuplicates": true
}
```

If tag already exists, the operation will fail with a clear error message. To handle this:

1. Use **Function Node** to catch and handle the error
2. Or set `preventDuplicates: false` to allow duplicates
3. Or use **IF Node** to check if tag exists first

### Safe Tag Deletion

```json
{
  "resource": "tags",
  "operation": "delete",
  "tagId": "tag-123",
  "forceDelete": false
}
```

This will fail if the tag is still in use. To handle:

1. Use `forceDelete: true` to remove from all bookmarks
2. Or first get tagged bookmarks and handle them separately
3. Or use **IF Node** to check usage before deletion

## Best Practices

1. **Always use `preventDuplicates: true`** when creating/updating tags to maintain data integrity
2. **Include usage statistics** when analyzing tags for cleanup or reporting
3. **Use pagination** when dealing with large numbers of tags
4. **Implement error handling** for duplicate prevention and deletion safety
5. **Standardize tag names** (e.g., consistent casing, no extra spaces)
6. **Regular cleanup** of unused tags to keep the system organized
7. **Use descriptive tag names** that are meaningful and searchable
8. **Consider tag hierarchies** or naming conventions for better organization