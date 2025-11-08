#!/usr/bin/env node
import { serve } from '@hono/node-server'
import { config } from 'dotenv'
import app from './worker/index.js'

// Load environment variables from .dev.vars file
config({ path: '.dev.vars' })

// Mock the Cloudflare Worker environment for standalone Node.js
const mockEnv = {
  NEON_DATABASE_URL: process.env.NEON_DATABASE_URL || ''
}

// Create a wrapper that provides the environment to the Hono app
const serverApp = app.fetch.bind(app)

const port = parseInt(process.env.PORT || '3000')

console.log(`🚀 Standalone Neon server starting on port ${port}`)
console.log(`📊 Database: ${mockEnv.NEON_DATABASE_URL ? 'Neon PostgreSQL connected' : 'No database URL found'}`)
console.log(`🔗 API available at: http://localhost:${port}/api/`)

serve({
  fetch: (request, server) => {
    // Hono expects: fetch(request, env, executionContext)
    // Pass the environment directly as the second parameter
    return serverApp(request, mockEnv, {})
  },
  port,
})
