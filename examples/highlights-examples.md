# Highlights Examples

This document provides examples of using the Karakeep Highlights resource in n8n workflows.

## Basic Operations

### Get All Highlights

Retrieve all highlights with optional filtering:

```json
{
  "resource": "highlights",
  "operation": "getAll",
  "additionalFields": {
    "page": 1,
    "limit": 20,
    "bookmarkId": "bookmark-123"
  }
}
```

### Get Highlight by ID

Retrieve a specific highlight:

```json
{
  "resource": "highlights",
  "operation": "getById",
  "highlightId": "highlight-456"
}
```

### Create New Highlight

Create a highlight with text position:

```json
{
  "resource": "highlights",
  "operation": "create",
  "bookmarkId": "bookmark-123",
  "text": "This is an important passage that needs highlighting",
  "startOffset": 150,
  "endOffset": 200,
  "color": "yellow",
  "note": "Key insight for the project"
}
```

### Update Highlight

Update highlight text and note:

```json
{
  "resource": "highlights",
  "operation": "update",
  "highlightId": "highlight-456",
  "text": "Updated highlighted text",
  "color": "red",
  "note": "Updated annotation with more context"
}
```

Update highlight position:

```json
{
  "resource": "highlights",
  "operation": "update",
  "highlightId": "highlight-456",
  "startOffset": 175,
  "endOffset": 225
}
```

### Delete Highlight

Remove a highlight:

```json
{
  "resource": "highlights",
  "operation": "delete",
  "highlightId": "highlight-456"
}
```

## Advanced Use Cases

### Bulk Highlight Creation

Create multiple highlights from a list of text selections:

1. **Start Node**: Manual trigger with highlight data
2. **Split In Batches**: Process highlights one by one
3. **Karakeep Node**: Create each highlight
4. **Merge**: Combine results

### Highlight Analysis Workflow

Analyze highlights for insights:

1. **Karakeep Node**: Get all highlights for a bookmark
2. **Function Node**: Extract and analyze highlight text
3. **OpenAI Node**: Generate summary of key insights
4. **Karakeep Node**: Update bookmark with analysis summary

### Highlight Export Workflow

Export highlights to external systems:

1. **Karakeep Node**: Get all highlights with pagination
2. **Function Node**: Format highlights for export
3. **Google Sheets Node**: Save to spreadsheet
4. **Email Node**: Send export notification

### Smart Highlight Suggestions

Suggest highlights based on content analysis:

1. **Karakeep Node**: Get bookmark content
2. **OpenAI Node**: Analyze content for key passages
3. **Function Node**: Convert AI suggestions to highlight format
4. **Karakeep Node**: Create suggested highlights
5. **Slack Node**: Notify user of new suggestions

## Error Handling Examples

### Validation Error Handling

Handle validation errors gracefully:

```json
{
  "nodes": [
    {
      "name": "Create Highlight",
      "type": "karakeep",
      "parameters": {
        "resource": "highlights",
        "operation": "create",
        "bookmarkId": "{{ $json.bookmarkId }}",
        "text": "{{ $json.text }}",
        "startOffset": "{{ $json.startOffset }}",
        "endOffset": "{{ $json.endOffset }}"
      },
      "continueOnFail": true
    },
    {
      "name": "Handle Errors",
      "type": "function",
      "parameters": {
        "functionCode": "if (items[0].json.error) { return [{ json: { status: 'failed', reason: items[0].json.error } }]; } return [{ json: { status: 'success', highlight: items[0].json } }];"
      }
    }
  ]
}
```

### Position Validation

Validate highlight positions before creation:

```json
{
  "nodes": [
    {
      "name": "Validate Position",
      "type": "function",
      "parameters": {
        "functionCode": "const { startOffset, endOffset, text } = items[0].json; if (startOffset < 0 || endOffset <= startOffset || !text.trim()) { throw new Error('Invalid highlight parameters'); } return items;"
      }
    },
    {
      "name": "Create Highlight",
      "type": "karakeep",
      "parameters": {
        "resource": "highlights",
        "operation": "create"
      }
    }
  ]
}
```

## Integration Patterns

### Highlight-Based Bookmarking

Create bookmarks based on highlights:

1. **Webhook Node**: Receive highlight data from browser extension
2. **Function Node**: Extract bookmark URL and metadata
3. **Karakeep Node**: Create bookmark if it doesn't exist
4. **Karakeep Node**: Create highlight on the bookmark
5. **Response Node**: Return success status

### Collaborative Highlighting

Share highlights with team members:

1. **Karakeep Node**: Get new highlights (created in last hour)
2. **Function Node**: Filter highlights with notes
3. **Slack Node**: Post highlights to team channel
4. **Karakeep Node**: Tag highlights as "shared"

### Highlight-Driven Research

Use highlights to drive research workflows:

1. **Schedule Trigger**: Run daily
2. **Karakeep Node**: Get highlights with specific tags
3. **Function Node**: Extract research topics from highlights
4. **Google Search Node**: Find related articles
5. **Karakeep Node**: Create bookmarks for relevant results
6. **Email Node**: Send research digest

## Best Practices

### Position Accuracy

- Always validate that `endOffset > startOffset`
- Ensure offsets are within the content bounds
- Use 0-based indexing for character positions
- Test position calculations with sample content

### Text Validation

- Trim whitespace from highlight text
- Validate that text is not empty
- Consider text encoding issues
- Handle special characters properly

### Error Recovery

- Use `continueOnFail` for batch operations
- Implement retry logic for network errors
- Validate input data before API calls
- Log errors for debugging

### Performance Optimization

- Use pagination for large highlight sets
- Filter highlights by bookmark ID when possible
- Batch operations when creating multiple highlights
- Cache frequently accessed highlight data

### Data Consistency

- Verify bookmark exists before creating highlights
- Handle bookmark deletion scenarios
- Maintain highlight-bookmark relationships
- Clean up orphaned highlights regularly