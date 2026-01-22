import { neon } from '@neondatabase/serverless';

// Direct database connection for Vercel deployment
const sql = neon(import.meta.env.VITE_NEON_DATABASE_URL || 'postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');

export async function fetchResourcesFromDB(options: {
  featured?: boolean;
  category?: string;
  search?: string;
  limit?: number;
}) {
  try {
    let baseConditions = ['is_approved = true'];
    let params: any[] = [];

    if (options.featured) {
      baseConditions.push('is_featured = true');
    }

    if (options.category) {
      baseConditions.push('category = $' + (params.length + 1));
      params.push(options.category);
    }

    if (options.search) {
      const searchParam = '%' + options.search + '%';
      baseConditions.push('(title ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 2) + ')');
      params.push(searchParam, searchParam);
    }

    const whereClause = baseConditions.length > 0 ? `WHERE ${baseConditions.join(' AND ')}` : '';

    const query = `
      SELECT *, user_id FROM curated_resources ${whereClause}
      ORDER BY is_featured DESC, created_at DESC, title ASC
      ${options.limit ? `LIMIT ${options.limit}` : ''}
    `;

    const result: any = await sql.query(query, params);
    // Neon serverless query result usually has .rows
    return result.rows || result;
  } catch (error) {
    console.error('Database Error:', error);
    return [];
  }
}

export async function fetchMySubmissionsFromDB(userId: string) {
  try {
    console.log('Fetching submissions for owner:', userId);
    // Use the template literal style for safety and simplicity
    const results = await sql`
      SELECT * FROM curated_resources 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return results;
  } catch (error) {
    console.error('My Submissions Error:', error);
    return [];
  }
}

export async function deleteResourceFromDB(resourceId: number, userId: string) {
  try {
    console.log(`Deleting resource ${resourceId} for user ${userId}`);
    // Only allow deletion if the user matches
    await sql`
      DELETE FROM curated_resources 
      WHERE id = ${resourceId} AND user_id = ${userId}
    `;
    return true;
  } catch (error) {
    console.error('Delete Resource Error:', error);
    return false;
  }
}

export async function fetchStatsFromDB() {
  try {
    const total = await sql`SELECT COUNT(*) FROM curated_resources WHERE is_approved = true`;
    const featured = await sql`SELECT COUNT(*) FROM curated_resources WHERE is_featured = true AND is_approved = true`;

    return {
      total: parseInt(total[0].count) || 0,
      featured: parseInt(featured[0].count) || 0
    };
  } catch (error) {
    console.error('Stats Error:', error);
    return { total: 0, featured: 0 };
  }
}

export async function fetchSavesFromDB(userId: string) {
  try {
    console.log('Fetching saves for user:', userId);
    const result = await sql`
      SELECT resource_id FROM favorites 
      WHERE user_id = ${userId}
    `;
    const ids = result.map(row => row.resource_id);
    console.log(`Found ${ids.length} saves for user ${userId}`);
    return ids;
  } catch (error) {
    console.error('Saves Error:', error);
    return [];
  }
}

export async function addSaveToDB(userId: string, resourceId: number) {
  try {
    console.log(`Adding save: user=${userId}, resource=${resourceId}`);
    await sql`
      INSERT INTO favorites (user_id, resource_id)
      VALUES (${userId}, ${resourceId})
      ON CONFLICT (user_id, resource_id) DO NOTHING
    `;
    console.log('Successfully added save to DB');
    return true;
  } catch (error) {
    console.error('Add Save Error:', error);
    return false;
  }
}

export async function removeSaveFromDB(userId: string, resourceId: number) {
  try {
    console.log(`Removing save: user=${userId}, resource=${resourceId}`);
    await sql`
      DELETE FROM favorites 
      WHERE user_id = ${userId} AND resource_id = ${resourceId}
    `;
    console.log('Successfully removed save from DB');
    return true;
  } catch (error) {
    console.error('Remove Save Error:', error);
    return false;
  }
}
