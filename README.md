# csv-to-github-issues

A CLI tool to bulk create GitHub issues and labels from CSV files. Perfect for project setup, issue migration, and Hacktoberfest preparation!

## Installation

### NPX (Recommended)

Run directly without installation:

```bash
GITHUB_TOKEN=your_pat_here npx csv-to-github-issues owner/repo
```

By default, it looks for `issues.csv` in the current directory.

### Global Installation

```bash
npm install -g csv-to-issues
GITHUB_TOKEN=your_pat_here csv-to-issues owner/repo
```

### Local Development

```bash
git clone https://github.com/krushndayshmookh/csv-to-issues.git
cd csv-to-issues
npm install
npm link
GITHUB_TOKEN=your_pat_here csv-to-issues owner/repo
```

## Usage

1. Create a CSV file with your issues (see format below)
2. Get a GitHub Personal Access Token from <https://github.com/settings/tokens>
3. Run the tool:

```bash
GITHUB_TOKEN=your_token_here npx csv-to-issues owner/repo
```

## CSV Format

The CSV file should have the following columns:

```csv
Title, Description, Priority, Type, Labels, Difficulty, Component
```

### Example CSV

```csv
Title,Description,Priority,Type,Labels,Difficulty,Component
"Fix login bug","Users cannot login with special characters","High","Bug","authentication,security","Medium","Core"
"Add dark mode","Implement dark theme for better UX","Medium","Enhancement","ui,theme","Easy","UI"
"Update docs","Improve API documentation","Low","Enhancement","documentation","Easy","Documentation"
```

## Features

- [x] Bulk create GitHub issues from CSV
- [x] Automatic label creation and management
- [x] Support for priority, difficulty, and component labels
- [x] Hacktoberfest-ready labeling
- [x] Rate limiting protection
- [x] Error handling and validation
- [x] Progress tracking and detailed logging
