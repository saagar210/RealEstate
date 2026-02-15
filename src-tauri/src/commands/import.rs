use serde::Serialize;
use sqlx::SqlitePool;
use tauri::State;

use crate::error::AppError;
use crate::import::csv::{self, ImportError};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportResultResponse {
    pub total: usize,
    pub successful: usize,
    pub failed: usize,
    pub errors: Vec<ImportErrorResponse>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportErrorResponse {
    pub row_number: usize,
    pub address: String,
    pub error: String,
}

impl From<ImportError> for ImportErrorResponse {
    fn from(err: ImportError) -> Self {
        Self {
            row_number: err.row_number,
            address: err.address,
            error: err.error,
        }
    }
}

/// Import properties from CSV data
#[tauri::command]
pub async fn import_properties_csv(
    db: State<'_, SqlitePool>,
    csv_data: String,
) -> Result<ImportResultResponse, AppError> {
    let result = csv::import_from_csv(&db, &csv_data).await?;

    Ok(ImportResultResponse {
        total: result.total,
        successful: result.successful,
        failed: result.failed,
        errors: result.errors.into_iter().map(Into::into).collect(),
    })
}

/// Get CSV template with headers and example rows
#[tauri::command]
pub fn get_csv_template() -> String {
    csv::generate_csv_template()
}
