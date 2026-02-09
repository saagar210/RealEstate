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

CREATE TABLE brand_voices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    extracted_style TEXT NOT NULL,
    source_listings TEXT NOT NULL,
    sample_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

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

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO settings (key, value) VALUES ('api_key', '');
INSERT INTO settings (key, value) VALUES ('default_style', 'professional');
INSERT INTO settings (key, value) VALUES ('default_tone', 'warm');
INSERT INTO settings (key, value) VALUES ('default_length', 'medium');
INSERT INTO settings (key, value) VALUES ('agent_name', '');
INSERT INTO settings (key, value) VALUES ('agent_phone', '');
INSERT INTO settings (key, value) VALUES ('agent_email', '');
INSERT INTO settings (key, value) VALUES ('brokerage_name', '');
