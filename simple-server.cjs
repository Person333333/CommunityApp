const express = require('express');
const { neon } = require('@neondatabase/serverless');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Neon connection
const getSQL = () => neon(process.env.NEON_DATABASE_URL);

// Test database endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const sql = getSQL();
    
    // Check if resources table exists and has data
    const result = await sql`
      SELECT COUNT(*) as count FROM resources
    `;
    
    const count = result[0]?.count || 0;
    
    // If no resources, let's add some sample data
    if (count === 0) {
      await sql`
        INSERT INTO resources (title, description, category, address, city, state, zip, phone, email, website, hours, audience, services, tags, latitude, longitude, is_approved, is_featured) VALUES
        ('Community Food Bank', 'Provides free groceries and meals to families in need', 'Food Assistance', '123 Main St', 'San Francisco', 'CA', '94102', '(415) 555-0123', 'info@foodbank.org', 'https://foodbank.org', 'Mon-Fri 9AM-5PM', 'Low-income families', 'Grocery distribution, Hot meals', 'food,meals,grocery', 37.7749, -122.4194, true, true),
        ('Health Clinic', 'Free medical services for uninsured residents', 'Healthcare', '456 Oak Ave', 'San Francisco', 'CA', '94103', '(415) 555-0456', 'clinic@health.org', 'https://healthclinic.org', 'Mon-Sat 8AM-6PM', 'Uninsured residents', 'Primary care, Vaccinations', 'health,medical,clinic', 37.7849, -122.4094, true, false),
        ('Job Center', 'Employment services and job placement assistance', 'Employment', '789 Pine St', 'San Francisco', 'CA', '94104', '(415) 555-0789', 'jobs@employment.org', 'https://jobcenter.org', 'Mon-Fri 9AM-5PM', 'Job seekers', 'Resume help, Job placement', 'jobs,employment,career', 37.7649, -122.4294, true, false)
      `;
    }
    
    // Get all resources
    const resources = await sql`
      SELECT * FROM resources WHERE is_approved = true ORDER BY created_at DESC
    `;
    
    res.json({ 
      message: 'Database initialized', 
      resourceCount: resources.length,
      resources: resources 
    });
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Resources endpoint
app.get('/api/resources', async (req, res) => {
  const { q, category, featured } = req.query;
  
  const sql = getSQL();
  let result;
  
  try {
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
      // Handle multiple categories
      const categoryStr = Array.isArray(category) ? category[0] : category;
      if (categoryStr) {
        const categories = categoryStr.split(',').filter(c => c.trim());
        if (categories.length > 1) {
          result = await sql`
            SELECT * FROM resources 
            WHERE is_approved = true 
              AND category = ANY(${categories})
            ORDER BY is_featured DESC, created_at DESC
          `;
        } else {
          result = await sql`
            SELECT * FROM resources 
            WHERE is_approved = true 
              AND category = ${category}
            ORDER BY is_featured DESC, created_at DESC
          `;
        }
      } else {
        result = await sql`
          SELECT * FROM resources 
          WHERE is_approved = true 
            AND category = ${category}
          ORDER BY is_featured DESC, created_at DESC
        `;
      }
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
    
    res.json(result);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Favorites endpoints
app.get('/api/favorites', async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const sql = getSQL();
    const rows = await sql`
      SELECT resource_id FROM favorites WHERE user_id = ${userId}
    `;
    res.json(rows.map(r => r.resource_id));
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const { userId, resourceId } = req.body;
    
    if (!userId || !resourceId) {
      return res.status(400).json({ error: "userId and resourceId are required" });
    }

    const sql = getSQL();
    
    // Ensure favorites table exists
    await sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, resource_id)
      )
    `;
    
    try {
      await sql`
        INSERT INTO favorites (user_id, resource_id) VALUES (${userId}, ${resourceId})
        ON CONFLICT (user_id, resource_id) DO NOTHING
      `;
    } catch (error) {
      console.error("Error adding favorite:", error);
      return res.status(500).json({ error: "Failed to add favorite" });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

app.delete('/api/favorites/:resourceId', async (req, res) => {
  const { resourceId } = req.params;
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const sql = getSQL();
    await sql`
      DELETE FROM favorites WHERE user_id = ${userId} AND resource_id = ${resourceId}
    `;
    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log('Database URL:', process.env.NEON_DATABASE_URL ? 'Found' : 'Not found');
  console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('NEON') || key.includes('GEMINI')));
});
