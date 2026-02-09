use docx_rs::*;

use crate::db::listings::Listing;
use crate::db::properties::Property;
use crate::error::AppError;

/// Generate a DOCX document for a property with its listings
pub fn generate_docx(property: &Property, listings: &[Listing]) -> Result<Vec<u8>, AppError> {
    let mut docx = Docx::new();

    // Property header
    let address = format!(
        "{}, {}, {} {}",
        property.address, property.city, property.state, property.zip
    );
    docx = docx.add_paragraph(
        Paragraph::new()
            .add_run(Run::new().add_text(&address).bold())
            .style("Heading1"),
    );

    // Property details
    let price = format_price_dollars(property.price);
    let details = format!(
        "${} | {} bed / {} bath / {} sqft | {}",
        price,
        property.beds,
        property.baths,
        property.sqft,
        property.property_type.replace('_', " "),
    );
    docx = docx.add_paragraph(Paragraph::new().add_run(Run::new().add_text(&details)));

    if let Some(year) = property.year_built {
        docx = docx.add_paragraph(
            Paragraph::new().add_run(Run::new().add_text(&format!("Built: {}", year))),
        );
    }

    // Key features
    let features: Vec<String> =
        serde_json::from_str(&property.key_features).unwrap_or_default();
    if !features.is_empty() {
        docx = docx.add_paragraph(Paragraph::new());
        docx = docx.add_paragraph(
            Paragraph::new()
                .add_run(Run::new().add_text("Key Features").bold())
                .style("Heading2"),
        );
        docx = docx.add_paragraph(
            Paragraph::new().add_run(Run::new().add_text(&features.join(" • "))),
        );
    }

    // Listings
    for (i, listing) in listings.iter().enumerate() {
        docx = docx.add_paragraph(Paragraph::new()); // spacer

        let section_title = match listing.generation_type.as_str() {
            "listing" => format!("Listing Description {}", i + 1),
            t if t.starts_with("social_") => {
                format!("Social Media - {}", t.strip_prefix("social_").unwrap_or(t))
            }
            t if t.starts_with("email_") => {
                format!("Email - {}", t.strip_prefix("email_").unwrap_or(t))
            }
            t => t.to_string(),
        };

        docx = docx.add_paragraph(
            Paragraph::new()
                .add_run(Run::new().add_text(&section_title).bold())
                .style("Heading2"),
        );

        // Split content by paragraphs
        for paragraph in listing.content.split("\n\n") {
            let trimmed = paragraph.trim();
            if !trimmed.is_empty() {
                docx = docx
                    .add_paragraph(Paragraph::new().add_run(Run::new().add_text(trimmed)));
            }
        }
    }

    // Render to bytes
    let mut buf = Vec::new();
    docx.build()
        .pack(&mut std::io::Cursor::new(&mut buf))
        .map_err(|e| AppError::Export(format!("Failed to generate DOCX: {}", e)))?;

    Ok(buf)
}

fn format_price_dollars(cents: i64) -> String {
    let dollars = cents / 100;
    let mut s = dollars.to_string();
    let mut result = String::new();
    let chars: Vec<char> = s.drain(..).collect();
    for (i, c) in chars.iter().rev().enumerate() {
        if i > 0 && i % 3 == 0 {
            result.insert(0, ',');
        }
        result.insert(0, *c);
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_property() -> Property {
        Property {
            id: "test".to_string(),
            address: "123 Oak St".to_string(),
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
            key_features: r#"["pool","hardwood floors"]"#.to_string(),
            neighborhood: None,
            neighborhood_highlights: "[]".to_string(),
            school_district: None,
            nearby_amenities: "[]".to_string(),
            agent_notes: None,
            created_at: "2024-01-01".to_string(),
            updated_at: "2024-01-01".to_string(),
        }
    }

    fn sample_listing() -> Listing {
        Listing {
            id: "listing-1".to_string(),
            property_id: "test".to_string(),
            content: "A beautiful home in San Francisco.\n\nThis stunning property features hardwood floors and a pool.".to_string(),
            generation_type: "listing".to_string(),
            style: Some("luxury".to_string()),
            tone: Some("warm".to_string()),
            length: Some("medium".to_string()),
            seo_keywords: "[]".to_string(),
            brand_voice_id: None,
            tokens_used: 500,
            generation_cost_cents: 1,
            is_favorite: false,
            created_at: "2024-01-01".to_string(),
        }
    }

    #[test]
    fn test_generate_docx_produces_valid_zip() {
        let property = sample_property();
        let listings = vec![sample_listing()];
        let result = generate_docx(&property, &listings);
        assert!(result.is_ok());
        let bytes = result.unwrap();
        // DOCX is a ZIP file — check magic bytes
        assert!(bytes.len() > 4);
        assert_eq!(&bytes[0..2], b"PK");
    }
}
