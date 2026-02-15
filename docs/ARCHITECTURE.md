# Real Estate Listing Optimizer - Architecture Documentation

**Version:** 1.0.0
**Last Updated:** 2026-02-15

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Layers](#architecture-layers)
4. [Data Flow](#data-flow)
5. [Database Schema](#database-schema)
6. [AI Integration](#ai-integration)
7. [File Storage](#file-storage)
8. [Error Handling](#error-handling)
9. [Testing Strategy](#testing-strategy)
10. [Performance Considerations](#performance-considerations)
11. [Security](#security)
12. [Future Enhancements](#future-enhancements)

---

## System Overview

The Real Estate Listing Optimizer is a desktop application built with Tauri 2, combining a Rust backend with a React + TypeScript frontend. It leverages Anthropic's Claude AI for intelligent content generation.

### Key Features

- Property management with rich metadata
- AI-powered listing generation (listings, social media, emails)
- Brand voice extraction and application
- Photo management with automatic optimization
- PDF/DOCX export with templates
- Bulk CSV import
- Usage analytics and cost tracking
- Cross-platform (Windows, macOS, Linux)

### Architecture Pattern

**Monolithic Desktop Application**
- Single executable
- Local SQLite database
- No network dependencies except AI API
- File-based photo storage

---

## Technology Stack

### Frontend

- **Framework:** React 18
- **Language:** TypeScript 5
- **Build Tool:** Vite 5
- **State Management:** Zustand
- **UI Components:** Custom components + Tauri Dialog/FS plugins
- **Styling:** CSS Modules (inferred)

### Backend

- **Framework:** Tauri 2
- **Language:** Rust (edition 2021)
- **Database:** SQLite 3 with sqlx
- **AI Client:** Anthropic API via reqwest
- **Image Processing:** image crate (0.25)
- **Document Generation:**
  - PDF: genpdf (0.2)
  - DOCX: docx-rs (0.4)
- **CSV Parsing:** csv (1.3)

### Infrastructure

- **CI/CD:** GitHub Actions
- **Version Control:** Git
- **Package Manager:** pnpm (frontend), Cargo (backend)
- **Code Signing:** Apple Developer ID, Windows EV certificates

---

## Architecture Layers

### Layer 1: Presentation (Frontend)

**Location:** `src/`

```
src/
├── components/       # React components
├── hooks/           # Custom React hooks
├── stores/          # Zustand state management
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
└── __tests__/       # Frontend tests
```

**Responsibilities:**
- User interface rendering
- User input handling
- State management
- Tauri command invocation
- Real-time streaming display

**Key Patterns:**
- **Component Architecture:** Functional components with hooks
- **State Management:** Zustand stores for global state
- **Event Handling:** Channel-based streaming for AI generation
- **Type Safety:** Full TypeScript coverage

---

### Layer 2: Application Logic (Backend)

**Location:** `src-tauri/src/`

```
src-tauri/src/
├── commands/        # Tauri command handlers
│   ├── property.rs
│   ├── generate.rs
│   ├── photos.rs
│   ├── export.rs
│   ├── import.rs
│   ├── analytics.rs
│   ├── brand_voice.rs
│   ├── settings.rs
│   └── license.rs
├── db/              # Database layer
│   ├── properties.rs
│   ├── listings.rs
│   ├── photos.rs
│   ├── brand_voice.rs
│   ├── analytics.rs
│   └── settings.rs
├── ai/              # AI integration
│   ├── client.rs
│   ├── listing_generator.rs
│   ├── social_generator.rs
│   ├── email_generator.rs
│   ├── brand_voice.rs
│   └── prompts.rs
├── export/          # Document generation
│   ├── pdf.rs
│   ├── docx.rs
│   └── templates.rs
├── import/          # Bulk import
│   └── csv.rs
├── photos/          # Photo processing
│   └── manager.rs
├── error.rs         # Error types
├── license.rs       # License validation
├── lib.rs           # Module registration
└── main.rs          # Entry point
```

**Responsibilities:**
- Business logic execution
- Data validation
- Database operations
- AI API communication
- File I/O operations

**Key Patterns:**
- **Command Pattern:** Tauri commands as entry points
- **Repository Pattern:** db/ modules encapsulate database access
- **Service Layer:** ai/, export/, import/ provide specialized services
- **Error Handling:** Result<T, AppError> throughout

---

### Layer 3: Data Persistence

**Location:** `src-tauri/migrations/`

**Database:** SQLite with WAL mode

**Migrations:**
- `20240101000001_initial.sql` - Core schema
- `20240201000001_phase3_enhancements.sql` - Analytics and settings

**Tables:**
- `properties` - Property records
- `listings` - Generated content
- `photos` - Photo metadata
- `brand_voices` - Extracted brand styles
- `generation_analytics` - Usage tracking
- `export_analytics` - Export metrics
- `settings` - Key-value configuration

**Relationships:**
- Properties → Listings (1:N, cascade delete)
- Properties → Photos (1:N, cascade delete)
- Properties → Analytics (1:N, cascade delete)
- Listings → Brand Voices (N:1, set null on delete)

---

## Data Flow

### Property Creation Flow

```
User Input (Frontend)
    ↓
create_property command
    ↓
Validation (beds >= 0, price > 0, etc.)
    ↓
properties::create (Database layer)
    ↓
INSERT INTO properties
    ↓
Return Property object
    ↓
Update Zustand store
    ↓
UI refresh
```

### Listing Generation Flow

```
User clicks "Generate" (Frontend)
    ↓
generate_listing command with Channel
    ↓
Load: property, API key, settings, brand voice
    ↓
ClaudeClient::new(api_key, model)
    ↓
listing_generator::generate_listing
    ├── Stage 1: Property Analysis (non-streaming)
    │   ├── build_analysis_prompt
    │   ├── client.send_message
    │   └── Parse JSON result
    └── Stage 2: Listing Generation (streaming)
        ├── build_listing_prompt (includes analysis)
        ├── client.stream_message
        ├── Send StreamEvent::Delta to Channel
        ├── Frontend appends text in real-time
        └── Send StreamEvent::Finished
    ↓
listings::save (Database layer)
    ↓
analytics::record_generation (tracking)
    ↓
Return to frontend
```

### Export Flow

```
User selects listings and clicks "Export PDF"
    ↓
export_pdf command
    ↓
Load: property, selected listings, photos
    ↓
tokio::spawn_blocking (avoid blocking async runtime)
    ├── pdf::generate_pdf
    │   ├── Create Document
    │   ├── Add property details
    │   ├── Load and resize photos (up to 6)
    │   ├── Embed images
    │   ├── Add listings content
    │   └── Render to bytes
    └── Return Vec<u8>
    ↓
analytics::record_export (tracking)
    ↓
Return PDF bytes to frontend
    ↓
Tauri save dialog
    ↓
Write file to disk
```

---

## Database Schema

### Properties Table

```sql
CREATE TABLE properties (
    id TEXT PRIMARY KEY,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    beds INTEGER NOT NULL CHECK(beds >= 0),
    baths REAL NOT NULL CHECK(baths >= 0),
    sqft INTEGER NOT NULL CHECK(sqft > 0),
    price INTEGER NOT NULL CHECK(price > 0),
    property_type TEXT NOT NULL CHECK(property_type IN (
        'single_family', 'condo', 'townhouse', 'multi_family', 'land', 'commercial'
    )),
    year_built INTEGER,
    lot_size TEXT,
    parking TEXT,
    key_features TEXT NOT NULL DEFAULT '[]',
    neighborhood TEXT,
    neighborhood_highlights TEXT DEFAULT '[]',
    school_district TEXT,
    nearby_amenities TEXT DEFAULT '[]',
    agent_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

**Indexes:** None (primary key only)

### Listings Table

```sql
CREATE TABLE listings (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    generation_type TEXT NOT NULL CHECK(generation_type IN (
        'listing', 'social_instagram', 'social_facebook', 'social_linkedin',
        'email_buyer', 'email_seller', 'email_open_house'
    )),
    style TEXT CHECK(style IN ('luxury', 'family', 'investment', 'first_time')),
    tone TEXT CHECK(tone IN ('professional', 'warm', 'exciting')),
    length TEXT CHECK(length IN ('short', 'medium', 'long')),
    seo_keywords TEXT DEFAULT '[]',
    brand_voice_id TEXT REFERENCES brand_voices(id) ON DELETE SET NULL,
    tokens_used INTEGER NOT NULL,
    generation_cost_cents INTEGER NOT NULL,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_listings_property ON listings(property_id, created_at DESC);
```

### Photos Table

```sql
CREATE TABLE photos (
    id TEXT PRIMARY KEY,
    property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_path TEXT NOT NULL,
    thumbnail_path TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    caption TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_photos_property ON photos(property_id, sort_order);
```

### Generation Analytics Table

```sql
CREATE TABLE generation_analytics (
    id TEXT PRIMARY KEY,
    property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
    generation_type TEXT NOT NULL,
    model_used TEXT NOT NULL,
    input_tokens INTEGER NOT NULL,
    output_tokens INTEGER NOT NULL,
    cost_cents INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    success INTEGER NOT NULL DEFAULT 1,
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_analytics_property ON generation_analytics(property_id, created_at DESC);
CREATE INDEX idx_analytics_created ON generation_analytics(created_at DESC);
```

**Cost Calculation:**
```
cost_cents = (input_tokens * 3 + output_tokens * 15) / 10000
```
(Based on Sonnet pricing: $3/1M input, $15/1M output)

---

## AI Integration

### Architecture

**Client:** `ai/client.rs` - `ClaudeClient` struct

**Flow:**
1. Create client with API key and model
2. Build system and user prompts
3. Send request (streaming or non-streaming)
4. Parse response
5. Return structured data

### Retry Logic

**Exponential Backoff:**
- Max retries: 3
- Backoff: 1s → 2s → 4s
- Retryable errors: 429 (rate limit), 529 (overload), network errors
- Non-retryable: auth errors, validation errors

**Implementation:**
```rust
async fn send_message(&self, ...) -> Result<...> {
    let mut attempt = 0;
    loop {
        attempt += 1;
        match self.send_message_attempt(...).await {
            Ok(response) => return Ok(response),
            Err(e) if attempt >= MAX_RETRIES => return Err(e),
            Err(e) if is_retryable_error(&e) => {
                let backoff_ms = INITIAL_BACKOFF_MS * 2_u64.pow(attempt - 1);
                sleep(Duration::from_millis(backoff_ms)).await;
            }
            Err(e) => return Err(e),
        }
    }
}
```

### Model Selection

**Supported Models:**
- `claude-sonnet-4-5-20250929` (default)
- `claude-haiku-4-5-20251001` (fast, economical)
- `claude-opus-4-6` (highest quality)

**Storage:** `settings` table, key = `ai_model`

**Loading:**
```rust
let model = settings::get(&db, "ai_model")
    .await
    .unwrap_or_else(|_| "claude-sonnet-4-5-20250929".to_string());
```

### Prompt Engineering

**Two-Stage Generation:**

**Stage 1: Analysis**
- Analyze property data
- Identify selling points, target buyer, emotional hooks
- Return structured JSON

**Stage 2: Content Generation**
- Use analysis JSON as input
- Apply style, tone, length parameters
- Apply brand voice if selected
- Stream text to frontend

**Prompts Location:** `ai/prompts.rs`

---

## File Storage

### Directory Structure

```
{APP_DATA_DIR}/
├── realestate.db           # SQLite database
└── photos/
    ├── {property_id}/
    │   ├── original/
    │   │   ├── {filename}.jpg
    │   │   └── ...
    │   └── thumbnails/
    │       ├── {filename}_thumb.jpg
    │       └── ...
    └── ...
```

### Photo Processing

**Import Flow:**
1. User selects photos (Tauri file dialog)
2. Validate format (JPEG/PNG)
3. Generate UUID filename
4. Copy to `original/` directory
5. Create thumbnail (300x300, Lanczos3)
6. Save to `thumbnails/` directory
7. Insert metadata to database

**Thumbnail Generation:**
```rust
let thumbnail = img.resize(300, 300, image::imageops::FilterType::Lanczos3);
thumbnail.save(&thumbnail_path)?;
```

### Export Files

**Location:** User-selected via save dialog
**Formats:** PDF (`.pdf`), DOCX (`.docx`)
**Generation:** On-demand, not cached

---

## Error Handling

### Error Type Hierarchy

```rust
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    // Database
    Database(#[from] sqlx::Error),

    // API
    MissingApiKey,
    ApiRateLimit(String),
    ApiOverloaded(String),
    NetworkError(String),
    Api(String),

    // Not Found
    PropertyNotFound(String),
    ListingNotFound(String),
    BrandVoiceNotFound(String),

    // Validation
    Validation(String),
    InvalidPropertyData(String),

    // Photos
    PhotoImportFailed(String),
    PhotoLimitExceeded,

    // Export
    Export(String),

    // License
    InvalidLicense,
    LicenseValidationFailed,

    // Generic
    Io(#[from] std::io::Error),
    Json(#[from] serde_json::Error),
}
```

### Error Messages

**User-Facing:**
- Clear, actionable error messages
- Example: "API key is missing or invalid. Please set your Anthropic API key in Settings (must start with 'sk-ant-')."

**Developer-Facing:**
- Detailed error context
- Stack traces in console (dev mode)

### Error Propagation

**Pattern:**
```rust
pub async fn some_function() -> Result<T, AppError> {
    let value = risky_operation()
        .await
        .map_err(|e| AppError::Database(e))?;

    Ok(value)
}
```

---

## Testing Strategy

### Test Pyramid

**Unit Tests (40%)**
- Pure functions
- Data transformations
- Validation logic
- Error handling

**Integration Tests (50%)**
- Database operations
- AI client (with mocks)
- Command handlers
- Import/export workflows

**End-to-End Tests (10%)**
- Full user workflows
- Property lifecycle
- Generation pipeline

### Test Infrastructure

**Location:** `src-tauri/tests/`

**Common Utilities:**
- `common/db_setup.rs` - In-memory SQLite
- `common/mock_api.rs` - HTTP mocking (mockito)
- `common/fixtures.rs` - Test data builders

**Coverage:** 95%+ (Phase 1 complete)

### Running Tests

```bash
# Backend tests
cd src-tauri
cargo test

# Frontend tests
pnpm test

# With coverage
pnpm test -- --coverage
```

---

## Performance Considerations

### Database

**Optimizations:**
- WAL mode for concurrent reads
- Indexes on foreign keys and date columns
- Prepared statements (sqlx compile-time checks)

**Connection Pooling:**
```rust
SqlitePoolOptions::new()
    .max_connections(5)
    .connect_with(options)
    .await?
```

### Image Processing

**Lazy Loading:**
- Thumbnails displayed, not originals
- Originals loaded only for export

**Resize Strategy:**
- Lanczos3 filter (high quality)
- Max 400px width for exports
- Parallel processing with `spawn_blocking`

### AI Requests

**Streaming:**
- Text appears as generated (better UX)
- No waiting for full response

**Caching:**
- Listings saved to database
- Reuse previous generations

### Export Generation

**Async Pattern:**
```rust
tokio::task::spawn_blocking(move || {
    pdf::generate_pdf(&property, &listings, &photos)
})
.await??
```

**Rationale:** PDF/DOCX generation is CPU-intensive and synchronous. `spawn_blocking` prevents blocking the async runtime.

---

## Security

### API Key Storage

**Location:** SQLite database (settings table)
**Encryption:** Not encrypted (local database, user's machine)
**Recommendation:** Use OS keychain for production (future enhancement)

### SQL Injection Prevention

**Strategy:** sqlx with compile-time checked queries

**Example:**
```rust
sqlx::query_as!(Property,
    r#"SELECT * FROM properties WHERE id = ?"#,
    id
)
.fetch_one(pool)
.await?
```

### File Access

**Restrictions:**
- Photos only in app data directory
- CSV import validates file paths
- Export uses Tauri save dialog (user consent)

### Network Security

**HTTPS Only:**
- All API requests to `https://api.anthropic.com`
- Certificate validation enabled

**No External Dependencies:**
- No analytics tracking
- No telemetry
- Fully offline except AI generation

---

## Future Enhancements

### Phase 4+ Features

**Cloud Sync (Optional):**
- Sync properties across devices
- Cloud backup
- Team collaboration

**Plugin System:**
- Custom export formats
- Third-party integrations
- MLS API connectors

**Advanced Analytics:**
- Cost trends over time
- Model performance comparison
- Property-level ROI tracking

**Mobile Companion App:**
- iOS/Android apps
- Photo capture on-site
- Quick property entry

### Technical Improvements

**Performance:**
- Photo lazy loading (virtual scrolling)
- Database query optimization
- Caching layer for frequent queries

**Security:**
- OS keychain integration for API keys
- Encrypted database option
- Audit logging

**UX:**
- Undo/redo functionality
- Autosave drafts
- Keyboard shortcuts
- Dark mode

---

## Development Setup

### Prerequisites

- Rust 1.70+
- Node.js 18+
- pnpm 8+
- SQLite 3

### Build

```bash
# Install frontend dependencies
pnpm install

# Install Rust dependencies
cd src-tauri
cargo build

# Run in development mode
cd ..
pnpm tauri dev

# Build for production
pnpm tauri build
```

### Project Structure Conventions

- **Frontend:** React functional components, TypeScript strict mode
- **Backend:** Rust 2021 edition, async/await throughout
- **Database:** Migrations in chronological order
- **Tests:** Co-located with modules (`mod tests`)
- **Docs:** Markdown in `docs/` directory

---

**Architecture Version:** 1.0.0
**Last Review:** 2026-02-15
