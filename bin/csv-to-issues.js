#!/usr/bin/env node

const { main } = require('../lib/csv-to-issues')
const fs = require('fs')

// Read environment variables with defaults
function parseEnvInt(varName, defaultValue) {
  const value = parseInt(process.env[varName], 10)
  return Number.isNaN(value) ? defaultValue : value
}

const BATCH_SIZE = parseEnvInt('BATCH_SIZE', 25)
const BATCH_DELAY_MS = parseEnvInt('BATCH_DELAY_MS', 750)
const CSV_FILE = process.env.CSV_FILE || './issues.csv'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const DRY_RUN = process.env.DRY_RUN === 'true' // Optional: for simulation

// Check for required environment variables
if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required!')
  process.exit(1)
}

if (!fs.existsSync(CSV_FILE)) {
  console.error(`❌ CSV file not found at path: ${CSV_FILE}`)
  process.exit(1)
}

const owner_repo = process.argv[2]
if (!owner_repo || !owner_repo.includes('/')) {
  console.error('❌ Repository owner and name are required! Usage: node script.js [owner]/[repo]')
  process.exit(1)
}

const [repoOwner, repoName] = owner_repo.split('/')

// Error handling for async processes
main({
  repoOwner,
  repoName,
  csvFile: CSV_FILE,
  githubToken: GITHUB_TOKEN,
  batchSize: BATCH_SIZE,
  batchDelayMs: BATCH_DELAY_MS,
  dryRun: DRY_RUN
}).then(() => {
  console.log('✅ Issue creation process completed.')
  process.exit(0)
}).catch((error) => {
  console.error('💥 Error:', error.message)
  process.exit(1)
})
