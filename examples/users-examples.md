# Users Resource Examples

This document provides examples of using the Karakeep Users resource in n8n workflows.

## Available Operations

### Get Current User
Retrieves the profile information of the currently authenticated user.

**Use Cases:**
- Display user information in dashboards
- Validate user permissions before performing operations
- Personalize workflow behavior based on user role

### Get User Stats
Retrieves comprehensive statistics about the current user's Karakeep data.

**Use Cases:**
- Create analytics dashboards
- Monitor user activity and content growth
- Generate usage reports
- Set up alerts based on content thresholds

## Example Workflows

### 1. User Profile Dashboard

**Workflow Description:** Create a simple dashboard showing user profile and statistics.

**Steps:**
1. **Get Current User** - Retrieve user profile information
2. **Get User Stats** - Retrieve user statistics
3. **Format Data** - Combine profile and stats into a dashboard format
4. **Send to Dashboard** - Display the information (e.g., via webhook, email, or Slack)

**Sample Output:**
```json
{
  "profile": {
    "id": "user-123",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2023-01-15T10:30:00Z"
  },
  "statistics": {
    "totalBookmarks": 1250,
    "totalLists": 45,
    "totalTags": 189,
    "totalHighlights": 567,
    "totalAssets": 234
  }
}
```

### 2. Weekly Usage Report

**Workflow Description:** Generate a weekly report of user activity and send via email.

**Steps:**
1. **Schedule Trigger** - Run every Monday at 9 AM
2. **Get User Stats** - Retrieve current statistics
3. **Calculate Growth** - Compare with previous week's data (stored in database)
4. **Format Report** - Create a readable report format
5. **Send Email** - Email the report to the user

**Sample Report:**
```
Weekly Karakeep Report for John Doe

Current Statistics:
- Bookmarks: 1,250 (+15 this week)
- Lists: 45 (+2 this week)
- Tags: 189 (+8 this week)
- Highlights: 567 (+23 this week)
- Assets: 234 (+5 this week)

Keep up the great work organizing your knowledge!
```

### 3. Permission-Based Workflow Routing

**Workflow Description:** Route workflow execution based on user role.

**Steps:**
1. **Get Current User** - Check user role
2. **IF Node** - Check if role is 'admin'
3. **Admin Operations** - Execute admin-only operations
4. **User Operations** - Execute standard user operations

**Logic:**
```javascript
// In IF node condition
return items[0].json.role === 'admin';
```

### 4. Content Growth Monitoring

**Workflow Description:** Monitor content growth and send alerts when thresholds are reached.

**Steps:**
1. **Schedule Trigger** - Run daily
2. **Get User Stats** - Retrieve current statistics
3. **Check Thresholds** - Compare against predefined limits
4. **Send Alerts** - Notify when milestones are reached

**Threshold Examples:**
- Alert when bookmarks reach 1,000, 5,000, 10,000
- Notify when highlights exceed 500
- Celebrate when lists reach 50

### 5. User Onboarding Status

**Workflow Description:** Check user onboarding progress and send helpful tips.

**Steps:**
1. **Get Current User** - Check account creation date
2. **Get User Stats** - Check content creation progress
3. **Determine Onboarding Stage** - Based on account age and content
4. **Send Personalized Tips** - Provide relevant guidance

**Onboarding Stages:**
- **New User** (< 7 days, < 10 bookmarks): Getting started tips
- **Active User** (< 30 days, 10-100 bookmarks): Organization tips
- **Power User** (> 30 days, > 100 bookmarks): Advanced features

## Error Handling Examples

### Authentication Errors
```json
{
  "error": "Authentication failed: Please check your API credentials",
  "statusCode": 401
}
```

### Permission Errors
```json
{
  "error": "Access denied: Insufficient permissions to access user profile information",
  "statusCode": 403
}
```

## Best Practices

### 1. Cache User Information
Since user profile information doesn't change frequently, consider caching it to reduce API calls:

