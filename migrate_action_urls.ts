import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');

async function migrateActions() {
    try {
        console.log('Enriching curated resources with actions and schedules...');

        const updates = [
            {
                title: 'Basic Food',
                schedule: 'Mon-Fri: 8:00 AM - 5:00 PM',
                action_urls: [
                    { label: 'Register', url: 'https://www.dshs.wa.gov/esa/community-services-offices/basic-food' },
                    { label: 'Learn More', url: 'https://www.everettwa.gov/790/Food-Assistance' }
                ]
            },
            {
                title: 'YouthCare',
                schedule: '24/7 Crisis Support | Drop-in: 9am-8pm Daily',
                action_urls: [
                    { label: 'Volunteer', url: 'https://youthcare.org/volunteer' },
                    { label: 'Donate', url: 'https://youthcare.org/donate' }
                ]
            },
            {
                title: 'Byrd Barr Place',
                schedule: 'Helping people build stability and self-sufficiency',
                action_urls: [
                    { label: 'Donate', url: 'https://byrdbarrplace.org/give/' },
                    { label: 'Learn More', url: 'https://byrdbarrplace.org/' }
                ]
            },
            {
                title: 'Crisis Connections',
                schedule: '24-hour crisis line and connections to community resources',
                action_urls: [
                    { label: 'Donate', url: 'https://www.crisisconnections.org/donate/' },
                    { label: 'Volunteer', url: 'https://www.crisisconnections.org/get-involved/volunteer/' }
                ]
            },
            {
                title: "Mary's Place",
                schedule: 'Emergency shelter and services for families',
                action_urls: [
                    { label: 'Donate', url: 'https://www.marysplaceseattle.org/donate' },
                    { label: 'Volunteer', url: 'https://www.marysplaceseattle.org/volunteer' }
                ]
            },
            {
                title: 'FareStart',
                schedule: 'Job training and placement in the culinary industry',
                action_urls: [
                    { label: 'Donate', url: 'https://www.farestart.org/donate' },
                    { label: 'Learn More', url: 'https://www.farestart.org/' }
                ]
            },
            {
                title: 'Lifelong',
                schedule: 'Food, housing, and health services for people with chronic illnesses',
                action_urls: [
                    { label: 'Donate', url: 'https://www.lifelong.org/donate' },
                    { label: 'Volunteer', url: 'https://www.lifelong.org/get-involved/volunteer' }
                ]
            }
        ];

        for (const update of updates) {
            await (sql.query as any)(
                `UPDATE curated_resources SET schedule = $1, action_urls = $2::jsonb WHERE title ILIKE $3`,
                [update.schedule, JSON.stringify(update.action_urls), `%${update.title}%`]
            );
            console.log(`Updated resource: ${update.title}`);
        }

        console.log('Migration complete.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateActions();
