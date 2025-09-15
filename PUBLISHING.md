# Publishing Guide for n8n-nodes-karakeep

This guide explains how to publish updates to the n8n-nodes-karakeep package on npm.

## Quick Publishing Commands

### Automated Version Bumping + Publishing

```bash
# Patch version (bug fixes: 1.0.0 -> 1.0.1)
npm run publish:patch

# Minor version (new features: 1.0.0 -> 1.1.0)
npm run publish:minor

# Major version (breaking changes: 1.0.0 -> 2.0.0)
npm run publish:major
```

### Interactive Publishing (Recommended)

```bash
# Run the interactive publishing script
npm run publish:interactive
```

This script will:
- Check npm authentication
- Show current version
- Let you choose version bump type
- Run tests and build
- Create package tarball
- Ask for confirmation before publishing

### Manual Publishing Steps

```bash
# 1. Clean and build
npm run clean
npm run build

# 2. Run tests
npm run test

# 3. Update version manually
npm version patch  # or minor/major

# 4. Create and publish package
npm pack
npm publish
```

### Dry Run (Test Without Publishing)

```bash
# Test the publishing process without actually publishing
npm run publish:dry
```

## Publishing Checklist

Before publishing, make sure:

- [ ] All tests pass (`npm test`)
- [ ] Code is properly formatted (`npm run format`)
- [ ] Build completes successfully (`npm run build`)
- [ ] Version number is appropriate for the changes
- [ ] README.md is up to date
- [ ] CHANGELOG.md is updated (if you have one)
- [ ] You're logged into npm (`npm whoami`)

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (1.0.0 -> 1.0.1): Bug fixes, small improvements
- **Minor** (1.0.0 -> 1.1.0): New features, backward compatible
- **Major** (1.0.0 -> 2.0.0): Breaking changes

## Post-Publishing Steps

After successful publishing:

1. **Update GitHub**: Push the version changes to GitHub
2. **Create Release**: Create a GitHub release with changelog
3. **Test Installation**: Verify users can install the new version
4. **Announce**: Let users know about the update

## Troubleshooting

### Authentication Issues
```bash
npm login
npm whoami  # Verify you're logged in
```

### Build Failures
```bash
npm run clean
npm install
npm run build
```

### Test Failures
```bash
npm test
# Fix any failing tests before publishing
```

### Publishing Errors
- Check if version already exists on npm
- Ensure you have publish permissions
- Verify package.json is valid

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run publish:patch` | Bump patch version and publish |
| `npm run publish:minor` | Bump minor version and publish |
| `npm run publish:major` | Bump major version and publish |
| `npm run publish:interactive` | Interactive publishing wizard |
| `npm run publish:dry` | Test publishing without actually publishing |
| `npm run build` | Build the project |
| `npm run test` | Run all tests |
| `npm run clean` | Clean build directory |

## Package Information

- **Package Name**: n8n-nodes-karakeep
- **npm URL**: https://www.npmjs.com/package/n8n-nodes-karakeep
- **Repository**: https://github.com/technovangelist/n8n-nodes-karakeep

## Support

For issues with publishing, check:
- [npm documentation](https://docs.npmjs.com/)
- [n8n community nodes guide](https://docs.n8n.io/integrations/community-nodes/)
- Project GitHub issues