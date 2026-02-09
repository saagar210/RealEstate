import { invoke } from "@tauri-apps/api/core";
import type {
  Property,
  CreatePropertyInput,
  Listing,
  BrandVoice,
  SocialGenerationOptions,
  EmailGenerationOptions,
  Photo,
} from "./types";

// Property commands
export const createProperty = (input: CreatePropertyInput) =>
  invoke<Property>("create_property", { input });

export const getProperty = (id: string) =>
  invoke<Property>("get_property", { id });

export const listProperties = () =>
  invoke<Property[]>("list_properties");

export const updateProperty = (id: string, input: CreatePropertyInput) =>
  invoke<Property>("update_property", { id, input });

export const deleteProperty = (id: string) =>
  invoke<void>("delete_property", { id });

// Listing commands
export const listListings = (propertyId: string) =>
  invoke<Listing[]>("list_listings", { propertyId });

export const toggleListingFavorite = (id: string) =>
  invoke<void>("toggle_listing_favorite", { id });

export const deleteListing = (id: string) =>
  invoke<void>("delete_listing", { id });

// Generation commands (streaming via Channel)
export const generateListing = (
  args: {
    propertyId: string;
    style: string;
    tone: string;
    length: string;
    seoKeywords: string[];
    brandVoiceId: string | null;
  },
  onEvent: unknown
) =>
  invoke<void>("generate_listing", { args, onEvent });

export const generateSocial = (
  propertyId: string,
  options: SocialGenerationOptions,
  onEvent: unknown
) =>
  invoke<void>("generate_social", { propertyId, options, onEvent });

export const generateEmail = (
  propertyId: string,
  options: EmailGenerationOptions,
  onEvent: unknown
) =>
  invoke<void>("generate_email", { propertyId, options, onEvent });

// Photo commands
export const importPhotos = (propertyId: string) =>
  invoke<Photo[]>("import_photos", { propertyId });

export const listPhotos = (propertyId: string) =>
  invoke<Photo[]>("list_photos", { propertyId });

export const deletePhoto = (id: string) =>
  invoke<void>("delete_photo", { id });

export const reorderPhotos = (propertyId: string, photoIds: string[]) =>
  invoke<void>("reorder_photos", { propertyId, photoIds });

// Brand voice commands
export const createBrandVoice = (
  name: string,
  description: string | null,
  sampleListings: string[]
) =>
  invoke<BrandVoice>("create_brand_voice", { name, description, sampleListings });

export const listBrandVoices = () =>
  invoke<BrandVoice[]>("list_brand_voices");

export const deleteBrandVoice = (id: string) =>
  invoke<void>("delete_brand_voice", { id });

// Settings commands
export const getSetting = (key: string) =>
  invoke<string>("get_setting", { key });

export const setSetting = (key: string, value: string) =>
  invoke<void>("set_setting", { key, value });

// Export commands
export const exportPdf = (propertyId: string, listingIds: string[]) =>
  invoke<void>("export_pdf", { propertyId, listingIds });

export const exportDocx = (propertyId: string, listingIds: string[]) =>
  invoke<void>("export_docx", { propertyId, listingIds });

export const copyToClipboard = (text: string) =>
  invoke<void>("copy_to_clipboard", { text });
