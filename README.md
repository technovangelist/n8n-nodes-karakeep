# n8n-nodes-karakeep

An n8n community node for integrating with Karakeep bookmark management service. 

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes** in your n8n instance
2. Select **Install** and enter `n8n-nodes-karakeep`
3. Click **Install**

### Manual Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the node
4. Run `npm run link:n8n` to link the node to your local n8n installation

## Development

### Prerequisites

- Node.js 18+
- n8n installed locally
- TypeScript knowledge

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Link to n8n: `npm run link:n8n`

### Development Workflow

1. Make changes to the source code
2. Run `npm run dev` for watch mode compilation
3. Restart n8n to see changes
4. Test your changes in n8n workflows

### Available Scripts

- `npm run build` - Build the project
- `npm run dev` - Watch mode for development
- `npm run test` - Run tests
- `npm run lint` - Lint the code
- `npm run format` - Format the code
- `npm run link:n8n` - Link to local n8n installation
- `npm run unlink:n8n` - Unlink from local n8n installation

## Usage

1. Add Karakeep credentials with your API key and instance URL
2. Add the Karakeep node to your workflow
3. Select the resource type (Bookmarks, Lists, Tags, etc.)
4. Choose the operation you want to perform
5. Configure the parameters as needed

## Resources

The Karakeep node supports the following resources:

- **Bookmarks**: Create, read, update, delete, and search bookmarks
- **Lists**: Manage bookmark collections
- **Tags**: Organize bookmarks with tags
- **Highlights**: Manage text highlights within bookmarks
- **Users**: Access user information and statistics
- **Assets**: Upload and manage files associated with bookmarks

You can find examples and sample workflows in the [examples directory](https://github.com/technovangelist/n8n-nodes-karakeep/tree/main/examples)


## License

MIT

## Support

For issues and feature requests, please use the GitHub issue tracker.