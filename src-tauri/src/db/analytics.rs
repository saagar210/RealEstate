use sqlx::SqlitePool;
use uuid::Uuid;

use crate::error::AppError;

/// Record a generation event for analytics
pub async fn record_generation(
    db: &SqlitePool,
    property_id: &str,
    generation_type: &str,
    model_used: &str,
    input_tokens: u32,
    output_tokens: u32,
    cost_cents: u32,
    latency_ms: u64,
    success: bool,
    error_message: Option<&str>,
) -> Result<(), AppError> {
    let id = Uuid::new_v4().to_string();

    sqlx::query!(
        r#"
        INSERT INTO generation_analytics (
            id, property_id, generation_type, model_used,
            input_tokens, output_tokens, cost_cents, latency_ms,
            success, error_message
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
        id,
        property_id,
        generation_type,
        model_used,
        input_tokens,
        output_tokens,
        cost_cents,
        latency_ms,
        success,
        error_message
    )
    .execute(db)
    .await?;

    Ok(())
}

/// Record an export event for analytics
pub async fn record_export(
    db: &SqlitePool,
    property_id: &str,
    export_format: &str,
    listing_count: usize,
    photo_count: usize,
    file_size_bytes: usize,
    generation_time_ms: u64,
) -> Result<(), AppError> {
    let id = Uuid::new_v4().to_string();

    sqlx::query!(
        r#"
        INSERT INTO export_analytics (
            id, property_id, export_format, listing_count,
            photo_count, file_size_bytes, generation_time_ms
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        "#,
        id,
        property_id,
        export_format,
        listing_count,
        photo_count,
        file_size_bytes,
        generation_time_ms
    )
    .execute(db)
    .await?;

    Ok(())
}

/// Get total generations count
pub async fn get_total_generations(db: &SqlitePool) -> Result<i64, AppError> {
    let result = sqlx::query_scalar!(
        r#"
        SELECT COUNT(*) as "count!" FROM generation_analytics
        "#
    )
    .fetch_one(db)
    .await?;

    Ok(result)
}

/// Get total cost in cents
pub async fn get_total_cost(db: &SqlitePool) -> Result<i64, AppError> {
    let result = sqlx::query_scalar!(
        r#"
        SELECT COALESCE(SUM(cost_cents), 0) as "total_cost!"
        FROM generation_analytics
        WHERE success = 1
        "#
    )
    .fetch_one(db)
    .await?;

    Ok(result)
}

/// Get average latency in milliseconds
pub async fn get_average_latency(db: &SqlitePool) -> Result<f64, AppError> {
    let result = sqlx::query_scalar!(
        r#"
        SELECT COALESCE(AVG(latency_ms), 0.0) as "avg_latency!"
        FROM generation_analytics
        WHERE success = 1
        "#
    )
    .fetch_one(db)
    .await?;

    Ok(result)
}

/// Get success rate as a percentage
pub async fn get_success_rate(db: &SqlitePool) -> Result<f64, AppError> {
    let result = sqlx::query!(
        r#"
        SELECT
            COUNT(*) as total,
            SUM(success) as successful
        FROM generation_analytics
        "#
    )
    .fetch_one(db)
    .await?;

    if result.total == 0 {
        return Ok(100.0);
    }

    let rate = (result.successful as f64 / result.total as f64) * 100.0;
    Ok(rate)
}

#[cfg(test)]
mod tests {
    use super::*;

    async fn setup_test_db() -> SqlitePool {
        let db = SqlitePool::connect("sqlite::memory:").await.unwrap();
        sqlx::migrate!("./migrations").run(&db).await.unwrap();
        db
    }

    #[tokio::test]
    async fn test_record_generation() {
        let db = setup_test_db().await;

        let result = record_generation(
            &db,
            "prop-123",
            "listing",
            "claude-sonnet-4-5",
            1000,
            2000,
            5,
            1500,
            true,
            None,
        )
        .await;

        assert!(result.is_ok());

        let count = get_total_generations(&db).await.unwrap();
        assert_eq!(count, 1);
    }

    #[tokio::test]
    async fn test_get_total_cost() {
        let db = setup_test_db().await;

        record_generation(&db, "prop-1", "listing", "sonnet", 100, 200, 10, 1000, true, None)
            .await
            .unwrap();
        record_generation(&db, "prop-2", "social", "sonnet", 100, 200, 15, 1200, true, None)
            .await
            .unwrap();

        let total = get_total_cost(&db).await.unwrap();
        assert_eq!(total, 25);
    }

    #[tokio::test]
    async fn test_success_rate() {
        let db = setup_test_db().await;

        record_generation(&db, "prop-1", "listing", "sonnet", 100, 200, 10, 1000, true, None)
            .await
            .unwrap();
        record_generation(
            &db,
            "prop-2",
            "listing",
            "sonnet",
            100,
            200,
            10,
            1000,
            false,
            Some("API error"),
        )
        .await
        .unwrap();

        let rate = get_success_rate(&db).await.unwrap();
        assert_eq!(rate, 50.0);
    }
}
