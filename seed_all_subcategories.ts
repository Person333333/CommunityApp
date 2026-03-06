import { neon } from '@neondatabase/serverless';
import { categoryHierarchy } from './src/shared/categoryHierarchy';

const sql = neon('postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');

function getLeafLabels(nodes: any[]): string[] {
    let labels: string[] = [];
    for (const node of nodes) {
        if (!node.children || node.children.length === 0) {
            labels.push(node.label);
        } else {
            labels.push(...getLeafLabels(node.children));
        }
    }
    return labels;
}

const waCities = ['Seattle', 'Tacoma', 'Spokane', 'Bellevue', 'Everett', 'Kent', 'Renton', 'Vancouver', 'Olympia', 'Bellingham'];

async function fillGaps() {
    try {
        const leafLabels = getLeafLabels(categoryHierarchy);

        console.log('Fetching current category usage...');
        const usedResult = await (sql.query as any)(`
            SELECT category FROM (
                SELECT category FROM curated_resources
                UNION ALL
                SELECT category FROM resource_submissions WHERE status = 'approved'
            ) combined
        `);
        const usedCategories = new Set(usedResult.map((r: any) => r.category));

        const emptyCategories = leafLabels.filter(label => !usedCategories.has(label));
        console.log(`Found ${emptyCategories.length} empty sub-categories.`);

        for (let i = 0; i < emptyCategories.length; i++) {
            const cat = emptyCategories[i];
            const city = waCities[i % waCities.length];
            const title = `${city} ${cat} Center`;
            const desc = `Comprehensive ${cat.toLowerCase()} services and support for the ${city} community. We provide guidance, resources, and direct assistance to those in need.`;

            console.log(`Adding resource for: ${cat}`);

            await (sql.query as any)(`
                INSERT INTO curated_resources 
                (title, description, category, address, city, state, zip, phone, website, is_featured, click_count)
                VALUES 
                ($1, $2, $3, $4, $5, 'WA', $6, $7, $8, false, $9)
            `, [
                title,
                desc,
                cat,
                `${100 + i} Community Way`,
                city,
                '98001',
                '206-555-0123',
                `https://example.org/${cat.toLowerCase().replace(/ /g, '-')}`,
                Math.floor(Math.random() * 200) + 50
            ]);
        }

        console.log('Seeding completed.');

    } catch (error) {
        console.error('Seeding failed:', error);
    }
}

fillGaps();
