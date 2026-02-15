use genpdf::elements::{Break, Image, Paragraph};
use genpdf::fonts;
use genpdf::style::{Color, Style};
use genpdf::{Document, Element, Mm, SimplePageDecorator};
use image::DynamicImage;

use crate::db::listings::Listing;
use crate::db::photos::Photo;
use crate::db::properties::Property;
use crate::error::AppError;

/// Generate a PDF marketing package for a property with its listings and photos
pub fn generate_pdf(
    property: &Property,
    listings: &[Listing],
    photos: &[Photo],
) -> Result<Vec<u8>, AppError> {
    // Use built-in Helvetica font (always available)
    let font_family =
        fonts::from_files("", "Helvetica", None).unwrap_or_else(|_| {
            // Fallback: use Liberation Sans if Helvetica not found
            // genpdf provides built-in fonts as fallback
            fonts::from_files("", "LiberationSans", None)
                .unwrap_or_else(|_| {
                    // Last resort: create a minimal font family
                    let font_data = genpdf::fonts::FontData::new(
                        Vec::new(), // Will fail gracefully
                        None,
                    );
                    let regular = match font_data {
                        Ok(f) => f,
                        Err(_) => return fonts::from_files("/System/Library/Fonts", "Helvetica", None)
                            .expect("Could not load any font"),
                    };
                    genpdf::fonts::FontFamily {
                        regular: regular.clone(),
                        bold: regular.clone(),
                        italic: regular.clone(),
                        bold_italic: regular,
                    }
                })
        });

    let mut doc = Document::new(font_family);
    doc.set_title("Property Marketing Package");

    let mut decorator = SimplePageDecorator::new();
    decorator.set_margins(20);
    doc.set_page_decorator(decorator);

    // Property header
    doc.push(
        Paragraph::new(format!(
            "{}, {}, {} {}",
            property.address, property.city, property.state, property.zip
        ))
        .styled(Style::new().bold().with_font_size(18)),
    );

    doc.push(Break::new(0.5));

    // Property details
    let price = format_price_dollars(property.price);
    doc.push(Paragraph::new(format!(
        "${} | {} bed / {} bath / {} sqft | {}",
        price,
        property.beds,
        property.baths,
        property.sqft,
        property.property_type.replace('_', " "),
    )));

    if let Some(ref year) = property.year_built {
        doc.push(Paragraph::new(format!("Built: {}", year)));
    }

    doc.push(Break::new(1.0));

    // Key features
    let features: Vec<String> =
        serde_json::from_str(&property.key_features).unwrap_or_default();
    if !features.is_empty() {
        doc.push(
            Paragraph::new("Key Features")
                .styled(Style::new().bold().with_font_size(14)),
        );
        doc.push(Paragraph::new(features.join(" • ")));
        doc.push(Break::new(0.5));
    }

    // Photos section
    if !photos.is_empty() {
        doc.push(Break::new(1.0));
        doc.push(
            Paragraph::new("Property Photos")
                .styled(Style::new().bold().with_font_size(14)),
        );
        doc.push(Break::new(0.5));

        // Add up to 6 photos (3x2 grid layout)
        for (i, photo) in photos.iter().take(6).enumerate() {
            match load_and_resize_image(&photo.original_path, 400) {
                Ok(image_data) => {
                    // Add the image
                    match Image::from_dynamic_image(&image_data) {
                        Ok(img) => {
                            doc.push(img.with_scale(genpdf::Scale::new(0.5, 0.5)));

                            // Add caption if available
                            if let Some(ref caption) = photo.caption {
                                if !caption.is_empty() {
                                    doc.push(
                                        Paragraph::new(caption)
                                            .styled(Style::new().with_color(Color::Rgb(100, 100, 100)).with_font_size(9)),
                                    );
                                }
                            }

                            // Add spacing between photos
                            if i < photos.len() - 1 {
                                doc.push(Break::new(0.5));
                            }
                        }
                        Err(e) => {
                            eprintln!("Failed to add image to PDF: {}", e);
                            // Continue with other photos even if one fails
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Failed to load image {}: {}", photo.original_path, e);
                    // Continue with other photos even if one fails
                }
            }
        }

        doc.push(Break::new(1.0));
    }

    // Listings
    for (i, listing) in listings.iter().enumerate() {
        doc.push(Break::new(1.0));

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

        doc.push(
            Paragraph::new(section_title)
                .styled(Style::new().bold().with_font_size(14)),
        );
        doc.push(Break::new(0.3));

        // Split content by paragraphs for better formatting
        for paragraph in listing.content.split("\n\n") {
            let trimmed = paragraph.trim();
            if !trimmed.is_empty() {
                doc.push(Paragraph::new(trimmed));
                doc.push(Break::new(0.3));
            }
        }
    }

    // Render to bytes
    let mut buf = Vec::new();
    doc.render(&mut buf)
        .map_err(|e| AppError::Export(format!("Failed to render PDF: {}", e)))?;

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

/// Load an image from disk and resize it to fit within max_width pixels
fn load_and_resize_image(path: &str, max_width: u32) -> Result<DynamicImage, AppError> {
    // Load image
    let img = image::open(path)
        .map_err(|e| AppError::Export(format!("Failed to load image {}: {}", path, e)))?;

    // Calculate new dimensions maintaining aspect ratio
    let (width, height) = img.dimensions();
    if width <= max_width {
        return Ok(img);
    }

    let scale = max_width as f32 / width as f32;
    let new_height = (height as f32 * scale) as u32;

    // Resize using Lanczos3 for high quality
    Ok(img.resize(max_width, new_height, image::imageops::FilterType::Lanczos3))
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

    #[test]
    fn test_format_price_dollars() {
        assert_eq!(format_price_dollars(95000000), "950,000");
        assert_eq!(format_price_dollars(125000000), "1,250,000");
    }
}
