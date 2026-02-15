# Real Estate Listing Optimizer - User Guide

**Version:** 1.0.0
**Last Updated:** 2026-02-15

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Configuration](#configuration)
3. [Managing Properties](#managing-properties)
4. [Generating Listings](#generating-listings)
5. [Brand Voice](#brand-voice)
6. [Photos](#photos)
7. [Exporting](#exporting)
8. [Bulk Import](#bulk-import)
9. [Analytics](#analytics)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Launch

When you first launch the Real Estate Listing Optimizer:

1. **Welcome Screen** - You'll see the dashboard
2. **Settings** - Navigate to Settings to configure your API key
3. **API Key Required** - You need an Anthropic API key to generate listings

### System Requirements

- **Operating System:** Windows 10+, macOS 11+, or Linux (Ubuntu 20.04+)
- **Memory:** 4GB RAM minimum, 8GB recommended
- **Disk Space:** 500MB for application + storage for photos
- **Internet:** Required for AI generation

---

## Configuration

### API Key Setup

1. Go to **Settings** (gear icon or Settings menu)
2. Find the **API Key** field
3. Enter your Anthropic API key (starts with `sk-ant-`)
4. Click **Save**

**Where to get an API key:**
- Visit [console.anthropic.com](https://console.anthropic.com)
- Sign up or log in
- Navigate to API Keys
- Create a new key

### AI Model Selection

Choose between different Claude models:

- **Claude Sonnet (Default)** - Best balance of speed and quality
- **Claude Haiku** - Faster, more economical for simple listings
- **Claude Opus** - Highest quality, best for luxury properties

**To change model:**
1. Go to Settings → AI Model
2. Select your preferred model
3. Click Save

### Agent Information

Set your contact information for listings:

- **Agent Name** - Your name
- **Phone** - Contact phone number
- **Email** - Contact email
- **Brokerage** - Your brokerage name

This information appears in generated listings and emails.

---

## Managing Properties

### Creating a Property

1. Click **New Property** or **Add Property**
2. Fill in required fields:
   - Address
   - City, State, Zip
   - Beds, Baths, Square Footage
   - Price (in dollars, will convert to cents)
   - Property Type
3. Fill optional fields:
   - Year Built
   - Lot Size
   - Parking
   - Key Features (click + to add)
   - Neighborhood
   - School District
   - Nearby Amenities
   - Agent Notes
4. Click **Create Property**

### Editing a Property

1. Click on a property from the property list
2. Click **Edit** button
3. Modify fields as needed
4. Click **Save**

### Deleting a Property

1. Click on a property
2. Click **Delete** button
3. Confirm deletion

**Warning:** Deleting a property also deletes all associated listings, photos, and analytics.

---

## Generating Listings

### Standard Listing Generation

1. Select a property
2. Click **Generate Listing**
3. Configure options:
   - **Style:** Luxury, Family, Investment, First-Time
   - **Tone:** Professional, Warm, Exciting
   - **Length:** Short (~100 words), Medium (~250 words), Long (~500 words)
   - **SEO Keywords:** Add keywords (optional)
   - **Brand Voice:** Select saved voice (optional)
4. Click **Generate**
5. Wait for streaming generation (you'll see text appear in real-time)

### Social Media Posts

Generate platform-specific social media content:

1. Select a property
2. Click **Generate Social**
3. Choose platform:
   - **Instagram** - Hashtag-optimized, visual focus
   - **Facebook** - Community-focused, conversational
   - **LinkedIn** - Professional, investment angle
4. Select Brand Voice (optional)
5. Click **Generate**

### Email Templates

Generate professional emails:

1. Select a property
2. Click **Generate Email**
3. Choose template type:
   - **Buyer Email** - For potential buyers
   - **Seller Email** - For property owners
   - **Open House** - Open house invitations
4. Select Brand Voice (optional)
5. Click **Generate**

### Managing Generated Listings

**Favorites:**
- Click the star icon to mark a listing as favorite
- Access favorites from the Favorites filter

**Delete:**
- Click the trash icon to delete a listing
- Deletion is permanent

**Copy:**
- Click the copy icon to copy text to clipboard
- Paste into your MLS, website, or marketing materials

---

## Brand Voice

Brand Voice allows you to maintain consistent style across all generations.

### Creating a Brand Voice

1. Navigate to **Brand Voice** section
2. Click **Create Brand Voice**
3. Enter a name (e.g., "Luxury Portfolio Style")
4. Add description (optional)
5. Paste 2+ sample listings in your style
6. Click **Analyze**
7. AI extracts your style patterns
8. Click **Save**

### Using Brand Voice

When generating content:
1. Select the **Brand Voice** dropdown
2. Choose your saved brand voice
3. Generate normally

The AI will match your established style, tone, and vocabulary.

### Managing Brand Voices

- **Edit:** Click the pencil icon to modify
- **Delete:** Click trash icon to remove
- **View:** Click on a brand voice to see extracted style

---

## Photos

### Adding Photos

1. Select a property
2. Navigate to **Photos** tab
3. Click **Import Photos**
4. Select images (JPEG or PNG)
5. Photos are automatically resized and optimized

**Limits:**
- Maximum 20 photos per property
- Supported formats: JPEG, PNG
- Files automatically compressed

### Photo Management

**Reorder:**
- Drag and drop photos to reorder
- First photo is the featured image

**Captions:**
- Click on a photo to add caption
- Captions appear in exports

**Delete:**
- Click the X icon to delete a photo
- Deletion is permanent

---

## Exporting

### PDF Export

Create professional PDF marketing packages:

1. Select a property
2. Click **Export** → **PDF**
3. Select listings to include
4. Choose template (Professional, Luxury, or Minimal)
5. Click **Generate PDF**
6. Save file to desired location

**PDF includes:**
- Property details
- Key features
- Photos (up to 6)
- Selected listings
- Agent contact information

### DOCX Export

Create editable Word documents:

1. Select a property
2. Click **Export** → **DOCX**
3. Select listings to include
4. Choose template
5. Click **Generate DOCX**
6. Save and edit in Microsoft Word

**DOCX benefits:**
- Fully editable
- Customizable branding
- Add logo, change fonts
- Print-ready

### Export Templates

**Professional**
- Navy blue color scheme
- Grid photo layout
- Formal tone
- Best for: Standard listings

**Luxury**
- Gold/bronze accents
- Featured photo layout
- Elegant typography
- Best for: High-end properties

**Minimal**
- Black and white
- Text-focused
- No photos
- Best for: MLS submissions

---

## Bulk Import

Import multiple properties from CSV files.

### CSV Template

1. Click **Import** → **Get CSV Template**
2. Download template file
3. Open in Excel or Google Sheets

### Required Columns

- address
- city
- state
- zip
- beds
- baths
- sqft
- price (in cents: $950,000 = 95000000)
- property_type (single_family, condo, townhouse, multi_family, land, commercial)

### Optional Columns

- year_built
- lot_size
- parking
- key_features (JSON array: `["pool","garage"]`)
- neighborhood
- neighborhood_highlights (JSON array)
- school_district
- nearby_amenities (JSON array)
- agent_notes

### Import Process

1. Fill out CSV file
2. Click **Import** → **Import Properties**
3. Select CSV file
4. Review import results:
   - Successful imports
   - Failed imports with error messages
5. Fix errors and re-import failed rows if needed

**Tips:**
- Validate property types carefully
- Price must be in cents (multiply by 100)
- JSON arrays must be valid: `["item1","item2"]`
- Use empty string for optional fields, not NULL

---

## Analytics

View usage statistics and cost tracking.

### Dashboard Metrics

**Total Generations:**
- Count of all listings, social posts, and emails generated

**Total Cost:**
- Cumulative cost in dollars
- Based on token usage

**Success Rate:**
- Percentage of successful generations
- Failures typically due to API issues

**Average Latency:**
- Average response time in milliseconds
- Lower is faster

### Cost Management

**Model Selection:**
- Haiku: ~$0.25 per 1M input tokens, ~$1.25 per 1M output
- Sonnet: ~$3 per 1M input tokens, ~$15 per 1M output
- Opus: ~$15 per 1M input tokens, ~$75 per 1M output

**Tips to Reduce Costs:**
- Use Haiku for simple properties
- Use shorter listings (short length)
- Reuse generated content when possible
- Batch generate multiple listings

---

## Troubleshooting

### API Key Issues

**Error: "API key is missing or invalid"**
- Verify key starts with `sk-ant-`
- Check for extra spaces
- Generate a new key if needed

**Error: "API rate limit exceeded"**
- Wait 60 seconds and try again
- Reduce generation frequency
- Upgrade your Anthropic account tier

### Generation Failures

**Error: "Failed to connect to Anthropic API"**
- Check internet connection
- Verify firewall allows HTTPS to api.anthropic.com
- Try again in a few minutes

**Error: "Generation timed out"**
- Automatic retry will occur (up to 3 times)
- If persistent, check network stability

### Export Issues

**Photos not appearing in export:**
- Verify photos are still on disk
- Re-import photos if deleted
- Check photo file permissions

**Export fails:**
- Ensure sufficient disk space
- Check file write permissions
- Try a different save location

### Performance

**Slow generation:**
- Switch to Haiku model for faster results
- Check internet speed
- Close other applications

**High memory usage:**
- Limit number of open properties
- Delete unused photos
- Restart application

---

## Keyboard Shortcuts

- **Ctrl/Cmd + N** - New Property
- **Ctrl/Cmd + S** - Save (when editing)
- **Ctrl/Cmd + G** - Generate Listing
- **Ctrl/Cmd + E** - Export
- **Ctrl/Cmd + ,** - Settings
- **Esc** - Close dialog/modal

---

## Best Practices

### Property Data

- Complete all fields for best AI results
- Be specific in key features
- Add neighborhood context
- Include agent notes for unique selling points

### Generation

- Start with medium length, adjust as needed
- Try different styles to find what resonates
- Use brand voice for consistency
- Generate multiple options, pick the best

### Photos

- Use high-quality images
- Include variety: exterior, interior, amenities
- First photo should be the best overall shot
- Add captions for context

### Organization

- Use consistent property naming
- Delete old/unused listings regularly
- Review analytics monthly
- Update brand voices seasonally

---

## Getting Help

### Support Channels

- **Documentation:** docs/ folder
- **GitHub Issues:** [github.com/yourusername/realestate/issues](https://github.com/yourusername/realestate/issues)
- **Email:** support@example.com

### Reporting Bugs

Include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- System information (OS, version)

---

**Happy Listing! 🏡**
