#!/usr/bin/env node

const { main } = require('../lib/csv-to-issues')

const CSV_FILE = process.env.CSV_FILE || './issues.csv'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

const owner_repo = process.argv[2]
let repoOwner, repoName

if (owner_repo && owner_repo.includes('/')) {
  [repoOwner, repoName] = owner_repo.split('/')
} else {
  console.error('❌ Repository owner and name are required!')
  console.error('   Usage: npx csv-to-github-issues [owner]/[repo]')
  console.error('   Example: npx csv-to-github-issues microsoft/vscode')
  process.exit(1)
}

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required!')
  console.error('   Create a Personal Access Token at: https://github.com/settings/tokens')
  console.error('   Then run: GITHUB_TOKEN=[your_token_here] npx csv-to-github-issues [owner]/[repo]')
  process.exit(1)
}

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Promise Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

main(repoOwner, repoName, CSV_FILE, GITHUB_TOKEN)
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error.message)
    process.exit(1)
  })
