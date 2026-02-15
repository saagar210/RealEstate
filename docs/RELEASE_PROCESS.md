# Release Process

## Overview

This document describes the complete release process for RealEstate Listing Optimizer, from version bumping to distribution.

---

## Prerequisites

Before creating a release:

- ✅ All tests passing on main branch
- ✅ Code signing certificates configured (see `CODE_SIGNING.md`)
- ✅ CHANGELOG.md updated with release notes
- ✅ No known critical bugs
- ✅ QA testing completed

---

## Release Workflow

### 1. Version Bump

**Manual Method:**

```bash
# Patch version (1.0.0 → 1.0.1)
pnpm run version:patch

# Minor version (1.0.0 → 1.1.0)
pnpm run version:minor

# Major version (1.0.0 → 2.0.0)
pnpm run version:major
```

**GitHub Actions Method (Recommended):**

1. Go to: Actions → Version Bump → Run workflow
2. Select version type: patch/minor/major
3. Enter changelog entry
4. Click "Run workflow"

This will:
- Bump version in `package.json`, `Cargo.toml`, `tauri.conf.json`
- Update `CHANGELOG.md` with date and changes
- Create git tag (e.g., `v1.0.1`)
- Commit and push to main
- Trigger build workflow

---

### 2. Build & Package

The build workflow runs automatically when a version tag is pushed.

**Manual Build:**

```bash
# Build for current platform
pnpm tauri build

# Artifacts in:
# - macOS: src-tauri/target/release/bundle/dmg/
# - Windows: src-tauri/target/release/bundle/msi/
# - Linux: src-tauri/target/release/bundle/appimage/
```

**GitHub Actions Build:**

Triggered automatically on tag push. Builds for:
- macOS (x64 + ARM64)
- Windows (x64)
- Linux (x64)

Check: Actions → Build & Release

---

### 3. Create GitHub Release

**Automated (via workflow):**

1. Wait for build workflow to complete
2. Draft release created automatically
3. Review release notes
4. Publish release

**Manual:**

1. Go to: Releases → Draft a new release
2. Choose tag: `v1.0.1`
3. Title: "RealEstate Listing Optimizer v1.0.1"
4. Description: Copy from CHANGELOG.md
5. Attach artifacts:
   - `RealEstate_x64.app.tar.gz` (macOS Intel)
   - `RealEstate_aarch64.app.tar.gz` (macOS Apple Silicon)
   - `RealEstate_x64_setup.exe` (Windows)
   - `realestate_amd64.AppImage` (Linux)
6. Mark as pre-release if beta
7. Publish release

---

### 4. Distribution

#### macOS

**DMG Distribution:**
```bash
# Create signed DMG
pnpm tauri build

# Notarize (automatic in CI)
xcrun notarytool submit RealEstate.dmg \
  --apple-id "your@email.com" \
  --password "app-specific-password" \
  --team-id "TEAM_ID" \
  --wait

# Staple notarization
xcrun stapler staple RealEstate.dmg
```

**Distribution channels:**
- GitHub Releases (primary)
- Direct download from website
- Future: Mac App Store

#### Windows

**MSI/EXE Distribution:**
```bash
# Build signed installer
pnpm tauri build

# Installer created: RealEstate_x64_setup.exe
```

**Distribution channels:**
- GitHub Releases (primary)
- Direct download from website
- Future: Microsoft Store

#### Linux

**AppImage Distribution:**
```bash
# Build AppImage
pnpm tauri build

# Make executable
chmod +x realestate_amd64.AppImage
```

**Distribution channels:**
- GitHub Releases
- Flathub (future)
- Snap Store (future)

---

### 5. Auto-Updates

Tauri includes built-in auto-update functionality.

**Update endpoint:**
```
https://github.com/YOUR_ORG/RealEstate/releases/latest/download/latest.json
```

**Update manifest (auto-generated):**
```json
{
  "version": "1.0.1",
  "date": "2024-01-15T00:00:00Z",
  "platforms": {
    "darwin-x86_64": {
      "url": "https://github.com/.../RealEstate_x64.app.tar.gz",
      "signature": "dW50cnVzdGVkIGNvbW1lbnQ6IHNpZ25hdHVyZSBmcm9tIHRhdXJpIHNlY3JldCBrZXk="
    },
    "darwin-aarch64": {
      "url": "https://github.com/.../RealEstate_aarch64.app.tar.gz",
      "signature": "..."
    },
    "windows-x86_64": {
      "url": "https://github.com/.../RealEstate_x64_setup.exe",
      "signature": "..."
    }
  }
}
```

**User experience:**
1. App checks for updates on launch (configurable interval)
2. Notification shows: "Update available: v1.0.1"
3. User clicks "Update"
4. App downloads and installs update
5. Prompts to restart

---

## Versioning Strategy

We follow **Semantic Versioning (SemVer)**:

```
MAJOR.MINOR.PATCH

1.0.0 → Initial release
1.0.1 → Bug fix (patch)
1.1.0 → New feature (minor)
2.0.0 → Breaking change (major)
```

### When to bump:

- **PATCH (1.0.0 → 1.0.1):**
  - Bug fixes
  - Performance improvements
  - Minor UI tweaks
  - Dependency updates (non-breaking)

- **MINOR (1.0.0 → 1.1.0):**
  - New features
  - New AI generation options
  - New export formats
  - Significant UX improvements

- **MAJOR (1.0.0 → 2.0.0):**
  - Breaking API changes
  - Database schema changes requiring migration
  - Removed features
  - Complete redesign

---

## Release Checklist

### Pre-Release

