# Code Signing & Certificates Setup

## Overview

This document explains how to set up code signing certificates for distributing RealEstate Listing Optimizer on macOS and Windows.

---

## macOS Code Signing (Required for macOS Distribution)

### Prerequisites

1. **Apple Developer Account**
   - Enroll at: https://developer.apple.com/programs/
   - Cost: $99/year
   - Required for distributing apps outside the App Store

2. **Developer ID Application Certificate**
   - Log in to Apple Developer Portal
   - Go to Certificates, Identifiers & Profiles
   - Create new certificate: "Developer ID Application"
   - Download the certificate (.cer file)

3. **Export Certificate for CI/CD**
   ```bash
   # Open Keychain Access
   # Find your "Developer ID Application" certificate
   # Right-click → Export "Developer ID Application"
   # Save as .p12 file with a strong password

   # Convert to base64 for GitHub Secrets
   base64 -i certificate.p12 | pbcopy
   ```

### GitHub Secrets Setup (macOS)

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
APPLE_CERTIFICATE              # Base64-encoded .p12 file
APPLE_CERTIFICATE_PASSWORD     # Password for .p12 file
APPLE_SIGNING_IDENTITY         # Certificate name (e.g., "Developer ID Application: Your Name (TEAM_ID)")
APPLE_ID                       # Your Apple ID email
APPLE_PASSWORD                 # App-specific password (see below)
APPLE_TEAM_ID                  # 10-character Team ID from Apple Developer
```

### App-Specific Password

1. Go to https://appleid.apple.com/account/manage
2. Sign in with your Apple ID
3. Under "Security" → "App-Specific Passwords"
4. Generate new password for "RealEstate Build Pipeline"
5. Save this password as `APPLE_PASSWORD` secret

### Notarization

Apple requires apps to be notarized. The Tauri build action handles this automatically if credentials are configured:

```yaml
# In .github/workflows/build.yml
env:
  APPLE_ID: ${{ secrets.APPLE_ID }}
  APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
  APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
```

---

## Windows Code Signing (Required for Windows Distribution)

### Option 1: EV Code Signing Certificate (Recommended)

**Providers:**
- DigiCert (~$400/year)
- GlobalSign (~$350/year)
- Sectigo (~$300/year)

**Benefits:**
- Immediate SmartScreen reputation
- No warnings on first install
- USB token or cloud-based signing

**Process:**
1. Purchase EV certificate from provider
2. Complete business verification (2-7 days)
3. Receive USB token or cloud signing credentials

### Option 2: Standard Code Signing Certificate

**Providers:**
- Cheaper (~$100/year)
- Still triggers SmartScreen warnings initially
- Builds reputation over time

### GitHub Secrets Setup (Windows)

For cloud-based signing (recommended for CI/CD):

```
WINDOWS_CERTIFICATE            # Base64-encoded .pfx file
WINDOWS_CERTIFICATE_PASSWORD   # Password for .pfx file
```

**Export certificate:**
```powershell
# Convert .pfx to base64
[Convert]::ToBase64String([IO.File]::ReadAllBytes("certificate.pfx")) | Set-Clipboard
```

### Alternative: Azure SignTool (Cloud Signing)

For EV certificates stored in Azure Key Vault:

```yaml
- name: Sign Windows binary
  uses: azure/azure-signtool@v1
  with:
    azure-sign-tool-credentials: ${{ secrets.AZURE_CREDENTIALS }}
    file-path: src-tauri/target/release/realestate.exe
```

---

## Tauri Updater Signing (Auto-Updates)

### Generate Key Pair

```bash
# Install Tauri CLI
cargo install tauri-cli

# Generate updater keypair
cargo tauri signer generate -w ~/.tauri/realestate.key

