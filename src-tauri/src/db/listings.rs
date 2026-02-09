use serde::{Deserialize, Serialize, Serializer};
use sqlx::{FromRow, Row, SqlitePool};

use crate::error::AppError;

fn serialize_json_array<S>(value: &str, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let arr: Vec<String> = serde_json::from_str(value).unwrap_or_default();
    arr.serialize(serializer)
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Listing {
    pub id: String,
    pub property_id: String,
    pub content: String,
    pub generation_type: String,
    pub style: Option<String>,
    pub tone: Option<String>,
    pub length: Option<String>,
    #[serde(serialize_with = "serialize_json_array")]
    pub seo_keywords: String,
    pub brand_voice_id: Option<String>,
    pub tokens_used: i64,
    pub generation_cost_cents: i64,
    pub is_favorite: bool,
    pub created_at: String,
}

pub struct CreateListingInput {
    pub property_id: String,
    pub content: String,
    pub generation_type: String,
    pub style: Option<String>,
    pub tone: Option<String>,
    pub length: Option<String>,
    pub seo_keywords: Vec<String>,
    pub brand_voice_id: Option<String>,
    pub tokens_used: i64,
    pub generation_cost_cents: i64,
}

pub async fn save(pool: &SqlitePool, input: CreateListingInput) -> Result<Listing, AppError> {
    let id = uuid::Uuid::new_v4().to_string();
    let seo_keywords = serde_json::to_string(&input.seo_keywords)?;

    sqlx::query(
        "INSERT INTO listings (id, property_id, content, generation_type, style, tone, length, seo_keywords, brand_voice_id, tokens_used, generation_cost_cents)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&input.property_id)
    .bind(&input.content)
    .bind(&input.generation_type)
    .bind(&input.style)
    .bind(&input.tone)
    .bind(&input.length)
    .bind(&seo_keywords)
    .bind(&input.brand_voice_id)
    .bind(input.tokens_used)
    .bind(input.generation_cost_cents)
    .execute(pool)
    .await?;

    get(pool, &id).await
}

pub async fn get(pool: &SqlitePool, id: &str) -> Result<Listing, AppError> {
    let row = sqlx::query(
        "SELECT id, property_id, content, generation_type, style, tone, length, seo_keywords, brand_voice_id, tokens_used, generation_cost_cents, is_favorite, created_at FROM listings WHERE id = ?"
    )
    .bind(id)
    .fetch_one(pool)
    .await?;

    Ok(listing_from_row(&row))
}

pub async fn list_by_property(
    pool: &SqlitePool,
    property_id: &str,
) -> Result<Vec<Listing>, AppError> {
    let rows = sqlx::query(
        "SELECT id, property_id, content, generation_type, style, tone, length, seo_keywords, brand_voice_id, tokens_used, generation_cost_cents, is_favorite, created_at FROM listings WHERE property_id = ? ORDER BY created_at DESC"
    )
    .bind(property_id)
    .fetch_all(pool)
    .await?;

    Ok(rows.iter().map(listing_from_row).collect())
}

fn listing_from_row(row: &sqlx::sqlite::SqliteRow) -> Listing {
    Listing {
        id: row.get("id"),
        property_id: row.get("property_id"),
        content: row.get("content"),
        generation_type: row.get("generation_type"),
        style: row.get("style"),
        tone: row.get("tone"),
        length: row.get("length"),
        seo_keywords: row.get("seo_keywords"),
        brand_voice_id: row.get("brand_voice_id"),
        tokens_used: row.get("tokens_used"),
        generation_cost_cents: row.get("generation_cost_cents"),
        is_favorite: row.get::<i32, _>("is_favorite") != 0,
        created_at: row.get("created_at"),
    }
}

pub async fn toggle_favorite(pool: &SqlitePool, id: &str) -> Result<(), AppError> {
    sqlx::query("UPDATE listings SET is_favorite = NOT is_favorite WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn delete(pool: &SqlitePool, id: &str) -> Result<(), AppError> {
    sqlx::query("DELETE FROM listings WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::{properties, test_pool};

    async fn create_test_property(pool: &SqlitePool) -> String {
        let input = properties::CreatePropertyInput {
            address: "123 Oak Street".to_string(),
            city: "San Francisco".to_string(),
            state: "CA".to_string(),
            zip: "94105".to_string(),
            beds: 3,
            baths: 2.5,
            sqft: 1800,
            price: 95000000,
            property_type: "single_family".to_string(),
            year_built: Some(2015),
            lot_size: None,
            parking: None,
            key_features: vec!["pool".to_string()],
            neighborhood: None,
            neighborhood_highlights: vec![],
            school_district: None,
            nearby_amenities: vec![],
            agent_notes: None,
        };
        let property = properties::create(pool, input).await.unwrap();
        property.id
    }

    #[tokio::test]
    async fn test_save_and_get() {
        let pool = test_pool().await;
        let property_id = create_test_property(&pool).await;

        let listing = save(
            &pool,
            CreateListingInput {
                property_id: property_id.clone(),
                content: "Beautiful home in SF".to_string(),
                generation_type: "listing".to_string(),
                style: Some("luxury".to_string()),
                tone: Some("warm".to_string()),
                length: Some("medium".to_string()),
                seo_keywords: vec!["san francisco".to_string()],
                brand_voice_id: None,
                tokens_used: 500,
                generation_cost_cents: 1,
            },
        )
        .await
        .unwrap();

        assert_eq!(listing.content, "Beautiful home in SF");
        assert_eq!(listing.tokens_used, 500);

        let fetched = get(&pool, &listing.id).await.unwrap();
        assert_eq!(fetched.id, listing.id);
    }

    #[tokio::test]
    async fn test_list_by_property() {
        let pool = test_pool().await;
        let property_id = create_test_property(&pool).await;

        for i in 0..3 {
            save(
                &pool,
                CreateListingInput {
                    property_id: property_id.clone(),
                    content: format!("Listing {}", i),
                    generation_type: "listing".to_string(),
                    style: None,
                    tone: None,
                    length: None,
                    seo_keywords: vec![],
                    brand_voice_id: None,
                    tokens_used: 100,
                    generation_cost_cents: 1,
                },
            )
            .await
            .unwrap();
        }

        let listings = list_by_property(&pool, &property_id).await.unwrap();
        assert_eq!(listings.len(), 3);
    }

    #[tokio::test]
    async fn test_toggle_favorite() {
        let pool = test_pool().await;
        let property_id = create_test_property(&pool).await;

        let listing = save(
            &pool,
            CreateListingInput {
                property_id,
                content: "Test".to_string(),
                generation_type: "listing".to_string(),
                style: None,
                tone: None,
                length: None,
                seo_keywords: vec![],
                brand_voice_id: None,
                tokens_used: 100,
                generation_cost_cents: 1,
            },
        )
        .await
        .unwrap();

        assert!(!listing.is_favorite);

        toggle_favorite(&pool, &listing.id).await.unwrap();
        let fetched = get(&pool, &listing.id).await.unwrap();
        assert!(fetched.is_favorite);

        toggle_favorite(&pool, &listing.id).await.unwrap();
        let fetched = get(&pool, &listing.id).await.unwrap();
        assert!(!fetched.is_favorite);
    }
}
