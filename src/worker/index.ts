import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ResourceSubmissionSchema } from "../shared/types";
import { neon } from "@neondatabase/serverless";
import { migrateToNeon } from "./migrate";
import "./types";
import { HonoRequest } from "hono";

const app = new Hono<{ Bindings: Env }>();

// Initialize Neon connection
const getSQL = (env: Env) => neon(env.NEON_DATABASE_URL);

// Ensure favorites table exists (idempotent)
async function ensureFavoritesTable(sql: ReturnType<typeof neon>) {
  await sql`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, resource_id)
    )
  `;
}

// Get all resources with optional filtering
app.get("/api/resources", async (c) => {
  const sql = getSQL(c.env);
  const { q, category, featured } = c.req.query();
  
  let result;
  
  if (q && category && featured === "true") {
    const searchTerm = `%${q}%`;
    result = await sql`
      SELECT * FROM resources 
      WHERE is_approved = true 
        AND category = ${category}
        AND is_featured = true
        AND (title ILIKE ${searchTerm} OR description ILIKE ${searchTerm} OR tags ILIKE ${searchTerm})
      ORDER BY is_featured DESC, created_at DESC
    `;
  } else if (q && category) {
    const searchTerm = `%${q}%`;
    result = await sql`
      SELECT * FROM resources 
      WHERE is_approved = true 
        AND category = ${category}
        AND (title ILIKE ${searchTerm} OR description ILIKE ${searchTerm} OR tags ILIKE ${searchTerm})
      ORDER BY is_featured DESC, created_at DESC
    `;
  } else if (q && featured === "true") {
    const searchTerm = `%${q}%`;
    result = await sql`
      SELECT * FROM resources 
      WHERE is_approved = true 
        AND is_featured = true
        AND (title ILIKE ${searchTerm} OR description ILIKE ${searchTerm} OR tags ILIKE ${searchTerm})
      ORDER BY is_featured DESC, created_at DESC
    `;
  } else if (category && featured === "true") {
    result = await sql`
      SELECT * FROM resources 
      WHERE is_approved = true 
        AND category = ${category}
        AND is_featured = true
      ORDER BY is_featured DESC, created_at DESC
    `;
  } else if (q) {
    const searchTerm = `%${q}%`;
    result = await sql`
      SELECT * FROM resources 
      WHERE is_approved = true 
        AND (title ILIKE ${searchTerm} OR description ILIKE ${searchTerm} OR tags ILIKE ${searchTerm})
      ORDER BY is_featured DESC, created_at DESC
    `;
  } else if (category) {
    result = await sql`
      SELECT * FROM resources 
      WHERE is_approved = true 
        AND category = ${category}
      ORDER BY is_featured DESC, created_at DESC
    `;
  } else if (featured === "true") {
    result = await sql`
      SELECT * FROM resources 
      WHERE is_approved = true 
        AND is_featured = true
      ORDER BY is_featured DESC, created_at DESC
    `;
  } else {
    result = await sql`
      SELECT * FROM resources 
      WHERE is_approved = true
      ORDER BY is_featured DESC, created_at DESC
    `;
  }
  
  // Attach computed coordinates if missing (basic city-based lookup + jitter)
  const cityToCoords: Record<string, [number, number]> = {
    'New York': [40.7128, -74.0060],
    'London': [51.5072, -0.1276],
    'Tokyo': [35.6762, 139.6503],
    'Sydney': [-33.8688, 151.2093],
    'Toronto': [43.6532, -79.3832],
    'Berlin': [52.52, 13.405],
    'Paris': [48.8566, 2.3522],
    'Mumbai': [19.076, 72.8777],
    'Nairobi': [-1.286389, 36.817223],
    'São Paulo': [-23.5558, -46.6396],
    'San Francisco': [37.7749, -122.4194],
    'Seattle': [47.6062, -122.3321],
    'Chicago': [41.8781, -87.6298],
    'Los Angeles': [34.0522, -118.2437],
  };
  const safe = (result as any[]).map(r => {
    if (r.latitude == null || r.longitude == null) {
      const base = (r.city && cityToCoords[r.city]) || (r.state && cityToCoords[r.state]) || [40.7128, -74.0060];
      // deterministic jitter from title length (slightly increased for diversity)
      const jitterA = ((r.title?.length || 1) % 10 - 5) * 0.01;
      const jitterB = ((r.description?.length || 1) % 10 - 5) * 0.01;
      r.latitude = base[0] + jitterA;
      r.longitude = base[1] + jitterB;
    }
    return r;
  });
  return c.json(safe);
});

