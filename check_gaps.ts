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

async function checkGaps() {
    const leafLabels = getLeafLabels(categoryHierarchy);
    console.log(`Total sub-categories (leaf nodes): ${leafLabels.length}`);

    const counts: Record<string, number> = {};
    for (const label of leafLabels) {
        const result = await (sql.query as any)(`
            SELECT COUNT(*) as count 
            FROM (
                SELECT category FROM curated_resources WHERE category = $1
                UNION ALL
                SELECT category FROM resource_submissions WHERE category = $1 AND status = 'approved'
            ) combined
        `, [label]);
        counts[label] = parseInt(result[0].count);
    }

    const empty = leafLabels.filter(label => counts[label] === 0);
    console.log(`Empty sub-categories: ${empty.length}`);
    console.log('List of empty sub-categories:', empty);

    const curTotalRes = await (sql.query as any)(`SELECT COUNT(*) FROM curated_resources`);
    const curSubRes = await (sql.query as any)(`SELECT COUNT(*) FROM resource_submissions WHERE status = 'approved'`);
    console.log(`Current total resources: ${parseInt(curTotalRes[0].count) + parseInt(curSubRes[0].count)}`);
}

checkGaps();