- [ ] All tests passing (`pnpm test` + `cargo test`)
- [ ] No console errors or warnings
- [ ] Database migrations tested
- [ ] License validation working
- [ ] AI generation working with test API key
- [ ] Export (PDF/DOCX) working
- [ ] Photo import working
- [ ] All keyboard shortcuts working
- [ ] Manual smoke testing on macOS, Windows, Linux
- [ ] CHANGELOG.md updated
- [ ] Version numbers updated in all files

### During Release

- [ ] Version bump workflow completed
- [ ] Build workflow passed
- [ ] All artifacts signed and notarized
- [ ] GitHub release created
- [ ] Release notes reviewed
- [ ] Artifacts uploaded

### Post-Release

- [ ] Test download and installation
- [ ] Verify auto-update works
- [ ] Update website with new version
- [ ] Announce release (Twitter, email list, etc.)
- [ ] Monitor error reports (Sentry, etc.)
- [ ] Update documentation if needed

---

## Rollback Procedure

If a critical bug is discovered post-release:

### Option 1: Quick Patch

```bash
# Fix the bug
git checkout main
git pull
# Make fix
git commit -m "fix: critical bug in X"

# Create patch release
pnpm run version:patch
# Triggers build automatically
```

### Option 2: Rollback Release

```bash
# Delete the tag
git tag -d v1.0.1
git push origin :refs/tags/v1.0.1

# Delete GitHub release
gh release delete v1.0.1

# Revert commit
git revert HEAD
git push origin main
```

### Option 3: Mark as Pre-Release

1. Edit GitHub release
2. Check "This is a pre-release"
3. Add warning to description
4. Create hotfix release ASAP

---

## Hotfix Process

For critical bugs in production:

```bash
# Create hotfix branch from tag
git checkout -b hotfix/1.0.2 v1.0.1

# Fix bug
git commit -m "fix: critical security issue"

# Merge to main
git checkout main
git merge hotfix/1.0.2

# Create patch release
pnpm run version:patch

# Tag and push
git push origin main --tags

# Delete hotfix branch
git branch -d hotfix/1.0.2
```

---

## Release Channels

### Stable (main)

- Production-ready releases
- Full testing completed
- Version tags: `v1.0.0`, `v1.1.0`
- Auto-update: enabled

### Beta (develop)

- Feature preview releases
- Some testing completed
- Version tags: `v1.1.0-beta.1`
- Auto-update: opt-in only

### Nightly (auto)

- Daily builds from main
- Minimal testing
- Version tags: `v1.1.0-nightly.20240115`
- Auto-update: disabled

**Configure update channel in app:**

```rust
// src-tauri/tauri.conf.json
{
  "updater": {
    "endpoints": [
      "https://releases.yourdomain.com/{{target}}/{{channel}}/{{current_version}}"
    ]
  }
}
```

---

## Metrics & Analytics

### Track after each release:

- Download count per platform
- Update adoption rate
- Crash reports
- Feature usage (via telemetry if enabled)
- User feedback and ratings

### Dashboard:

- GitHub Insights → Traffic → Releases
- Sentry for error tracking (if configured)
- PostHog/Mixpanel for analytics (if configured)

---

## Communication

### Release Announcement Template

```markdown
## 🎉 RealEstate Listing Optimizer v1.1.0 Released!

We're excited to announce version 1.1.0 with new features and improvements!

### ✨ What's New

- **Brand Voice Learning** — Extract style from past listings
- **Bulk Export** — Export multiple properties at once
- **Keyboard Shortcuts** — Cmd+N for new property, Cmd+Enter to generate

### 🐛 Bug Fixes

- Fixed photo reordering on Windows
- Improved API error messages
- Fixed license validation cache

### 📥 Download

- [macOS (Intel)](link)
- [macOS (Apple Silicon)](link)
- [Windows](link)
- [Linux](link)

### 🔄 Auto-Update

Existing users will be prompted to update automatically.

Full changelog: https://github.com/YOUR_ORG/RealEstate/releases/tag/v1.1.0
```

### Channels:

- GitHub Releases (auto)
- Email newsletter
- Twitter/X
- Product Hunt (major releases)
- Blog post (major releases)

---

## Security Releases

For security vulnerabilities:

1. **DO NOT** discuss publicly until fixed
2. Create private security advisory on GitHub
3. Develop fix in private fork
4. Test thoroughly
5. Release patch ASAP
6. Disclose vulnerability after users update (7-14 days)

**Security release process:**

```bash
# In private repository
git checkout -b security/CVE-2024-XXXX

# Fix vulnerability
git commit -m "security: fix CVE-2024-XXXX"

# Create security patch release
pnpm run version:patch

# After release is live, publish advisory
gh security-advisory publish
```

---

## Tools & Scripts

### Useful commands

```bash
# Check current version
node -p "require('./package.json').version"

# Generate changelog automatically
git log v1.0.0..HEAD --oneline --pretty=format:"- %s"

# Test release build locally
pnpm tauri build --debug

# Verify signatures
codesign -dv --verbose=4 RealEstate.app  # macOS
Get-AuthenticodeSignature RealEstate.exe  # Windows

# List all releases
gh release list

# Download release artifact
gh release download v1.0.1 --pattern "*.dmg"
```

---

## Appendix: GitHub Secrets

Required secrets for automated releases:

```
# Apple (macOS)
APPLE_CERTIFICATE
APPLE_CERTIFICATE_PASSWORD
APPLE_SIGNING_IDENTITY
APPLE_ID
APPLE_PASSWORD
APPLE_TEAM_ID

# Windows
WINDOWS_CERTIFICATE
WINDOWS_CERTIFICATE_PASSWORD

# Tauri Updater
TAURI_PRIVATE_KEY
TAURI_KEY_PASSWORD

# GitHub
GITHUB_TOKEN  # Auto-provided
```

See `docs/CODE_SIGNING.md` for setup instructions.

---

**Status:** Process documented and ready for first release ✅
