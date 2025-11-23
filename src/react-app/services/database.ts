import { neon } from '@neondatabase/serverless';

// Direct database connection for Vercel deployment
const sql = neon(import.meta.env.VITE_NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');

export async function fetchResourcesFromDB(options: {
  featured?: boolean;
  category?: string;
  search?: string;
}) {
  try {
    let query = `
      SELECT * FROM resources 
      WHERE is_approved = true
    `;
    const params = [];

    if (options.featured) {
      query += ` AND is_featured = true`;
    }

    if (options.category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(options.category);
    }

    if (options.search) {
      query += ` AND (title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
      params.push(`%${options.search}%`);
    }

    query += ` ORDER BY is_featured DESC, title ASC`;

    const resources = await sql(query, params);
    return resources;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function fetchStatsFromDB() {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured
      FROM resources 
      WHERE is_approved = true
    `;
    return result[0];
  } catch (error) {
    console.error('Stats Error:', error);
    return { total: 0, featured: 0 };
  }
}

export async function fetchFavoritesFromDB(userId: string) {
  try {
    const result = await sql`
      SELECT resource_id FROM favorites 
      WHERE user_id = ${userId}
    `;
    return result.map(row => row.resource_id);
  } catch (error) {
    console.error('Favorites Error:', error);
    return [];
  }
}

export async function addFavoriteToDB(userId: string, resourceId: number) {
  try {
    await sql`
      INSERT INTO favorites (user_id, resource_id)
      VALUES (${userId}, ${resourceId})
      ON CONFLICT DO NOTHING
    `;
    return true;
  } catch (error) {
    console.error('Add Favorite Error:', error);
    return false;
  }
}

export async function removeFavoriteFromDB(userId: string, resourceId: number) {
  try {
    await sql`
      DELETE FROM favorites 
      WHERE user_id = ${userId} AND resource_id = ${resourceId}
    `;
    return true;
  } catch (error) {
    console.error('Remove Favorite Error:', error);
    return false;
  }
}
