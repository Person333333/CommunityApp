import { Client } from 'pg';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * CSV Import Script for Neon DB
 * 
 * Usage:
 * 1. Create a CSV file (e.g., resources_import.csv) in the project root.
 * 2. Ensure your .env has DATABASE_URL.
 * 3. Run: npx ts-node scripts/import-csv.ts resources_import.csv
 */

async function importCsv() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Please provide a path to a CSV file.');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        console.log(`Found ${records.length} records in CSV.`);

        for (const record of records) {
            const {
                name,
                category,
                description,
                address,
                city,
                state,
                zip,
                phone,
                website,
                latitude,
                longitude,
                tags
            } = record;

            // Basic validation
            if (!name || !category) {
                console.warn(`Skipping record: ${name || 'Unknown'} - Missing name or category.`);
                continue;
            }

            const query = `
        INSERT INTO resources (
          name, category, description, address, city, state, zip, 
          phone, website, latitude, longitude, tags, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (name) DO UPDATE SET
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          address = EXCLUDED.address,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          zip = EXCLUDED.zip,
          phone = EXCLUDED.phone,
          website = EXCLUDED.website,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          tags = EXCLUDED.tags,
          status = EXCLUDED.status
      `;

            const values = [
                name,
                category,
                description || '',
                address || '',
                city || '',
                state || '',
                zip || '',
                phone || '',
                website || '',
                latitude ? parseFloat(latitude) : null,
                longitude ? parseFloat(longitude) : null,
                tags ? tags.split(',').map((t: string) => t.trim()) : [],
                'approved'
            ];

            await client.query(query, values);
            console.log(`Imported/Updated: ${name}`);
        }

        console.log('Import completed successfully.');
    } catch (err) {
        console.error('Error during import:', err);
    } finally {
        await client.end();
    }
}

importCsv();