// Get single resource
app.get("/api/resources/:id", async (c) => {
  const sql = getSQL(c.env);
  const id = parseInt(c.req.param("id"));
  
  const result = await sql`
    SELECT * FROM resources WHERE id = ${id} AND is_approved = true
  `;
  
  if (!result || result.length === 0) {
    return c.json({ error: "Resource not found" }, 404);
  }
  
  return c.json(result[0]);
});

// Submit a new resource
app.post("/api/submissions", zValidator("json", ResourceSubmissionSchema), async (c) => {
  const sql = getSQL(c.env);
  const data = c.req.valid("json");
  
  const result = await sql`
    INSERT INTO resource_submissions (
      title, description, category, contact_name, contact_email,
      phone, website, address, city, state, status, submitted_at
    ) VALUES (
      ${data.title}, ${data.description}, ${data.category}, 
      ${data.contact_name}, ${data.contact_email}, 
      ${data.phone || null}, ${data.website || null}, 
      ${data.address || null}, ${data.city || null}, ${data.state || null}, 
      'pending', NOW()
    )
    RETURNING id
  `;
  
  return c.json({ 
    success: true, 
    message: "Thank you! Your submission has been received and will be reviewed shortly.",
    id: result[0].id 
  });
});

// Get categories and stats
app.get("/api/stats", async (c) => {
  const sql = getSQL(c.env);
  
  const resourceCount = await sql`
    SELECT COUNT(*) as count FROM resources WHERE is_approved = true
  `;
  
  const categoryCount = await sql`
    SELECT category, COUNT(*) as count FROM resources WHERE is_approved = true GROUP BY category
  `;
  
  const submissionCount = await sql`
    SELECT COUNT(*) as count FROM resource_submissions WHERE status = 'pending'
  `;
  
  return c.json({
    totalResources: parseInt(resourceCount[0].count),
    categories: categoryCount,
    pendingSubmissions: parseInt(submissionCount[0].count),
  });
});

