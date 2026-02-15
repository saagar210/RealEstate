# Real Estate Listing Optimizer - API Reference

**Version:** 1.0.0
**Last Updated:** 2026-02-15

Complete reference for all Tauri commands exposed to the frontend.

---

## Table of Contents

1. [Properties](#properties)
2. [Listings & Generation](#listings--generation)
3. [Photos](#photos)
4. [Brand Voice](#brand-voice)
5. [Export](#export)
6. [Import](#import)
7. [Analytics](#analytics)
8. [Settings](#settings)
9. [License](#license)
10. [Error Handling](#error-handling)

---

## Properties

### `create_property`

Create a new property.

**Parameters:**
```typescript
{
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  price: number; // in cents
  propertyType: 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'land' | 'commercial';
  yearBuilt?: number;
  lotSize?: string;
  parking?: string;
  keyFeatures: string[]; // Will be JSON-stringified
  neighborhood?: string;
  neighborhoodHighlights: string[];
  schoolDistrict?: string;
  nearbyAmenities: string[];
  agentNotes?: string;
}
```

**Returns:**
```typescript
{
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  price: number;
  propertyType: string;
  yearBuilt?: number;
  lotSize?: string;
  parking?: string;
  keyFeatures: string; // JSON string
  neighborhood?: string;
  neighborhoodHighlights: string;
  schoolDistrict?: string;
  nearbyAmenities: string;
  agentNotes?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Example:**
```typescript
const property = await invoke('create_property', {
  address: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  zip: '94105',
  beds: 3,
  baths: 2.5,
  sqft: 1800,
  price: 95000000, // $950,000
  propertyType: 'single_family',
  keyFeatures: ['pool', 'hardwood floors'],
  neighborhoodHighlights: [],
  nearbyAmenities: []
});
```

---

### `get_property`

Get a single property by ID.

**Parameters:**
```typescript
{
  id: string;
}
```

**Returns:** Property object (same as create_property)

**Errors:**
- `PropertyNotFound` - Property with given ID doesn't exist

---

### `list_properties`

List all properties.

**Parameters:** None

**Returns:** `Property[]`

---

### `update_property`

Update an existing property.

**Parameters:**
```typescript
{
  id: string;
  // ... all property fields (same as create_property)
}
```

**Returns:** Updated Property object

**Errors:**
- `PropertyNotFound`

---

### `delete_property`

Delete a property and all associated data.

**Parameters:**
```typescript
{
  id: string;
}
```

**Returns:** `null`

**Cascade Deletes:**
- All listings
- All photos (files deleted from disk)
- All generation analytics

---

## Listings & Generation

### `generate_listing`

Generate a property listing description with streaming.

**Parameters:**
```typescript
{
  propertyId: string;
  style: 'luxury' | 'family' | 'investment' | 'first_time';
  tone: 'professional' | 'warm' | 'exciting';
  length: 'short' | 'medium' | 'long';
  seoKeywords: string[];
  brandVoiceId?: string;
}
```

**Streaming Events:**
```typescript
type StreamEvent =
  | { event: 'started'; data: { estimatedTokens: number } }
  | { event: 'delta'; data: { text: string } }
  | { event: 'finished'; data: { fullText: string; inputTokens: number; outputTokens: number; costCents: number } }
  | { event: 'error'; data: { message: string } };
```

**Example:**
```typescript
await invoke('generate_listing', {
  propertyId: 'prop-123',
  style: 'luxury',
  tone: 'warm',
  length: 'medium',
  seoKeywords: ['waterfront', 'downtown'],
  brandVoiceId: null
}, {
  onEvent: (event: StreamEvent) => {
    if (event.event === 'delta') {
      appendText(event.data.text);
    }
  }
});
```

**Saved automatically** to database when finished.

---

### `generate_social`

Generate social media post for a platform.

**Parameters:**
```typescript
{
  propertyId: string;
  platform: 'instagram' | 'facebook' | 'linkedin';
  brandVoiceId?: string;
}
```

**Returns:** Streams same as `generate_listing`

---

### `generate_email`

Generate email template.

**Parameters:**
```typescript
{
  propertyId: string;
  templateType: 'buyer' | 'seller' | 'open_house';
  brandVoiceId?: string;
}
```

**Returns:** Streams same as `generate_listing`

---

### `list_listings`

Get all listings for a property.

**Parameters:**
```typescript
{
  propertyId: string;
}
```

**Returns:**
```typescript
{
  id: string;
  propertyId: string;
  content: string;
  generationType: 'listing' | 'social_instagram' | 'social_facebook' | 'social_linkedin' | 'email_buyer' | 'email_seller' | 'email_open_house';
  style?: string;
  tone?: string;
  length?: string;
  seoKeywords: string; // JSON
  brandVoiceId?: string;
  tokensUsed: number;
  generationCostCents: number;
  isFavorite: boolean;
  createdAt: string;
}[]
```

---

### `toggle_listing_favorite`

Toggle favorite status of a listing.

**Parameters:**
```typescript
{
  id: string;
}
```

**Returns:** `null`

---

### `delete_listing`

Delete a listing.

**Parameters:**
```typescript
{
  id: string;
}
```

**Returns:** `null`

---

## Photos

### `import_photos`

Import photos for a property.

**Parameters:**
```typescript
{
  propertyId: string;
  photoPaths: string[]; // Absolute file paths
}
```

**Returns:**
```typescript
{
  id: string;
  propertyId: string;
  filename: string;
  originalPath: string;
  thumbnailPath: string;
  sortOrder: number;
  caption?: string;
  createdAt: string;
}[]
```

**Processing:**
- Creates thumbnail (300x300)
- Copies original to app data directory
- Validates JPEG/PNG format

**Errors:**
- `PhotoLimitExceeded` - Max 20 photos per property
- `PhotoImportFailed` - Invalid image format

---

### `list_photos`

Get all photos for a property.

**Parameters:**
```typescript
{
  propertyId: string;
}
```

**Returns:** `Photo[]` (sorted by sortOrder)

---

### `delete_photo`

Delete a photo.

**Parameters:**
```typescript
{
  id: string;
}
```

**Returns:** `null`

**Side effects:**
- Deletes original file
- Deletes thumbnail file

---

### `reorder_photos`

Change photo sort order.

**Parameters:**
```typescript
{
  photoId: string;
  newSortOrder: number;
}
```

**Returns:** `null`

---

## Brand Voice

### `create_brand_voice`

Analyze sample listings and extract brand voice.

**Parameters:**
```typescript
{
  name: string;
  description?: string;
  sampleListings: string[]; // At least 2 required
}
```

**Returns:**
```typescript
{
  id: string;
  name: string;
  description?: string;
  extractedStyle: string; // JSON with style patterns
  sourceListings: string; // JSON
  sampleCount: number;
  createdAt: string;
  updatedAt: string;
}
```

**Errors:**
- `Validation` - Less than 2 samples
- `MissingApiKey`

---

### `list_brand_voices`

Get all brand voices.

**Parameters:** None

**Returns:** `BrandVoice[]`

---

### `delete_brand_voice`

Delete a brand voice.

**Parameters:**
```typescript
{
  id: string;
}
```

**Returns:** `null`

**Note:** Listings using this brand voice will have `brandVoiceId` set to NULL.

---

## Export

### `export_pdf`

Generate PDF marketing package.

**Parameters:**
```typescript
{
  propertyId: string;
  listingIds: string[]; // Listings to include
}
```

**Returns:** `Uint8Array` (PDF file bytes)

**Includes:**
- Property details
- Key features
- Photos (up to 6, auto-resized)
- Selected listings
- Agent contact info

**Example:**
```typescript
const pdfBytes = await invoke('export_pdf', {
  propertyId: 'prop-123',
  listingIds: ['listing-1', 'listing-2']
});

// Save to file
await save({
  filters: [{ name: 'PDF', extensions: ['pdf'] }],
  defaultPath: 'property-package.pdf'
}, new Uint8Array(pdfBytes));
```

---

### `export_docx`

Generate DOCX document.

**Parameters:**
```typescript
{
  propertyId: string;
  listingIds: string[];
}
```

**Returns:** `Uint8Array` (DOCX file bytes)

**Format:** Microsoft Word compatible .docx

---

### `copy_to_clipboard`

Copy text to clipboard (passthrough, use Tauri clipboard plugin directly).

**Parameters:**
```typescript
{
  text: string;
}
```

**Returns:** `null`

**Note:** Frontend should use `@tauri-apps/plugin-clipboard-manager` directly.

---

## Import

### `import_properties_csv`

Bulk import properties from CSV data.

**Parameters:**
```typescript
{
  csvData: string; // Full CSV file content
}
```

**Returns:**
```typescript
{
  total: number;
  successful: number;
  failed: number;
  errors: {
    rowNumber: number;
    address: string;
    error: string;
  }[];
}
```

**CSV Format:** See `get_csv_template`

**Validation:**
- Property type must be valid
- beds, baths, sqft, price must be positive
- JSON fields must be valid JSON arrays

---

### `get_csv_template`

Get CSV template with headers and example rows.

**Parameters:** None

**Returns:** `string` (CSV content)

**Example:**
```typescript
const template = await invoke('get_csv_template');
// Download or display template
```

---

## Analytics

### `get_analytics_summary`

Get aggregate analytics for dashboard.

**Parameters:** None

**Returns:**
```typescript
{
  totalGenerations: number;
  totalCostCents: number;
  averageLatencyMs: number;
  successRate: number; // 0-100
}
```

**Example:**
```typescript
const stats = await invoke('get_analytics_summary');
console.log(`Total cost: $${stats.totalCostCents / 100}`);
console.log(`Success rate: ${stats.successRate}%`);
```

---

## Settings

### `get_setting`

Get a single setting value.

**Parameters:**
```typescript
{
  key: string;
}
```

**Returns:** `string`

**Available Keys:**
- `api_key`
- `ai_model`
- `default_style`
- `default_tone`
- `default_length`
- `agent_name`
- `agent_phone`
- `agent_email`
- `brokerage_name`

**Errors:**
- `Database` - Key not found

---

### `set_setting`

Update a setting value.

**Parameters:**
```typescript
{
  key: string;
  value: string;
}
```

**Returns:** `null`

**Example:**
```typescript
await invoke('set_setting', {
  key: 'ai_model',
  value: 'claude-haiku-4-5-20251001'
});
```

---

## License

### `validate_license_key`

Validate a license key with LemonSqueezy.

**Parameters:**
```typescript
{
  licenseKey: string;
}
```

**Returns:**
```typescript
{
  valid: boolean;
  meta: any; // License metadata from LemonSqueezy
}
```

**Errors:**
- `InvalidLicense`
- `LicenseValidationFailed`

---

### `check_license`

Check current license status.

**Parameters:** None

**Returns:**
```typescript
{
  activated: boolean;
  key?: string;
}
```

---

## Error Handling

All commands can throw errors. Handle them appropriately:

```typescript
try {
  const property = await invoke('get_property', { id });
} catch (error) {
  if (error.includes('Property not found')) {
    // Handle missing property
  } else if (error.includes('Database error')) {
    // Handle database issue
  } else {
    // Generic error handling
  }
}
```

### Common Error Types

**`MissingApiKey`**
```
API key is missing or invalid. Please set your Anthropic API key in Settings (must start with 'sk-ant-').
```

**`ApiRateLimit`**
```
API rate limit exceeded. Please wait a few minutes before generating again.
```

**`ApiOverloaded`**
```
Anthropic API is currently overloaded. Please wait a moment and try again.
```

**`NetworkError`**
```
Network error occurred. Please check your internet connection and try again.
```

**`PropertyNotFound`**
```
Property not found (ID: {id}). It may have been deleted.
```

**`PhotoLimitExceeded`**
```
Maximum of 20 photos per property. Please delete some photos before adding more.
```

**`Export`**
```
Export error: {details}
```

---

## TypeScript Types

```typescript
// Property
interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  beds: number;
  baths: number;
  sqft: number;
  price: number; // cents
  propertyType: PropertyType;
  yearBuilt?: number;
  lotSize?: string;
  parking?: string;
  keyFeatures: string; // JSON array
  neighborhood?: string;
  neighborhoodHighlights: string;
  schoolDistrict?: string;
  nearbyAmenities: string;
  agentNotes?: string;
  createdAt: string;
  updatedAt: string;
}

type PropertyType =
  | 'single_family'
  | 'condo'
  | 'townhouse'
  | 'multi_family'
  | 'land'
  | 'commercial';

// Listing
interface Listing {
  id: string;
  propertyId: string;
  content: string;
  generationType: GenerationType;
  style?: ListingStyle;
  tone?: ListingTone;
  length?: ListingLength;
  seoKeywords: string; // JSON
  brandVoiceId?: string;
  tokensUsed: number;
  generationCostCents: number;
  isFavorite: boolean;
  createdAt: string;
}

type GenerationType =
  | 'listing'
  | 'social_instagram'
  | 'social_facebook'
  | 'social_linkedin'
  | 'email_buyer'
  | 'email_seller'
  | 'email_open_house';

type ListingStyle = 'luxury' | 'family' | 'investment' | 'first_time';
type ListingTone = 'professional' | 'warm' | 'exciting';
type ListingLength = 'short' | 'medium' | 'long';

// Photo
interface Photo {
  id: string;
  propertyId: string;
  filename: string;
  originalPath: string;
  thumbnailPath: string;
  sortOrder: number;
  caption?: string;
  createdAt: string;
}

// Brand Voice
interface BrandVoice {
  id: string;
  name: string;
  description?: string;
  extractedStyle: string;
  sourceListings: string;
  sampleCount: number;
  createdAt: string;
  updatedAt: string;
}

// Analytics
interface AnalyticsSummary {
  totalGenerations: number;
  totalCostCents: number;
  averageLatencyMs: number;
  successRate: number;
}
```

---

**API Version:** 1.0.0
