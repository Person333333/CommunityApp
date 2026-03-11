import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');

async function addColumns() {
    try {
        console.log('Adding missing columns to curated_resources and resource_submissions...');

        // Add to curated_resources
        await (sql.query as any)(`ALTER TABLE curated_resources ADD COLUMN IF NOT EXISTS schedule TEXT`);
        await (sql.query as any)(`ALTER TABLE curated_resources ADD COLUMN IF NOT EXISTS action_urls JSONB DEFAULT '[]'::jsonb`);
        console.log('Updated curated_resources table.');

        // Add to resource_submissions
        await (sql.query as any)(`ALTER TABLE resource_submissions ADD COLUMN IF NOT EXISTS schedule TEXT`);
        await (sql.query as any)(`ALTER TABLE resource_submissions ADD COLUMN IF NOT EXISTS action_urls JSONB DEFAULT '[]'::jsonb`);
        await (sql.query as any)(`ALTER TABLE resource_submissions ADD COLUMN IF NOT EXISTS auto_assign_tags BOOLEAN DEFAULT false`);
        console.log('Updated resource_submissions table.');

        console.log('Schema update complete.');
    } catch (error) {
        console.error('Schema update failed:', error);
        process.exit(1);
    }
}

addColumns();
