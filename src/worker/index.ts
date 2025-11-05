import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ResourceSubmissionSchema } from "@/shared/types";
import { neon } from "@neondatabase/serverless";
import { migrateToNeon } from "./migrate";
import "./types";
import { HonoRequest } from "hono";

const app = new Hono<{ Bindings: Env }>();

// Initialize Neon connection
const getSQL = (env: Env) => neon(env.NEON_DATABASE_URL);

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
      // deterministic jitter from title length
      const jitterA = ((r.title?.length || 1) % 10 - 5) * 0.005;
      const jitterB = ((r.description?.length || 1) % 10 - 5) * 0.005;
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
  ];
  // Replicate to ~60 rows by jittering locations
  const generated: any[] = [];
  for (let i = 0; i < 10; i++) {
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

export default app;
