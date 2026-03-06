import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');

async function seedAndAudit() {
    try {
        console.log('Seeding click counts...');
        // Update both curated and submitted resources with arbitrary amounts
        await (sql.query as any)(`UPDATE curated_resources SET click_count = floor(random() * 401) + 100`);
        await (sql.query as any)(`UPDATE resource_submissions SET click_count = floor(random() * 401) + 100`);
        console.log('Click counts seeded.');

        console.log('\nAuditing category distribution...');
        const results = await (sql.query as any)(`
            SELECT category, COUNT(*) as count 
            FROM (
                SELECT category FROM curated_resources
                UNION ALL
                SELECT category FROM resource_submissions
            ) combined
            GROUP BY category
            ORDER BY count DESC
        `);

        console.log('Category Counts:');
        console.table(results);

    } catch (error) {
        console.error('Operation failed:', error);
        process.exit(1);
    }
}

seedAndAudit();
