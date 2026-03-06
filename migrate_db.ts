import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');

async function migrate() {
    try {
        console.log('Adding click_count column...');
        // For non-parameterized DDL, we can use sql.query
        await (sql.query as any)(`ALTER TABLE curated_resources ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0`);
        await (sql.query as any)(`ALTER TABLE resource_submissions ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0`);

        console.log('Updating categories to new hierarchy...');

        const categoryMap = {
            'Food Assistance': 'Food Assistance',
            'Healthcare': 'Healthcare',
            'Housing': 'Housing',
            'Employment': 'Employment',
            'Education': 'Education',
            'Mental Health': 'Mental Health',
            'Legal Aid': 'Legal Aid',
            'Transportation': 'Healthcare',
            'Child Care': 'Education',
            'Veterans Services': 'Healthcare',
            'Financial Assistance': 'Housing',
            'Senior Services': 'Healthcare'
        };

        for (const [oldCat, newCat] of Object.entries(categoryMap)) {
            // Use sql.query for parameterized queries
            await (sql.query as any)(`UPDATE curated_resources SET category = $1 WHERE category = $2`, [newCat, oldCat]);
            await (sql.query as any)(`UPDATE resource_submissions SET category = $1 WHERE category = $2`, [newCat, oldCat]);
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
