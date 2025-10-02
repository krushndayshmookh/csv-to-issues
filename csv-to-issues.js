#!/usr/bin/env node

/**
 * Script to bulk create GitHub issues from a CSV file using GitHub REST API
 * Usage: GITHUB_TOKEN=your_pat_here node csv-to-issues.js
 * The CSV should have: Title, Description, Priority, Type, Labels, Difficulty, Component
 */

const fs = require('fs')
const https = require('https')

const CSV_FILE = '<PATH TO CSV FILE>'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO_OWNER = '<REPO OWNER USERNAME>' 
const REPO_NAME = '<REPO NAME>' 

// Simple CSV parser that handles quoted fields
function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = parseCSVLine(lines[0])
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === headers.length) {
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      rows.push(row)
    }
  }

  return rows
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

function makeGitHubRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'User-Agent': 'animated-vg-issue-creator',
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
    }

    const req = https.request(options, (res) => {
      let responseData = ''

      res.on('data', (chunk) => {
        responseData += chunk
      })

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed)
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || responseData}`))
          }
        } catch {
          reject(new Error(`Failed to parse response: ${responseData}`))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

async function getExistingLabels() {
  try {
    const labels = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/labels`)
    return new Set(labels.map((label) => label.name))
  } catch (error) {
    console.warn('⚠️  Could not fetch existing labels:', error.message)
    return new Set()
  }
}

async function createLabel(name, color, description) {
  try {
    await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/labels`, 'POST', {
      name: name,
      color: color,
      description: description,
    })
    console.log(`✅ Created label: ${name}`)
  } catch (error) {
    if (error.message.includes('already_exists')) {
      console.log(`ℹ️  Label already exists: ${name}`)
    } else {
      console.error(`❌ Failed to create label ${name}:`, error.message)
    }
  }
}

async function ensureLabels() {
  console.log('🏷️  Setting up labels...')

  const existingLabels = await getExistingLabels()

  const labelsToCreate = [
    // Difficulty labels
    { name: 'difficulty:easy', color: '0e8a16', description: 'Good for newcomers' },
    { name: 'difficulty:medium', color: 'fbca04', description: 'Moderate complexity' },
    { name: 'difficulty:hard', color: 'd93f0b', description: 'Complex implementation required' },

    // Priority labels
    { name: 'priority:high', color: 'b60205', description: 'High priority issue' },
    { name: 'priority:medium', color: 'fbca04', description: 'Medium priority issue' },
    { name: 'priority:low', color: '0e8a16', description: 'Low priority issue' },

    // Component labels
    { name: 'component:testing', color: '006b75', description: 'Testing related' },
    { name: 'component:core', color: '1d76db', description: 'Core functionality' },
    { name: 'component:ui', color: 'e99695', description: 'User interface' },
    { name: 'component:store', color: 'f9d0c4', description: 'State management' },
    { name: 'component:service', color: 'fef2c0', description: 'Service layer' },
    { name: 'component:animation', color: 'c2e0c6', description: 'Animation system' },

    // Type labels
    { name: 'enhancement', color: '84b6eb', description: 'New feature or improvement' },
    { name: 'bug', color: 'd73a4a', description: "Something isn't working" },
    { name: 'good first issue', color: '7057ff', description: 'Good for newcomers' },
    { name: 'hacktoberfest', color: 'ff6b35', description: 'Hacktoberfest eligible' },

    // Additional useful labels
    { name: 'accessibility', color: '0e8a16', description: 'Accessibility improvements' },
    { name: 'performance', color: 'fbca04', description: 'Performance related' },
    { name: 'documentation', color: '0075ca', description: 'Documentation improvements' },
  ]

  for (const label of labelsToCreate) {
    if (!existingLabels.has(label.name)) {
      await createLabel(label.name, label.color, label.description)
      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}

async function createIssue(issue) {
  const { Title, Description, Priority, Type, Labels, Difficulty, Component } = issue

  // Build labels array
  const labels = ['hacktoberfest']
  if (Labels) {
    labels.push(
      ...Labels.split(',')
        .map((l) => l.trim())
        .filter((l) => l),
    )
  }
  if (Difficulty) labels.push(`difficulty:${Difficulty.toLowerCase()}`)
  if (Component) labels.push(`component:${Component.toLowerCase()}`)
  if (Priority) labels.push(`priority:${Priority.toLowerCase()}`)
  if (Type === 'Bug') labels.push('bug')

  // Add Hacktoberfest labels for easy issues
  if (Difficulty === 'Easy') {
    labels.push('good first issue')
  }

  // Remove duplicates and empty labels
  const uniqueLabels = [...new Set(labels)].filter((l) => l)

  console.log(`Creating issue: ${Title}`)
  console.log(`Labels: ${uniqueLabels.join(', ')}`)

  try {
    const issueData = {
      title: Title,
      body: Description,
      labels: uniqueLabels,
    }

    const result = await makeGitHubRequest(
      `/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      'POST',
      issueData,
    )
    console.log(`✅ Created: #${result.number} - ${Title}`)
    console.log(`   URL: ${result.html_url}`)

    // Add delay to avoid rate limiting (GitHub allows 5000 requests/hour)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return result
  } catch (error) {
    console.error(`❌ Failed to create issue: ${Title}`)
    console.error(`   Error: ${error.message}`)
    throw error
  }
}

