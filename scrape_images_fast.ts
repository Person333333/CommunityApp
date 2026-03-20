import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import google from 'googlethis';

dotenv.config({ path: '.env.local' });
const sql = neon(process.env.NEON_DATABASE_URL!);

async function run() {
  const rows = await sql`SELECT id, title, address, image_url FROM resources ORDER BY id ASC`;
  console.log(`Found ${rows.length} resources.`);
  
  const toUpdate = rows.filter(r => !(r.image_url && !r.image_url.includes('unsplash.com') && !r.image_url.includes('placeholder')));
  console.log(`Need to update ${toUpdate.length} resources.`);

  const chunkSize = 20; // 20 concurrent requests
  let processed = 0;

  for (let i = 0; i < toUpdate.length; i += chunkSize) {
    const chunk = toUpdate.slice(i, i + chunkSize);
    
    await Promise.all(chunk.map(async (row) => {
      const query = `${row.title} ${row.address || ''}`.trim();
      try {
        const images = await google.image(query, { safe: false });
        if (images && images.length > 0) {
          const firstImage = images[0].url;
          await sql`UPDATE resources SET image_url = ${firstImage} WHERE id = ${row.id}`;
        }
      } catch (e) {
        // silently fail to not clutter output, or log minimal
      }
    }));
    processed += chunk.length;
    console.log(`Processed ${processed}/${toUpdate.length}`);
  }
  
  console.log('Finished updating images.');
}

run().catch(console.error);
