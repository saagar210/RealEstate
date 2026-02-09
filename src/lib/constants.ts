export const ROUTES = {
  DASHBOARD: "/",
  NEW_PROPERTY: "/property/new",
  PROPERTY_DETAIL: "/property/:id",
  GENERATE_LISTING: "/property/:id/listing",
  SOCIAL_MEDIA: "/property/:id/social",
  EMAIL_CAMPAIGN: "/property/:id/email",
  BRAND_VOICE: "/brand-voice",
  SETTINGS: "/settings",
} as const;

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL",
  "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
  "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

export const PROPERTY_TYPES = [
  { value: "single_family", label: "Single Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
] as const;

export const LISTING_STYLES = [
  { value: "luxury", label: "Luxury", description: "Sophisticated language for affluent buyers" },
  { value: "family", label: "Family-Friendly", description: "Warm, inviting tone for families" },
  { value: "investment", label: "Investment", description: "Data-driven for investors" },
  { value: "first_time", label: "First-Time Buyer", description: "Encouraging for new buyers" },
] as const;

export const LISTING_TONES = [
  { value: "professional", label: "Professional", description: "Authoritative and polished" },
  { value: "warm", label: "Warm", description: "Conversational and inviting" },
  { value: "exciting", label: "Exciting", description: "High energy, action-oriented" },
] as const;

export const LISTING_LENGTHS = [
  { value: "short", label: "Short", description: "100-150 words" },
  { value: "medium", label: "Medium", description: "200-300 words" },
  { value: "long", label: "Long", description: "400-500 words" },
] as const;

export const SOCIAL_PLATFORMS = [
  { value: "instagram", label: "Instagram", maxChars: 2200 },
  { value: "facebook", label: "Facebook", maxChars: 63206 },
  { value: "linkedin", label: "LinkedIn", maxChars: 3000 },
] as const;

export const EMAIL_TEMPLATES = [
  { value: "buyer", label: "Buyer Lead", description: "Target potential buyers matching this property" },
  { value: "seller", label: "Seller Lead", description: "Use as social proof for neighborhood sellers" },
  { value: "open_house", label: "Open House", description: "Invite buyers to an open house event" },
] as const;

export const MAX_PHOTOS = 20;
export const MAX_PHOTO_SIZE_MB = 10;
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
