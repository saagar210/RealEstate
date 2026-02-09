use serde::{Deserialize, Serialize, Serializer};
use sqlx::{FromRow, SqlitePool};

use crate::error::AppError;

/// Serialize a JSON string column as a proper JSON array
fn serialize_json_array<S>(value: &str, serializer: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    let arr: Vec<String> = serde_json::from_str(value).unwrap_or_default();
    arr.serialize(serializer)
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Property {
    pub id: String,
    pub address: String,
    pub city: String,
    pub state: String,
    pub zip: String,
    pub beds: i64,
    pub baths: f64,
    pub sqft: i64,
    pub price: i64,
    pub property_type: String,
    pub year_built: Option<i64>,
    pub lot_size: Option<String>,
    pub parking: Option<String>,
    #[serde(serialize_with = "serialize_json_array")]
    pub key_features: String,
    pub neighborhood: Option<String>,
    #[serde(serialize_with = "serialize_json_array")]
    pub neighborhood_highlights: String,
    pub school_district: Option<String>,
    #[serde(serialize_with = "serialize_json_array")]
    pub nearby_amenities: String,
    pub agent_notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePropertyInput {
    pub address: String,
    pub city: String,
    pub state: String,
    pub zip: String,
    pub beds: i64,
    pub baths: f64,
    pub sqft: i64,
    pub price: i64,
    pub property_type: String,
    pub year_built: Option<i64>,
    pub lot_size: Option<String>,
    pub parking: Option<String>,
    pub key_features: Vec<String>,
    pub neighborhood: Option<String>,
    pub neighborhood_highlights: Vec<String>,
    pub school_district: Option<String>,
    pub nearby_amenities: Vec<String>,
    pub agent_notes: Option<String>,
}

pub async fn create(pool: &SqlitePool, input: CreatePropertyInput) -> Result<Property, AppError> {
    let id = uuid::Uuid::new_v4().to_string();
    let key_features = serde_json::to_string(&input.key_features)?;
    let neighborhood_highlights = serde_json::to_string(&input.neighborhood_highlights)?;
    let nearby_amenities = serde_json::to_string(&input.nearby_amenities)?;

    sqlx::query(
        "INSERT INTO properties (id, address, city, state, zip, beds, baths, sqft, price, property_type, year_built, lot_size, parking, key_features, neighborhood, neighborhood_highlights, school_district, nearby_amenities, agent_notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(&id)
    .bind(&input.address)
    .bind(&input.city)
    .bind(&input.state)
    .bind(&input.zip)
    .bind(input.beds)
    .bind(input.baths)
    .bind(input.sqft)
    .bind(input.price)
    .bind(&input.property_type)
    .bind(input.year_built)
    .bind(&input.lot_size)
    .bind(&input.parking)
    .bind(&key_features)
    .bind(&input.neighborhood)
    .bind(&neighborhood_highlights)
    .bind(&input.school_district)
    .bind(&nearby_amenities)
    .bind(&input.agent_notes)
    .execute(pool)
    .await?;

    get(pool, &id).await
}

pub async fn get(pool: &SqlitePool, id: &str) -> Result<Property, AppError> {
    let property = sqlx::query_as::<_, Property>(
        "SELECT id, address, city, state, zip, beds, baths, sqft, price, property_type, year_built, lot_size, parking, key_features, neighborhood, neighborhood_highlights, school_district, nearby_amenities, agent_notes, created_at, updated_at FROM properties WHERE id = ?"
    )
    .bind(id)
    .fetch_one(pool)
    .await?;

    Ok(property)
}

pub async fn list_all(pool: &SqlitePool) -> Result<Vec<Property>, AppError> {
    let properties = sqlx::query_as::<_, Property>(
        "SELECT id, address, city, state, zip, beds, baths, sqft, price, property_type, year_built, lot_size, parking, key_features, neighborhood, neighborhood_highlights, school_district, nearby_amenities, agent_notes, created_at, updated_at FROM properties ORDER BY created_at DESC"
    )
    .fetch_all(pool)
    .await?;

    Ok(properties)
}

pub async fn update(
    pool: &SqlitePool,
    id: &str,
    input: CreatePropertyInput,
) -> Result<Property, AppError> {
    let key_features = serde_json::to_string(&input.key_features)?;
    let neighborhood_highlights = serde_json::to_string(&input.neighborhood_highlights)?;
    let nearby_amenities = serde_json::to_string(&input.nearby_amenities)?;

    sqlx::query(
        "UPDATE properties SET address = ?, city = ?, state = ?, zip = ?, beds = ?, baths = ?, sqft = ?, price = ?, property_type = ?, year_built = ?, lot_size = ?, parking = ?, key_features = ?, neighborhood = ?, neighborhood_highlights = ?, school_district = ?, nearby_amenities = ?, agent_notes = ?, updated_at = datetime('now') WHERE id = ?"
    )
    .bind(&input.address)
    .bind(&input.city)
    .bind(&input.state)
    .bind(&input.zip)
    .bind(input.beds)
    .bind(input.baths)
    .bind(input.sqft)
    .bind(input.price)
    .bind(&input.property_type)
    .bind(input.year_built)
    .bind(&input.lot_size)
    .bind(&input.parking)
    .bind(&key_features)
    .bind(&input.neighborhood)
    .bind(&neighborhood_highlights)
    .bind(&input.school_district)
    .bind(&nearby_amenities)
    .bind(&input.agent_notes)
    .bind(id)
    .execute(pool)
    .await?;

    get(pool, id).await
}

pub async fn delete(pool: &SqlitePool, id: &str) -> Result<(), AppError> {
    sqlx::query("DELETE FROM properties WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::test_pool;

    fn sample_input() -> CreatePropertyInput {
        CreatePropertyInput {
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
            lot_size: Some("0.25 acres".to_string()),
            parking: Some("2-car garage".to_string()),
            key_features: vec!["hardwood floors".to_string(), "chef's kitchen".to_string()],
            neighborhood: Some("Mission Bay".to_string()),
            neighborhood_highlights: vec!["Walk Score 95".to_string()],
            school_district: Some("SFUSD".to_string()),
            nearby_amenities: vec!["Whole Foods 0.3mi".to_string()],
            agent_notes: Some("Motivated seller".to_string()),
        }
    }

    #[tokio::test]
    async fn test_create_and_get() {
        let pool = test_pool().await;
        let property = create(&pool, sample_input()).await.unwrap();

        assert_eq!(property.address, "123 Oak Street");
        assert_eq!(property.beds, 3);
        assert_eq!(property.baths, 2.5);
        assert_eq!(property.price, 95000000);

        let fetched = get(&pool, &property.id).await.unwrap();
        assert_eq!(fetched.id, property.id);
    }

    #[tokio::test]
    async fn test_list_all() {
        let pool = test_pool().await;
        create(&pool, sample_input()).await.unwrap();
        create(&pool, sample_input()).await.unwrap();

        let all = list_all(&pool).await.unwrap();
        assert_eq!(all.len(), 2);
    }

    #[tokio::test]
    async fn test_update() {
        let pool = test_pool().await;
        let property = create(&pool, sample_input()).await.unwrap();

        let mut updated_input = sample_input();
        updated_input.address = "456 Elm Street".to_string();
        updated_input.beds = 4;

        let updated = update(&pool, &property.id, updated_input).await.unwrap();
        assert_eq!(updated.address, "456 Elm Street");
        assert_eq!(updated.beds, 4);
    }

    #[tokio::test]
    async fn test_delete() {
        let pool = test_pool().await;
        let property = create(&pool, sample_input()).await.unwrap();
        delete(&pool, &property.id).await.unwrap();

        let result = get(&pool, &property.id).await;
        assert!(result.is_err());
    }
}
