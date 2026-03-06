import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');

async function migrateToSubcategories() {
    try {
        console.log('Migrating resources to specific sub-categories...');

        const mappings = [
            // Food
            { id: 113, sub: 'Food Pantries', cat: 'Food' },
            { id: 110, sub: 'Meals', cat: 'Food' },
            { id: 82, sub: 'Food Pantries', cat: 'Food' },
            { id: 79, sub: 'Food Pantries', cat: 'Food' },
            { id: 80, sub: 'Food Pantries', cat: 'Food' },

            // Health
            { id: 84, sub: 'Medical Care', cat: 'Health' },
            { id: 85, sub: 'Medical Care', cat: 'Health' },
            { id: 86, sub: 'Medical Care', cat: 'Health' },
            { id: 83, sub: 'Medical Care', cat: 'Health' },
            { id: 95, sub: 'Mental Health', cat: 'Health' },
            { id: 96, sub: 'Mental Health', cat: 'Health' },
            { id: 112, sub: 'Medical Care', cat: 'Health' },

            // Housing
            { id: 87, sub: 'Shelters', cat: 'Housing' },
            { id: 88, sub: 'Shelters', cat: 'Housing' },
            { id: 89, sub: 'Help Finding Housing', cat: 'Housing' },
            { id: 90, sub: 'Shelters', cat: 'Housing' },
            { id: 104, sub: 'Help Finding Housing', cat: 'Housing' },
            { id: 103, sub: 'Help Paying for Housing', cat: 'Housing' },
            { id: 111, sub: 'Help Finding Housing', cat: 'Housing' },

            // Employment
            { id: 91, sub: 'Help Finding a Job', cat: 'Employment' },
            { id: 92, sub: 'Job Training', cat: 'Employment' },

            // Education
            { id: 93, sub: 'Tutoring & Mentoring', cat: 'Education' },
            { id: 94, sub: 'Tutoring & Mentoring', cat: 'Education' },

            // Legal
            { id: 97, sub: 'Legal Aid', cat: 'Legal' },
            { id: 98, sub: 'Rights & Legal Issues', cat: 'Legal' },

            // Family (Moving some from Health/Education)
            { id: 101, sub: 'Childcare', cat: 'Family' },
            { id: 102, sub: 'Preschool & Childcare', cat: 'Family' },
            { id: 99, sub: 'Senior Services', cat: 'Family' },
            { id: 100, sub: 'Senior Services', cat: 'Family' }
        ];

        for (const m of mappings) {
            await (sql.query as any)(`UPDATE curated_resources SET category = $1 WHERE id = $2`, [m.sub, m.id]);
            await (sql.query as any)(`UPDATE resource_submissions SET category = $1 WHERE id = $2`, [m.sub, m.id]);
        }

        console.log('Migration completed.');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrateToSubcategories();
