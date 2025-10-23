/**
 * CSV to GitHub Issues - Main Entry Point
 * 
 * This module exports the main functionality for creating GitHub issues from CSV files.
 * It can be used both as a CLI tool and as a library in other Node.js applications.
 */

const csvToIssues = require('./lib/csv-to-issues')
const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs')

// Function to display GitHub token instructions
function showTokenInstructions() {
  console.log('\nGitHub Personal Access Token Instructions:')
  console.log('===========================================')
  console.log('1. Go to GitHub.com -> Settings -> Developer settings -> Personal access tokens -> Tokens ')
  console.log('2. Click "Generate new token" -> "Generate new token "')
  console.log('3. Give your token a descriptive name (e.g., "CSV Issue Creator")')
  console.log('4. Set expiration (recommended: 30-90 days for security)')
  console.log('5. Select these scopes:')
  console.log('   - repo (Full control of private repositories)')
  console.log('   - write:discussions (Optional: if you want discussion features)')
  console.log('6. Click "Generate token"')
  console.log('7. Copy the token immediately - you won\'t see it again!')
  console.log('8. Store it securely (consider using a password manager)')
  console.log('\nImportant: Keep your token secure and never commit it to version control!')
  console.log('===========================================\n')
}

if (require.main === module) {
  ;(async () => {
    try {
      console.log('CSV to GitHub Issues Creator')
      console.log('===============================\n')

      // Ask if user needs token instructions
      const { showInstructions } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'showInstructions',
          message: 'Do you need instructions for creating a GitHub Personal Access Token?',
          default: false
        }
      ])

      if (showInstructions) {
        showTokenInstructions()
        
        // Wait for user to acknowledge
        await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continue',
            message: 'Ready to continue?',
            default: true
          }
        ])
      }

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'owner',
          message: 'Enter the GitHub repository owner:',
          validate: input => input.trim() !== '' || 'Owner cannot be empty',
        },
        {
          type: 'input',
          name: 'repo',
          message: 'Enter the GitHub repository name:',
          validate: input => input.trim() !== '' || 'Repository name cannot be empty',
        },
        {
          type: 'input',
          name: 'csvFile',
          message: 'Enter path to CSV file:',
          default: './samples/bugs.csv',
          validate: input => {
            const resolvedPath = path.resolve(input)
            return fs.existsSync(resolvedPath) || 'CSV file does not exist'
          },
        },
        {
          type: 'password',
          name: 'token',
          message: 'Enter your GitHub Personal Access Token:',
          mask: '*',
          validate: input => input.trim() !== '' || 'GitHub token cannot be empty',
        },
        {
          type: 'confirm',
          name: 'dryRun',
          message: 'Perform a dry run (validate without creating issues)?',
          default: true
        }
      ])

      console.log('\nProcessing...')

      const options = {
        owner: answers.owner,
        repo: answers.repo,
        csvFile: path.resolve(answers.csvFile),
        githubToken: answers.token,
        dryRun: answers.dryRun
      }

      const result = await csvToIssues(options)

      if (answers.dryRun) {
        console.log('\nDry run completed successfully!')
        console.log(`Would create ${result.issuesProcessed} issues`)
        console.log('Remove the dry run flag to actually create the issues')
      } else {
        console.log('\nIssues created successfully!')
        console.log(`${result.issuesProcessed} issues processed`)
        console.log(`${result.issuesCreated} issues created`)
        if (result.failures && result.failures.length > 0) {
          console.log(`${result.failures.length} failures`)
          result.failures.forEach(failure => {
            console.log(`   - ${failure.title}: ${failure.error}`)
          })
        }
      }

    } catch (err) {
      console.error('\nError:', err.message)
      console.error('\nTips:')
      console.error('   - Check your GitHub token has the correct permissions')
      console.error('   - Verify the repository exists and you have access')
      console.error('   - Ensure the CSV file format is correct')
      console.error('   - Check your internet connection')
      
      process.exit(1)
    }
  })()
}

module.exports = csvToIssues