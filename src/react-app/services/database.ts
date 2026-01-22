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
    // Base parameters (shared)
    let params: any[] = [];

    // 1. Curated Resources Conditions
    // Curated table doesn't have is_approved (all are valid) or status column
    let curatedConditions: string[] = [];

    // 2. Submissions Conditions
    // Submissions table uses status='approved'
    let submissionConditions: string[] = ["status = 'approved'"];

    // Apply shared filters
    if (options.category) {
      const paramIdx = params.length + 1;
      curatedConditions.push(`category = $${paramIdx}`);
      submissionConditions.push(`category = $${paramIdx}`);
      params.push(options.category);
    }

    if (options.search) {
      const searchParam = '%' + options.search + '%';
      const searchClause = `(
        title ILIKE $${params.length + 1} OR 
        description ILIKE $${params.length + 2} OR 
        city ILIKE $${params.length + 3} OR 
        state ILIKE $${params.length + 4} OR 
        zip ILIKE $${params.length + 5}
      )`;

      curatedConditions.push(searchClause);
      submissionConditions.push(searchClause);
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    // Featured Logic
    // If featured=true, we ONLY query curated_resources (submissions can't be featured yet)
    // If featured=false or undefined, we query both (but submissions are never featured)
    if (options.featured) {
      curatedConditions.push('is_featured = true');
    }

    // Construct Clauses
    const curatedWhere = curatedConditions.length > 0 ? `WHERE ${curatedConditions.join(' AND ')}` : '';
    const submissionWhere = submissionConditions.length > 0 ? `WHERE ${submissionConditions.join(' AND ')}` : '';

    // Construct Query
    let query = '';

    // Part 1: Curated Resources
    query += `SELECT *, user_id FROM curated_resources ${curatedWhere}`;

    // Part 2: Submissions (only if not filtering for featured, or if we want to allow featured submissions in future)
    // For now, if featured is requested, we assume submissions aren't featured, so we don't need to query them at all
    // BUT to be safe and simple, we'll just query them if !options.featured
    if (!options.featured) {
      query += `
        UNION ALL
        SELECT 
          id, title, description, category, contact_email as email, phone, website,
          address, city, state, zip, image_url, latitude, longitude,
          audience, hours, services, tags,
          CASE WHEN status = 'approved' THEN true ELSE false END as is_approved,
          false as is_featured,
          created_at, updated_at, user_id
        FROM resource_submissions ${submissionWhere}
      `;
    }

    query += ` ORDER BY is_featured DESC, created_at DESC, title ASC`;

    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }

    // @ts-ignore - Using .query() for dynamic SQL strings as per Neon driver error message
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
    // Query resource_submissions table
    const results = await sql`
    SELECT * FROM resource_submissions 
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
    // Delete from resource_submissions table
    await sql`
      DELETE FROM resource_submissions 
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
    const curatedTotal = await sql`SELECT COUNT(*) FROM curated_resources WHERE is_approved = true`;
    const submissionsTotal = await sql`SELECT COUNT(*) FROM resource_submissions WHERE status = 'approved'`;
    const featured = await sql`SELECT COUNT(*) FROM curated_resources WHERE is_featured = true AND is_approved = true`;

    return {
      total: (parseInt(curatedTotal[0].count) || 0) + (parseInt(submissionsTotal[0].count) || 0),
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
    console.log(`Adding save: user = ${userId}, resource = ${resourceId} `);
    await sql`
      INSERT INTO favorites(user_id, resource_id)
    VALUES(${userId}, ${resourceId})
      ON CONFLICT(user_id, resource_id) DO NOTHING
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
    console.log(`Removing save: user = ${userId}, resource = ${resourceId} `);
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
