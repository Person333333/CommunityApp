import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_blPQ09vgTLiI@ep-lucky-glitter-afuy9gkd-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require');

async function migrateActions() {
    try {
        console.log('Enriching curated resources with actions and schedules...');

        const updates = [
            {
                id: 119,
                schedule: 'Mon-Fri: 8:00 AM - 5:00 PM',
                action_urls: [
                    { label: 'Register', url: 'https://www.dshs.wa.gov/esa/community-services-offices/basic-food' },
                    { label: 'Learn More', url: 'https://www.everettwa.gov/790/Food-Assistance' }
                ]
            },
            {
                id: 90,
                schedule: '24/7 Crisis Support | Drop-in: 9am-8pm Daily',
                action_urls: [
                    { label: 'Volunteer', url: 'https://youthcare.org/volunteer' },
                    { label: 'Donate', url: 'https://youthcare.org/donate' }
                ]
            },
            {
                id: 124,
                schedule: 'Appointments: Tue/Thu 10am-2pm',
                action_urls: [
                    { label: 'Register', url: 'https://www.whatcomcounty.us/3313/Eviction-Prevention' },
                    { label: 'Learn More', url: 'https://www.oppco.org/housing/' }
                ]
            },
            {
                id: 127,
                schedule: 'Winter Hours: 8:30am-4:30pm | Emergency Walk-ins welcome',
                action_urls: [
                    { label: 'Register', url: 'https://www.snapwa.org/energy-assistance/' },
                    { label: 'Learn More', url: 'https://www.commerce.wa.gov/growing-the-economy/energy/low-income-home-energy-assistance-program-liheap/' }
                ]
            },
            {
                id: 122,
                schedule: 'Legal Clinic: Wed 5pm-8pm | General Advice: Mon-Fri',
                action_urls: [
                    { label: 'Volunteer', url: 'https://www.vlpvancouver.org/volunteer' },
                    { label: 'Learn More', url: 'https://www.cityofvancouver.us/government/department/community-development/housing-resources/' }
                ]
            },
            {
                id: 96,
                schedule: 'Group Sessions: Sat 10am | 1-on-1: By Appointment',
                action_urls: [
                    { label: 'Register', url: 'https://www.sound.health/get-started/' },
                    { label: 'Learn More', url: 'https://www.sound.health/locations/' }
                ]
            }
        ];

        for (const update of updates) {
            await (sql.query as any)(
                `UPDATE curated_resources SET schedule = $1, action_urls = $2::jsonb WHERE id = $3`,
                [update.schedule, JSON.stringify(update.action_urls), update.id]
            );
            console.log(`Updated resource ${update.id} (${update.schedule})`);
        }

        console.log('Migration complete.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateActions();
