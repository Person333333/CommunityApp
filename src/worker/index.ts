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

// Seed evenly distributed resources across US regions
// Resources are spread across states with some clustering around cities but not too much
app.post("/api/seed-distributed-us", async (c) => {
  const sql = getSQL(c.env);
  
  // Major US cities and regions with coordinates
  // Spread across different regions: Northeast, Southeast, Midwest, Southwest, West Coast
  const locations = [
    // Northeast
    { city: 'Boston', state: 'MA', lat: 42.3601, lng: -71.0589 },
    { city: 'Hartford', state: 'CT', lat: 41.7658, lng: -72.6734 },
    { city: 'Albany', state: 'NY', lat: 42.6526, lng: -73.7562 },
    { city: 'Portland', state: 'ME', lat: 43.6591, lng: -70.2568 },
    { city: 'Burlington', state: 'VT', lat: 44.4759, lng: -73.2121 },
    { city: 'Providence', state: 'RI', lat: 41.8240, lng: -71.4128 },
    
    // Mid-Atlantic
    { city: 'Philadelphia', state: 'PA', lat: 39.9526, lng: -75.1652 },
    { city: 'Pittsburgh', state: 'PA', lat: 40.4406, lng: -79.9959 },
    { city: 'Baltimore', state: 'MD', lat: 39.2904, lng: -76.6122 },
    { city: 'Richmond', state: 'VA', lat: 37.5407, lng: -77.4360 },
    { city: 'Charleston', state: 'WV', lat: 38.3498, lng: -81.6326 },
    { city: 'Wilmington', state: 'DE', lat: 39.7391, lng: -75.5398 },
    
    // Southeast
    { city: 'Atlanta', state: 'GA', lat: 33.7490, lng: -84.3880 },
    { city: 'Charlotte', state: 'NC', lat: 35.2271, lng: -80.8431 },
    { city: 'Raleigh', state: 'NC', lat: 35.7796, lng: -78.6382 },
    { city: 'Nashville', state: 'TN', lat: 36.1627, lng: -86.7816 },
    { city: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.0490 },
    { city: 'Birmingham', state: 'AL', lat: 33.5207, lng: -86.8025 },
    { city: 'Jacksonville', state: 'FL', lat: 30.3322, lng: -81.6557 },
    { city: 'Tampa', state: 'FL', lat: 27.9506, lng: -82.4572 },
    { city: 'Miami', state: 'FL', lat: 25.7617, lng: -80.1918 },
    { city: 'Orlando', state: 'FL', lat: 28.5383, lng: -81.3792 },
    { city: 'Columbia', state: 'SC', lat: 34.0007, lng: -81.0348 },
    { city: 'Savannah', state: 'GA', lat: 32.0809, lng: -81.0912 },
    { city: 'Tallahassee', state: 'FL', lat: 30.4383, lng: -84.2807 },
    
    // Midwest
    { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
    { city: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458 },
    { city: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650 },
    { city: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065 },
    { city: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581 },
    { city: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988 },
    { city: 'Cleveland', state: 'OH', lat: 41.4993, lng: -81.6944 },
    { city: 'Cincinnati', state: 'OH', lat: 39.1031, lng: -84.5120 },
    { city: 'Louisville', state: 'KY', lat: 38.2527, lng: -85.7585 },
    { city: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786 },
    { city: 'St. Louis', state: 'MO', lat: 38.6270, lng: -90.1994 },
    { city: 'Des Moines', state: 'IA', lat: 41.5868, lng: -93.6250 },
    { city: 'Omaha', state: 'NE', lat: 41.2565, lng: -95.9345 },
    { city: 'Madison', state: 'WI', lat: 43.0731, lng: -89.4012 },
    { city: 'Grand Rapids', state: 'MI', lat: 42.9634, lng: -85.6681 },
    
    // Southwest
    { city: 'Dallas', state: 'TX', lat: 32.7767, lng: -96.7970 },
    { city: 'Houston', state: 'TX', lat: 29.7604, lng: -95.3698 },
    { city: 'Austin', state: 'TX', lat: 30.2672, lng: -97.7431 },
    { city: 'San Antonio', state: 'TX', lat: 29.4241, lng: -98.4936 },
    { city: 'El Paso', state: 'TX', lat: 31.7619, lng: -106.4850 },
    { city: 'Fort Worth', state: 'TX', lat: 32.7555, lng: -97.3308 },
    { city: 'Phoenix', state: 'AZ', lat: 33.4484, lng: -112.0740 },
    { city: 'Tucson', state: 'AZ', lat: 32.2226, lng: -110.9747 },
    { city: 'Albuquerque', state: 'NM', lat: 35.0844, lng: -106.6504 },
    { city: 'Las Vegas', state: 'NV', lat: 36.1699, lng: -115.1398 },
    { city: 'Oklahoma City', state: 'OK', lat: 35.4676, lng: -97.5164 },
    { city: 'Tulsa', state: 'OK', lat: 36.1540, lng: -95.9928 },
    
    // West Coast
    { city: 'Los Angeles', state: 'CA', lat: 34.0522, lng: -118.2437 },
    { city: 'San Diego', state: 'CA', lat: 32.7157, lng: -117.1611 },
    { city: 'San Francisco', state: 'CA', lat: 37.7749, lng: -122.4194 },
    { city: 'San Jose', state: 'CA', lat: 37.3382, lng: -121.8863 },
    { city: 'Sacramento', state: 'CA', lat: 38.5816, lng: -121.4944 },
    { city: 'Fresno', state: 'CA', lat: 36.7378, lng: -119.7871 },
    { city: 'Oakland', state: 'CA', lat: 37.8044, lng: -122.2712 },
    { city: 'Seattle', state: 'WA', lat: 47.6062, lng: -122.3321 },
    { city: 'Portland', state: 'OR', lat: 45.5152, lng: -122.6784 },
    { city: 'Spokane', state: 'WA', lat: 47.6588, lng: -117.4260 },
    { city: 'Eugene', state: 'OR', lat: 44.0521, lng: -123.0868 },
    { city: 'Boise', state: 'ID', lat: 43.6150, lng: -116.2023 },
    { city: 'Salt Lake City', state: 'UT', lat: 40.7608, lng: -111.8910 },
    { city: 'Denver', state: 'CO', lat: 39.7392, lng: -104.9903 },
    { city: 'Colorado Springs', state: 'CO', lat: 38.8339, lng: -104.8214 },
  ];
  
  const categories = [
    'Healthcare', 'Food Assistance', 'Housing', 'Legal Aid', 'Employment',
    'Senior Services', 'Mental Health', 'Education', 'Transportation', 'Child Care',
  ];
  
  // Resource title prefixes for variety
  const titlePrefixes = [
    'Community', 'Hope', 'United', 'Helping Hands', 'Neighborhood', 
    'Family', 'Regional', 'Gateway', 'Sunrise', 'Pathway'
  ];
  
  // Helper function to get category-specific defaults
  function getCategoryDefaults(category: string, location: { city: string; state: string }) {
    const cat = category.toLowerCase();
    const areaCode = location.state === 'CA' ? '415' : location.state === 'NY' ? '212' : location.state === 'TX' ? '214' : '206';
    const phone = `(${areaCode}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
    const email = `info@${titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)].toLowerCase().replace(/\s+/g, '')}${location.city.toLowerCase().replace(/\s+/g, '')}.org`;
    const website = `https://www.${titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)].toLowerCase().replace(/\s+/g, '')}${location.city.toLowerCase().replace(/\s+/g, '')}.org`;
    
    if (cat.includes('health') || cat.includes('healthcare')) {
      return {
        services: 'Primary care, Vaccinations, Screenings, Health education',
        tags: 'walk-in,free care,uninsured,clinic,health services',
        hours: 'Monday-Friday 9AM-5PM, Saturday 10AM-2PM',
        audience: 'Adults,Children,Uninsured,All ages',
        description: `Comprehensive healthcare services including primary care, vaccinations, and health screenings for the ${location.city} community.`,
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=1200&auto=format&fit=crop',
      };
    }
    if (cat.includes('food')) {
      return {
        services: 'Hot meals, Food pantry, Nutrition education, Grocery assistance',
        tags: 'free meals,food pantry,groceries,emergency food,nutrition',
        hours: 'Monday-Friday 11:30AM-1:30PM, Saturday 4:00PM-6:00PM',
        audience: 'All ages,Families,Individuals,Seniors',
        description: `Free meals served daily to anyone in need. No questions asked, just come hungry and leave fed. We also provide grocery bags for families.`,
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
      };
    }
    if (cat.includes('housing')) {
      return {
        services: 'Shelter referrals, Rental assistance, Case management, Housing counseling',
        tags: 'shelter,rent,emergency housing,case management,housing assistance',
        hours: 'Monday-Friday 9AM-5PM',
        audience: 'Adults,Families,Unhoused,Low-income',
        description: `Housing support services including shelter referrals, rental assistance, and case management for individuals and families in ${location.city}.`,
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop',
      };
    }
    if (cat.includes('legal')) {
      return {
        services: 'Legal consultation, Document assistance, Court representation, Legal education',
        tags: 'legal aid,consultation,lawyer,legal services,pro bono',
        hours: 'Monday-Friday 9AM-5PM, By appointment',
        audience: 'Adults,Low-income,Immigrants,General public',
        description: `Free and low-cost legal services for those who cannot afford an attorney. We provide consultations, document preparation, and court representation.`,
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop',
      };
    }
    if (cat.includes('employment')) {
      return {
        services: 'Job placement, Resume assistance, Career counseling, Skills training',
        tags: 'jobs,employment,career,counseling,training',
        hours: 'Monday-Friday 9AM-5PM',
        audience: 'Adults,Job seekers,Unemployed,All ages',
        description: `Employment services including job placement, resume assistance, and career counseling to help you find meaningful work in ${location.city}.`,
        image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
      };
    }
    if (cat.includes('senior')) {
      return {
        services: 'Social activities, Health programs, Transportation, Meal delivery',
        tags: 'seniors,elderly,activities,health,transportation',
        hours: 'Monday-Friday 8AM-4PM',
        audience: 'Seniors,Elderly,Adults 55+',
        description: `Comprehensive services for seniors including social activities, health programs, transportation assistance, and meal delivery.`,
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1200&auto=format&fit=crop',
      };
    }
    if (cat.includes('mental')) {
      return {
        services: 'Counseling, Support groups, Crisis intervention, Mental health education',
        tags: 'mental health,counseling,therapy,support,crisis',
        hours: 'Monday-Friday 9AM-6PM, 24/7 Crisis line',
        audience: 'Adults,Youth,Children,Families',
        description: `Mental health services including counseling, support groups, and crisis intervention for individuals and families in ${location.city}.`,
        image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1200&auto=format&fit=crop',
      };
    }
    if (cat.includes('education')) {
      return {
        services: 'Tutoring, GED preparation, ESL classes, Computer training',
        tags: 'education,learning,tutoring,classes,training',
        hours: 'Monday-Friday 3PM-7PM, Saturday 10AM-2PM',
        audience: 'Students,Adults,Youth,All ages',
        description: `Educational programs and services including tutoring, GED preparation, ESL classes, and computer training for the ${location.city} community.`,
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200&auto=format&fit=crop',
      };
    }
    if (cat.includes('transport')) {
      return {
        services: 'Ride assistance, Public transit help, Transportation vouchers, Vehicle repair',
        tags: 'transportation,rides,transit,vouchers,travel',
        hours: 'Monday-Friday 8AM-5PM',
        audience: 'Adults,Seniors,Low-income,General public',
        description: `Transportation assistance services including ride coordination, public transit help, and transportation vouchers for those in need.`,
        image: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?q=80&w=1200&auto=format&fit=crop',
      };
    }
    if (cat.includes('child')) {
      return {
        services: 'Child care, After-school programs, Early childhood education, Parenting support',
        tags: 'childcare,children,daycare,after-school,parenting',
        hours: 'Monday-Friday 7AM-6PM',
        audience: 'Children,Families,Parents',
        description: `Quality child care and early childhood education services for families in ${location.city}. We provide safe, nurturing environments for children.`,
        image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1200&auto=format&fit=crop',
      };
    }
    // Default
    return {
      services: 'Consultation, Referrals, Support, Community programs',
      tags: 'community,local,assistance,services,support',
      hours: 'Monday-Friday 9AM-5PM',
      audience: 'All ages,General public',
      description: `${titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)]} ${category} Center provides essential community support services to the ${location.city} area.`,
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    };
  }
  
  const resources: any[] = [];
  
  // Create 2-4 resources per location with slight variations
  // This gives us ~150-200 resources spread across US
  locations.forEach((location, locIndex) => {
    const resourcesPerLocation = 2 + (locIndex % 3); // 2, 3, or 4 resources per location
    
    for (let i = 0; i < resourcesPerLocation; i++) {
      const category = categories[(locIndex * resourcesPerLocation + i) % categories.length];
      const prefix = titlePrefixes[(locIndex * resourcesPerLocation + i) % titlePrefixes.length];
      
      // Add some jitter to coordinates (0.1-0.3 degrees, roughly 10-30km)
      // This creates clustering around cities but not too tight
      const jitterLat = (Math.random() - 0.5) * 0.25;
      const jitterLng = (Math.random() - 0.5) * 0.25;
      
      // Occasionally add resources further out (20% chance)
      const isOutlier = Math.random() < 0.2;
      const outlierMultiplier = isOutlier ? 2.5 : 1;
      
      const lat = location.lat + (jitterLat * outlierMultiplier);
      const lng = location.lng + (jitterLng * outlierMultiplier);
      
      // Generate realistic address
      const streetNumbers = ['123', '456', '789', '234', '567', '890', '100', '200', '300'];
      const streetNames = ['Main St', 'Oak Ave', 'Elm St', 'Park Blvd', 'First St', 'Second Ave', 'Washington St', 'Broadway'];
      const streetNum = streetNumbers[(locIndex * resourcesPerLocation + i) % streetNumbers.length];
      const streetName = streetNames[(locIndex * resourcesPerLocation + i) % streetNames.length];
      const zip = `${Math.floor(Math.random() * 90000) + 10000}`;
      const address = `${streetNum} ${streetName}, ${location.city}, ${location.state} ${zip}`;
      
      const title = `${prefix} ${category} Center - ${location.city}`;
      const defaults = getCategoryDefaults(category, location);
      const areaCode = location.state === 'CA' ? '415' : location.state === 'NY' ? '212' : location.state === 'TX' ? '214' : '206';
      const phone = `(${areaCode}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
      const email = `info@${prefix.toLowerCase().replace(/\s+/g, '')}${location.city.toLowerCase().replace(/\s+/g, '')}.org`;
      const website = `https://www.${prefix.toLowerCase().replace(/\s+/g, '')}${location.city.toLowerCase().replace(/\s+/g, '')}.org`;
      
      resources.push({
        title,
        description: defaults.description,
        category,
        address,
        city: location.city,
        state: location.state,
        zip,
        phone,
        email,
        website,
        hours: defaults.hours,
        audience: defaults.audience,
        services: defaults.services,
        tags: defaults.tags,
        image_url: defaults.image,
        lat,
        lng,
      });
    }
  });
  
  // Insert resources
  for (const resource of resources) {
    await sql`
      INSERT INTO resources (
        title, description, category, address, city, state, zip, phone, email, website, tags, hours, audience, services, image_url, latitude, longitude, is_featured, is_approved
      ) VALUES (
        ${resource.title}, 
        ${resource.description}, 
        ${resource.category}, 
        ${resource.address}, 
        ${resource.city}, 
        ${resource.state},
        ${resource.zip},
        ${resource.phone},
        ${resource.email},
        ${resource.website},
        ${resource.tags},
        ${resource.hours},
        ${resource.audience},
        ${resource.services},
        ${resource.image_url},
        ${resource.lat}, 
        ${resource.lng}, 
        ${false}, 
        ${true}
      )
      ON CONFLICT DO NOTHING
    `;
  }
  
  return c.json({ success: true, inserted: resources.length, locations: locations.length });
});

export default app;
