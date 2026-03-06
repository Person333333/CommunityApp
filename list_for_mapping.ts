import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');

async function listResources() {
    try {
        const curated = await (sql.query as any)(`SELECT id, title, description, category FROM curated_resources`);
        const submissions = await (sql.query as any)(`SELECT id, title, description, category FROM resource_submissions WHERE status = 'approved'`);

        console.log('--- CURATED ---');
        console.table(curated);
        console.log('--- SUBMISSIONS ---');
        console.table(submissions);
    } catch (error) {
        console.error('Failed to list resources:', error);
    }
}

listResources();
