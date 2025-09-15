# Karakeep Lists Examples

This document provides examples of how to use the Karakeep node for list management operations.

## Available Operations

### Get All Lists
Retrieve all lists with optional filtering and pagination.

**Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of lists per page (max 100)
- `isPublic` (optional): Filter by list visibility (all/true/false)

**Example:**
```json
{
  "resource": "lists",
  "operation": "getAll",
  "additionalFields": {
    "page": 1,
    "limit": 20,
    "isPublic": true
  }
}
```

### Get List by ID
Retrieve a specific list by its ID.

**Parameters:**
- `listId` (required): The ID of the list to retrieve

**Example:**
```json
{
  "resource": "lists",
  "operation": "getById",
  "listId": "list-123"
}
```

### Create List
Create a new list for organizing bookmarks.

**Parameters:**
- `name` (required): The name of the list (max 100 characters)
- `icon` (required): Icon for the list (emoji or icon identifier)
- `description` (optional): Description of the list (max 500 characters)
- `type` (optional): Type of list - "manual" (default) or "smart"
- `query` (optional): Query for smart lists (required when type is "smart", see [Search Query Language](https://docs.karakeep.app/guides/search-query-language) for syntax)
- `parentId` (optional): ID of parent list for nested organization

**Example - Basic Manual List:**
```json
{
  "resource": "lists",
  "operation": "create",
  "name": "My Reading List",
  "icon": "📚",
  "description": "Articles and resources I want to read later",
  "type": "manual"
}
```

**Example - Smart List:**
```json
{
  "resource": "lists",
  "operation": "create",
  "name": "JavaScript Resources",
  "icon": "⚡",
  "description": "Automatically curated JavaScript resources",
  "type": "smart",
  "query": "tag:javascript OR tag:js"
}
```

**Example - Nested List:**
```json
{
  "resource": "lists",
  "operation": "create",
  "name": "React Tutorials",
  "icon": "⚛️",
  "description": "React-specific learning materials",
  "type": "manual",
  "parentId": "parent-list-id"
}
```

### Update List
Update an existing list's properties.

**Parameters:**
- `listId` (required): The ID of the list to update
- `name` (optional): New name for the list (max 100 characters)
- `icon` (optional): New icon for the list
- `description` (optional): New description for the list (max 500 characters)
- `type` (optional): New type of list - "manual" or "smart"
- `query` (optional): New query for smart lists (required when type is "smart", see [Search Query Language](https://docs.karakeep.app/guides/search-query-language) for syntax)
- `parentId` (optional): New parent list ID for nested organization

**Example - Update Name, Icon and Description:**
```json
{
  "resource": "lists",
  "operation": "update",
  "listId": "list-123",
  "name": "Updated Reading List",
  "icon": "📖",
  "description": "My updated collection of articles to read"
}
```

**Example - Convert to Smart List:**
```json
{
  "resource": "lists",
  "operation": "update",
  "listId": "list-123",
  "type": "smart",
  "query": "tag:programming AND created:>2023-01-01"
}
```

**Example - Update Parent (Move to Different Category):**
```json
{
  "resource": "lists",
  "operation": "update",
  "listId": "list-123",
  "parentId": "new-parent-list-id"
}
```

### Delete List
Delete a list and remove all bookmark associations.

**Parameters:**
- `listId` (required): The ID of the list to delete

**Example:**
```json
{
  "resource": "lists",
  "operation": "delete",
  "listId": "list-123"
}
```

### Add Bookmarks to List
Add one or more bookmarks to a list.

**Parameters:**
- `listId` (required): The ID of the list
- `bookmarkInputMethod` (required): "single" or "multiple"
- `bookmarkId` (required when single): The ID of the bookmark to add
- `bookmarkIds` (required when multiple): Comma-separated list of bookmark IDs

**Example - Add Single Bookmark:**
```json
{
  "resource": "lists",
  "operation": "addBookmarks",
  "listId": "list-123",
  "bookmarkInputMethod": "single",
  "bookmarkId": "bookmark-456"
}
```

**Example - Add Multiple Bookmarks:**
```json
{
  "resource": "lists",
  "operation": "addBookmarks",
  "listId": "list-123",
  "bookmarkInputMethod": "multiple",
  "bookmarkIds": "bookmark-456, bookmark-789, bookmark-101"
}
```

### Remove Bookmarks from List
Remove one or more bookmarks from a list.

**Parameters:**
- `listId` (required): The ID of the list
- `bookmarkInputMethod` (required): "single" or "multiple"
- `bookmarkId` (required when single): The ID of the bookmark to remove
- `bookmarkIds` (required when multiple): Comma-separated list of bookmark IDs

**Example - Remove Single Bookmark:**
```json
{
  "resource": "lists",
  "operation": "removeBookmarks",
  "listId": "list-123",
  "bookmarkInputMethod": "single",
  "bookmarkId": "bookmark-456"
}
```

**Example - Remove Multiple Bookmarks:**
```json
{
  "resource": "lists",
  "operation": "removeBookmarks",
  "listId": "list-123",
  "bookmarkInputMethod": "multiple",
  "bookmarkIds": "bookmark-456, bookmark-789"
}
```

## Common Use Cases

### 1. Create Themed Lists
Organize bookmarks by topic or theme:

```json
{
  "workflow": "Create multiple themed lists",
  "lists": [
    {
      "resource": "lists",
      "operation": "create",
      "name": "Web Development",
      "icon": "💻",
      "description": "Resources for web development learning",
      "type": "smart",
      "query": "tag:webdev OR tag:programming"
    },
    {
      "resource": "lists",
      "operation": "create",
      "name": "Design Inspiration",
      "icon": "🎨",
      "description": "Beautiful designs and UI/UX resources",
      "type": "manual"
    },
    {
      "resource": "lists",
      "operation": "create",
      "name": "Personal Reading",
      "icon": "📖",
      "description": "Articles I want to read in my free time",
      "type": "manual"
    }
  ]
}
```

### 2. Bulk Bookmark Organization
Automatically organize bookmarks into lists based on tags:

```json
{
  "step1": {
    "resource": "bookmarks",
    "operation": "search",
    "searchQuery": "javascript",
    "searchOptions": {
      "includeContent": false,
      "limit": 100
    }
  },
  "step2": {
    "resource": "lists",
    "operation": "create",
    "name": "JavaScript Resources",
    "icon": "⚡",
    "description": "All JavaScript-related bookmarks",
    "type": "smart",
    "query": "tag:javascript"
  },
  "step3": {
    "resource": "lists",
    "operation": "addBookmarks",
    "listId": "{{ $('step2').item.json.id }}",
    "bookmarkInputMethod": "single",
    "bookmarkId": "{{ $json.id }}"
  }
}
```

### 3. List Curation Workflow
Create curated lists from existing bookmarks:

```json
{
  "step1": {
    "resource": "bookmarks",
    "operation": "getAll",
    "additionalFields": {
      "tags": "tutorial, beginner",
      "archived": "false"
    }
  },
  "step2": {
    "resource": "lists",
    "operation": "create",
    "name": "Beginner Tutorials",
    "description": "Hand-picked tutorials for beginners",
    "isPublic": true
  },
  "step3": {
    "resource": "lists",
    "operation": "addBookmarks",
    "listId": "{{ $('step2').item.json.id }}",
    "bookmarkInputMethod": "multiple",
    "bookmarkIds": "{{ $json.map(item => item.id).join(', ') }}"
  }
}
```

### 4. List Maintenance
Regularly clean up and maintain lists:

```json
{
  "step1": {
    "resource": "lists",
    "operation": "getAll"
  },
  "step2": "Check if list has bookmarks (custom logic)",
  "step3": {
    "resource": "lists",
    "operation": "delete",
    "listId": "{{ $json.id }}"
  }
}
```

### 5. Collaborative List Management
Create and share public lists for team collaboration:

```json
{
  "step1": {
    "resource": "lists",
    "operation": "create",
    "name": "Team Resources - {{ new Date().toISOString().split('T')[0] }}",
    "description": "Weekly curated resources for the development team",
    "isPublic": true
  },
  "step2": {
    "resource": "bookmarks",
    "operation": "search",
    "searchQuery": "{{ $json.weeklyTopic }}",
    "searchOptions": {
      "sortOrder": "relevance",
      "limit": 20
    }
  },
  "step3": {
    "resource": "lists",
    "operation": "addBookmarks",
    "listId": "{{ $('step1').item.json.id }}",
    "bookmarkInputMethod": "single",
    "bookmarkId": "{{ $json.id }}"
  }
}
```

### 6. List Migration and Backup
Backup list contents and migrate between instances:

```json
{
  "backup_workflow": {
    "step1": {
      "resource": "lists",
      "operation": "getAll"
    },
    "step2": {
      "resource": "lists",
      "operation": "getById",
      "listId": "{{ $json.id }}"
    },
    "step3": "Export list data to external storage"
  },
  "restore_workflow": {
    "step1": "Read list data from backup",
    "step2": {
      "resource": "lists",
      "operation": "create",
      "name": "{{ $json.name }}",
      "description": "{{ $json.description }}",
      "isPublic": "{{ $json.isPublic }}"
    },
    "step3": {
      "resource": "lists",
      "operation": "addBookmarks",
      "listId": "{{ $('step2').item.json.id }}",
      "bookmarkInputMethod": "multiple",
      "bookmarkIds": "{{ $json.bookmarkIds.join(', ') }}"
    }
  }
}
```

### 7. Dynamic List Creation
Create lists based on bookmark metadata:

```json
{
  "step1": {
    "resource": "bookmarks",
    "operation": "getAll",
    "additionalFields": {
      "archived": "false"
    }
  },
  "step2": "Group bookmarks by domain or author",
  "step3": {
    "resource": "lists",
    "operation": "create",
    "name": "{{ $json.groupName }} Resources",
    "description": "Bookmarks from {{ $json.groupName }}",
    "isPublic": false
  },
  "step4": {
    "resource": "lists",
    "operation": "addBookmarks",
    "listId": "{{ $('step3').item.json.id }}",
    "bookmarkInputMethod": "multiple",
    "bookmarkIds": "{{ $json.bookmarkIds.join(', ') }}"
  }
}
```

### 8. List Analytics and Reporting
Generate reports on list usage and contents:

```json
{
  "step1": {
    "resource": "lists",
    "operation": "getAll"
  },
  "step2": {
    "resource": "lists",
    "operation": "getById",
    "listId": "{{ $json.id }}"
  },
  "step3": "Generate analytics report",
  "report_data": {
    "listName": "{{ $json.name }}",
    "bookmarkCount": "{{ $json.bookmarkCount }}",
    "isPublic": "{{ $json.isPublic }}",
    "createdAt": "{{ $json.createdAt }}",
    "lastUpdated": "{{ $json.updatedAt }}"
  }
}
```

### 9. Automated List Updates
Automatically update lists based on new bookmarks:

```json
{
  "trigger": "New bookmark created webhook",
  "step1": "Analyze bookmark tags and content",
  "step2": {
    "resource": "lists",
    "operation": "getAll",
    "additionalFields": {
      "isPublic": false
    }
  },
  "step3": "Match bookmark to appropriate lists",
  "step4": {
    "resource": "lists",
    "operation": "addBookmarks",
    "listId": "{{ $json.matchedListId }}",
    "bookmarkInputMethod": "single",
    "bookmarkId": "{{ $json.newBookmarkId }}"
  }
}
```

### 10. List Synchronization
Keep lists synchronized across different systems:

```json
{
  "sync_workflow": {
    "step1": {
      "resource": "lists",
      "operation": "getAll"
    },
    "step2": "Compare with external system",
    "step3_create": {
      "resource": "lists",
      "operation": "create",
      "name": "{{ $json.externalList.name }}",
      "description": "{{ $json.externalList.description }}",
      "isPublic": "{{ $json.externalList.isPublic }}"
    },
    "step3_update": {
      "resource": "lists",
      "operation": "update",
      "listId": "{{ $json.existingList.id }}",
      "name": "{{ $json.externalList.name }}",
      "description": "{{ $json.externalList.description }}"
    },
    "step4": {
      "resource": "lists",
      "operation": "addBookmarks",
      "listId": "{{ $json.listId }}",
      "bookmarkInputMethod": "multiple",
      "bookmarkIds": "{{ $json.newBookmarkIds.join(', ') }}"
    }
  }
}
```

## Advanced Patterns

### Conditional List Operations
Use n8n's conditional logic with list operations:

```json
{
  "if_node": {
    "conditions": {
      "boolean": [
        {
          "value1": "{{ $json.bookmarkCount }}",
          "operation": "larger",
          "value2": 10
        }
      ]
    }
  },
  "true_branch": {
    "resource": "lists",
    "operation": "update",
    "listId": "{{ $json.id }}",
    "description": "Large collection with {{ $json.bookmarkCount }} bookmarks"
  },
  "false_branch": {
    "resource": "lists",
    "operation": "update",
    "listId": "{{ $json.id }}",
    "description": "Small collection with {{ $json.bookmarkCount }} bookmarks"
  }
}
```

### Error Handling for Bulk Operations
Handle errors gracefully when working with multiple bookmarks:

```json
{
  "step1": {
    "resource": "lists",
    "operation": "addBookmarks",
    "listId": "list-123",
    "bookmarkInputMethod": "multiple",
    "bookmarkIds": "bookmark-1, bookmark-2, invalid-bookmark, bookmark-3"
  },
  "error_handling": {
    "continueOnFail": true,
    "onError": "Check response for failed bookmarks and retry individually"
  }
}
```

### List Templating
Create lists from templates:

```json
{
  "templates": [
    {
      "name": "Weekly Reading - Week {{ $json.weekNumber }}",
      "description": "Curated articles for week {{ $json.weekNumber }} of {{ $json.year }}",
      "isPublic": true
    },
    {
      "name": "{{ $json.projectName }} Resources",
      "description": "Resources and references for the {{ $json.projectName }} project",
      "isPublic": false
    }
  ],
  "create_from_template": {
    "resource": "lists",
    "operation": "create",
    "name": "{{ $json.template.name }}",
    "description": "{{ $json.template.description }}",
    "isPublic": "{{ $json.template.isPublic }}"
  }
}
```

## Best Practices

1. **Descriptive Names**: Use clear, descriptive names for your lists
2. **Consistent Organization**: Develop a consistent system for organizing lists
3. **Regular Maintenance**: Periodically review and clean up unused lists
4. **Bulk Operations**: Use bulk operations when adding/removing multiple bookmarks
5. **Error Handling**: Always include error handling for bulk operations
6. **Privacy Settings**: Be mindful of public vs private list settings
7. **Documentation**: Document your list organization system for team collaboration

## Error Handling

The Lists resource provides detailed error messages for common issues:

- **Missing List ID**: When trying to access operations without providing a list ID
- **Invalid Bookmark IDs**: When trying to add/remove non-existent bookmarks
- **Empty Updates**: When trying to update a list without providing any fields
- **Duplicate Operations**: When trying to add bookmarks that are already in the list
- **Permission Errors**: When trying to modify lists without proper permissions

## Response Formats

### Successful Operations
Most operations return the updated list object or confirmation:

```json
{
  "id": "list-123",
  "name": "My Reading List",
  "description": "Articles I want to read",
  "icon": "📚",
  "parentId": null,
  "type": "manual",
  "query": null,
  "public": false,
  "bookmarkCount": 15,
  "createdAt": "2023-12-01T10:00:00.000Z",
  "updatedAt": "2023-12-15T14:30:00.000Z"
}
```

### Bulk Operations
Bulk bookmark operations return detailed results:

```json
{
  "success": true,
  "listId": "list-123",
  "addedBookmarks": [
    { "success": true, "bookmarkId": "bookmark-1" },
    { "success": true, "bookmarkId": "bookmark-2" },
    { "success": false, "bookmarkId": "bookmark-3", "error": "Bookmark not found" }
  ],
  "totalProcessed": 3
}
```

### Delete Operations
Delete operations return confirmation:

```json
{
  "success": true,
  "id": "list-123"
}
```