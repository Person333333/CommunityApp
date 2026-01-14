import { neon } from '@neondatabase/serverless';

// Direct database connection for Vercel deployment
const sql = neon(import.meta.env.VITE_NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');

export async function fetchResourcesFromDB(options: {
  featured?: boolean;
  category?: string;
  search?: string;
}) {
  try {
    let conditions = ['is_approved = true'];
    let params = [];

    if (options.featured) {
      conditions.push('is_featured = true');
    }

    if (options.category) {
      conditions.push('category = $' + (params.length + 1));
      params.push(options.category);
    }

    if (options.search) {
      conditions.push('(title ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 2) + ')');
      params.push('%' + options.search + '%', '%' + options.search + '%');
    }

    const whereClause = conditions.join(' AND ');

    const query = `SELECT * FROM curated_resources WHERE ${whereClause} ORDER BY is_featured DESC, title ASC`;

    const resources = await sql.query(query, params);
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
      FROM curated_resources 
      WHERE is_approved = true
    `;
    return result[0];
  } catch (error) {
    console.error('Stats Error:', error);
    return { total: 0, featured: 0 };
  }
}

export async function fetchSavesFromDB(userId: string) {
  try {
    const result = await sql`
      SELECT resource_id FROM favorites 
      WHERE user_id = ${userId}
    `;
    return result.map(row => row.resource_id);
  } catch (error) {
    console.error('Saves Error:', error);
    return [];
  }
}

export async function addSaveToDB(userId: string, resourceId: number) {
  try {
    await sql`
      INSERT INTO favorites (user_id, resource_id)
      VALUES (${userId}, ${resourceId})
      ON CONFLICT DO NOTHING
    `;
    return true;
  } catch (error) {
    console.error('Add Save Error:', error);
    return false;
  }
}

export async function removeSaveFromDB(userId: string, resourceId: number) {
  try {
    await sql`
      DELETE FROM favorites 
      WHERE user_id = ${userId} AND resource_id = ${resourceId}
    `;
    return true;
  } catch (error) {
    console.error('Remove Save Error:', error);
    return false;
  }
}