# Output:
# Private key: (save as TAURI_PRIVATE_KEY secret)
# Public key: (add to tauri.conf.json)
```

### Configure Auto-Updates

1. **Add public key to tauri.conf.json:**
   ```json
   {
     "tauri": {
       "updater": {
         "active": true,
         "pubkey": "YOUR_PUBLIC_KEY_HERE"
       }
     }
   }
   ```

2. **Add private key to GitHub Secrets:**
   ```
   TAURI_PRIVATE_KEY              # Private key from generate command
   TAURI_KEY_PASSWORD             # Password (if encrypted)
   ```

3. **Update endpoint configuration:**
   ```json
   {
     "tauri": {
       "updater": {
         "endpoints": [
           "https://releases.yourdomain.com/{{target}}/{{current_version}}"
         ]
       }
     }
   }
   ```

---

## CI/CD Integration

All certificates and keys are already configured in `.github/workflows/build.yml`:

```yaml
env:
  # Apple certificates
  APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
  APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
  APPLE_SIGNING_IDENTITY: ${{ secrets.APPLE_SIGNING_IDENTITY }}
  APPLE_ID: ${{ secrets.APPLE_ID }}
  APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
  APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}

  # Windows certificates
  WINDOWS_CERTIFICATE: ${{ secrets.WINDOWS_CERTIFICATE }}
  WINDOWS_CERTIFICATE_PASSWORD: ${{ secrets.WINDOWS_CERTIFICATE_PASSWORD }}

  # Tauri updater
  TAURI_PRIVATE_KEY: ${{ secrets.TAURI_PRIVATE_KEY }}
  TAURI_KEY_PASSWORD: ${{ secrets.TAURI_KEY_PASSWORD }}
```

---

## Local Development Signing

### macOS (Development)

For local development, use ad-hoc signing:

```bash
# Tauri handles this automatically
pnpm tauri build
```

For distribution testing:
```bash
# Use your Developer ID
pnpm tauri build -- --target universal-apple-darwin
```

### Windows (Development)

For local development, skip signing:

```bash
pnpm tauri build
```

For distribution testing:
```bash
# Sign with your certificate
signtool sign /f certificate.pfx /p PASSWORD /tr http://timestamp.digicert.com /td sha256 /fd sha256 realestate.exe
```

---

## Verification

### Verify macOS Signature

```bash
# Check signature
codesign -dv --verbose=4 RealEstate.app

# Verify notarization
spctl -a -v RealEstate.app

# Should output: "accepted"
```

### Verify Windows Signature

```powershell
# Check signature
Get-AuthenticodeSignature RealEstate.exe

# Should show:
# Status: Valid
# SignerCertificate: Your certificate info
```

---

## Troubleshooting

### macOS: "App is damaged and can't be opened"
- **Cause:** App not notarized or signature invalid
- **Fix:** Re-sign with valid Developer ID and notarize

### Windows: "Windows protected your PC" SmartScreen warning
- **Cause:** New certificate or unsigned binary
- **Fix:**
  - Use EV certificate for immediate reputation
  - Or wait for reputation to build (downloads + time)

### Tauri Updater: "Signature verification failed"
- **Cause:** Public/private key mismatch
- **Fix:** Regenerate keypair and update tauri.conf.json

---

## Cost Summary

| Item | Cost (Annual) | Required? |
|------|---------------|-----------|
| Apple Developer Account | $99 | Yes (macOS) |
| Windows EV Certificate | $300-400 | Recommended (Windows) |
| Windows Standard Certificate | $100 | Alternative (Windows) |
| **Total (Recommended)** | **~$500/year** | - |

---

## Next Steps

1. **Purchase certificates** from providers listed above
2. **Complete verification** (Apple: instant, Windows EV: 2-7 days)
3. **Export and encode** certificates as base64
4. **Add secrets** to GitHub repository
5. **Test build** by triggering workflow manually
6. **Verify signatures** on built artifacts

---

## Security Best Practices

- ✅ Never commit certificates or private keys to git
- ✅ Use GitHub Secrets for all sensitive credentials
- ✅ Rotate passwords and keys annually
- ✅ Use separate certificates for different environments (dev/staging/prod)
- ✅ Enable 2FA on Apple ID and certificate provider accounts
- ✅ Store backup copies of certificates in secure vault (1Password, etc.)
- ✅ Document certificate expiration dates in team calendar

---

**Status:** Ready to configure once certificates are purchased ✅
