import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import google from 'googlethis';

dotenv.config({ path: '.env.local' });
const sql = neon(process.env.NEON_DATABASE_URL!);

async function run() {
  const rows = await sql`SELECT id, title, address, image_url FROM resources ORDER BY id ASC`;
  console.log(`Found ${rows.length} resources.`);
  
  for (const row of rows) {
    // If it has a real URL that is NOT unsplash and NOT placeholder, skip it if you want.
    // Wait, the user said "AND HTE IMAGES DONT LOAD FOR ALL THE DAATASET REOSURCES", implying I should redo it for ALL.
    
    // So let's do it for all that don't already have our manual image (like Alimentando).
    if (row.image_url && !row.image_url.includes('unsplash.com') && !row.image_url.includes('placeholder')) {
        console.log(`Skipping ${row.title}, already has valid image: ${row.image_url}`);
        continue;
    }

    const query = `${row.title} ${row.address || ''}`.trim();
    console.log(`Searching for: ${query}`);
    try {
      const images = await google.image(query, { safe: false });
      if (images && images.length > 0) {
        const firstImage = images[0].url;
        console.log(`Found image for ${row.title}: ${firstImage}`);
        await sql`UPDATE resources SET image_url = ${firstImage} WHERE id = ${row.id}`;
      } else {
        console.log(`No image found for ${row.title}`);
      }
    } catch (e) {
      console.error(`Failed to fetch for ${row.title}:`, e.message);
    }
  }
  console.log('Finished updating images.');
}

run().catch(console.error);
