# Assets Examples

This document provides examples of using the Karakeep Assets resource in n8n workflows.

## Upload Asset from Binary Data

Upload a file that was processed by a previous node (e.g., from HTTP Request, Read Binary File, etc.):

```json
{
  "resource": "assets",
  "operation": "upload",
  "uploadMethod": "binary",
  "binaryPropertyName": "data",
  "filename": "document.pdf",
  "mimeType": "application/pdf"
}
```

## Upload Asset from URL

Upload a file directly from a URL:

```json
{
  "resource": "assets",
  "operation": "upload",
  "uploadMethod": "url",
  "fileUrl": "https://example.com/document.pdf",
  "filename": "my-document.pdf"
}
```

## Get Asset Information

Retrieve metadata about an asset:

```json
{
  "resource": "assets",
  "operation": "getById",
  "assetId": "asset-123"
}
```

## Download Asset as Binary Data

Download an asset and return it as binary data for further processing:

```json
{
  "resource": "assets",
  "operation": "download",
  "assetId": "asset-123",
  "returnFormat": "binary",
  "binaryPropertyName": "data"
}
```

## Get Asset Download URL

Get the download URL without actually downloading the file:

```json
{
  "resource": "assets",
  "operation": "download",
  "assetId": "asset-123",
  "returnFormat": "url"
}
```

## Common Use Cases

### 1. Process and Upload Images

1. **HTTP Request** - Download image from external API
2. **Edit Image** - Resize or modify the image
3. **Karakeep Assets** - Upload processed image
4. **Karakeep Bookmarks** - Create bookmark with the uploaded asset

### 2. Backup Important Documents

1. **Read Binary Files** - Read files from local directory
2. **Karakeep Assets** - Upload each file
3. **Karakeep Bookmarks** - Create bookmarks for each uploaded document
4. **Karakeep Lists** - Add all document bookmarks to a "Backups" list

### 3. Archive Web Content

1. **HTTP Request** - Fetch webpage content
2. **HTML/CSS to Image** - Convert webpage to image
3. **Karakeep Assets** - Upload the screenshot
4. **Karakeep Bookmarks** - Create bookmark with both URL and screenshot asset

### 4. Document Processing Pipeline

1. **Karakeep Assets** - Download PDF document
2. **PDF** - Extract text content
3. **AI** - Summarize the content
4. **Karakeep Bookmarks** - Update bookmark with AI summary

## Supported File Types

### Images
- JPEG (`image/jpeg`)
- PNG (`image/png`)
- GIF (`image/gif`)
- WebP (`image/webp`)
- SVG (`image/svg+xml`)

### Documents
- PDF (`application/pdf`)
- Plain Text (`text/plain`)
- HTML (`text/html`)
- Markdown (`text/markdown`)
- JSON (`application/json`)
- XML (`application/xml`)

### Media
- MP4 Video (`video/mp4`)
- WebM Video (`video/webm`)
- MP3 Audio (`audio/mp3`)
- WAV Audio (`audio/wav`)

## File Size Limits

- Maximum file size: 50MB
- For larger files, consider using URL upload method if the source supports it
- Binary uploads are processed in memory, so very large files may impact performance

## Error Handling

Common errors and solutions:

### "File size exceeds maximum limit"
- Reduce file size before upload
- Use compression tools in your workflow
- Consider splitting large files

### "File type not supported"
- Check the supported MIME types list above
- Convert files to supported formats using appropriate n8n nodes

### "Asset download URL not available"
- The asset may not be ready for download yet
- Check if the asset exists using the "Get by ID" operation first

### "Binary property name is required"
- Ensure the previous node outputs binary data
- Check that the binary property name matches the actual property name

## Tips and Best Practices

1. **File Naming**: Use descriptive filenames to make assets easier to manage
2. **MIME Type Detection**: Let the system auto-detect MIME types when possible
3. **Error Handling**: Always include error handling for file operations
4. **Progress Tracking**: For large files, consider implementing progress feedback
5. **Cleanup**: Remove temporary assets that are no longer needed
6. **Security**: Validate file types and sizes before upload to prevent abuse