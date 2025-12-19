# Contributing to WorkDesks

## Git Workflow

We follow a **feature branch workflow** to maintain code quality and enable collaboration.

### Branch Structure

- **`main`** - Production-ready code (protected)
- **`develop`** - Integration branch for ongoing development
- **`feature/*`** - New features
- **`bugfix/*`** - Bug fixes
- **`hotfix/*`** - Urgent production fixes

### Workflow Steps

#### 1. Start a New Feature

```bash
# Make sure you're on develop and up to date
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/your-feature-name

# Examples:
# git checkout -b feature/add-notifications
# git checkout -b feature/ticket-filters
# git checkout -b bugfix/fix-login-redirect
```

#### 2. Work on Your Feature

```bash
# Make changes to your code
# Stage and commit your changes
git add .
git commit -m "feat: Add your feature description"

# Push to GitHub
git push -u origin feature/your-feature-name
```

#### 3. Create a Pull Request

1. Go to GitHub repository
2. Click "Pull Requests" → "New Pull Request"
3. Set base branch to `develop`
4. Set compare branch to your feature branch
5. Add description and create PR
6. Request review (if working in a team)

#### 4. Merge to Develop

After PR is approved:
- Merge the PR on GitHub
- Delete the feature branch

#### 5. Release to Production

When ready to release:

```bash
# Merge develop to main
git checkout main
git pull origin main
git merge develop
git push origin main

# Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: Add canned responses functionality
fix: Resolve login redirect issue
docs: Update README with setup instructions
refactor: Extract ticket validation logic
```

## Code Review Guidelines

- Keep PRs focused and small
- Write clear descriptions
- Add screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed

## Current Development

All new features should branch from `develop` and merge back to `develop` via Pull Request.
