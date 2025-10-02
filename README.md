# csv-to-issues
A script to bulk create issues and labels on GitHub from CSV

## Usage

```bash
GITHUB_TOKEN=your_pat_here node csv-to-issues.js
```

The CSV should have: 

```csv
Title, Description, Priority, Type, Labels, Difficulty, Component
```
