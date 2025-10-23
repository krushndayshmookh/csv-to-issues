#!/usr/bin/env node

const { main } = require('../lib/csv-to-issues')
const readline = require('readline')
const fs = require('fs')

let GITHUB_TOKEN = process.env.GITHUB_TOKEN
let repoOwner, repoName, csvFile

const owner_repo = process.argv[2]

function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
}

async function promptForInput(question) {
  const rl = createReadlineInterface()
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function promptForRepository() {
  if (owner_repo && owner_repo.includes('/')) {
    [repoOwner, repoName] = owner_repo.split('/')
    return
  }

  console.log('Repository Configuration')
  console.log('========================')
  console.log('')
  
  repoOwner = await promptForInput('Enter repository owner (username or organization): ')
  if (!repoOwner) {
    console.error('Repository owner is required!')
    process.exit(1)
  }

  repoName = await promptForInput('Enter repository name: ')
  if (!repoName) {
    console.error('Repository name is required!')
    process.exit(1)
  }
}

async function promptForCsvFile() {
  const defaultCsv = process.env.CSV_FILE || './issues.csv'
  
  csvFile = await promptForInput(`Enter CSV file path (default: ${defaultCsv}): `)
  if (!csvFile) {
    csvFile = defaultCsv
  }

  if (!fs.existsSync(csvFile)) {
    console.error(`CSV file not found: ${csvFile}`)
    console.error('Please check the file path and try again.')
    process.exit(1)
  }
}

async function promptForToken() {
  if (GITHUB_TOKEN) return GITHUB_TOKEN

  console.log('')
  console.log('GitHub Personal Access Token required!')
  console.log('')
  console.log('To get a token:')
  console.log('1. Go to https://github.com/settings/tokens')
  console.log('2. Click "Generate new token" → "Generate new token (classic)"')
  console.log('3. Give it a name like "csv-to-issues"')
  console.log('4. Select scope: "repo" (full control of private repositories)')
  console.log('5. Click "Generate token"')
  console.log('6. Copy the token (starts with "ghp_" or "github_pat_")')
  console.log('')
  console.log('Note: You can also set GITHUB_TOKEN environment variable to skip this prompt')
  console.log('')

  const token = await promptForInput('Enter your GitHub token: ')
  if (!token) {
    console.error('GitHub token is required!')
    process.exit(1)
  }
  return token
}

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

async function run() {
  try {
    console.log('GitHub Issues Bulk Creator')
    console.log('==========================')
    console.log('')
    
    // Interactive mode: prompt for all configuration
    await promptForRepository()
    await promptForCsvFile()
    const token = await promptForToken()
    
    console.log('')
    console.log('Configuration Summary:')
    console.log(`Repository: ${repoOwner}/${repoName}`)
    console.log(`CSV File: ${csvFile}`)
    console.log('')
    
    await main(repoOwner, repoName, csvFile, token)
    process.exit(0)
  } catch (error) {
    console.error('Script failed:', error.message)
    process.exit(1)
  }
}

run()
