# csv-to-issues

A CLI tool to bulk create GitHub issues and labels from CSV files. Perfect for project setup, issue migration, and Hacktoberfest preparation!

---

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [CSV Format](#csv-format)
- [Features](#features)
- [Configuration Options](#configuration-options)
- [Usage Examples](#usage-examples)
- [Troubleshooting Guide](#troubleshooting-guide)
- [FAQ](#faq)
- [Contributing](#contributing)
- [License](#license)

---

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

---

## Usage

1. Create a CSV file with your issues (see format below)
2. Get a GitHub Personal Access Token from <https://github.com/settings/tokens>
3. Run the tool:

```bash
GITHUB_TOKEN=your_token_here npx csv-to-issues owner/repo
```

You can specify a custom CSV file:

```bash
GITHUB_TOKEN=your_token_here npx csv-to-issues owner/repo --file=my_issues.csv
```

---

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

- **Title**: Issue title (required)
- **Description**: Issue body/description (required)
- **Priority**: e.g., High, Medium, Low (optional, creates label if not present)
- **Type**: e.g., Bug, Enhancement (optional, creates label if not present)
- **Labels**: Comma-separated list of additional labels (optional)
- **Difficulty**: e.g., Easy, Medium, Hard (optional, creates label if not present)
- **Component**: e.g., UI, Core, Documentation (optional, creates label if not present)

---

## Features

- [x] Bulk create GitHub issues from CSV
- [x] Automatic label creation and management
- [x] Support for priority, difficulty, and component labels
- [x] Hacktoberfest-ready labeling
- [x] Rate limiting protection
- [x] Error handling and validation
- [x] Progress tracking and detailed logging

---

## Configuration Options

You can customize the behavior using CLI flags:

| Option                | Description                                      | Default           |
|-----------------------|--------------------------------------------------|-------------------|
| `--file`              | Path to the CSV file                             | `issues.csv`      |
| `--dry-run`           | Simulate actions without creating issues/labels  | `false`           |
| `--label-prefix`      | Prefix for auto-created labels                   | *(none)*          |
| `--log-level`         | Set log verbosity (`info`, `warn`, `error`)      | `info`            |
| `--skip-existing`     | Skip issues if a similar title already exists    | `false`           |
| `--assignee`          | Assign all issues to a user                      | *(none)*          |

Example:

```bash
GITHUB_TOKEN=your_token_here npx csv-to-issues owner/repo --file=bugs.csv --dry-run --log-level=warn
```

---

## Usage Examples

### Basic Usage

```bash
GITHUB_TOKEN=your_token_here npx csv-to-issues owner/repo
```

### Custom CSV File

```bash
GITHUB_TOKEN=your_token_here npx csv-to-issues owner/repo --file=my_issues.csv
```

### Dry Run (No changes made)

```bash
GITHUB_TOKEN=your_token_here npx csv-to-issues owner/repo --dry-run
```

### Assign All Issues to a User

```bash
GITHUB_TOKEN=your_token_here npx csv-to-issues owner/repo --assignee=username
```

### Add Prefix to Labels

```bash
GITHUB_TOKEN=your_token_here npx csv-to-issues owner/repo --label-prefix=imported-
```

---

## Troubleshooting Guide

### Common Issues

- **Authentication failed**
	- Ensure your `GITHUB_TOKEN` is valid and has `repo` scope.
- **Rate limit exceeded**
	- Wait a few minutes and try again. The tool respects GitHub API rate limits.
- **CSV parsing errors**
	- Check your CSV for missing headers, extra commas, or unescaped quotes.
- **Issues not created**
	- Check logs for errors. Use `--log-level=info` for more details.
- **Labels not appearing**
	- Ensure you have permission to create labels in the repository.

### Debugging Tips

- Use `--dry-run` to preview actions.
- Increase verbosity with `--log-level=info`.
- Check the output for detailed error messages.

---

## FAQ

**Q: Can I update existing issues?**  
A: No, this tool only creates new issues. Existing issues are not modified.

**Q: What permissions does my token need?**  
A: At minimum, `repo` scope for private repos, or `public_repo` for public repos.

**Q: Can I use this on GitHub Enterprise?**  
A: Not currently supported out-of-the-box.

**Q: How are duplicate issues handled?**  
A: By default, all issues are created. Use `--skip-existing` to skip issues with duplicate titles.

---

## Contributing

Contributions are welcome! Please open issues or pull requests on [GitHub](https://github.com/krushndayshmookh/csv-to-issues).

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## License

MIT License. See [LICENSE](LICENSE) for details.
