import { neon } from "@neondatabase/serverless";
import "./types";

export async function migrateToNeon(env: Env) {
  const sql = neon(env.NEON_DATABASE_URL);
  
  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS resources (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      hours TEXT,
      audience TEXT,
      services TEXT,
      image_url TEXT,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      is_featured BOOLEAN DEFAULT false,
      is_approved BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Add columns if missing (idempotent)
  await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION`;
  await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION`;

  await sql`
    CREATE TABLE IF NOT EXISTS resource_submissions (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      phone TEXT,
      website TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Favorites table
  await sql`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, resource_id)
    )
  `;

  // Optional auto-seed: if resources count is low, insert sample global resources
  const [{ count }]: any = await sql`SELECT COUNT(*)::int AS count FROM resources`;
  if (count < 100) {
    const samples = [
      { title: 'NYC Community Health', city: 'New York', state: 'NY', country: 'USA', category: 'Healthcare', lat: 40.7128, lng: -74.0060 },
      { title: 'London Food Bank', city: 'London', state: '', country: 'UK', category: 'Food Assistance', lat: 51.5072, lng: -0.1276 },
      { title: 'Tokyo Housing Support', city: 'Tokyo', state: '', country: 'Japan', category: 'Housing', lat: 35.6762, lng: 139.6503 },
      { title: 'Sydney Legal Aid', city: 'Sydney', state: 'NSW', country: 'Australia', category: 'Legal Aid', lat: -33.8688, lng: 151.2093 },
      { title: 'Toronto Employment Center', city: 'Toronto', state: 'ON', country: 'Canada', category: 'Employment', lat: 43.6532, lng: -79.3832 },
      { title: 'Berlin Senior Services', city: 'Berlin', state: '', country: 'Germany', category: 'Senior Services', lat: 52.52, lng: 13.405 },
      { title: 'Paris Mental Health Hub', city: 'Paris', state: '', country: 'France', category: 'Mental Health', lat: 48.8566, lng: 2.3522 },
      { title: 'Mumbai Education Access', city: 'Mumbai', state: 'MH', country: 'India', category: 'Education', lat: 19.076, lng: 72.8777 },
      { title: 'Nairobi Child Care Center', city: 'Nairobi', state: '', country: 'Kenya', category: 'Child Care', lat: -1.286389, lng: 36.817223 },
      { title: 'Sao Paulo Transport Help', city: 'São Paulo', state: 'SP', country: 'Brazil', category: 'Transportation', lat: -23.5558, lng: -46.6396 },
    ];
    const generated: any[] = [];
    for (let i = 0; i < 12; i++) {
      for (const s of samples) {
        generated.push({
          ...s,
          lat: s.lat + (Math.random() - 0.5) * 0.5,
          lng: s.lng + (Math.random() - 0.5) * 0.5,
        });
      }
    }
    for (const g of generated) {
      await sql`
        INSERT INTO resources (
          title, description, category, address, city, state, tags, website, hours, audience, services, image_url, latitude, longitude, is_featured, is_approved
        ) VALUES (
          ${g.title}, ${g.title} || ' description', ${g.category}, ${g.city || ''} || ', ' || ${g.country || ''}, ${g.city}, ${g.state || null},
          ${null}, ${null}, ${null}, ${null}, ${null}, ${null}, ${g.lat}, ${g.lng}, ${false}, ${true}
        )
      `;
    }
  }

  return {
    success: true,
    message: "Tables created successfully"
  };
}
