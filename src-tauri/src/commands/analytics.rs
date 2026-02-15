use serde::Serialize;
use sqlx::SqlitePool;
use tauri::State;

use crate::db::analytics;
use crate::error::AppError;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AnalyticsSummary {
    pub total_generations: i64,
    pub total_cost_cents: i64,
    pub average_latency_ms: f64,
    pub success_rate: f64,
}

/// Get analytics summary for dashboard
#[tauri::command]
pub async fn get_analytics_summary(
    db: State<'_, SqlitePool>,
) -> Result<AnalyticsSummary, AppError> {
    let total_generations = analytics::get_total_generations(&db).await?;
    let total_cost_cents = analytics::get_total_cost(&db).await?;
    let average_latency_ms = analytics::get_average_latency(&db).await?;
    let success_rate = analytics::get_success_rate(&db).await?;

    Ok(AnalyticsSummary {
        total_generations,
        total_cost_cents,
        average_latency_ms,
        success_rate,
    })
}