// Migration endpoint (remove after running once)
app.post("/api/migrate", async (c) => {
  try {
    const result = await migrateToNeon(c.env);
    return c.json(result);
  } catch (error) {
    console.error("Migration error:", error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Favorites APIs
app.get("/api/favorites", async (c) => {
  const sql = getSQL(c.env);
  const { userId } = c.req.query();
  if (!userId) return c.json({ error: "userId is required" }, 400);
  await ensureFavoritesTable(sql);
  const rows = await sql`
    SELECT resource_id FROM favorites WHERE user_id = ${userId}
  `;
  return c.json(rows.map((r: any) => r.resource_id));
});

app.post("/api/favorites", async (c) => {
  const sql = getSQL(c.env);
  const body = await c.req.json();
  const { userId, resourceId } = body || {};
  if (!userId || !resourceId) return c.json({ error: "userId and resourceId are required" }, 400);
  await ensureFavoritesTable(sql);
  await sql`
    INSERT INTO favorites (user_id, resource_id) VALUES (${userId}, ${resourceId})
    ON CONFLICT (user_id, resource_id) DO NOTHING
  `;
  return c.json({ success: true });
});

app.delete("/api/favorites/:resourceId", async (c) => {
  const sql = getSQL(c.env);
  const resourceId = parseInt(c.req.param("resourceId"));
  const { userId } = c.req.query();
  if (!userId) return c.json({ error: "userId is required" }, 400);
  await ensureFavoritesTable(sql);
  await sql`
    DELETE FROM favorites WHERE user_id = ${userId} AND resource_id = ${resourceId}
  `;
  return c.json({ success: true });
});

// Seed endpoint to add sample resources with coordinates (run once)
app.post("/api/seed", async (c) => {
  const sql = getSQL(c.env);
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
    { title: 'Los Angeles Legal Aid', city: 'Los Angeles', state: 'CA', country: 'USA', category: 'Legal Aid', lat: 34.0522, lng: -118.2437 },
    { title: 'San Francisco Housing Support', city: 'San Francisco', state: 'CA', country: 'USA', category: 'Housing', lat: 37.7749, lng: -122.4194 },
    { title: 'Chicago Food Assistance', city: 'Chicago', state: 'IL', country: 'USA', category: 'Food Assistance', lat: 41.8781, lng: -87.6298 },
    { title: 'Mexico City Health Clinic', city: 'Mexico City', state: '', country: 'Mexico', category: 'Healthcare', lat: 19.4326, lng: -99.1332 },
    { title: 'Barcelona Education Access', city: 'Barcelona', state: '', country: 'Spain', category: 'Education', lat: 41.3874, lng: 2.1686 },
    { title: 'Johannesburg Employment Center', city: 'Johannesburg', state: '', country: 'South Africa', category: 'Employment', lat: -26.2041, lng: 28.0473 },
    { title: 'Seoul Senior Services', city: 'Seoul', state: '', country: 'South Korea', category: 'Senior Services', lat: 37.5665, lng: 126.9780 },
    { title: 'Singapore Transport Help', city: 'Singapore', state: '', country: 'Singapore', category: 'Transportation', lat: 1.3521, lng: 103.8198 },
    { title: 'Rome Mental Health Hub', city: 'Rome', state: '', country: 'Italy', category: 'Mental Health', lat: 41.9028, lng: 12.4964 },
    { title: 'Istanbul Child Care Center', city: 'Istanbul', state: '', country: 'Turkey', category: 'Child Care', lat: 41.0082, lng: 28.9784 },
  ];
  // Replicate to ~60 rows by jittering locations
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
        ${g.title}, ${g.title} description, ${g.category}, ${g.city + ', ' + g.country}, ${g.city}, ${g.state || null},
        ${null}, ${null}, ${null}, ${null}, ${null}, ${null}, ${g.lat}, ${g.lng}, ${false}, ${true}
      )
      ON CONFLICT DO NOTHING
    `;
  }
  return c.json({ success: true, inserted: generated.length });
});

// Seed exactly 100 additional resources with varied titles/coords
app.post("/api/seed-100", async (c) => {
  const sql = getSQL(c.env);
  const base = [
    { city: 'New York', state: 'NY', country: 'USA', lat: 40.7128, lng: -74.0060 },
    { city: 'London', state: '', country: 'UK', lat: 51.5072, lng: -0.1276 },
    { city: 'Tokyo', state: '', country: 'Japan', lat: 35.6762, lng: 139.6503 },
    { city: 'Sydney', state: 'NSW', country: 'Australia', lat: -33.8688, lng: 151.2093 },
    { city: 'Toronto', state: 'ON', country: 'Canada', lat: 43.6532, lng: -79.3832 },
    { city: 'Berlin', state: '', country: 'Germany', lat: 52.52, lng: 13.405 },
    { city: 'Paris', state: '', country: 'France', lat: 48.8566, lng: 2.3522 },
    { city: 'Mumbai', state: 'MH', country: 'India', lat: 19.076, lng: 72.8777 },
    { city: 'Nairobi', state: '', country: 'Kenya', lat: -1.286389, lng: 36.817223 },
    { city: 'São Paulo', state: 'SP', country: 'Brazil', lat: -23.5558, lng: -46.6396 },
  ];
  const categories = [
    'Healthcare', 'Food Assistance', 'Housing', 'Legal Aid', 'Employment',
    'Senior Services', 'Mental Health', 'Education', 'Transportation', 'Child Care',
  ];
  const rows: any[] = [];
  for (let i = 0; i < 100; i++) {
    const seed = base[i % base.length];
    const category = categories[i % categories.length];
    const title = `${seed.city} ${category} Resource`;
    const lat = seed.lat + (Math.random() - 0.5) * 0.25;
    const lng = seed.lng + (Math.random() - 0.5) * 0.25;
    rows.push({ title, category, seed, lat, lng });
  }
  for (const r of rows) {
    await sql`
      INSERT INTO resources (
        title, description, category, address, city, state, tags, website, hours, audience, services, image_url, latitude, longitude, is_featured, is_approved
      ) VALUES (
        ${r.title}, ${r.title} || ' description', ${r.category}, ${r.seed.city || ''} || ', ' || ${r.seed.country || ''}, ${r.seed.city}, ${r.seed.state || null},
        ${null}, ${null}, ${null}, ${null}, ${null}, ${null}, ${r.lat}, ${r.lng}, ${false}, ${true}
      )
    `;
  }
  return c.json({ success: true, inserted: rows.length });
});

// Normalize resources: ensure all have image_url, services, tags, description, address,
// phone, website, hours, audience. Then delete any remaining incomplete rows.
app.post("/api/normalize-resources", async (c) => {
  const sql = getSQL(c.env);
  const rows = await sql`
    SELECT id, title, description, category, address, city, state, phone, email, website, hours, audience, services, image_url, tags
    FROM resources
  `;

  function defaultByCategory(category?: string | null) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('health')) {
      return {
        services: 'Primary care, Vaccinations, Screenings',
        tags: 'walk-in,free care,uninsured,clinic',
        hours: 'Tue-Thu 10AM-6PM',
        audience: 'Adults,Children,Uninsured',
      };
    }
    if (cat.includes('food')) {
      return {
        services: 'Hot meals, Food pantry, Nutrition education',
        tags: 'free meals,food pantry,groceries,emergency food',
        hours: 'Mon-Fri 11:30AM-1:30PM, Sat 4:00PM-6:00PM',
        audience: 'All ages,Families,Individuals',
      };
    }
    if (cat.includes('housing')) {
      return {
        services: 'Shelter referrals, Rental assistance, Case management',
        tags: 'shelter,rent,emergency housing,case management',
        hours: 'Mon-Fri 9AM-5PM',
        audience: 'Adults,Families,Unhoused',
      };
    }
    return {
      services: 'Consultation, Referrals, Support',
      tags: 'community,local,assistance,services',
      hours: 'Mon-Fri 9AM-5PM',
      audience: 'All ages,General public',
    };
  }

  for (const r of rows as any[]) {
    const defs = defaultByCategory(r.category);
    const description = r.description || `${r.title} provides community support services.`;
    const address = r.address || `${r.city || '123 Main Street'}, ${r.state || 'WA'}`;
    const phone = r.phone || '(206) 555-0100';
    const website = r.website || 'https://example.org';
    const hours = r.hours || defs.hours;
    const audience = r.audience || defs.audience;
    const services = r.services || defs.services;
    const image_url = r.image_url || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop';
    const tags = r.tags || defs.tags;

    await sql`
      UPDATE resources
      SET description = ${description},
          address = ${address},
          phone = ${phone},
          website = ${website},
          hours = ${hours},
          audience = ${audience},
          services = ${services},
          image_url = ${image_url},
          tags = ${tags}
      WHERE id = ${r.id}
    `;
  }

  const del = await sql`
    DELETE FROM resources
    WHERE description IS NULL OR address IS NULL OR phone IS NULL OR website IS NULL OR hours IS NULL OR audience IS NULL OR services IS NULL OR image_url IS NULL OR tags IS NULL
    RETURNING id
  `;

  return c.json({ success: true, normalized: (rows as any[]).length, deleted: del.length });
});

// Cleanup titles: strip any trailing #TIMESTAMP-N pattern from earlier seeds
app.post("/api/cleanup-seed-titles", async (c) => {
  const sql = getSQL(c.env);
  const rows = await sql`SELECT id, title FROM resources`;
  let updated = 0;
  for (const r of rows as any[]) {
    const cleaned = r.title?.replace(/\s*#\d{10,}-\d+$/, '');
    if (cleaned && cleaned !== r.title) {
      await sql`UPDATE resources SET title = ${cleaned} WHERE id = ${r.id}`;
      updated++;
    }
  }
  return c.json({ success: true, updated });
});

export default app;
