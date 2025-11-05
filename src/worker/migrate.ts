import { neon } from "@neondatabase/serverless";
import "./types";

export async function migrateToNeon(env: Env) {
  const sql = neon(env.NEON_DATABASE_URL);
  
  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS resources (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      hours TEXT,
      audience TEXT,
      services TEXT,
      image_url TEXT,
      latitude DOUBLE PRECISION,
      longitude DOUBLE PRECISION,
      is_featured BOOLEAN DEFAULT false,
      is_approved BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Add columns if missing (idempotent)
  await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION`;
  await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION`;

  await sql`
    CREATE TABLE IF NOT EXISTS resource_submissions (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      phone TEXT,
      website TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Favorites table
  await sql`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL,
      resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, resource_id)
    )
  `;

  // Get existing resources from D1
  const d1Resources = await env.DB.prepare("SELECT * FROM resources").all();
  
  // Insert resources into Neon
  if (d1Resources.results && d1Resources.results.length > 0) {
    for (const resource of d1Resources.results as any) {
      try {
        await sql`
          INSERT INTO resources (
            title, description, category, tags, address, city, state, zip,
            phone, email, website, hours, audience, services, image_url,
            is_featured, is_approved, created_at, updated_at
          ) VALUES (
            ${resource.title}, ${resource.description}, ${resource.category}, 
            ${resource.tags}, ${resource.address}, ${resource.city}, ${resource.state}, ${resource.zip},
            ${resource.phone}, ${resource.email}, ${resource.website}, ${resource.hours}, 
            ${resource.audience}, ${resource.services}, ${resource.image_url},
            ${Boolean(resource.is_featured)}, ${Boolean(resource.is_approved)}, 
            ${resource.created_at}, ${resource.updated_at}
          )
        `;
      } catch (error) {
        console.log(`Skipping duplicate resource: ${resource.title}`);
      }
    }
  }

  // Get existing submissions from D1
  const d1Submissions = await env.DB.prepare("SELECT * FROM resource_submissions").all();
  
  // Insert submissions into Neon
  if (d1Submissions.results && d1Submissions.results.length > 0) {
    for (const submission of d1Submissions.results as any) {
      try {
        await sql`
          INSERT INTO resource_submissions (
            title, description, category, contact_name, contact_email,
            phone, website, address, city, state, status, notes, submitted_at
          ) VALUES (
            ${submission.title}, ${submission.description}, ${submission.category}, 
            ${submission.contact_name}, ${submission.contact_email},
            ${submission.phone}, ${submission.website}, ${submission.address}, 
            ${submission.city}, ${submission.state}, ${submission.status}, 
            ${submission.notes}, ${submission.submitted_at}
          )
        `;
      } catch (error) {
        console.log(`Skipping duplicate submission: ${submission.title}`);
      }
    }
  }

  return {
    success: true,
    resourcesMigrated: d1Resources.results?.length || 0,
    submissionsMigrated: d1Submissions.results?.length || 0
  };
}
