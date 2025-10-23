/**
 * CSV to GitHub Issues - Core Library
 * Contains the main logic for parsing CSV and creating GitHub issues
 */

const fs = require('fs')
const https = require('https')

/**
 * Simple CSV parser that handles quoted fields
 * @param {string} text - CSV content as string
 * @returns {Array} Array of objects representing CSV rows
 */
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

/**
 * Parse a single CSV line handling quoted fields
 * @param {string} line - Single CSV line
 * @returns {Array} Array of field values
 */
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

/**
 * Make HTTP request to GitHub API
 * @param {string} path - API endpoint path
 * @param {string} githubToken - GitHub authentication token
 * @param {string} method - HTTP method
 * @param {Object} data - Request body data
 * @returns {Promise} Promise resolving to API response
 */
function makeGitHubRequest(path, githubToken, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        Authorization: `token ${githubToken}`,
        'User-Agent': 'csv-to-github-issues',
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

/**
 * Get existing labels from the repository
 * @param {string} repoOwner - Repository owner
 * @param {string} repoName - Repository name
 * @param {string} githubToken - GitHub authentication token
 * @returns {Promise<Set>} Set of existing label names
 */
async function getExistingLabels(repoOwner, repoName, githubToken) {
  try {
    const labels = await makeGitHubRequest(`/repos/${repoOwner}/${repoName}/labels`, githubToken)
    return new Set(labels.map((label) => label.name))
  } catch (error) {
    console.warn('Could not fetch existing labels:', error.message)
    return new Set()
  }
}

/**
 * Create a single label
 * @param {string} name - Label name
 * @param {string} color - Label color (hex without #)
 * @param {string} description - Label description
 * @param {string} repoOwner - Repository owner
 * @param {string} repoName - Repository name
 * @param {string} githubToken - GitHub authentication token
 */
async function createLabel(name, color, description, repoOwner, repoName, githubToken) {
  try {
    await makeGitHubRequest(`/repos/${repoOwner}/${repoName}/labels`, githubToken, 'POST', {
      name: name,
      color: color,
      description: description,
    })
    console.log(`Created label: ${name}`)
  } catch (error) {
    if (error.message.includes('already_exists')) {
      console.log(`Label already exists: ${name}`)
    } else {
      console.error(`Failed to create label ${name}:`, error.message)
    }
  }
}

/**
 * Ensure all necessary labels exist in the repository
 * @param {string} repoOwner - Repository owner
 * @param {string} repoName - Repository name
 * @param {string} githubToken - GitHub authentication token
 */
async function ensureLabels(repoOwner, repoName, githubToken) {
  console.log('Setting up labels...')

  const existingLabels = await getExistingLabels(repoOwner, repoName, githubToken)

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
      await createLabel(label.name, label.color, label.description, repoOwner, repoName, githubToken)
      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }
}

/**
 * Create a single GitHub issue
 * @param {Object} issue - Issue data from CSV
 * @param {string} repoOwner - Repository owner
 * @param {string} repoName - Repository name
 * @param {string} githubToken - GitHub authentication token
 * @returns {Promise<Object>} Created issue data
 */
async function createIssue(issue, repoOwner, repoName, githubToken) {
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
      `/repos/${repoOwner}/${repoName}/issues`,
      githubToken,
      'POST',
      issueData,
    )
    console.log(`Created: #${result.number} - ${Title}`)
    console.log(`   URL: ${result.html_url}`)

    // Add delay to avoid rate limiting (GitHub allows 5000 requests/hour)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return result
  } catch (error) {
    console.error(`Failed to create issue: ${Title}`)
    console.error(`   Error: ${error.message}`)
    throw error
  }
}

/**
 * Main function to execute the CSV to GitHub issues process
 * @param {string} repoOwner - Repository owner (required)
 * @param {string} repoName - Repository name (required)
 * @param {string} csvFile - CSV file path (required)
 * @param {string} githubToken - GitHub authentication token (required)
 */
async function main(repoOwner, repoName, csvFile, githubToken) {
  console.log('GitHub Issues Bulk Creator (NPX Version)')
  console.log('==========================================')

  if (!githubToken) {
    console.error('GitHub token is required!')
    console.error('   Create a Personal Access Token at: https://github.com/settings/tokens')
    console.error('   Then run: GITHUB_TOKEN=[your_token_here] npx csv-to-github-issues [owner]/[repo]')
    process.exit(1)
  }

  if (!repoOwner || !repoName) {
    console.error('Repository owner and name are required!')
    console.error('   Usage: npx csv-to-github-issues [owner]/[repo]')
    console.error('   Or provide them as function parameters when using as a library')
    process.exit(1)
  }

  if (!csvFile || !fs.existsSync(csvFile)) {
    console.error(`${csvFile || 'CSV file'} not found!`)
    process.exit(1)
  }

  // Verify API access
  try {
    const repo = await makeGitHubRequest(`/repos/${repoOwner}/${repoName}`, githubToken)
    console.log(`Repository: ${repo.full_name}`)
    console.log(`API access verified`)
  } catch (error) {
    console.error('Failed to access repository:', error.message)
    console.error('   Check your token permissions and repository name')
    process.exit(1)
  }

  const csvContent = fs.readFileSync(csvFile, 'utf8')
  const issues = parseCSV(csvContent)

  console.log(`Found ${issues.length} issues to create`)
  console.log(`Target repository: ${repoOwner}/${repoName}`)
  console.log('')
  console.log('This will create issues in the repository.')
  console.log('Press Enter to continue, or Ctrl+C to cancel.')

  // Wait for user input
  await new Promise((resolve) => {
    process.stdin.once('data', resolve)
  })

  // First, ensure all necessary labels exist
  await ensureLabels(repoOwner, repoName, githubToken)

  console.log('')
  console.log('Creating issues...')
  console.log('')

  const created = []
  const failed = []

  for (const issue of issues) {
    if (issue.Title && issue.Title.trim()) {
      try {
        const result = await createIssue(issue, repoOwner, repoName, githubToken)
        created.push(result)
      } catch (error) {
        failed.push({ issue, error })
      }
      console.log('---')
    }
  }

  console.log('')
  console.log('Summary:')
  console.log(`Created: ${created.length} issues`)
  console.log(`Failed: ${failed.length} issues`)

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
  console.log('Done!')
}

module.exports = {
  main,
  parseCSV,
  parseCSVLine,
  makeGitHubRequest,
  getExistingLabels,
  createLabel,
  ensureLabels,
  createIssue
}