async function main() {
  console.log('🚀 GitHub Issues Bulk Creator (API Version)')
  console.log('==========================================')

  if (!GITHUB_TOKEN) {
    console.error('❌ GITHUB_TOKEN environment variable is required!')
    console.error('   Create a Personal Access Token at: https://github.com/settings/tokens')
    console.error('   Then run: GITHUB_TOKEN=your_token_here node csv-to-issues.js')
    process.exit(1)
  }

  if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ ${CSV_FILE} not found!`)
    process.exit(1)
  }

  // Verify API access
  try {
    const repo = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}`)
    console.log(`📁 Repository: ${repo.full_name}`)
    console.log(`🔑 API access verified`)
  } catch (error) {
    console.error('❌ Failed to access repository:', error.message)
    console.error('   Check your token permissions and repository name')
    process.exit(1)
  }

  const csvContent = fs.readFileSync(CSV_FILE, 'utf8')
  const issues = parseCSV(csvContent)

  console.log(`📄 Found ${issues.length} issues to create`)
  console.log(`🎯 Target repository: ${REPO_OWNER}/${REPO_NAME}`)
  console.log('')
  console.log('This will create issues in the repository.')
  console.log('Press Enter to continue, or Ctrl+C to cancel.')

  // Wait for user input
  await new Promise((resolve) => {
    process.stdin.once('data', resolve)
  })

  // First, ensure all necessary labels exist
  await ensureLabels()

  console.log('')
  console.log('🔨 Creating issues...')
  console.log('')

  const created = []
  const failed = []

  for (const issue of issues) {
    if (issue.Title && issue.Title.trim()) {
      try {
        const result = await createIssue(issue)
        created.push(result)
      } catch (error) {
        failed.push({ issue, error })
      }
      console.log('---')
    }
  }

  console.log('')
  console.log('🎉 Summary:')
  console.log(`✅ Created: ${created.length} issues`)
  console.log(`❌ Failed: ${failed.length} issues`)

  if (failed.length > 0) {
    console.log('')
    console.log('Failed issues:')
    failed.forEach(({ issue, error }) => {
      console.log(`   - ${issue.Title}: ${error.message}`)
    })
  }

  if (created.length > 0) {
    console.log('')
    console.log('Created issues:')
    created.forEach((issue) => {
      console.log(`   - #${issue.number}: ${issue.title}`)
    })
  }

  console.log('')
  console.log('🎉 Done!')
}

main().catch((error) => {
  console.error('💥 Script failed:', error.message)
  process.exit(1)
})
