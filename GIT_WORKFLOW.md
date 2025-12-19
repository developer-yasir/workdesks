# Git Workflow Quick Reference

## Current Branch Structure

```
main (production) ← You are here
  └── develop (integration)
      └── feature/* (your work)
```

## Quick Commands

### Start New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Commit Changes
```bash
git add .
git commit -m "feat: Your feature description"
git push -u origin feature/your-feature-name
```

### Create Pull Request
1. Go to GitHub
2. Click "Pull Requests" → "New"
3. Base: `develop` ← Compare: `feature/your-feature-name`
4. Create PR

### After PR Merged
```bash
git checkout develop
git pull origin develop
git branch -d feature/your-feature-name
```

## Commit Message Prefixes

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructure
- `test:` - Tests
- `chore:` - Maintenance

## Example Workflow

```bash
# 1. Start new feature
git checkout develop
git checkout -b feature/add-notifications

# 2. Make changes
# ... edit files ...

# 3. Commit
git add .
git commit -m "feat: Add email notifications for new tickets"

# 4. Push
git push -u origin feature/add-notifications

# 5. Create PR on GitHub (base: develop)

# 6. After merge, cleanup
git checkout develop
git pull origin develop
git branch -d feature/add-notifications
```

## Current Status

✅ `main` - Production-ready code
✅ `develop` - Integration branch (created)
🔄 Ready for feature branches!

## Next Steps

When you want to add a new feature:
1. Create a feature branch from `develop`
2. Work on your feature
3. Push and create PR to `develop`
4. After review, merge to `develop`
5. Periodically merge `develop` to `main` for releases
