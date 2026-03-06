import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');

async function migrateLabels() {
    try {
        console.log('Mapping old categories to new labels...');

        const categoryMap = {
            'Food Assistance': 'Food',
            'Healthcare': 'Health',
            'Mental Health': 'Health',
            'Legal Aid': 'Legal',
            'Housing': 'Housing',
            'Employment': 'Employment',
            'Education': 'Education'
        };

        for (const [oldCat, newCat] of Object.entries(categoryMap)) {
            await (sql.query as any)(`UPDATE curated_resources SET category = $1 WHERE category = $2`, [newCat, oldCat]);
            await (sql.query as any)(`UPDATE resource_submissions SET category = $1 WHERE category = $2`, [newCat, oldCat]);
            console.log(`Mapped '${oldCat}' to '${newCat}'`);
        }

        console.log('\nFinal Audit:');
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
        console.table(results);

    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateLabels();