```javascript
// In Code node - check cache first
const cachedUser = $('Cache').first().json.user;
const cacheAge = Date.now() - $('Cache').first().json.timestamp;

// Use cached data if less than 1 hour old
if (cachedUser && cacheAge < 3600000) {
  return [{ json: cachedUser }];
}

// Otherwise, fetch fresh data
return [];
```

### 2. Handle Different User Roles
Always check user roles before performing operations:

```javascript
// In Code node
const userRole = $('Get Current User').first().json.role;

if (userRole !== 'admin') {
  throw new Error('This operation requires admin privileges');
}

return items;
```

### 3. Monitor API Usage
Track your API usage to avoid rate limits:

```javascript
// In Code node - log API calls
const stats = $('Get User Stats').first().json;
console.log(`API call made at ${new Date().toISOString()}`);
console.log(`User has ${stats.totalBookmarks} bookmarks`);

return items;
```

### 4. Graceful Error Handling
Always handle potential errors gracefully:

```javascript
// In Code node
try {
  const user = $('Get Current User').first().json;
  return [{ json: { success: true, user } }];
} catch (error) {
  return [{ json: { success: false, error: error.message } }];
}
```

## Integration Examples

### With Slack
Send user statistics to a Slack channel:

```javascript
// Format message for Slack
const stats = $('Get User Stats').first().json;
const user = $('Get Current User').first().json;

const message = `📊 *${user.name}'s Karakeep Stats*
• 📚 Bookmarks: ${stats.totalBookmarks}
• 📋 Lists: ${stats.totalLists}
• 🏷️ Tags: ${stats.totalTags}
• ✨ Highlights: ${stats.totalHighlights}
• 📎 Assets: ${stats.totalAssets}`;

return [{ json: { text: message } }];
```

### With Google Sheets
Log user statistics to a spreadsheet:

```javascript
// Format data for Google Sheets
const stats = $('Get User Stats').first().json;
const user = $('Get Current User').first().json;

return [{
  json: {
    Date: new Date().toISOString().split('T')[0],
    User: user.name,
    Email: user.email,
    Role: user.role,
    Bookmarks: stats.totalBookmarks,
    Lists: stats.totalLists,
    Tags: stats.totalTags,
    Highlights: stats.totalHighlights,
    Assets: stats.totalAssets
  }
}];
```

### With Email
Send a formatted email report:

```javascript
// Create HTML email content
const stats = $('Get User Stats').first().json;
const user = $('Get Current User').first().json;

const htmlContent = `
<h2>Your Karakeep Summary</h2>
<p>Hello ${user.name},</p>
<p>Here's your current Karakeep statistics:</p>
<ul>
  <li><strong>Bookmarks:</strong> ${stats.totalBookmarks}</li>
  <li><strong>Lists:</strong> ${stats.totalLists}</li>
  <li><strong>Tags:</strong> ${stats.totalTags}</li>
  <li><strong>Highlights:</strong> ${stats.totalHighlights}</li>
  <li><strong>Assets:</strong> ${stats.totalAssets}</li>
</ul>
<p>Keep up the great work organizing your knowledge!</p>
`;

return [{ json: { html: htmlContent, subject: 'Your Karakeep Summary' } }];
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API key is correct
   - Check that instance URL is properly formatted
   - Ensure credentials are saved in n8n

2. **Permission Errors**
   - Verify user has necessary permissions
   - Check if API key belongs to the correct user
   - Contact admin if permissions are needed

3. **Empty Statistics**
   - New users may have zero statistics
   - Check if user has created any content
   - Verify API is returning correct data

### Debug Tips

1. **Log API Responses**
   ```javascript
   // In Code node
   console.log('User data:', JSON.stringify($('Get Current User').first().json, null, 2));
   console.log('Stats data:', JSON.stringify($('Get User Stats').first().json, null, 2));
   ```

2. **Validate Data Structure**
   ```javascript
   // In Code node
   const user = $('Get Current User').first().json;
   if (!user.id || !user.email) {
     throw new Error('Invalid user data received');
   }
   ```

3. **Test with Manual Execution**
   - Use n8n's manual execution to test workflows
   - Check each node's output individually
   - Verify data flows correctly between nodes