// Settings command handler tests

#[cfg(test)]
mod tests {
    use crate::common::db_setup::create_test_db;

    #[tokio::test]
    async fn test_set_and_get_setting() {
        let pool = create_test_db().await.expect("Failed to create test DB");

        // Set a setting
        realestate_lib::db::settings::set(&pool, "test_key", "test_value")
            .await
            .expect("Failed to set setting");

        // Get the setting
        let value = realestate_lib::db::settings::get(&pool, "test_key")
            .await
            .expect("Failed to get setting");

        assert_eq!(value, "test_value");
    }

    #[tokio::test]
    async fn test_update_existing_setting() {
        let pool = create_test_db().await.expect("Failed to create test DB");

        // Set initial value
        realestate_lib::db::settings::set(&pool, "api_key", "initial_key")
            .await
            .expect("Failed to set");

        // Update value
        realestate_lib::db::settings::set(&pool, "api_key", "updated_key")
            .await
            .expect("Failed to update");

        // Verify updated value
        let value = realestate_lib::db::settings::get(&pool, "api_key")
            .await
            .expect("Failed to get");

        assert_eq!(value, "updated_key");
    }

    #[tokio::test]
    async fn test_get_nonexistent_setting() {
        let pool = create_test_db().await.expect("Failed to create test DB");

        let result = realestate_lib::db::settings::get(&pool, "nonexistent_key").await;

        assert!(result.is_err(), "Should error for nonexistent setting");
    }

    #[tokio::test]
    async fn test_multiple_settings() {
        let pool = create_test_db().await.expect("Failed to create test DB");

        // Set multiple settings
        let settings = vec![
            ("anthropic_api_key", "sk-ant-test-123"),
            ("agent_name", "John Doe"),
            ("agent_email", "john@example.com"),
            ("default_style", "Professional"),
            ("default_tone", "Friendly"),
        ];

        for (key, value) in &settings {
            realestate_lib::db::settings::set(&pool, key, value)
                .await
                .expect("Failed to set");
        }

        // Verify all settings
        for (key, expected_value) in &settings {
            let value = realestate_lib::db::settings::get(&pool, key)
                .await
                .expect("Failed to get");
            assert_eq!(value, *expected_value);
        }
    }

    #[tokio::test]
    async fn test_api_key_storage() {
        let pool = create_test_db().await.expect("Failed to create test DB");

        let api_key = "sk-ant-api03-xyz123";
        realestate_lib::db::settings::set(&pool, "anthropic_api_key", api_key)
            .await
            .expect("Failed to set API key");

        let retrieved = realestate_lib::db::settings::get(&pool, "anthropic_api_key")
            .await
            .expect("Failed to get API key");

        assert_eq!(retrieved, api_key);
        assert!(retrieved.starts_with("sk-ant-"));
    }

    #[tokio::test]
    async fn test_settings_persistence() {
        let pool = create_test_db().await.expect("Failed to create test DB");

        // Set settings
        realestate_lib::db::settings::set(&pool, "setting1", "value1")
            .await
            .expect("Failed to set");
        realestate_lib::db::settings::set(&pool, "setting2", "value2")
            .await
            .expect("Failed to set");

        // Verify both persist
        let val1 = realestate_lib::db::settings::get(&pool, "setting1")
            .await
            .expect("Failed to get");
        let val2 = realestate_lib::db::settings::get(&pool, "setting2")
            .await
            .expect("Failed to get");

        assert_eq!(val1, "value1");
        assert_eq!(val2, "value2");
    }
}
