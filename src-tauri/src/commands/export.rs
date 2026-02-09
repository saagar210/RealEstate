use sqlx::SqlitePool;
use tauri::State;

use crate::db::{listings, properties};
use crate::error::AppError;
use crate::export::{docx, pdf};

#[tauri::command]
pub async fn export_pdf(
    db: State<'_, SqlitePool>,
    property_id: String,
    listing_ids: Vec<String>,
) -> Result<Vec<u8>, AppError> {
    let property = properties::get(&db, &property_id).await?;

    let mut selected_listings = Vec::new();
    for id in &listing_ids {
        let listing = listings::get(&db, id).await?;
        selected_listings.push(listing);
    }

    let bytes =
        tokio::task::spawn_blocking(move || pdf::generate_pdf(&property, &selected_listings))
            .await
            .map_err(|e| AppError::Export(format!("PDF generation task failed: {}", e)))??;

    Ok(bytes)
}

#[tauri::command]
pub async fn export_docx(
    db: State<'_, SqlitePool>,
    property_id: String,
    listing_ids: Vec<String>,
) -> Result<Vec<u8>, AppError> {
    let property = properties::get(&db, &property_id).await?;

    let mut selected_listings = Vec::new();
    for id in &listing_ids {
        let listing = listings::get(&db, id).await?;
        selected_listings.push(listing);
    }

    let bytes =
        tokio::task::spawn_blocking(move || docx::generate_docx(&property, &selected_listings))
            .await
            .map_err(|e| AppError::Export(format!("DOCX generation task failed: {}", e)))??;

    Ok(bytes)
}

#[tauri::command]
pub async fn copy_to_clipboard(text: String) -> Result<(), AppError> {
    // Use the clipboard plugin from the frontend side instead
    // This command is a simple passthrough for cases where we need it from Rust
    // In practice, the frontend uses @tauri-apps/plugin-clipboard-manager directly
    Ok(())
}
