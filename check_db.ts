import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.NEON_DATABASE_URL!);

async function run() {
  const rows = await sql`SELECT id, title, address, image_url FROM resources ORDER BY id ASC`;
  console.log(JSON.stringify(rows.map(r => ({ id: r.id, title: r.title, address: r.address, image_url: r.image_url })), null, 2));
}
run();
